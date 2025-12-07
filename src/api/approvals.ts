/**
 * Approval System API Routes
 * 승인 시스템 - 관장/학예실장만 결재 권한
 */

import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// Middleware: 결재권자 체크
// ============================================================
const requireApprover = async (c: any, next: any) => {
  const user = c.get('user')
  
  if (!user) {
    return c.json({ error: '로그인이 필요합니다' }, 401)
  }

  // is_approver 체크
  const approverCheck = await c.env.DB.prepare(
    'SELECT is_approver FROM users WHERE id = ?'
  ).bind(user.id).first()

  if (!approverCheck || !approverCheck.is_approver) {
    return c.json({ error: '결재 권한이 없습니다' }, 403)
  }

  await next()
}

// ============================================================
// 1. 승인 요청 (일반 사용자)
// ============================================================
app.post('/projects/:id/request-approval', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: '로그인이 필요합니다' }, 401)
  }

  const projectId = c.req.param('id')
  const { comment } = await c.req.json()

  try {
    // 프로젝트 소유자 확인
    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, user.id).first()

    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없거나 권한이 없습니다' }, 404)
    }

    // 이미 승인 대기 중이거나 승인됨
    if (project.approval_status === 'pending_approval') {
      return c.json({ error: '이미 승인 요청 중입니다' }, 400)
    }
    if (project.approval_status === 'approved') {
      return c.json({ error: '이미 승인된 프로젝트입니다' }, 400)
    }

    // 승인 요청 상태로 변경
    await c.env.DB.prepare(
      'UPDATE projects SET approval_status = ? WHERE id = ?'
    ).bind('pending_approval', projectId).run()

    // 승인 이력 기록
    await c.env.DB.prepare(
      'INSERT INTO approval_history (project_id, user_id, action, comment) VALUES (?, ?, ?, ?)'
    ).bind(projectId, user.id, 'request', comment || '승인 요청').run()

    return c.json({ 
      success: true,
      message: '승인 요청이 완료되었습니다',
      approval_status: 'pending_approval'
    })

  } catch (error: any) {
    console.error('승인 요청 실패:', error)
    return c.json({ error: '승인 요청 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

// ============================================================
// 2. 승인 대기 목록 조회 (결재권자만)
// ============================================================
app.get('/pending', requireApprover, async (c) => {
  try {
    const pendingProjects = await c.env.DB.prepare(`
      SELECT 
        p.*,
        u.name as owner_name,
        u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.approval_status = 'pending_approval'
      ORDER BY p.updated_at DESC
    `).all()

    return c.json({
      success: true,
      count: pendingProjects.results.length,
      pending_approvals: pendingProjects.results
    })

  } catch (error: any) {
    console.error('승인 대기 목록 조회 실패:', error)
    return c.json({ error: '승인 대기 목록 조회 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

// ============================================================
// 3. 승인 (결재권자만)
// ============================================================
app.post('/projects/:id/approve', requireApprover, async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('id')
  const { comment } = await c.req.json()

  try {
    // 프로젝트 확인
    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ?'
    ).bind(projectId).first()

    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없습니다' }, 404)
    }

    if (project.approval_status !== 'pending_approval') {
      return c.json({ error: '승인 대기 중인 프로젝트가 아닙니다' }, 400)
    }

    // 승인 처리
    await c.env.DB.prepare(`
      UPDATE projects 
      SET approval_status = ?,
          approver_id = ?,
          approved_at = datetime('now'),
          approval_comment = ?
      WHERE id = ?
    `).bind('approved', user.id, comment || '승인 완료', projectId).run()

    // 승인 이력 기록
    await c.env.DB.prepare(
      'INSERT INTO approval_history (project_id, user_id, action, comment) VALUES (?, ?, ?, ?)'
    ).bind(projectId, user.id, 'approve', comment || '승인 완료').run()

    return c.json({
      success: true,
      message: '프로젝트가 승인되었습니다',
      approval_status: 'approved'
    })

  } catch (error: any) {
    console.error('승인 처리 실패:', error)
    return c.json({ error: '승인 처리 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

// ============================================================
// 4. 반려 (결재권자만)
// ============================================================
app.post('/projects/:id/reject', requireApprover, async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('id')
  const { comment } = await c.req.json()

  try {
    // 프로젝트 확인
    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ?'
    ).bind(projectId).first()

    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없습니다' }, 404)
    }

    if (project.approval_status !== 'pending_approval') {
      return c.json({ error: '승인 대기 중인 프로젝트가 아닙니다' }, 400)
    }

    // 반려 처리 (draft 상태로 복귀)
    await c.env.DB.prepare(`
      UPDATE projects 
      SET approval_status = ?,
          approver_id = ?,
          approved_at = datetime('now'),
          approval_comment = ?
      WHERE id = ?
    `).bind('rejected', user.id, comment || '반려', projectId).run()

    // 반려 이력 기록
    await c.env.DB.prepare(
      'INSERT INTO approval_history (project_id, user_id, action, comment) VALUES (?, ?, ?, ?)'
    ).bind(projectId, user.id, 'reject', comment || '반려').run()

    return c.json({
      success: true,
      message: '프로젝트가 반려되었습니다',
      approval_status: 'rejected'
    })

  } catch (error: any) {
    console.error('반려 처리 실패:', error)
    return c.json({ error: '반려 처리 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

// ============================================================
// 5. 승인 이력 조회
// ============================================================
app.get('/projects/:id/history', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: '로그인이 필요합니다' }, 401)
  }

  const projectId = c.req.param('id')

  try {
    const history = await c.env.DB.prepare(`
      SELECT 
        ah.*,
        u.name as user_name,
        u.position as user_position
      FROM approval_history ah
      LEFT JOIN users u ON ah.user_id = u.id
      WHERE ah.project_id = ?
      ORDER BY ah.created_at DESC
    `).bind(projectId).all()

    return c.json({
      success: true,
      history: history.results
    })

  } catch (error: any) {
    console.error('승인 이력 조회 실패:', error)
    return c.json({ error: '승인 이력 조회 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

// ============================================================
// 6. 내 승인 요청 현황 (일반 사용자)
// ============================================================
app.get('/my-requests', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: '로그인이 필요합니다' }, 401)
  }

  try {
    const myRequests = await c.env.DB.prepare(`
      SELECT *
      FROM projects
      WHERE user_id = ? AND approval_status IN ('pending_approval', 'approved', 'rejected')
      ORDER BY updated_at DESC
    `).bind(user.id).all()

    return c.json({
      success: true,
      count: myRequests.results.length,
      my_requests: myRequests.results
    })

  } catch (error: any) {
    console.error('내 승인 요청 조회 실패:', error)
    return c.json({ error: '내 승인 요청 조회 중 오류가 발생했습니다', details: error.message }, 500)
  }
})

export default app
