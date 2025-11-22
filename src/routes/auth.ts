import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  isValidEmail,
  validatePassword,
  checkRateLimit,
  resetRateLimit,
  getJWTSecret
} from '../utils/security';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

// Generate JWT token
async function generateToken(userId: number, email: string, jwtSecret: string): Promise<string> {
  const payload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };
  return await sign(payload, jwtSecret);
}

// Get client IP for rate limiting
function getClientIP(c: any): string {
  return c.req.header('CF-Connecting-IP') || 
         c.req.header('X-Forwarded-For') || 
         c.req.header('X-Real-IP') || 
         'unknown';
}

/**
 * POST /api/auth/signup
 * Register new user with enhanced security
 */
auth.post('/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    // Rate limiting
    const clientIP = getClientIP(c);
    const rateLimit = checkRateLimit(`signup_${clientIP}`, 3, 60 * 60 * 1000); // 3 attempts per hour
    
    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60);
      return c.json({ 
        error: `Too many signup attempts. Please try again in ${resetIn} minutes.` 
      }, 429);
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    // Validation
    if (!sanitizedName || !sanitizedEmail || !password) {
      return c.json({ error: 'All fields are required.' }, 400);
    }
    
    if (!isValidEmail(sanitizedEmail)) {
      return c.json({ error: 'Invalid email format.' }, 400);
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.message }, 400);
    }
    
    // Check if user exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(sanitizedEmail).first();
    
    if (existing) {
      return c.json({ error: 'Email already registered.' }, 409);
    }
    
    // Hash password with salt
    const { hash, salt } = await hashPassword(password);
    
    // Create user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(sanitizedName, sanitizedEmail, hash, salt).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create account.' }, 500);
    }
    
    // Reset rate limit on success
    resetRateLimit(`signup_${clientIP}`);
    
    return c.json({
      success: true,
      message: 'Account created successfully.',
    }, 201);
    
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

/**
 * POST /api/auth/login
 * Login with enhanced security (rate limiting, etc.)
 */
