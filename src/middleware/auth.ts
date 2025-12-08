/**
 * JWT Authentication Middleware
 * 모든 보호된 API 라우트에 적용
 */

import { verify } from 'hono/jwt';
import { Context, Next } from 'hono';
import { getJWTSecret } from '../utils/security';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

/**
 * JWT 인증 미들웨어
 * Authorization: Bearer <token> 헤더에서 JWT 토큰 검증
 */
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      error: '인증 토큰이 필요합니다',
      code: 'AUTH_TOKEN_REQUIRED' 
    }, 401);
  }
  
  const token = authHeader.substring(7); // 'Bearer ' 제거
  const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
  
  try {
    // JWT 토큰 검증
    const payload = await verify(token, jwtSecret) as { userId: number; email: string; exp: number };
    
    // 만료 확인
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ 
        error: '토큰이 만료되었습니다',
        code: 'TOKEN_EXPIRED' 
      }, 401);
    }
    
    // DB에서 사용자 정보 로드
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, is_approver, created_at, last_login
      FROM users 
      WHERE id = ?
    `).bind(payload.userId).first();
    
    if (!user) {
      return c.json({ 
        error: '사용자를 찾을 수 없습니다',
        code: 'USER_NOT_FOUND' 
      }, 404);
    }
    
    // 사용자 정보를 context에 저장
    c.set('user', user);
    
    // 다음 미들웨어/핸들러로 진행
    await next();
    
  } catch (error: any) {
    console.error('JWT 검증 실패:', error);
    return c.json({ 
      error: '유효하지 않은 토큰입니다',
      code: 'INVALID_TOKEN',
      details: error.message 
    }, 401);
  }
}

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 그냥 진행
 */
export async function optionalAuthMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
    
    try {
      const payload = await verify(token, jwtSecret) as { userId: number };
      const user = await c.env.DB.prepare(`
        SELECT id, email, name, is_approver
        FROM users 
        WHERE id = ?
      `).bind(payload.userId).first();
      
      if (user) {
        c.set('user', user);
      }
    } catch (error) {
      // 토큰 검증 실패해도 계속 진행 (선택적이므로)
      console.warn('Optional auth failed:', error);
    }
  }
  
  await next();
}

/**
 * 결재권자 전용 미들웨어
 * authMiddleware 이후에 사용
 */
export async function requireApprover(c: Context<{ Bindings: Bindings }>, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ 
      error: '인증이 필요합니다',
      code: 'AUTH_REQUIRED' 
    }, 401);
  }
  
  if (!user.is_approver) {
    return c.json({ 
      error: '결재 권한이 없습니다',
      code: 'PERMISSION_DENIED' 
    }, 403);
  }
  
  await next();
}

/**
 * Admin 전용 미들웨어
 * authMiddleware 이후에 사용
 */
export async function requireAdmin(c: Context<{ Bindings: Bindings }>, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ 
      error: '인증이 필요합니다',
      code: 'AUTH_REQUIRED' 
    }, 401);
  }
  
  // Admin 체크 (role이나 다른 필드로 확인)
  // 현재는 is_approver를 admin으로 간주
  if (!user.is_approver) {
    return c.json({ 
      error: '관리자 권한이 없습니다',
      code: 'ADMIN_REQUIRED' 
    }, 403);
  }
  
  await next();
}
