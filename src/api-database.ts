/**
 * MuseFlow D1 Database CRUD API
 * Version: 17.0.0
 * Description: Comprehensive CRUD operations for AI Orchestrator data
 */

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// ==========================================
// AI Execution Sessions - CRUD
// ==========================================

// CREATE: New AI execution session
app.post('/sessions', async (c) => {
  try {
    const { userId, command, mode, workflowId } = await c.req.json()

    const result = await c.env.DB.prepare(`
      INSERT INTO ai_execution_sessions 
      (user_id, command, mode, workflow_id, status, created_at)
      VALUES (?, ?, ?, ?, 'running', CURRENT_TIMESTAMP)
    `).bind(userId, command, mode, workflowId || null).run()

    return c.json({
      success: true,
      data: {
        sessionId: result.meta.last_row_id,
        status: 'running'
      }
    })
  } catch (error: any) {
    console.error('❌ Create session error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// READ: Get session by ID
app.get('/sessions/:id', async (c) => {
  try {
    const sessionId = c.req.param('id')

    const result = await c.env.DB.prepare(`
      SELECT * FROM ai_execution_sessions WHERE id = ?
    `).bind(sessionId).first()

    if (!result) {
      return c.json({
        success: false,
        error: 'Session not found'
      }, 404)
    }

    return c.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// UPDATE: Update session status
app.put('/sessions/:id', async (c) => {
  try {
    const sessionId = c.req.param('id')
    const { status, duration, metadata } = await c.req.json()

    await c.env.DB.prepare(`
      UPDATE ai_execution_sessions 
      SET status = ?, duration_ms = ?, metadata = ?
      WHERE id = ?
    `).bind(
      status,
      duration || null,
      metadata ? JSON.stringify(metadata) : null,
      sessionId
    ).run()

    return c.json({
      success: true,
      data: { sessionId, status }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// DELETE: Delete session
app.delete('/sessions/:id', async (c) => {
  try {
    const sessionId = c.req.param('id')

    // Delete related events first
    await c.env.DB.prepare(`
      DELETE FROM ai_execution_events WHERE session_id = ?
    `).bind(sessionId).run()

    // Delete session
    await c.env.DB.prepare(`
      DELETE FROM ai_execution_sessions WHERE id = ?
    `).bind(sessionId).run()

    return c.json({
      success: true,
      data: { sessionId }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// LIST: Get recent sessions
app.get('/sessions', async (c) => {
  try {
    const limit = c.req.query('limit') || '20'
    const userId = c.req.query('userId')

    let query = `
      SELECT * FROM ai_execution_sessions
    `
    
    if (userId) {
      query += ` WHERE user_id = ?`
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`

    const stmt = userId 
      ? c.env.DB.prepare(query).bind(userId, parseInt(limit))
      : c.env.DB.prepare(query).bind(parseInt(limit))

    const result = await stmt.all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// ==========================================
// AI Execution Events - CRUD
// ==========================================

// CREATE: Log execution event
app.post('/events', async (c) => {
  try {
    const { sessionId, phase, eventType, agentType, data } = await c.req.json()

    const result = await c.env.DB.prepare(`
      INSERT INTO ai_execution_events 
      (session_id, phase, event_type, agent_type, data, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      sessionId,
      phase,
      eventType,
      agentType || null,
      data ? JSON.stringify(data) : null
    ).run()

    return c.json({
      success: true,
      data: {
        eventId: result.meta.last_row_id
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// READ: Get events for session
app.get('/sessions/:id/events', async (c) => {
  try {
    const sessionId = c.req.param('id')

    const result = await c.env.DB.prepare(`
      SELECT * FROM ai_execution_events 
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).bind(sessionId).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// ==========================================
// Canvas-Dashboard Sync - CRUD
// ==========================================

// CREATE: Sync record
app.post('/sync', async (c) => {
  try {
    const { canvasNodeId, dashboardWidgetId, syncData } = await c.req.json()

    const result = await c.env.DB.prepare(`
      INSERT INTO canvas_dashboard_sync 
      (canvas_node_id, dashboard_widget_id, sync_data, sync_status, created_at)
      VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(
      canvasNodeId,
      dashboardWidgetId,
      syncData ? JSON.stringify(syncData) : null
    ).run()

    return c.json({
      success: true,
      data: {
        syncId: result.meta.last_row_id
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// UPDATE: Sync status
app.put('/sync/:id', async (c) => {
  try {
    const syncId = c.req.param('id')
    const { status, errorMessage } = await c.req.json()

    await c.env.DB.prepare(`
      UPDATE canvas_dashboard_sync 
      SET sync_status = ?, error_message = ?
      WHERE id = ?
    `).bind(status, errorMessage || null, syncId).run()

    return c.json({
      success: true,
      data: { syncId, status }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// READ: Get sync records
app.get('/sync', async (c) => {
  try {
    const canvasNodeId = c.req.query('canvasNodeId')
    const dashboardWidgetId = c.req.query('dashboardWidgetId')

    let query = `SELECT * FROM canvas_dashboard_sync WHERE 1=1`
    const bindings: any[] = []

    if (canvasNodeId) {
      query += ` AND canvas_node_id = ?`
      bindings.push(canvasNodeId)
    }

    if (dashboardWidgetId) {
      query += ` AND dashboard_widget_id = ?`
      bindings.push(dashboardWidgetId)
    }

    query += ` ORDER BY created_at DESC LIMIT 50`

    const stmt = c.env.DB.prepare(query)
    const result = bindings.length > 0 
      ? await stmt.bind(...bindings).all()
      : await stmt.all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// ==========================================
// Learning Data - CRUD
// ==========================================

// CREATE: Log learning data
app.post('/learning', async (c) => {
  try {
    const { sessionId, userInput, aiDecision, feedback, successRate } = await c.req.json()

    const result = await c.env.DB.prepare(`
      INSERT INTO learning_data 
      (session_id, user_input, ai_decision, feedback, success_rate, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      sessionId || null,
      userInput ? JSON.stringify(userInput) : null,
      aiDecision ? JSON.stringify(aiDecision) : null,
      feedback || null,
      successRate || null
    ).run()

    return c.json({
      success: true,
      data: {
        learningId: result.meta.last_row_id
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// READ: Get learning data
app.get('/learning', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    const limit = c.req.query('limit') || '100'

    let query = `SELECT * FROM learning_data`
    
    if (sessionId) {
      query += ` WHERE session_id = ?`
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`

    const stmt = sessionId
      ? c.env.DB.prepare(query).bind(sessionId, parseInt(limit))
      : c.env.DB.prepare(query).bind(parseInt(limit))

    const result = await stmt.all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// ==========================================
// Statistics & Analytics
// ==========================================

// Get execution statistics
app.get('/statistics/executions', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(duration_ms) as avg_duration
      FROM ai_execution_sessions
      GROUP BY status
    `).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// Get agent usage statistics
app.get('/statistics/agents', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        agent_type,
        COUNT(*) as usage_count
      FROM ai_execution_events
      WHERE agent_type IS NOT NULL
      GROUP BY agent_type
      ORDER BY usage_count DESC
      LIMIT 20
    `).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// ==========================================
// Health Check
// ==========================================
app.get('/health', async (c) => {
  try {
    // Test database connection
    await c.env.DB.prepare('SELECT 1').first()
    
    return c.json({
      status: 'ok',
      service: 'D1 Database CRUD API',
      version: '17.0.0',
      database: 'connected'
    })
  } catch (error: any) {
    return c.json({
      status: 'error',
      service: 'D1 Database CRUD API',
      version: '17.0.0',
      database: 'disconnected',
      error: error.message
    }, 500)
  }
})

export default app
