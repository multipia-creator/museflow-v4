/**
 * AI Orchestrator Core Service
 * Zero Error Rate, MSA-ready
 * @version 1.0.0
 */

import type {
  ExecutionContext,
  Workflow,
  WorkflowPhase,
  MultiAgentExecution,
  ExecutionEvent,
  AISession,
  ExecutionMode,
  AgentExecutionResult,
  OrchestratorError,
  AIDecision,
  DecisionOption,
  ExecutionMetrics
} from '../types/orchestrator.types';

import { WorkflowTemplateService } from './workflow-template.service';
import { ContextService } from './context.service';
import { EventEmitter } from './event-emitter.service';

/**
 * AI Orchestrator - 핵심 오케스트레이션 엔진
 * Multi-Agent 시스템 조율 및 워크플로우 실행
 */
export class AIOrchestrator {
  private workflowTemplates: WorkflowTemplateService;
  private contextService: ContextService;
  private eventEmitter: EventEmitter;
  private db: D1Database;
  private geminiApiKey?: string;
  private activeExecutions: Map<string, MultiAgentExecution>;

  constructor(db: D1Database, geminiApiKey?: string) {
    this.db = db;
    this.geminiApiKey = geminiApiKey;
    this.workflowTemplates = new WorkflowTemplateService();
    this.contextService = new ContextService(db);
    this.eventEmitter = new EventEmitter();
    this.activeExecutions = new Map();
  }

  /**
   * AI 명령 실행 시작
   * @param userId - 사용자 ID
   * @param command - 사용자 명령
   * @param mode - 실행 모드 (conversational | autonomous)
   */
  async execute(
    userId: number,
    command: string,
    mode: ExecutionMode = 'conversational'
  ): Promise<{ sessionId: string; workflow: Workflow }> {
    try {
      // 1. 세션 생성
      const sessionId = this.generateSessionId();
      const session = await this.createSession(userId, command, mode);

      // 2. 명령 파싱 및 인텐트 분석
      const intent = await this.parseIntent(command);

      // 3. 컨텍스트 로드 (과거 히스토리, 학습 데이터)
      const context = await this.contextService.loadContext(userId, intent);

      // 4. 워크플로우 생성
      const workflow = await this.generateWorkflow(intent, context, mode);

      // 5. 실행 객체 생성
      const execution: MultiAgentExecution = {
        sessionId,
        workflow,
        currentPhaseIndex: 0,
        completedPhases: [],
        failedPhases: [],
        totalProgress: 0,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString()
      };

      this.activeExecutions.set(sessionId, execution);

      // 6. 세션 시작 이벤트 발생
      await this.emitEvent({
        type: 'session-started',
        sessionId,
        timestamp: new Date().toISOString(),
        message: `AI 실행 시작: ${command}`,
        data: { workflow, mode }
      });

      // 7. 워크플로우 실행 시작 (비동기)
      this.executeWorkflow(sessionId, execution, context).catch(error => {
        console.error(`❌ Workflow execution failed for session ${sessionId}:`, error);
        this.handleExecutionError(sessionId, error);
      });

      return { sessionId, workflow };
    } catch (error) {
      console.error('❌ Failed to start AI execution:', error);
      throw this.createOrchestratorError('EXECUTION_START_FAILED', error);
    }
  }

