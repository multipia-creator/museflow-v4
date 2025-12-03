/**
 * Monitor Agent
 * 실시간 모니터링 및 성능 추적
 * @version 1.0.0
 */

import type { ExecutionContext } from '../types/orchestrator.types';

interface MonitorInput {
  type: 'session' | 'performance' | 'errors' | 'analytics' | 'health' | 'alerts';
  sessionId?: string;
  timeRange?: string;
  filters?: Record<string, any>;
}

interface MonitorResult {
  monitorType: string;
  data: any;
  metrics: Record<string, any>;
  alerts?: Alert[];
  timestamp: string;
}

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export class MonitorAgent {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 메인 실행 함수
   */
  async execute(input: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    try {
      console.log('📊 Monitor Agent 시작:', input);

      const monitorInput = input as MonitorInput;
      const type = monitorInput.type;

      let result: MonitorResult;

      switch (type) {
        case 'session':
          result = await this.monitorSession(monitorInput.sessionId || context.sessionId);
          break;
        
        case 'performance':
          result = await this.monitorPerformance(monitorInput.timeRange || '1h');
          break;
        
        case 'errors':
          result = await this.monitorErrors(monitorInput.timeRange || '1h');
          break;
        
        case 'analytics':
          result = await this.monitorAnalytics(monitorInput.timeRange || '24h');
          break;
        
        case 'health':
          result = await this.monitorHealth();
          break;
        
        case 'alerts':
          result = await this.monitorAlerts(monitorInput.filters);
          break;
        
        default:
          result = await this.defaultMonitor(context.sessionId);
      }

      // 알림이 있으면 DB에 저장
      if (result.alerts && result.alerts.length > 0) {
        await this.saveAlerts(result.alerts, context.sessionId);
      }

      return {
        success: true,
        message: `${type} 모니터링 완료`,
        data: result
      };

    } catch (error) {
      console.error('❌ Monitor Agent 실패:', error);
      return {
        success: false,
        message: '모니터링 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 세션 모니터링
   */
  private async monitorSession(sessionId: string): Promise<MonitorResult> {
    try {
      // 세션 정보 조회
      const session = await this.db.prepare(`
        SELECT * FROM ai_execution_sessions
        WHERE session_id = ?
      `).bind(sessionId).first();

      // 세션 이벤트 조회
      const events = await this.db.prepare(`
        SELECT * FROM ai_execution_events
        WHERE session_id = ?
        ORDER BY timestamp ASC
      `).bind(sessionId).all();

      // 학습 데이터 조회
      const learningData = await this.db.prepare(`
        SELECT * FROM learning_data
        WHERE session_id = ?
      `).bind(sessionId).first();

      const alerts: Alert[] = [];

      // 세션 상태 체크
      if (session?.status === 'failed') {
        alerts.push({
          severity: 'critical',
          message: '세션 실행 실패',
          timestamp: new Date().toISOString(),
          details: { sessionId, error: session.error_message }
        });
      }

      // 실행 시간 체크 (10분 이상이면 경고)
      if (session?.started_at && session?.completed_at) {
        const duration = new Date(session.completed_at).getTime() - new Date(session.started_at).getTime();
        if (duration > 600000) { // 10분
          alerts.push({
            severity: 'warning',
            message: '세션 실행 시간 초과',
            timestamp: new Date().toISOString(),
            details: { sessionId, duration: Math.round(duration / 1000) + 's' }
          });
        }
      }

      return {
        monitorType: 'session',
        data: {
          session,
          events: events.results || [],
          learningData,
          eventCount: events.results?.length || 0
        },
        metrics: {
          sessionId,
          status: session?.status || 'unknown',
          eventCount: events.results?.length || 0,
          duration: session?.started_at && session?.completed_at 
            ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000)
            : null
        },
        alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 세션 모니터링 실패:', error);
      return {
        monitorType: 'session',
        data: null,
        metrics: {},
        alerts: [{
          severity: 'critical',
          message: '세션 모니터링 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 성능 모니터링
   */
  private async monitorPerformance(timeRange: string): Promise<MonitorResult> {
    try {
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - timeRangeMs).toISOString();

      // 최근 세션 조회
      const sessions = await this.db.prepare(`
        SELECT * FROM ai_execution_sessions
        WHERE created_at >= ?
        ORDER BY created_at DESC
        LIMIT 100
      `).bind(startTime).all();

      const sessionResults = sessions.results || [];

      // 성능 메트릭 계산
      const completedSessions = sessionResults.filter((s: any) => s.status === 'completed');
      const failedSessions = sessionResults.filter((s: any) => s.status === 'failed');
      
      const avgDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum: number, s: any) => {
            if (s.started_at && s.completed_at) {
              return sum + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime());
            }
            return sum;
          }, 0) / completedSessions.length / 1000
        : 0;

      const successRate = sessionResults.length > 0
        ? (completedSessions.length / sessionResults.length) * 100
        : 100;

      const alerts: Alert[] = [];

      // 성능 알림 체크
      if (successRate < 80) {
        alerts.push({
          severity: 'critical',
          message: '성공률 저하',
          timestamp: new Date().toISOString(),
          details: { successRate: successRate.toFixed(2) + '%' }
        });
      }

      if (avgDuration > 300) { // 5분
        alerts.push({
          severity: 'warning',
          message: '평균 실행 시간 증가',
          timestamp: new Date().toISOString(),
          details: { avgDuration: Math.round(avgDuration) + 's' }
        });
      }

      return {
        monitorType: 'performance',
        data: {
          sessions: sessionResults.slice(0, 10), // 최근 10개만
          timeRange,
          startTime
        },
        metrics: {
          totalSessions: sessionResults.length,
          completedSessions: completedSessions.length,
          failedSessions: failedSessions.length,
          successRate: Math.round(successRate * 10) / 10,
          avgDuration: Math.round(avgDuration * 10) / 10,
          timeRange
        },
        alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 성능 모니터링 실패:', error);
      return {
        monitorType: 'performance',
        data: null,
        metrics: {},
        alerts: [{
          severity: 'critical',
          message: '성능 모니터링 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 에러 모니터링
   */
  private async monitorErrors(timeRange: string): Promise<MonitorResult> {
    try {
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - timeRangeMs).toISOString();

      // 실패한 세션 조회
      const failedSessions = await this.db.prepare(`
        SELECT * FROM ai_execution_sessions
        WHERE status = 'failed'
        AND created_at >= ?
        ORDER BY created_at DESC
        LIMIT 50
      `).bind(startTime).all();

      const errors = failedSessions.results || [];
      
      // 에러 타입별 분류
      const errorsByType: Record<string, number> = {};
      errors.forEach((session: any) => {
        const errorType = session.error_message?.split(':')[0] || 'Unknown';
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      });

      const alerts: Alert[] = [];

      // 에러율 체크
      if (errors.length > 10) {
        alerts.push({
          severity: 'critical',
          message: `높은 에러율 감지 (${errors.length}건)`,
          timestamp: new Date().toISOString(),
          details: { errorCount: errors.length, timeRange }
        });
      }

      return {
        monitorType: 'errors',
        data: {
          errors: errors.slice(0, 10), // 최근 10개만
          errorsByType,
          timeRange
        },
        metrics: {
          totalErrors: errors.length,
          uniqueErrorTypes: Object.keys(errorsByType).length,
          mostCommonError: Object.entries(errorsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None',
          timeRange
        },
        alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 에러 모니터링 실패:', error);
      return {
        monitorType: 'errors',
        data: null,
        metrics: {},
        alerts: [{
          severity: 'critical',
          message: '에러 모니터링 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 분석 모니터링
   */
  private async monitorAnalytics(timeRange: string): Promise<MonitorResult> {
    try {
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - timeRangeMs).toISOString();

      // 전체 세션 통계
      const sessions = await this.db.prepare(`
        SELECT 
          workflow_type,
          status,
          COUNT(*) as count
        FROM ai_execution_sessions
        WHERE created_at >= ?
        GROUP BY workflow_type, status
      `).bind(startTime).all();

      // 이벤트 통계
      const events = await this.db.prepare(`
        SELECT 
          agent_type,
          COUNT(*) as count
        FROM ai_execution_events
        WHERE created_at >= ?
        GROUP BY agent_type
      `).bind(startTime).all();

      const sessionStats = sessions.results || [];
      const eventStats = events.results || [];

      // 워크플로우 타입별 통계
      const workflowStats: Record<string, any> = {};
      sessionStats.forEach((stat: any) => {
        if (!workflowStats[stat.workflow_type]) {
          workflowStats[stat.workflow_type] = { total: 0, completed: 0, failed: 0 };
        }
        workflowStats[stat.workflow_type].total += stat.count;
        if (stat.status === 'completed') {
          workflowStats[stat.workflow_type].completed += stat.count;
        } else if (stat.status === 'failed') {
          workflowStats[stat.workflow_type].failed += stat.count;
        }
      });

      // Agent 타입별 통계
      const agentStats: Record<string, number> = {};
      eventStats.forEach((stat: any) => {
        agentStats[stat.agent_type] = stat.count;
      });

      return {
        monitorType: 'analytics',
        data: {
          workflowStats,
          agentStats,
          timeRange
        },
        metrics: {
          totalSessions: sessionStats.reduce((sum: number, s: any) => sum + s.count, 0),
          totalEvents: eventStats.reduce((sum: number, e: any) => sum + e.count, 0),
          mostUsedWorkflow: Object.entries(workflowStats).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'None',
          mostUsedAgent: Object.entries(agentStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None',
          timeRange
        },
        alerts: [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 분석 모니터링 실패:', error);
      return {
        monitorType: 'analytics',
        data: null,
        metrics: {},
        alerts: [{
          severity: 'critical',
          message: '분석 모니터링 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 헬스 체크
   */
  private async monitorHealth(): Promise<MonitorResult> {
    try {
      const alerts: Alert[] = [];

      // DB 연결 체크
      let dbHealthy = true;
      try {
        await this.db.prepare('SELECT 1').first();
      } catch (error) {
        dbHealthy = false;
        alerts.push({
          severity: 'critical',
          message: 'DB 연결 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        });
      }

      // 최근 세션 체크 (최근 1시간)
      const recentSessions = await this.db.prepare(`
        SELECT COUNT(*) as count FROM ai_execution_sessions
        WHERE created_at >= datetime('now', '-1 hour')
      `).first();

      const recentSessionCount = (recentSessions as any)?.count || 0;

      // 활동이 없으면 경고
      if (recentSessionCount === 0) {
        alerts.push({
          severity: 'warning',
          message: '최근 1시간 활동 없음',
          timestamp: new Date().toISOString(),
          details: { period: '1h' }
        });
      }

      return {
        monitorType: 'health',
        data: {
          dbHealthy,
          recentSessionCount
        },
        metrics: {
          status: dbHealthy && recentSessionCount > 0 ? 'healthy' : 'degraded',
          dbConnection: dbHealthy ? 'ok' : 'error',
          recentActivity: recentSessionCount > 0 ? 'active' : 'inactive',
          timestamp: new Date().toISOString()
        },
        alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 헬스 체크 실패:', error);
      return {
        monitorType: 'health',
        data: null,
        metrics: { status: 'unhealthy' },
        alerts: [{
          severity: 'critical',
          message: '헬스 체크 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 알림 모니터링
   */
  private async monitorAlerts(filters?: Record<string, any>): Promise<MonitorResult> {
    try {
      // ai_execution_events에서 알림 조회
      const events = await this.db.prepare(`
        SELECT * FROM ai_execution_events
        WHERE event_type = 'system-alert'
        ORDER BY timestamp DESC
        LIMIT 50
      `).all();

      const alertEvents = events.results || [];

      // 심각도별 분류
      const alertsBySeverity = {
        critical: alertEvents.filter((e: any) => {
          const data = JSON.parse(e.event_data || '{}');
          return data.severity === 'critical';
        }).length,
        warning: alertEvents.filter((e: any) => {
          const data = JSON.parse(e.event_data || '{}');
          return data.severity === 'warning';
        }).length,
        info: alertEvents.filter((e: any) => {
          const data = JSON.parse(e.event_data || '{}');
          return data.severity === 'info';
        }).length
      };

      return {
        monitorType: 'alerts',
        data: {
          alerts: alertEvents.slice(0, 10), // 최근 10개만
          alertsBySeverity
        },
        metrics: {
          totalAlerts: alertEvents.length,
          criticalAlerts: alertsBySeverity.critical,
          warningAlerts: alertsBySeverity.warning,
          infoAlerts: alertsBySeverity.info
        },
        alerts: [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 알림 모니터링 실패:', error);
      return {
        monitorType: 'alerts',
        data: null,
        metrics: {},
        alerts: [{
          severity: 'critical',
          message: '알림 모니터링 실패',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : String(error) }
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 기본 모니터링
   */
  private async defaultMonitor(sessionId: string): Promise<MonitorResult> {
    return {
      monitorType: 'default',
      data: { sessionId },
      metrics: {},
      alerts: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 알림 저장
   */
  private async saveAlerts(alerts: Alert[], sessionId: string): Promise<void> {
    try {
      for (const alert of alerts) {
        await this.db.prepare(`
          INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
          VALUES (?, 'system-alert', 'monitor', 'monitor', ?, ?, ?)
        `).bind(
          sessionId,
          JSON.stringify(alert),
          alert.timestamp,
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ ${alerts.length}개 알림 DB 저장 완료`);

    } catch (error) {
      console.error('❌ 알림 저장 실패:', error);
    }
  }

  /**
   * 시간 범위 파싱 (예: "1h" → 3600000ms)
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 3600000; // 기본 1시간

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 3600000;
    }
  }
}
