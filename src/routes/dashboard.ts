import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// 모든 dashboard API에 인증 적용
app.use('*', authMiddleware)

// ==========================================
// Canvas → Dashboard 실시간 동기화 API
// ==========================================

/**
 * POST /api/dashboard/sync
 * Canvas에서 Node 생성/수정/완료 시 Dashboard에 실시간 반영
 */
app.post('/sync', async (c) => {
  try {
    const { node_id, node_type, node_title, status, completed_at, data, widget_id } = await c.req.json()

    // 1. D1 Database에 저장 (올바른 스키마 사용)
    const result = await c.env.DB.prepare(`
      INSERT INTO canvas_dashboard_sync (
        canvas_node_id, 
        canvas_node_type, 
        dashboard_widget_id,
        sync_data, 
        sync_timestamp,
        sync_status,
        created_at
      ) VALUES (?, ?, ?, ?, datetime('now'), ?, datetime('now'))
    `).bind(
      node_id,
      node_type,
      widget_id || `widget-${node_id}`, // widget_id 없으면 자동 생성
      JSON.stringify({
        node_title,
        status: status || 'pending',
        completed_at,
        data
      }),
      status === 'completed' ? 'completed' : 'pending'
    ).run()

    // 2. Task 매핑: Canvas Node → Dashboard Timeline Item 자동 업데이트
    if (status === 'completed' && node_title) {
      // Note: dashboard_timeline_items 테이블이 있다면 업데이트
      try {
        await c.env.DB.prepare(`
          UPDATE dashboard_timeline_items
          SET status = 'completed', completed_at = datetime('now')
          WHERE title = ?
        `).bind(node_title).run()
      } catch (e) {
        // 테이블이 없어도 계속 진행
        console.warn('dashboard_timeline_items table not found, skipping update')
      }
    }

    return c.json({
      success: true,
      message: 'Dashboard에 실시간 반영되었습니다.',
      node_id,
      sync_id: result.meta.last_row_id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Dashboard sync error:', error)
    return c.json({
      success: false,
      error: 'Dashboard 동기화 실패',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/dashboard/updates
 * Dashboard에서 5초마다 Polling하여 최신 Canvas 결과 가져오기
 */
app.get('/updates', async (c) => {
  try {
    const since = c.req.query('since') || '0' // Timestamp (밀리초)

    const result = await c.env.DB.prepare(`
      SELECT 
        id,
        canvas_node_id as node_id,
        canvas_node_type as node_type,
        dashboard_widget_id as widget_id,
        sync_data,
        sync_timestamp,
        sync_status as status,
        created_at
      FROM canvas_dashboard_sync
      WHERE sync_timestamp > datetime(?, 'unixepoch', 'subsec')
      ORDER BY sync_timestamp DESC
      LIMIT 50
    `).bind(parseInt(since) / 1000).all()

    // Parse sync_data JSON for each result
    const updates = (result.results || []).map((row: any) => ({
      ...row,
      sync_data: JSON.parse(row.sync_data || '{}')
    }))

    return c.json({
      success: true,
      updates,
      count: updates.length,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('❌ Dashboard updates error:', error)
    return c.json({
      success: false,
      error: 'Dashboard 업데이트 조회 실패',
      updates: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/dashboard/task/:taskTitle
 * Dashboard Task → Canvas Workflow 매핑 정보 조회
 */
app.get('/task/:taskTitle', async (c) => {
  try {
    const taskTitle = c.req.param('taskTitle')

    // Task → Workflow 매핑 테이블
    const TASK_TO_WORKFLOW_MAPPING: Record<string, any> = {
      "전시 라벨 작성": {
        workflow_type: "document",
        auto_nodes: [
          { type: "document", title: "전시 라벨", icon: "📝", description: "전시 라벨 내용 작성" },
          { type: "idea", title: "라벨 구성안", icon: "💡", description: "라벨 구성 아이디어" }
        ]
      },
      "예산 승인": {
        workflow_type: "budget",
        auto_nodes: [
          { type: "chart", title: "예산 계획", icon: "💰", chartType: "bar", description: "예산 항목별 분석" },
          { type: "document", title: "예산 산출 근거", icon: "📊", description: "예산 계산 근거 문서" },
          { type: "task", title: "예산 검토", icon: "✅", description: "최종 예산 검토 단계" }
        ]
      },
      "소장품 선정": {
        workflow_type: "collection",
        auto_nodes: [
          { type: "image", title: "소장품 이미지", icon: "🖼️", description: "소장품 이미지 업로드" },
          { type: "document", title: "작품 설명", icon: "📄", description: "작품 설명 문서 작성" },
          { type: "chart", title: "선정 기준 분석", icon: "📊", chartType: "radar", description: "작품 선정 기준 분석" }
        ]
      },
      "홍보 계획 수립": {
        workflow_type: "promotion",
        auto_nodes: [
          { type: "idea", title: "홍보 전략", icon: "💡", description: "홍보 전략 아이디어" },
          { type: "image", title: "홍보 포스터", icon: "🎨", description: "홍보 포스터 디자인" },
          { type: "document", title: "SNS 콘텐츠", icon: "📱", description: "SNS 게시물 작성" },
          { type: "chart", title: "홍보 예산", icon: "💰", chartType: "pie", description: "홍보 예산 분배" }
        ]
      }
    }

    const workflow = TASK_TO_WORKFLOW_MAPPING[taskTitle]

    if (workflow) {
      return c.json({
        success: true,
        task_title: taskTitle,
        workflow
      })
    } else {
      return c.json({
        success: false,
        message: '해당 Task에 대한 워크플로우 매핑이 없습니다.',
        task_title: taskTitle
      }, 404)
    }
  } catch (error) {
    console.error('❌ Task workflow mapping error:', error)
    return c.json({
      success: false,
      error: 'Task 워크플로우 조회 실패'
    }, 500)
  }
})

/**
 * POST /api/dashboard/widgets/update
 * Canvas Node 완료 시 Dashboard Widget 자동 업데이트
 */
app.post('/widgets/update', async (c) => {
  try {
    const { widget_type, node_data } = await c.req.json()

    // Widget Type별 업데이트 로직
    switch (widget_type) {
      case 'budget':
        // 예산 위젯 업데이트
        await c.env.DB.prepare(`
          UPDATE dashboard_widgets
          SET data = ?, updated_at = datetime('now')
          WHERE type = 'budget'
        `).bind(JSON.stringify(node_data)).run()
        break

      case 'timeline':
        // 진행 중인 작업 위젯 업데이트
        await c.env.DB.prepare(`
          UPDATE dashboard_timeline_items
          SET status = ?, updated_at = datetime('now')
          WHERE title = ?
        `).bind(node_data.status, node_data.title).run()
        break

      case 'document':
        // 문서 목록 위젯 업데이트
        await c.env.DB.prepare(`
          INSERT INTO dashboard_documents (title, content, created_at)
          VALUES (?, ?, datetime('now'))
        `).bind(node_data.title, node_data.content).run()
        break

      default:
        return c.json({
          success: false,
          message: '지원하지 않는 Widget Type입니다.'
        }, 400)
    }

    return c.json({
      success: true,
      message: `${widget_type} 위젯이 업데이트되었습니다.`
    })
  } catch (error) {
    console.error('❌ Widget update error:', error)
    return c.json({
      success: false,
      error: 'Widget 업데이트 실패'
    }, 500)
  }
})

export default app
