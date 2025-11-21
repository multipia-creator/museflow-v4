import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
};

const auth = new Hono<{ Bindings: Bindings }>();

// Simple password hashing (in production, use bcrypt or Argon2)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate JWT token
async function generateToken(userId: number, email: string): Promise<string> {
  const secret = 'museflow-secret-key-2024'; // In production, use env variable
  const payload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };
  return await sign(payload, secret);
}

// Signup endpoint
auth.post('/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    // Validation
    if (!name || !email || !password) {
      return c.json({ error: '모든 필드를 입력해주세요.' }, 400);
    }
    
    if (password.length < 8) {
      return c.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, 400);
    }
    
    // Check if user exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existing) {
      return c.json({ error: '이미 등록된 이메일입니다.' }, 409);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).bind(name, email, passwordHash).run();
    
    if (!result.success) {
      return c.json({ error: '회원가입에 실패했습니다.' }, 500);
    }
    
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
    }, 201);
    
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Validation
    if (!email || !password) {
      return c.json({ error: '이메일과 비밀번호를 입력해주세요.' }, 400);
    }
    
    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string);
    
    if (!isValid) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }
    
    // Generate token
    const token = await generateToken(user.id as number, user.email as string);
    
    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();
    
    // Store session
    await c.env.DB.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(user.id, token).run();
    
    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Get current user endpoint
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '인증 토큰이 필요합니다.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const secret = 'museflow-secret-key-2024';
    
    try {
      const payload = await verify(token, secret);
      
      // Get user from database
      const user = await c.env.DB.prepare(
        'SELECT id, email, name, created_at, last_login FROM users WHERE id = ?'
      ).bind(payload.userId).first();
      
      if (!user) {
        return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
      }
      
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
          lastLogin: user.last_login,
        },
      });
      
    } catch (error) {
      return c.json({ error: '유효하지 않은 토큰입니다.' }, 401);
    }
    
  } catch (error) {
    console.error('Me endpoint error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Logout endpoint
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '인증 토큰이 필요합니다.' }, 401);
    }
    
    const token = authHeader.substring(7);
    
    // Delete session
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE token = ?'
    ).bind(token).run();
    
    return c.json({ success: true, message: '로그아웃되었습니다.' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Update profile endpoint
auth.put('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '인증 토큰이 필요합니다.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const secret = 'museflow-secret-key-2024';
    
    try {
      const payload = await verify(token, secret);
      const { name, profileImage } = await c.req.json();
      
      // Validation
      if (!name || name.trim().length === 0) {
        return c.json({ error: '이름을 입력해주세요.' }, 400);
      }
      
      // Update profile
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, profile_image = ? WHERE id = ?'
      ).bind(name, profileImage || null, payload.userId).run();
      
      return c.json({
        success: true,
        message: '프로필이 업데이트되었습니다.',
      });
      
    } catch (error) {
      return c.json({ error: '유효하지 않은 토큰입니다.' }, 401);
    }
    
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// Change password endpoint
auth.put('/password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '인증 토큰이 필요합니다.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const secret = 'museflow-secret-key-2024';
    
    try {
      const payload = await verify(token, secret);
      const { currentPassword, newPassword } = await c.req.json();
      
      // Validation
      if (!currentPassword || !newPassword) {
        return c.json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' }, 400);
      }
      
      if (newPassword.length < 8) {
        return c.json({ error: '새 비밀번호는 8자 이상이어야 합니다.' }, 400);
      }
      
      // Get user
      const user = await c.env.DB.prepare(
        'SELECT id, password_hash FROM users WHERE id = ?'
      ).bind(payload.userId).first();
      
      if (!user) {
        return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
      }
      
      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password_hash as string);
      
      if (!isValid) {
        return c.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 401);
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update password
      await c.env.DB.prepare(
        'UPDATE users SET password_hash = ? WHERE id = ?'
      ).bind(newPasswordHash, payload.userId).run();
      
      // Delete all sessions (force re-login)
      await c.env.DB.prepare(
        'DELETE FROM sessions WHERE user_id = ?'
      ).bind(payload.userId).run();
      
      return c.json({
        success: true,
        message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.',
      });
      
    } catch (error) {
      return c.json({ error: '유효하지 않은 토큰입니다.' }, 401);
    }
    
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

export default auth;
