/**
 * Context Service
 * 사용자 히스토리 및 학습 데이터 로딩
 * @version 1.0.0
 */

import type {
  ExecutionContext,
  UserHistoryContext,
  LearningDataContext,
  ProjectContext
} from '../types/orchestrator.types';

export class ContextService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 사용자 컨텍스트 로드
   */
  async loadContext(userId: number, intent: string): Promise<ExecutionContext> {
    const [userHistory, learningData] = await Promise.all([
      this.loadUserHistory(userId, intent),
      this.loadLearningData(userId, intent)
    ]);

    return {
      sessionId: '', // 나중에 채워짐
      userId,
      command: '',
      mode: 'conversational',
      userHistory,
      learningData
    };
  }

  /**
   * 사용자 히스토리 로드
   */
  private async loadUserHistory(userId: number, intent: string): Promise<UserHistoryContext[]> {
    try {
      // ai_execution_sessions에서 과거 실행 기록 조회
      const result = await this.db.prepare(`
        SELECT 
          command,
          status,
          total_duration_ms,
          created_at
        FROM ai_execution_sessions
        WHERE user_id = ?
          AND command LIKE ?
          AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(userId, `%${intent}%`).all();

      if (!result.results || result.results.length === 0) {
        return [];
      }

      // 통계 계산
      const taskFrequency = result.results.length;
      const successCount = result.results.filter((r: any) => r.status === 'completed').length;
      const successRate = Math.round((successCount / taskFrequency) * 100);
      const avgDuration = Math.round(
        result.results.reduce((sum: number, r: any) => sum + (r.total_duration_ms || 0), 0) / taskFrequency
      );

      return [{
        taskType: intent,
        frequency: taskFrequency,
        successRate,
        lastExecutedAt: (result.results[0] as any).created_at,
        averageDurationMs: avgDuration
      }];

    } catch (error) {
      console.error('❌ Failed to load user history:', error);
      return [];
    }
  }

  /**
   * 학습 데이터 로드
   */
  private async loadLearningData(userId: number, intent: string): Promise<LearningDataContext[]> {
    try {
      const result = await this.db.prepare(`
        SELECT 
          task_type,
          user_input,
          ai_decision,
          user_feedback,
          success_rate,
          created_at
        FROM learning_data
        WHERE user_id = ?
          AND task_type = ?
          AND user_feedback IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 20
      `).bind(userId, intent).all();

      if (!result.results || result.results.length === 0) {
        return [];
      }

      return result.results.map((row: any) => ({
        taskType: row.task_type,
        userInput: row.user_input,
        aiDecision: JSON.parse(row.ai_decision),
        userFeedback: row.user_feedback,
        successRate: row.success_rate || 0,
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error('❌ Failed to load learning data:', error);
      return [];
    }
  }

  /**
   * 프로젝트 컨텍스트 로드
   */
  async loadProjectContext(projectId: string): Promise<ProjectContext | undefined> {
    try {
      const result = await this.db.prepare(`
        SELECT id, name, metadata
        FROM projects
        WHERE id = ?
      `).bind(projectId).first();

      if (!result) {
        return undefined;
      }

      return {
        projectId: String(result.id),
        projectName: result.name as string,
        projectType: 'exhibition', // TODO: metadata에서 추출
        relatedTasks: [],
        recentActivity: []
      };

    } catch (error) {
      console.error('❌ Failed to load project context:', error);
      return undefined;
    }
  }

  /**
   * 학습 데이터 저장
   */
  async saveLearningData(
    userId: number,
    sessionId: string,
    taskType: string,
    userInput: string,
    aiDecision: Record<string, any>,
    userFeedback?: 'approved' | 'rejected' | 'modified',
    successRate?: number
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO learning_data (
          user_id, session_id, task_type, user_input, ai_decision, 
          user_feedback, success_rate, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        sessionId,
        taskType,
        userInput,
        JSON.stringify(aiDecision),
        userFeedback || null,
        successRate || null,
        new Date().toISOString()
      ).run();

    } catch (error) {
      console.error('❌ Failed to save learning data:', error);
      throw error;
    }
  }

  /**
   * 사용자의 AI 자율성 레벨 계산
   */
  async calculateAutonomyLevel(userId: number): Promise<number> {
    try {
      // 학습 데이터 개수 조회
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count
        FROM learning_data
        WHERE user_id = ?
          AND user_feedback = 'approved'
      `).bind(userId).first();

      const approvedCount = (result?.count as number) || 0;

      // Stage 계산
      if (approvedCount < 50) return 1;      // Stage 1: 대화형
      if (approvedCount < 300) return 2;     // Stage 2: 부분 자율
      if (approvedCount < 1000) return 3;    // Stage 3: 고급 자율
      return 4;                               // Stage 4: 완전 자율

    } catch (error) {
      console.error('❌ Failed to calculate autonomy level:', error);
      return 1;
    }
  }
}