  /**
   * 워크플로우 실행 (Phase별 순차 실행)
   */
  private async executeWorkflow(
    sessionId: string,
    execution: MultiAgentExecution,
    context: ExecutionContext
  ): Promise<void> {
    const { workflow } = execution;

    try {
      for (let i = 0; i < workflow.phases.length; i++) {
        execution.currentPhaseIndex = i;
        const phase = workflow.phases[i];

        // Phase 시작 이벤트
        await this.emitEvent({
          type: 'phase-started',
          sessionId,
          timestamp: new Date().toISOString(),
          phase: phase.name,
          agent: phase.agent,
          message: `${phase.name} 시작`,
          data: { phaseId: phase.id, description: phase.description }
        });

        // Phase 실행
        const startTime = Date.now();
        phase.status = 'running';
        phase.startTime = new Date().toISOString();

        try {
          // Agent 실행
          const result = await this.executeAgent(phase, context);

          if (!result.success) {
            throw new Error(result.error || 'Agent execution failed');
          }

          // Phase 완료
          phase.status = 'completed';
          phase.endTime = new Date().toISOString();
          phase.actualDurationMs = Date.now() - startTime;
          phase.output = result.output;

          execution.completedPhases.push(phase.id);
          execution.totalProgress = Math.round(((i + 1) / workflow.phases.length) * 100);

          // Phase 완료 이벤트
          await this.emitEvent({
            type: 'phase-completed',
            sessionId,
            timestamp: new Date().toISOString(),
            phase: phase.name,
            agent: phase.agent,
            progress: execution.totalProgress,
            message: `${phase.name} 완료`,
            data: { output: result.output, durationMs: phase.actualDurationMs }
          });

          // 승인 필요한 경우 대기
          if (phase.requiresApproval && context.mode === 'conversational') {
            await this.requestUserApproval(sessionId, phase, result);
          }

        } catch (error) {
          // Phase 실패
          phase.status = 'failed';
          phase.endTime = new Date().toISOString();
          phase.actualDurationMs = Date.now() - startTime;
          phase.error = error instanceof Error ? error.message : String(error);

          execution.failedPhases.push(phase.id);

          await this.emitEvent({
            type: 'phase-failed',
            sessionId,
            timestamp: new Date().toISOString(),
            phase: phase.name,
            agent: phase.agent,
            message: `${phase.name} 실패`,
            error: phase.error
          });

          // 치명적 에러가 아니면 계속 진행
          if (this.isCriticalPhase(phase)) {
            throw error;
          }
        }

        // 실행 상태 업데이트
        execution.lastUpdateTime = new Date().toISOString();
        this.activeExecutions.set(sessionId, execution);

        // DB에 상태 저장
        await this.updateSessionStatus(sessionId, execution);
      }

      // 워크플로우 완료
      await this.completeSession(sessionId, execution);

    } catch (error) {
      console.error(`❌ Workflow execution failed for session ${sessionId}:`, error);
      await this.failSession(sessionId, error);
      throw error;
    }
  }

