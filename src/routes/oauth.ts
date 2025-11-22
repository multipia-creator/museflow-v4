import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
  JWT_SECRET: string;
};

type OAuthProvider = 'google' | 'naver' | 'kakao';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface NaverUserInfo {
  response: {
    id: string;
    email: string;
    name: string;
    profile_image?: string;
  };
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email: string;
    profile?: {
      nickname: string;
      profile_image_url?: string;
    };
  };
}

const oauth = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/oauth/config
 * Returns OAuth client configuration for frontend
 */
oauth.get('/config', async (c) => {
  try {
    const provider = c.req.query('provider') as OAuthProvider;
    
    if (!provider || !['google', 'naver', 'kakao'].includes(provider)) {
      return c.json({ error: 'Invalid provider' }, 400);
    }

    let clientId: string;
    
    switch (provider) {
      case 'google':
        clientId = c.env.GOOGLE_CLIENT_ID;
        break;
      case 'naver':
        clientId = c.env.NAVER_CLIENT_ID;
        break;
      case 'kakao':
        clientId = c.env.KAKAO_CLIENT_ID;
        break;
    }

    if (!clientId) {
      return c.json({ error: 'OAuth provider not configured' }, 500);
    }

    return c.json({ 
      provider,
      clientId 
    });
  } catch (error) {
    console.error('OAuth config error:', error);
    return c.json({ error: 'Failed to load OAuth configuration' }, 500);
  }
});

/**
 * POST /api/oauth/token
 * Exchange authorization code for access token
 */
oauth.post('/token', async (c) => {
  try {
    const body = await c.req.json();
    const { provider, code, redirect_uri } = body;

    if (!provider || !code || !redirect_uri) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    let tokenUrl: string;
    let clientId: string;
    let clientSecret: string;

    switch (provider as OAuthProvider) {
      case 'google':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        clientId = c.env.GOOGLE_CLIENT_ID;
        clientSecret = c.env.GOOGLE_CLIENT_SECRET;
        break;
      case 'naver':
        tokenUrl = 'https://nid.naver.com/oauth2.0/token';
        clientId = c.env.NAVER_CLIENT_ID;
        clientSecret = c.env.NAVER_CLIENT_SECRET;
        break;
      case 'kakao':
        tokenUrl = 'https://kauth.kakao.com/oauth/token';
        clientId = c.env.KAKAO_CLIENT_ID;
        clientSecret = c.env.KAKAO_CLIENT_SECRET;
        break;
      default:
        return c.json({ error: 'Invalid provider' }, 400);
    }

    // Exchange code for token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirect_uri
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return c.json({ error: 'Failed to exchange code for token' }, 400);
    }

    const tokenData = await tokenResponse.json();
    return c.json(tokenData);
  } catch (error) {
    console.error('Token exchange error:', error);
    return c.json({ error: 'Failed to exchange code for token' }, 500);
  }
});

/**
 * POST /api/oauth/userinfo
 * Get user information from OAuth provider
 */
oauth.post('/userinfo', async (c) => {
  try {
    const body = await c.req.json();
    const { provider, access_token } = body;

    if (!provider || !access_token) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    let userInfoUrl: string;
    let headers: Record<string, string>;

    switch (provider as OAuthProvider) {
      case 'google':
        userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        headers = { 'Authorization': `Bearer ${access_token}` };
        break;
      case 'naver':
        userInfoUrl = 'https://openapi.naver.com/v1/nid/me';
        headers = { 'Authorization': `Bearer ${access_token}` };
        break;
      case 'kakao':
        userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
        headers = { 'Authorization': `Bearer ${access_token}` };
        break;
      default:
        return c.json({ error: 'Invalid provider' }, 400);
    }

    const userInfoResponse = await fetch(userInfoUrl, {
      method: 'GET',
      headers
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.text();
      console.error('User info fetch failed:', errorData);
      return c.json({ error: 'Failed to fetch user info' }, 400);
    }

    const userInfo = await userInfoResponse.json();
    return c.json(userInfo);
  } catch (error) {
    console.error('User info fetch error:', error);
    return c.json({ error: 'Failed to fetch user info' }, 500);
  }
});

/**
 * POST /api/oauth/complete
 * Complete OAuth login - create/login user and issue JWT
 */
oauth.post('/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { provider, user_info } = body;

    if (!provider || !user_info) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    // Extract user data based on provider
    let email: string;
    let name: string;
    let providerId: string;
    let avatarUrl: string | undefined;

    switch (provider as OAuthProvider) {
      case 'google': {
        const googleInfo = user_info as GoogleUserInfo;
        email = googleInfo.email;
        name = googleInfo.name;
        providerId = googleInfo.id;
        avatarUrl = googleInfo.picture;
        break;
      }
      case 'naver': {
        const naverInfo = user_info as NaverUserInfo;
        email = naverInfo.response.email;
        name = naverInfo.response.name;
        providerId = naverInfo.response.id;
        avatarUrl = naverInfo.response.profile_image;
        break;
      }
      case 'kakao': {
        const kakaoInfo = user_info as KakaoUserInfo;
        email = kakaoInfo.kakao_account.email;
        name = kakaoInfo.kakao_account.profile?.nickname || 'User';
        providerId = kakaoInfo.id.toString();
        avatarUrl = kakaoInfo.kakao_account.profile?.profile_image_url;
        break;
      }
      default:
        return c.json({ error: 'Invalid provider' }, 400);
    }

    if (!email) {
      return c.json({ error: 'Email not provided by OAuth provider' }, 400);
    }

    // Check if user exists in database
    const db = c.env.DB;
    
    // First, check if user exists by email
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    let userId: number;

    if (existingUser) {
      // User exists - update OAuth info if needed
      userId = existingUser.id as number;
      
      await db.prepare(`
        UPDATE users 
        SET oauth_provider = ?, oauth_provider_id = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(provider, providerId, avatarUrl, userId).run();
    } else {
      // Create new user
      const result = await db.prepare(`
        INSERT INTO users (name, email, oauth_provider, oauth_provider_id, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(name, email, provider, providerId, avatarUrl).run();

      userId = result.meta.last_row_id as number;
    }

    // Generate JWT token (simplified - in production, use proper JWT library)
    const tokenPayload = {
      userId,
      email,
      name,
      provider,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Simple token generation (Base64 encoding)
    // Note: In production, use proper JWT signing with crypto
    const token = btoa(JSON.stringify(tokenPayload));

    // Return user data and token
    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        avatarUrl,
        provider
      }
    });
  } catch (error) {
    console.error('OAuth complete error:', error);
    return c.json({ error: 'Failed to complete OAuth login' }, 500);
  }
});

export default oauth
