/**
 * OAuth Manager - Google/Naver/Kakao Social Login
 * Handles OAuth 2.0 authentication flows for all three providers
 * 
 * Features:
 * - Google OAuth 2.0 (OpenID Connect)
 * - Naver OAuth 2.0
 * - Kakao OAuth 2.0
 * - State parameter for CSRF protection
 * - Multi-language support
 * - Error handling with user-friendly messages
 */

const OAuthManager = {
    // OAuth Configuration
    // These values should be set in .dev.vars for local development
    // For production, set them as Cloudflare Pages environment variables
    config: {
        google: {
            clientId: '', // Will be loaded from environment
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            scope: 'openid email profile',
            responseType: 'code'
        },
        naver: {
            clientId: '', // Will be loaded from environment
            authUrl: 'https://nid.naver.com/oauth2.0/authorize',
            tokenUrl: 'https://nid.naver.com/oauth2.0/token',
            userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
            scope: 'email name',
            responseType: 'code'
        },
        kakao: {
            clientId: '', // Will be loaded from environment
            authUrl: 'https://kauth.kakao.com/oauth/authorize',
            tokenUrl: 'https://kauth.kakao.com/oauth/token',
            userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
            scope: 'profile_nickname account_email',
            responseType: 'code'
        }
    },

    // Get redirect URI based on current environment
    getRedirectUri(provider) {
        const host = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        // Sandbox environment
        if (host.includes('.sandbox.novita.ai')) {
            return `${protocol}//${host}/oauth-callback.html?provider=${provider}`;
        }
        
        // Cloudflare Pages production
        if (host.includes('.pages.dev')) {
            return `${protocol}//${host}/oauth-callback.html?provider=${provider}`;
        }
        
        // Localhost
        if (host === 'localhost') {
            return `${protocol}//${host}:${port || '8000'}/oauth-callback.html?provider=${provider}`;
        }
        
        // Default
        return `${protocol}//${host}/oauth-callback.html?provider=${provider}`;
    },

    // Generate random state for CSRF protection
    generateState() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Store state in sessionStorage for verification
    saveState(state, provider) {
        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('oauth_provider', provider);
        sessionStorage.setItem('oauth_timestamp', Date.now().toString());
    },

    // Verify state matches stored state
    verifyState(state) {
        const storedState = sessionStorage.getItem('oauth_state');
        const timestamp = parseInt(sessionStorage.getItem('oauth_timestamp') || '0');
        const now = Date.now();
        
        // State must match and be less than 10 minutes old
        return storedState === state && (now - timestamp) < 600000;
    },

    // Initialize Google OAuth flow
    async loginWithGoogle() {
        try {
            const provider = 'google';
            const state = this.generateState();
            this.saveState(state, provider);

            const redirectUri = this.getRedirectUri(provider);
            const clientId = this.config.google.clientId || await this.loadClientId('google');

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: this.config.google.responseType,
                scope: this.config.google.scope,
                state: state,
                access_type: 'offline',
                prompt: 'consent'
            });

            const authUrl = `${this.config.google.authUrl}?${params.toString()}`;
            
            // Show loading before redirect
            if (typeof Loading !== 'undefined') {
                Loading.show('Redirecting to Google...');
            }
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Google OAuth initialization error:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to initialize Google login');
            } else {
                this.showError('Failed to initialize Google login');
            }
        }
    },

    // Initialize Naver OAuth flow
    async loginWithNaver() {
        try {
            const provider = 'naver';
            const state = this.generateState();
            this.saveState(state, provider);

            const redirectUri = this.getRedirectUri(provider);
            const clientId = this.config.naver.clientId || await this.loadClientId('naver');

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: this.config.naver.responseType,
                state: state
            });

            const authUrl = `${this.config.naver.authUrl}?${params.toString()}`;
            
            // Show loading before redirect
            if (typeof Loading !== 'undefined') {
                Loading.show('Redirecting to Naver...');
            }
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Naver OAuth initialization error:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to initialize Naver login');
            } else {
                this.showError('Failed to initialize Naver login');
            }
        }
    },

    // Initialize Kakao OAuth flow
    async loginWithKakao() {
        try {
            const provider = 'kakao';
            const state = this.generateState();
            this.saveState(state, provider);

            const redirectUri = this.getRedirectUri(provider);
            const clientId = this.config.kakao.clientId || await this.loadClientId('kakao');

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: this.config.kakao.responseType,
                state: state
            });

            const authUrl = `${this.config.kakao.authUrl}?${params.toString()}`;
            
            // Show loading before redirect
            if (typeof Loading !== 'undefined') {
                Loading.show('Redirecting to Kakao...');
            }
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Kakao OAuth initialization error:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to initialize Kakao login');
            } else {
                this.showError('Failed to initialize Kakao login');
            }
        }
    },

    // Load client ID from backend API
    async loadClientId(provider) {
        try {
            const response = await fetch(`/api/oauth/config?provider=${provider}`);
            if (!response.ok) {
                throw new Error('Failed to load OAuth configuration');
            }
            const data = await response.json();
            return data.clientId;
        } catch (error) {
            console.error('Failed to load client ID:', error);
            throw error;
        }
    },

    // Handle OAuth callback (authorization code)
    async handleCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const provider = urlParams.get('provider') || sessionStorage.getItem('oauth_provider');
            const error = urlParams.get('error');

            // Handle OAuth errors
            if (error) {
                const errorDescription = urlParams.get('error_description') || 'OAuth authentication failed';
                throw new Error(errorDescription);
            }

            // Verify required parameters
            if (!code || !state || !provider) {
                throw new Error('Missing required OAuth parameters');
            }

            // Verify state for CSRF protection
            if (!this.verifyState(state)) {
                throw new Error('Invalid OAuth state - possible CSRF attack');
            }

            // Show loading indicator
            this.showLoading('Completing authentication...');

            // Exchange authorization code for access token
            const tokenData = await this.exchangeCodeForToken(provider, code);

            // Get user info from OAuth provider
            const userInfo = await this.getUserInfo(provider, tokenData.access_token);

            // Send user info to backend for account creation/login
            const authResult = await this.completeOAuthLogin(provider, userInfo, tokenData);

            // Clean up
            sessionStorage.removeItem('oauth_state');
            sessionStorage.removeItem('oauth_provider');
            sessionStorage.removeItem('oauth_timestamp');

            // Store auth token
            localStorage.setItem('authToken', authResult.token);
            localStorage.setItem('user', JSON.stringify(authResult.user));

            // Redirect to dashboard
            this.showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/projects.html';
            }, 1000);

        } catch (error) {
            console.error('OAuth callback error:', error);
            this.showError(error.message);
            
            // Redirect back to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        }
    },

    // Exchange authorization code for access token
    async exchangeCodeForToken(provider, code) {
        try {
            const response = await fetch('/api/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: provider,
                    code: code,
                    redirect_uri: this.getRedirectUri(provider)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to exchange code for token');
            }

            return await response.json();
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    },

    // Get user info from OAuth provider
    async getUserInfo(provider, accessToken) {
        try {
            const response = await fetch('/api/oauth/userinfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: provider,
                    access_token: accessToken
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get user info');
            }

            return await response.json();
        } catch (error) {
            console.error('User info error:', error);
            throw error;
        }
    },

    // Complete OAuth login (create/login user in backend)
    async completeOAuthLogin(provider, userInfo, tokenData) {
        try {
            const response = await fetch('/api/oauth/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: provider,
                    user_info: userInfo,
                    token_data: tokenData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to complete OAuth login');
            }

            return await response.json();
        } catch (error) {
            console.error('Complete OAuth login error:', error);
            throw error;
        }
    },

    // UI Helper: Show loading message
    showLoading(message) {
        const container = document.getElementById('oauth-status');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem;">${message}</p>
                </div>
            `;
        }
    },

    // UI Helper: Show success message
    showSuccess(message) {
        const container = document.getElementById('oauth-status');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem;">${message}</p>
                </div>
            `;
        }
    },

    // UI Helper: Show error message
    showError(message) {
        const container = document.getElementById('oauth-status');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; margin-bottom: 1rem;">${message}</p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Redirecting to login page...</p>
                </div>
            `;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthManager;
}
