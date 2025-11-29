import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getJWTSecret } from '../utils/security';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

const projects = new Hono<{ Bindings: Bindings }>();

// Middleware to verify JWT
async function verifyAuth(c: any): Promise<number | null> {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const secret = getJWTSecret(c.env.JWT_SECRET);
    
    const payload = await verify(token, secret);
    return payload.userId as number;
    
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Get all projects for user
projects.get('/', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    const result = await c.env.DB.prepare(
      'SELECT id, title, description, status, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(userId).all();
    
    return c.json({
      projects: result.results || [],
    });
    
  } catch (error) {
    console.error('Get projects error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Get single project
projects.get('/:id', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    const projectId = c.req.param('id');
    
    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, userId).first();
    
    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없습니다.' }, 404);
    }
    
    return c.json({ project });
    
  } catch (error) {
    console.error('Get project error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Create new project
projects.post('/', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    const { title, description } = await c.req.json();
    
    if (!title || title.trim().length === 0) {
      return c.json({ error: '프로젝트 제목을 입력해주세요.' }, 400);
    }
    
    const result = await c.env.DB.prepare(
      'INSERT INTO projects (user_id, title, description, status) VALUES (?, ?, ?, ?)'
    ).bind(userId, title, description || '', 'draft').run();
    
    if (!result.success) {
      return c.json({ error: '프로젝트 생성에 실패했습니다.' }, 500);
    }
    
    return c.json({
      success: true,
      projectId: result.meta?.last_row_id,
      message: '프로젝트가 생성되었습니다.',
    }, 201);
    
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Update project
projects.put('/:id', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    const projectId = c.req.param('id');
    const { title, description, workflowData, status } = await c.req.json();
    
    // Check ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, userId).first();
    
    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없습니다.' }, 404);
    }
    
    // Update project
    await c.env.DB.prepare(
      'UPDATE projects SET title = ?, description = ?, workflow_data = ?, status = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(
      title || null,
      description || null,
      workflowData ? JSON.stringify(workflowData) : null,
      status || 'draft',
      projectId
    ).run();
    
    return c.json({
      success: true,
      message: '프로젝트가 업데이트되었습니다.',
    });
    
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Delete project
projects.delete('/:id', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    const projectId = c.req.param('id');
    
    // Check ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, userId).first();
    
    if (!project) {
      return c.json({ error: '프로젝트를 찾을 수 없습니다.' }, 404);
    }
    
    // Delete project
    await c.env.DB.prepare(
      'DELETE FROM projects WHERE id = ?'
    ).bind(projectId).run();
    
    return c.json({
      success: true,
      message: '프로젝트가 삭제되었습니다.',
    });
    
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Get project statistics
projects.get('/stats/summary', async (c) => {
  try {
    const userId = await verifyAuth(c);
    
    if (!userId) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }
    
    // Get total count
    const totalResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM projects WHERE user_id = ?'
    ).bind(userId).first();
    
    // Get active count
    const activeResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as active FROM projects WHERE user_id = ? AND status = ?'
    ).bind(userId, 'active').first();
    
    // Get count by status
    const draftResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as draft FROM projects WHERE user_id = ? AND status = ?'
    ).bind(userId, 'draft').first();
    
    const completedResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as completed FROM projects WHERE user_id = ? AND status = ?'
    ).bind(userId, 'completed').first();
    
    return c.json({
      success: true,
      stats: {
        total: totalResult?.total || 0,
        active: activeResult?.active || 0,
        draft: draftResult?.draft || 0,
        completed: completedResult?.completed || 0,
      }
    });
    
  } catch (error) {
    console.error('Get project stats error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

export default projects;
