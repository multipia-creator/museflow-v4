/**
 * MuseFlow V4.0 - Projects API Routes
 * CRUD operations for exhibition projects with D1 Database
 */

import { Hono } from 'hono'
import type { Context } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================================
// GET /api/projects - List all projects
// ============================================================================
app.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    
    // Get query parameters
    const status = c.req.query('status')
    const userId = c.req.query('userId') // Optional user filter
    
    // Build query
    let query = `
      SELECT 
        p.*,
        pb.budget_amount,
        pb.spent_amount,
        pb.currency,
        COUNT(DISTINCT t.id) as task_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN project_budgets pb ON p.id = pb.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (userId) {
      query += ` AND p.user_id = ?`
      params.push(userId)
    }
    
    if (status) {
      query += ` AND p.status = ?`
      params.push(status)
    }
    
    query += ` GROUP BY p.id ORDER BY p.updated_at DESC`
    
    const { results } = await DB.prepare(query).bind(...params).all()
    
    // Parse workflow_data JSON
    const projects = results.map((p: any) => ({
      ...p,
      workflow_data: p.workflow_data ? JSON.parse(p.workflow_data) : null,
      budget: {
        budget_amount: p.budget_amount || 0,
        spent_amount: p.spent_amount || 0,
        currency: p.currency || 'KRW'
      },
      stats: {
        task_count: p.task_count || 0,
        completed_tasks: p.completed_tasks || 0
      }
    }))
    
    return c.json({
      success: true,
      projects,
      count: projects.length
    })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    }, 500)
  }
})

// ============================================================================
// GET /api/projects/:id - Get single project
// ============================================================================
app.get('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.param('id')
    
    const { results } = await DB.prepare(`
      SELECT 
        p.*,
        pb.budget_amount,
        pb.spent_amount,
        pb.currency
      FROM projects p
      LEFT JOIN project_budgets pb ON p.id = pb.project_id
      WHERE p.id = ?
    `).bind(projectId).all()
    
    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404)
    }
    
    const project = results[0] as any
    
    // Parse workflow_data
    if (project.workflow_data) {
      project.workflow_data = JSON.parse(project.workflow_data)
    }
    
    // Get tasks
    const { results: tasks } = await DB.prepare(`
      SELECT * FROM tasks 
      WHERE project_id = ? 
      ORDER BY position ASC, created_at ASC
    `).bind(projectId).all()
    
    // Parse checklist JSON in tasks
    const parsedTasks = tasks.map((t: any) => ({
      ...t,
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }))
    
    return c.json({
      success: true,
      project: {
        ...project,
        budget: {
          budget_amount: project.budget_amount || 0,
          spent_amount: project.spent_amount || 0,
          currency: project.currency || 'KRW'
        }
      },
      tasks: parsedTasks
    })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch project'
    }, 500)
  }
})

// ============================================================================
// POST /api/projects - Create new project
// ============================================================================
app.post('/', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const body = await c.req.json()
    
    const {
      title,
      description,
      status = 'draft',
      user_id = 1,
      workflow_data = null,
      budget_amount = 0,
      exhibition_type,
      start_date,
      end_date
    } = body
    
    // Validate required fields
    if (!title) {
      return c.json({
        success: false,
        error: 'Title is required'
      }, 400)
    }
    
    // Insert project
    const projectResult = await DB.prepare(`
      INSERT INTO projects (user_id, title, description, workflow_data, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      user_id,
      title,
      description || '',
      workflow_data ? JSON.stringify(workflow_data) : null,
      status
    ).run()
    
    const projectId = projectResult.meta.last_row_id
    
    // Insert budget if provided
    if (budget_amount > 0) {
      await DB.prepare(`
        INSERT INTO project_budgets (project_id, budget_amount, spent_amount, currency, created_at, updated_at)
        VALUES (?, ?, 0, 'KRW', datetime('now'), datetime('now'))
      `).bind(projectId, budget_amount).run()
    }
    
    // Log activity
    await DB.prepare(`
      INSERT INTO activity_log (user_id, project_id, activity_type, content, created_at)
      VALUES (?, ?, 'project_create', ?, datetime('now'))
    `).bind(user_id, projectId, `Created project: ${title}`).run()
    
    return c.json({
      success: true,
      project_id: projectId,
      message: 'Project created successfully'
    }, 201)
  } catch (error: any) {
    console.error('Error creating project:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to create project'
    }, 500)
  }
})