auth.post('/login', async (c) => {
  try {
    const { email, password, rememberMe } = await c.req.json();
    
    // Sanitize email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    // Rate limiting by email and IP
    const clientIP = getClientIP(c);
    const emailRateLimit = checkRateLimit(`login_email_${sanitizedEmail}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min
    const ipRateLimit = checkRateLimit(`login_ip_${clientIP}`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
    
    if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
      const resetIn = Math.ceil((Math.min(emailRateLimit.resetAt, ipRateLimit.resetAt) - Date.now()) / 1000 / 60);
      return c.json({ 
        error: `Too many login attempts. Please try again in ${resetIn} minutes.` 
      }, 429);
    }
    
    // Validation
    if (!sanitizedEmail || !password) {
      return c.json({ error: 'Email and password are required.' }, 400);
    }
    
    // Find user
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, password_hash, password_salt, oauth_provider, avatar_url 
      FROM users 
      WHERE email = ?
    `).bind(sanitizedEmail).first();
    
    if (!user) {
      return c.json({ error: 'Invalid email or password.' }, 401);
    }
    
    // Check if OAuth user trying to login with password
    if (user.oauth_provider && !user.password_hash) {
      return c.json({ 
        error: `This account uses ${user.oauth_provider} login. Please use the ${user.oauth_provider} button.` 
      }, 400);
    }
    
    // Verify password
    const isValid = await verifyPassword(
      password, 
      user.password_hash as string, 
      user.password_salt as string
    );
    
    if (!isValid) {
      return c.json({ error: 'Invalid email or password.' }, 401);
    }
    
    // Generate token
    const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    const token = await sign({
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    }, jwtSecret);
    
    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();
    
    // Store session
    await c.env.DB.prepare(`
      INSERT INTO sessions (user_id, token, expires_at, created_at)
      VALUES (?, ?, datetime('now', '+${rememberMe ? 30 : 7} days'), CURRENT_TIMESTAMP)
    `).bind(user.id, token).run();
    
    // Reset rate limits on successful login
    resetRateLimit(`login_email_${sanitizedEmail}`);
    resetRateLimit(`login_ip_${clientIP}`);
    
    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

/**
 * GET /api/auth/me
 * Get current user with JWT verification
 */
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication token required.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
    
    try {
      const payload = await verify(token, jwtSecret);
      
      // Verify session exists and not expired
      const session = await c.env.DB.prepare(
        'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
      ).bind(token).first();
      
      if (!session) {
        return c.json({ error: 'Session expired. Please login again.' }, 401);
      }
      
      // Get user from database
      const user = await c.env.DB.prepare(`
        SELECT id, email, name, avatar_url, oauth_provider, created_at, last_login 
        FROM users 
        WHERE id = ?
      `).bind(payload.userId).first();
      
      if (!user) {
        return c.json({ error: 'User not found.' }, 404);
      }
      
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          oauthProvider: user.oauth_provider,
          createdAt: user.created_at,
          lastLogin: user.last_login,
        },
      });
      
    } catch (error) {
      return c.json({ error: 'Invalid or expired token.' }, 401);
    }
    
  } catch (error) {
    console.error('Me endpoint error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication token required.' }, 401);
    }
    
    const token = authHeader.substring(7);
    
    // Delete session
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE token = ?'
    ).bind(token).run();
    
    return c.json({ success: true, message: 'Logged out successfully.' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
auth.put('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication token required.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
    
    try {
      const payload = await verify(token, jwtSecret);
      const { name, profileImage } = await c.req.json();
      
      // Sanitize input
      const sanitizedName = sanitizeInput(name);
      
      // Validation
      if (!sanitizedName || sanitizedName.trim().length === 0) {
        return c.json({ error: 'Name is required.' }, 400);
      }
      
      // Update profile
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(sanitizedName, profileImage || null, payload.userId).run();
      
      return c.json({
        success: true,
        message: 'Profile updated successfully.',
      });
      
    } catch (error) {
      return c.json({ error: 'Invalid or expired token.' }, 401);
    }
    
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

/**
 * GET /api/auth/csrf-token
 * Generate CSRF token for state-changing operations
 */
auth.get('/csrf-token', async (c) => {
  try {
    const { generateCSRFToken } = await import('../utils/security');
    const csrfToken = generateCSRFToken();
    
    // Store in session or return to client
    // Client should include this in X-CSRF-Token header for state-changing requests
    return c.json({
      csrfToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error('CSRF token error:', error);
    return c.json({ error: 'Failed to generate CSRF token.' }, 500);
  }
});

/**
 * PUT /api/auth/password
 * Change password with security checks
 */
auth.put('/password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication token required.' }, 401);
    }
    
    const token = authHeader.substring(7);
    const jwtSecret = getJWTSecret(c.env.JWT_SECRET);
    
    try {
      const payload = await verify(token, jwtSecret);
      const { currentPassword, newPassword } = await c.req.json();
      
      // Validation
      if (!currentPassword || !newPassword) {
        return c.json({ error: 'Current and new password are required.' }, 400);
      }
      
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return c.json({ error: passwordValidation.message }, 400);
      }
      
      // Get user
      const user = await c.env.DB.prepare(`
        SELECT id, password_hash, password_salt, oauth_provider 
        FROM users 
        WHERE id = ?
      `).bind(payload.userId).first();
      
      if (!user) {
        return c.json({ error: 'User not found.' }, 404);
      }
      
      // Check if OAuth user
      if (user.oauth_provider && !user.password_hash) {
        return c.json({ 
          error: 'OAuth users cannot change password. Please use your OAuth provider.' 
        }, 400);
      }
      
      // Verify current password
      const isValid = await verifyPassword(
        currentPassword, 
        user.password_hash as string, 
        user.password_salt as string
      );
      
      if (!isValid) {
        return c.json({ error: 'Current password is incorrect.' }, 401);
      }
      
      // Hash new password
      const { hash, salt } = await hashPassword(newPassword);
      
      // Update password
      await c.env.DB.prepare(
        'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(hash, salt, payload.userId).run();
      
      // Delete all sessions (force re-login)
      await c.env.DB.prepare(
        'DELETE FROM sessions WHERE user_id = ?'
      ).bind(payload.userId).run();
      
      return c.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
      
    } catch (error) {
      return c.json({ error: 'Invalid or expired token.' }, 401);
    }
    
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: 'Server error occurred.' }, 500);
  }
});

export default auth;
