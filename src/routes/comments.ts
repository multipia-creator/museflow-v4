/**
 * MuseFlow V4.0 - Comments API Routes
 * CRUD operations for task comments
 */

import { Hono } from 'hono'
import type { Context } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/comments?taskId=1
app.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const taskId = c.req.query('taskId')
    
    if (!taskId) {
      return c.json({ success: false, error: 'taskId is required' }, 400)
    }
    
    const { results } = await DB.prepare(`
      SELECT c.*, u.name as author_name, u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `).bind(taskId).all()
    
    return c.json({ success: true, comments: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// POST /api/comments
app.post('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const body = await c.req.json()
    
    const { task_id, project_id, user_id = 1, content, mentions = [] } = body
    
    if (!task_id || !project_id || !content) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    const result = await DB.prepare(`
      INSERT INTO comments (task_id, project_id, user_id, content, mentions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(task_id, project_id, user_id, content, JSON.stringify(mentions)).run()
    
    return c.json({ success: true, comment_id: result.meta.last_row_id }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PUT /api/comments/:id
app.put('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const { content } = await c.req.json()
    
    await DB.prepare(`
      UPDATE comments SET content = ?, edited = TRUE, updated_at = datetime('now') WHERE id = ?
    `).bind(content, c.req.param('id')).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// DELETE /api/comments/:id
app.delete('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    await DB.prepare(`DELETE FROM comments WHERE id = ?`).bind(c.req.param('id')).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