// ============================================================================
// PUT /api/projects/:id - Update project
// ============================================================================
app.put('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.param('id')
    const body = await c.req.json()
    
    const {
      title,
      description,
      status,
      workflow_data,
      budget_amount,
      budget_total,
      budget_used,
      type,
      phase,
      curator,
      location,
      start_date,
      end_date
    } = body
    
    // Update project with all fields
    await DB.prepare(`
      UPDATE projects 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        workflow_data = COALESCE(?, workflow_data),
        budget_total = COALESCE(?, budget_total),
        budget_used = COALESCE(?, budget_used),
        type = COALESCE(?, type),
        phase = COALESCE(?, phase),
        curator = COALESCE(?, curator),
        location = COALESCE(?, location),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      title || null,
      description !== undefined ? description : null,
      status || null,
      workflow_data ? JSON.stringify(workflow_data) : null,
      budget_total !== undefined ? budget_total : null,
      budget_used !== undefined ? budget_used : null,
      type || null,
      phase || null,
      curator || null,
      location || null,
      start_date || null,
      end_date || null,
      projectId
    ).run()
    
    // Update budget if provided (for backward compatibility)
    if (budget_amount !== undefined) {
      await DB.prepare(`
        INSERT INTO project_budgets (project_id, budget_amount, spent_amount, currency, created_at, updated_at)
        VALUES (?, ?, 0, 'KRW', datetime('now'), datetime('now'))
        ON CONFLICT(project_id) DO UPDATE SET
          budget_amount = excluded.budget_amount,
          updated_at = datetime('now')
      `).bind(projectId, budget_amount).run()
    }
    
    // Log activity
    await DB.prepare(`
      INSERT INTO activity_log (user_id, project_id, activity_type, content, created_at)
      VALUES (1, ?, 'project_update', ?, datetime('now'))
    `).bind(projectId, `Updated project: ${title || 'Untitled'}`).run()
    
    return c.json({
      success: true,
      message: 'Project updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating project:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to update project'
    }, 500)
  }
})

// ============================================================================
// DELETE /api/projects/:id - Delete project
// ============================================================================
app.delete('/:id', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.param('id')
    
    // Get project title for logging
    const { results } = await DB.prepare(`
      SELECT title FROM projects WHERE id = ?
    `).bind(projectId).all()
    
    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404)
    }
    
    const projectTitle = (results[0] as any).title
    
    // Delete project (cascade will delete related records)
    await DB.prepare(`
      DELETE FROM projects WHERE id = ?
    `).bind(projectId).run()
    
    // Log activity
    await DB.prepare(`
      INSERT INTO activity_log (user_id, activity_type, content, created_at)
      VALUES (1, 'project_delete', ?, datetime('now'))
    `).bind(`Deleted project: ${projectTitle}`).run()
    
    return c.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to delete project'
    }, 500)
  }
})

// ============================================================================
// GET /api/projects/:id/canvas - Get canvas workflow data
// ============================================================================
app.get('/:id/canvas', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.param('id')
    
    // Get project's workflow_data
    const { results } = await DB.prepare(`
      SELECT workflow_data FROM projects WHERE id = ?
    `).bind(projectId).all()
    
    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404)
    }
    
    const project = results[0] as any
    const workflowData = project.workflow_data ? JSON.parse(project.workflow_data) : { nodes: [], connections: [] }
    
    return c.json({
      success: true,
      ...workflowData
    })
  } catch (error: any) {
    console.error('Error loading canvas data:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to load canvas data'
    }, 500)
  }
})

// ============================================================================
// POST /api/projects/:id/canvas - Save canvas workflow data
// ============================================================================
app.post('/:id/canvas', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    const projectId = c.req.param('id')
    const body = await c.req.json()
    
    const { nodes, connections } = body
    
    // Update project's workflow_data field
    await DB.prepare(`
      UPDATE projects 
      SET 
        workflow_data = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      JSON.stringify({ nodes, connections }),
      projectId
    ).run()
    
    // Log activity
    await DB.prepare(`
      INSERT INTO activity_log (user_id, project_id, activity_type, content, created_at)
      VALUES (1, ?, 'canvas_update', 'Updated canvas workflow', datetime('now'))
    `).bind(projectId).run()
    
    return c.json({
      success: true,
      message: 'Canvas data saved successfully'
    })
  } catch (error: any) {
    console.error('Error saving canvas data:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to save canvas data'
    }, 500)
  }
})

// ============================================================================
// GET /api/projects/urgent - Get urgent projects (D-7 or less)
// ============================================================================
app.get('/urgent', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { DB } = c.env
    
    // Get projects ending within 7 days
    const { results } = await DB.prepare(`
      SELECT 
        p.*,
        pb.budget_amount,
        pb.spent_amount,
        julianday(p.end_date) - julianday('now') as days_left
      FROM projects p
      LEFT JOIN project_budgets pb ON p.id = pb.project_id
      WHERE p.end_date IS NOT NULL
        AND julianday(p.end_date) - julianday('now') <= 7
        AND julianday(p.end_date) - julianday('now') >= 0
        AND p.status != 'completed'
      ORDER BY days_left ASC
    `).all()
    
    return c.json({
      success: true,
      projects: results
    })
  } catch (error: any) {
    console.error('Error fetching urgent projects:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch urgent projects'
    }, 500)
  }
})

export default app
