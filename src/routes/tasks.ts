/**
 * MuseFlow V4.0 - Tasks API Routes
 * CRUD operations for workflow tasks
 */

import { Hono } from 'hono'
import type { Context } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/tasks?project_id=1
app.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.query('project_id')
    
    if (!projectId) {
      return c.json({ success: false, error: 'project_id is required' }, 400)
    }
    
    const { results } = await DB.prepare(`
      SELECT * FROM tasks WHERE project_id = ? ORDER BY position ASC, created_at ASC
    `).bind(projectId).all()
    
    const tasks = results.map((t: any) => ({
      ...t,
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }))
    
    return c.json({ success: true, tasks })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// POST /api/tasks
app.post('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const body = await c.req.json()
    
    const {
      project_id, user_id = 1, title, description, phase, assignee, due_date, checklist = []
    } = body
    
    if (!project_id || !title || !phase) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    const result = await DB.prepare(`
      INSERT INTO tasks (project_id, user_id, title, description, phase, assignee, due_date, checklist, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(project_id, user_id, title, description || '', phase, assignee || '', due_date || null, JSON.stringify(checklist)).run()
    
    return c.json({ success: true, task_id: result.meta.last_row_id }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PUT /api/tasks/:id
app.put('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const taskId = c.req.param('id')
    const body = await c.req.json()
    
    const { title, description, phase, status, assignee, due_date, checklist, position } = body
    
    await DB.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        phase = COALESCE(?, phase),
        status = COALESCE(?, status),
        assignee = COALESCE(?, assignee),
        due_date = COALESCE(?, due_date),
        checklist = COALESCE(?, checklist),
        position = COALESCE(?, position),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      title || null, description !== undefined ? description : null, phase || null, status || null,
      assignee !== undefined ? assignee : null, due_date !== undefined ? due_date : null,
      checklist ? JSON.stringify(checklist) : null, position !== undefined ? position : null, taskId
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// DELETE /api/tasks/:id
app.delete('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    await DB.prepare(`DELETE FROM tasks WHERE id = ?`).bind(c.req.param('id')).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
