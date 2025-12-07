import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
}

const admin = new Hono<{ Bindings: Bindings }>()

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const requireAdmin = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    
    // Check if user is admin
    const user = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(payload.userId).first()

    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden - Admin access required' }, 403)
    }

    c.set('userId', payload.userId)
    c.set('userRole', user.role)
    await next()
  } catch (error) {
    console.error('Admin auth error:', error)
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }
}

// Apply admin middleware to all routes
admin.use('*', requireAdmin)

// ==========================================
// OVERVIEW DASHBOARD
// ==========================================

// Get Dashboard Overview
admin.get('/overview', async (c) => {
  try {
    // Get total users count
    const usersCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first()

    // Get active projects count
    const projectsCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'active'"
    ).first()

    // Get total tasks/AI operations count (last 7 days)
    const tasksCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM tasks 
       WHERE created_at >= datetime('now', '-7 days')`
    ).first()

    // Get storage usage (approximate from projects and tasks)
    const storageQuery = await c.env.DB.prepare(
      `SELECT 
        COUNT(DISTINCT p.id) as project_count,
        COUNT(t.id) as task_count
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id`
    ).first()

    // Calculate approximate storage (mock calculation)
    const approximateStorageGB = (
      (storageQuery?.project_count || 0) * 0.05 + // 50MB per project
      (storageQuery?.task_count || 0) * 0.001      // 1MB per task
    ).toFixed(2)

    // Get user growth (last 7 days)
    const userGrowth = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= datetime('now', '-7 days')`
    ).first()

    // Calculate growth percentage
    const totalUsers = usersCount?.count || 0
    const newUsers = userGrowth?.count || 0
    const growthPercentage = totalUsers > 0 
      ? ((newUsers / totalUsers) * 100).toFixed(1)
      : '0.0'

    return c.json({
      success: true,
      data: {
        metrics: {
          totalUsers: usersCount?.count || 0,
          aiTasks: tasksCount?.count || 0,
          activeProjects: projectsCount?.count || 0,
          storageGB: approximateStorageGB,
          userGrowthPercentage: growthPercentage,
          newUsersWeek: newUsers
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Failed to load overview:', error)
    return c.json({
      success: false,
      error: 'Failed to load dashboard overview',
      details: error.message
    }, 500)
  }
})

// Get System Health
admin.get('/health', async (c) => {
  try {
    const startTime = Date.now()
    
    // Test database connection
    await c.env.DB.prepare('SELECT 1').first()
    const dbResponseTime = Date.now() - startTime

    // Get database statistics
    const dbStats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM projects) as projects_count,
        (SELECT COUNT(*) FROM tasks) as tasks_count
    `).first()

    return c.json({
      success: true,
      health: {
        apiResponseTime: `${dbResponseTime}ms`,
        workerSuccessRate: '98.5%', // Mock data - integrate with Cloudflare Analytics
        dbConnection: 'healthy',
        memoryUsage: '45%', // Mock data - integrate with Worker metrics
        dbStats: {
          users: dbStats?.users_count || 0,
          projects: dbStats?.projects_count || 0,
          tasks: dbStats?.tasks_count || 0
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    return c.json({
      success: false,
      error: 'Health check failed',
      details: error.message
    }, 500)
  }
})

// Get Recent Activity
admin.get('/activity', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')

    // Get recent users
    const recentUsers = await c.env.DB.prepare(`
      SELECT id, email, created_at, 'user_signup' as type
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(limit).all()

    // Get recent projects
    const recentProjects = await c.env.DB.prepare(`
      SELECT id, title, created_at, 'project_created' as type
      FROM projects 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(limit).all()

    // Get recent tasks
    const recentTasks = await c.env.DB.prepare(`
      SELECT id, title, created_at, 'task_completed' as type
      FROM tasks 
      WHERE status = 'completed'
      ORDER BY updated_at DESC 
      LIMIT ?
    `).bind(limit).all()

    // Combine and sort all activities
    const activities = [
      ...recentUsers.results.map(u => ({
        id: u.id,
        type: 'user_signup',
        title: `새로운 사용자 가입: ${u.email}`,
        timestamp: u.created_at
      })),
      ...recentProjects.results.map(p => ({
        id: p.id,
        type: 'project_created',
        title: `새 프로젝트 생성: ${p.title}`,
        timestamp: p.created_at
      })),
      ...recentTasks.results.map(t => ({
        id: t.id,
        type: 'task_completed',
        title: `작업 완료: ${t.title}`,
        timestamp: t.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return c.json({
      success: true,
      activities,
      count: activities.length
    })
  } catch (error: any) {
    console.error('Failed to load activity:', error)
    return c.json({
      success: false,
      error: 'Failed to load recent activity',
      details: error.message
    }, 500)
  }
})

// ==========================================
// USER MANAGEMENT
// ==========================================

// Get All Users
admin.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const role = c.req.query('role')
    const search = c.req.query('search')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM users'
    let countQuery = 'SELECT COUNT(*) as count FROM users'
    const params: any[] = []
    const conditions: string[] = []

    if (role) {
      conditions.push('role = ?')
      params.push(role)
    }

    if (search) {
      conditions.push('(email LIKE ? OR name LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`
      query += whereClause
      countQuery += whereClause
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'

    // Get total count
    const totalResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first()
    const total = totalResult?.count || 0

    // Get users
    const result = await c.env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all()

    return c.json({
      success: true,
      users: result.results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Failed to get users:', error)
    return c.json({
      success: false,
      error: 'Failed to get users',
      details: error.message
    }, 500)
  }
})

// Get User Statistics by Role
admin.get('/users/stats', async (c) => {
  try {
    const roleStats = await c.env.DB.prepare(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as new_week
      FROM users
      GROUP BY role
    `).all()

    return c.json({
      success: true,
      stats: roleStats.results
    })
  } catch (error: any) {
    console.error('Failed to get user stats:', error)
    return c.json({
      success: false,
      error: 'Failed to get user statistics',
      details: error.message
    }, 500)
  }
})

// Get User Details
admin.get('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id')

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }

    // Get user's projects
    const projects = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    // Get user's tasks
    const tasks = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).bind(userId).all()

    return c.json({
      success: true,
      user,
      projects: projects.results,
      tasks: tasks.results
    })
  } catch (error: any) {
    console.error('Failed to get user details:', error)
    return c.json({
      success: false,
      error: 'Failed to get user details',
      details: error.message
    }, 500)
  }
})

// Update User
admin.put('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const body = await c.req.json()

    const allowedFields = ['name', 'role', 'is_active']
    const updates: string[] = []
    const params: any[] = []

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`${field} = ?`)
        params.push(body[field])
      }
    }

    if (updates.length === 0) {
      return c.json({ success: false, error: 'No valid fields to update' }, 400)
    }

    params.push(userId)

    await c.env.DB.prepare(
      `UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`
    ).bind(...params).run()

    return c.json({ success: true, message: 'User updated successfully' })
  } catch (error: any) {
    console.error('Failed to update user:', error)
    return c.json({
      success: false,
      error: 'Failed to update user',
      details: error.message
    }, 500)
  }
})

// Delete User
admin.delete('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id')

    // Check if user exists
    const user = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }

    // Delete user (cascade will handle related records)
    await c.env.DB.prepare(
      'DELETE FROM users WHERE id = ?'
    ).bind(userId).run()

    return c.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    return c.json({
      success: false,
      error: 'Failed to delete user',
      details: error.message
    }, 500)
  }
})

// ==========================================
// PROJECT MANAGEMENT
// ==========================================

// Get All Projects
admin.get('/projects', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let query = `
      SELECT p.*, u.email as user_email, u.name as user_name
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
    `
    let countQuery = 'SELECT COUNT(*) as count FROM projects'
    const params: any[] = []

    if (status) {
      query += ' WHERE p.status = ?'
      countQuery += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'

    const totalResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first()
    const total = totalResult?.count || 0

    const result = await c.env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all()

    return c.json({
      success: true,
      projects: result.results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Failed to get projects:', error)
    return c.json({
      success: false,
      error: 'Failed to get projects',
      details: error.message
    }, 500)
  }
})

// Get Project Statistics
admin.get('/projects/stats', async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM projects
      GROUP BY status
    `).all()

    return c.json({
      success: true,
      stats: stats.results
    })
  } catch (error: any) {
    console.error('Failed to get project stats:', error)
    return c.json({
      success: false,
      error: 'Failed to get project statistics',
      details: error.message
    }, 500)
  }
})

// ==========================================
// AI SYSTEM MANAGEMENT
// ==========================================

// Get AI Agent Statistics
admin.get('/ai/agents/stats', async (c) => {
  try {
    // Get task statistics by type (proxy for agent usage)
    const agentStats = await c.env.DB.prepare(`
      SELECT 
        COALESCE(agent_type, 'unknown') as agent,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as recent
      FROM tasks
      GROUP BY agent_type
    `).all()

    return c.json({
      success: true,
      agents: agentStats.results
    })
  } catch (error: any) {
    console.error('Failed to get AI stats:', error)
    return c.json({
      success: false,
      error: 'Failed to get AI agent statistics',
      details: error.message
    }, 500)
  }
})

// Get AI Usage Trend (Last 7 days)
admin.get('/ai/usage/trend', async (c) => {
  try {
    const trend = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM tasks
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all()

    return c.json({
      success: true,
      trend: trend.results
    })
  } catch (error: any) {
    console.error('Failed to get AI usage trend:', error)
    return c.json({
      success: false,
      error: 'Failed to get AI usage trend',
      details: error.message
    }, 500)
  }
})

// ==========================================
// DATABASE MANAGEMENT
// ==========================================

// Get Database Statistics
admin.get('/database/stats', async (c) => {
  try {
    const tables = [
      'users',
      'projects', 
      'tasks',
      'comments',
      'behaviors',
      'workflows'
    ]

    const stats = []
    for (const table of tables) {
      const result = await c.env.DB.prepare(
        `SELECT COUNT(*) as count FROM ${table}`
      ).first()
      
      stats.push({
        table,
        rows: result?.count || 0
      })
    }

    return c.json({
      success: true,
      tables: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to get database stats:', error)
    return c.json({
      success: false,
      error: 'Failed to get database statistics',
      details: error.message
    }, 500)
  }
})

export default admin
