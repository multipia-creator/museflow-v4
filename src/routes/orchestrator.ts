/**
 * AI Orchestrator API Routes
 * SSE (Server-Sent Events) 실시간 스트리밍
 * @version 1.0.0
 */

import { Hono } from 'hono';
import { AIOrchestrator } from '../services/orchestrator.service';
import type {
  ExecuteAIRequest,
  ExecuteAIResponse,
  GetSessionStatusResponse,
  SubmitDecisionRequest,
  SubmitDecisionResponse,
  ExecutionEvent
} from '../types/orchestrator.types';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ==========================================
// POST /api/orchestrator/execute
// AI 명령 실행 시작
// ==========================================
app.post('/execute', async (c) => {
  try {
    const body = await c.req.json<ExecuteAIRequest>();
    const { command, mode = 'conversational', projectContext, options } = body;

    // 입력 검증
    if (!command || command.trim().length === 0) {
      return c.json({
        success: false,
        error: 'Command is required'
      }, 400);
    }

    // TODO: JWT 토큰에서 userId 추출
    const userId = 1; // 임시

    // AI Orchestrator 실행
    const orchestrator = new AIOrchestrator(c.env.DB, c.env.GEMINI_API_KEY);
    const result = await orchestrator.execute(userId, command, mode);

    const response: ExecuteAIResponse = {
      success: true,
      sessionId: result.sessionId,
      workflow: result.workflow,
      streamUrl: `/api/orchestrator/stream/${result.sessionId}`,
      message: 'AI 실행이 시작되었습니다.'
    };

    return c.json(response, 200);

  } catch (error) {
    console.error('❌ Failed to execute AI command:', error);
    return c.json({
      success: false,
      error: 'Failed to execute AI command',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// GET /api/orchestrator/stream/:sessionId
// SSE 실시간 스트리밍
// ==========================================
app.get('/stream/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');

  if (!sessionId) {
    return c.json({ error: 'Session ID is required' }, 400);
  }

  // SSE 헤더 설정
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  c.header('X-Accel-Buffering', 'no'); // Nginx buffering 비활성화

  // TransformStream 생성
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // AI Orchestrator에서 EventEmitter 가져오기
  const orchestrator = new AIOrchestrator(c.env.DB, c.env.GEMINI_API_KEY);
  const eventEmitter = orchestrator.getEventEmitter();

  // 이벤트 리스너 등록
  const cleanup = eventEmitter.on(sessionId, async (event: ExecutionEvent) => {
    try {
      // SSE 형식으로 전송
      const data = JSON.stringify(event);
      const message = `data: ${data}\n\n`;
      await writer.write(encoder.encode(message));
    } catch (error) {
      console.error('❌ Failed to write SSE event:', error);
    }
  });

  // 초기 연결 메시지
  const initialMessage = `data: ${JSON.stringify({
    type: 'connection-established',
    sessionId,
    timestamp: new Date().toISOString(),
    message: 'SSE 연결 성공'
  })}\n\n`;
  await writer.write(encoder.encode(initialMessage));

  // Keep-alive (30초마다 ping)
  const keepAliveInterval = setInterval(async () => {
    try {
      const ping = `: keep-alive ${Date.now()}\n\n`;
      await writer.write(encoder.encode(ping));
    } catch (error) {
      console.error('❌ Keep-alive failed:', error);
      clearInterval(keepAliveInterval);
    }
  }, 30000);

  // 클라이언트 연결 종료 감지
  c.req.raw.signal.addEventListener('abort', () => {
    console.log(`🔌 SSE connection closed for session: ${sessionId}`);
    cleanup();
    clearInterval(keepAliveInterval);
    writer.close().catch(console.error);
  });

  // 세션 완료 시 자동 종료
  eventEmitter.on(sessionId, (event) => {
    if (event.type === 'session-completed' || event.type === 'session-failed') {
      setTimeout(() => {
        cleanup();
        clearInterval(keepAliveInterval);
        writer.close().catch(console.error);
      }, 5000); // 5초 후 종료
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
});

// ==========================================
// GET /api/orchestrator/status/:sessionId
// 세션 상태 조회
// ==========================================
app.get('/status/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    if (!sessionId) {
      return c.json({ error: 'Session ID is required' }, 400);
    }

    const orchestrator = new AIOrchestrator(c.env.DB, c.env.GEMINI_API_KEY);
    const execution = await orchestrator.getSessionStatus(sessionId);

    if (!execution) {
      return c.json({
        success: false,
        error: 'Session not found'
      }, 404);
    }

    // DB에서 세션 정보 조회
    const session = await c.env.DB.prepare(`
      SELECT * FROM ai_execution_sessions WHERE id = ?
    `).bind(sessionId).first();

    if (!session) {
      return c.json({
        success: false,
        error: 'Session not found in database'
      }, 404);
    }

    const response: GetSessionStatusResponse = {
      success: true,
      session: {
        id: String(session.id),
        userId: session.user_id as number,
        command: session.command as string,
        mode: session.mode as 'conversational' | 'autonomous',
        status: session.status as any,
        currentPhase: session.current_phase as string | undefined,
        startTime: session.start_time as string,
        endTime: session.end_time as string | undefined,
        totalDurationMs: session.total_duration_ms as number | undefined
      },
      execution,
      metrics: {
        sessionId,
        totalDurationMs: execution.workflow.phases.reduce((sum, p) => sum + (p.actualDurationMs || 0), 0),
        phaseMetrics: execution.workflow.phases.map(p => ({
          phase: p.name,
          durationMs: p.actualDurationMs || 0,
          status: p.status,
          retries: 0,
          error: p.error
        })),
        agentMetrics: [],
        successRate: Math.round((execution.completedPhases.length / execution.workflow.phases.length) * 100),
        userInterventions: execution.workflow.phases.filter(p => p.requiresApproval).length
      }
    };

    return c.json(response, 200);

  } catch (error) {
    console.error('❌ Failed to get session status:', error);
    return c.json({
      success: false,
      error: 'Failed to get session status',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// POST /api/orchestrator/decision
// 사용자 결정 제출
// ==========================================
app.post('/decision', async (c) => {
  try {
    const body = await c.req.json<SubmitDecisionRequest>();
    const { sessionId, phase, selectedOptionId, feedback } = body;

    // 입력 검증
    if (!sessionId || !phase || !selectedOptionId) {
      return c.json({
        success: false,
        error: 'sessionId, phase, and selectedOptionId are required'
      }, 400);
    }

    // TODO: 실제 결정 처리 로직
    // 현재는 DB에 기록만
    await c.env.DB.prepare(`
      INSERT INTO learning_data (user_id, session_id, task_type, user_input, ai_decision, user_feedback, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      1, // TODO: 실제 userId
      sessionId,
      phase,
      selectedOptionId,
      JSON.stringify({ selectedOptionId, feedback }),
      'approved',
      new Date().toISOString()
    ).run();

    const response: SubmitDecisionResponse = {
      success: true,
      message: '결정이 제출되었습니다.',
      nextPhase: undefined // TODO: 다음 Phase 정보
    };

    return c.json(response, 200);

  } catch (error) {
    console.error('❌ Failed to submit decision:', error);
    return c.json({
      success: false,
      error: 'Failed to submit decision',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// POST /api/orchestrator/pause/:sessionId
// 세션 일시정지
// ==========================================
app.post('/pause/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    await c.env.DB.prepare(`
      UPDATE ai_execution_sessions
      SET status = 'paused', updated_at = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), sessionId).run();

    return c.json({
      success: true,
      message: 'Session paused'
    }, 200);

  } catch (error) {
    console.error('❌ Failed to pause session:', error);
    return c.json({
      success: false,
      error: 'Failed to pause session',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// POST /api/orchestrator/resume/:sessionId
// 세션 재개
// ==========================================
app.post('/resume/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    await c.env.DB.prepare(`
      UPDATE ai_execution_sessions
      SET status = 'running', updated_at = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), sessionId).run();

    return c.json({
      success: true,
      message: 'Session resumed'
    }, 200);

  } catch (error) {
    console.error('❌ Failed to resume session:', error);
    return c.json({
      success: false,
      error: 'Failed to resume session',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// POST /api/orchestrator/cancel/:sessionId
// 세션 취소
// ==========================================
app.post('/cancel/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    await c.env.DB.prepare(`
      UPDATE ai_execution_sessions
      SET status = 'cancelled', end_time = ?, updated_at = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), new Date().toISOString(), sessionId).run();

    return c.json({
      success: true,
      message: 'Session cancelled'
    }, 200);

  } catch (error) {
    console.error('❌ Failed to cancel session:', error);
    return c.json({
      success: false,
      error: 'Failed to cancel session',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// GET /api/orchestrator/history
// 사용자의 실행 히스토리 조회
// ==========================================
app.get('/history', async (c) => {
  try {
    // TODO: JWT에서 userId 추출
    const userId = 1;
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const result = await c.env.DB.prepare(`
      SELECT 
        id, command, mode, status, workflow_id, 
        start_time, end_time, total_duration_ms, created_at
      FROM ai_execution_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    return c.json({
      success: true,
      sessions: result.results || [],
      total: result.results?.length || 0,
      limit,
      offset
    }, 200);

  } catch (error) {
    console.error('❌ Failed to get history:', error);
    return c.json({
      success: false,
      error: 'Failed to get history',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// GET /api/orchestrator/templates
// 워크플로우 템플릿 목록
// ==========================================
app.get('/templates', async (c) => {
  try {
    const { WorkflowTemplateService } = await import('../services/workflow-template.service');
    const templateService = new WorkflowTemplateService();
    const templates = templateService.getAllTemplates();

    return c.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        estimatedDurationMs: t.estimatedDurationMs,
        phaseCount: t.phases.length,
        requiredAgents: t.requiredAgents
      }))
    }, 200);

  } catch (error) {
    console.error('❌ Failed to get templates:', error);
    return c.json({
      success: false,
      error: 'Failed to get templates',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default app;