  /**
   * Agent 실행
   */
  private async executeAgent(
    phase: WorkflowPhase,
    context: ExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // Agent 로딩 (동적 import)
      const agent = await this.loadAgent(phase.agent);

      // Agent 실행
      const output = await agent.execute(phase.input || {}, context);

      return {
        success: true,
        agent: phase.agent,
        phase: phase.name,
        durationMs: Date.now() - startTime,
        output
      };

    } catch (error) {
      console.error(`❌ Agent ${phase.agent} execution failed:`, error);
      return {
        success: false,
        agent: phase.agent,
        phase: phase.name,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Agent 동적 로딩
   */
  private async loadAgent(agentType: string): Promise<any> {
    switch (agentType) {
      case 'research':
        const { ResearchAgent } = await import('../agents/research.agent');
        return new ResearchAgent(this.db, this.geminiApiKey);
      case 'canvas':
        const { CanvasAgent } = await import('../agents/canvas.agent');
        return new CanvasAgent(this.db, this.geminiApiKey);
      case 'document':
        const { DocumentAgent } = await import('../agents/document.agent');
        return new DocumentAgent(this.db, this.geminiApiKey);
      case 'widget':
        const { WidgetAgent } = await import('../agents/widget.agent');
        return new WidgetAgent(this.db);
      case 'integration':
        const { IntegrationAgent } = await import('../agents/integration.agent');
        return new IntegrationAgent(this.db);
      case 'monitor':
        const { MonitorAgent } = await import('../agents/monitor.agent');
        return new MonitorAgent(this.db);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  /**
   * 명령 파싱 (Gemini API)
   */
  private async parseIntent(command: string): Promise<string> {
    // TODO: Gemini API를 통한 인텐트 분석
    // 현재는 간단한 키워드 매칭
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('전시') || lowerCommand.includes('exhibition')) {
      return 'exhibition_planning';
    } else if (lowerCommand.includes('예산') || lowerCommand.includes('budget')) {
      return 'budget_approval';
    } else if (lowerCommand.includes('소장품') || lowerCommand.includes('collection')) {
      return 'collection_selection';
    } else if (lowerCommand.includes('교육') || lowerCommand.includes('education')) {
      return 'education_program';
    } else if (lowerCommand.includes('홍보') || lowerCommand.includes('promotion')) {
      return 'promotion_planning';
    } else {
      return 'general_task';
    }
  }

  /**
   * 워크플로우 생성
   */
  private async generateWorkflow(
    intent: string,
    context: ExecutionContext,
    mode: ExecutionMode
  ): Promise<Workflow> {
    // 템플릿에서 워크플로우 가져오기
    return this.workflowTemplates.getWorkflowByIntent(intent, mode);
  }

  /**
   * 사용자 승인 요청
   */
  private async requestUserApproval(
    sessionId: string,
    phase: WorkflowPhase,
    result: AgentExecutionResult
  ): Promise<void> {
    // 승인 대기 이벤트 발생
    await this.emitEvent({
      type: 'approval-required',
      sessionId,
      timestamp: new Date().toISOString(),
      phase: phase.name,
      agent: phase.agent,
      message: `${phase.name} 승인 필요`,
      data: {
        phaseId: phase.id,
        output: result.output
      }
    });

    // 사용자 결정 대기 (Promise 기반)
    // 실제 구현에서는 DB polling 또는 WebSocket 사용
  }

  /**
   * 세션 생성
   */
  private async createSession(
    userId: number,
    command: string,
    mode: ExecutionMode
  ): Promise<AISession> {
    const now = new Date().toISOString();

    const result = await this.db.prepare(`
      INSERT INTO ai_execution_sessions (user_id, command, mode, status, start_time, created_at, updated_at)
      VALUES (?, ?, ?, 'running', ?, ?, ?)
    `).bind(userId, command, mode, now, now, now).run();

    return {
      id: String(result.meta.last_row_id),
      userId,
      command,
      mode,
      status: 'running',
      startTime: now
    };
  }

  /**
   * 세션 상태 업데이트
   */
  private async updateSessionStatus(
    sessionId: string,
    execution: MultiAgentExecution
  ): Promise<void> {
    await this.db.prepare(`
      UPDATE ai_execution_sessions
      SET current_phase = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      execution.workflow.phases[execution.currentPhaseIndex]?.name,
      new Date().toISOString(),
      sessionId
    ).run();
  }

  /**
   * 세션 완료
   */
  private async completeSession(
    sessionId: string,
    execution: MultiAgentExecution
  ): Promise<void> {
    const endTime = new Date().toISOString();
    const startTime = new Date(execution.startTime).getTime();
    const totalDurationMs = Date.now() - startTime;

    await this.db.prepare(`
      UPDATE ai_execution_sessions
      SET status = 'completed', end_time = ?, total_duration_ms = ?, updated_at = ?
      WHERE id = ?
    `).bind(endTime, totalDurationMs, endTime, sessionId).run();

    await this.emitEvent({
      type: 'session-completed',
      sessionId,
      timestamp: endTime,
      message: '모든 작업 완료',
      data: {
        totalDurationMs,
        completedPhases: execution.completedPhases.length,
        failedPhases: execution.failedPhases.length
      }
    });

    this.activeExecutions.delete(sessionId);
  }

  /**
   * 세션 실패
   */
  private async failSession(sessionId: string, error: any): Promise<void> {
    const endTime = new Date().toISOString();

    await this.db.prepare(`
      UPDATE ai_execution_sessions
      SET status = 'failed', end_time = ?, updated_at = ?
      WHERE id = ?
    `).bind(endTime, endTime, sessionId).run();

    await this.emitEvent({
      type: 'session-failed',
      sessionId,
      timestamp: endTime,
      message: '실행 실패',
      error: error instanceof Error ? error.message : String(error)
    });

    this.activeExecutions.delete(sessionId);
  }

  /**
   * 이벤트 발생
   */
  private async emitEvent(event: ExecutionEvent): Promise<void> {
    // EventEmitter로 전송 (SSE 스트림)
    this.eventEmitter.emit(event);

    // DB에 저장
    await this.db.prepare(`
      INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event.sessionId,
      event.type,
      event.phase || null,
      event.agent || null,
      JSON.stringify(event.data || {}),
      event.timestamp,
      new Date().toISOString()
    ).run();
  }

  /**
   * 에러 핸들링
   */
  private handleExecutionError(sessionId: string, error: any): void {
    this.emitEvent({
      type: 'error',
      sessionId,
      timestamp: new Date().toISOString(),
      message: 'Execution error',
      error: error instanceof Error ? error.message : String(error)
    }).catch(console.error);
  }

  /**
   * Orchestrator 에러 생성
   */
  private createOrchestratorError(code: string, error: any): OrchestratorError {
    return {
      code,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    };
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 치명적 Phase 판단
   */
  private isCriticalPhase(phase: WorkflowPhase): boolean {
    // Research, Canvas, Document는 치명적
    return ['research', 'canvas', 'document'].includes(phase.agent);
  }

  /**
   * 세션 상태 조회
   */
  async getSessionStatus(sessionId: string): Promise<MultiAgentExecution | null> {
    return this.activeExecutions.get(sessionId) || null;
  }

  /**
   * EventEmitter 가져오기 (SSE용)
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}
