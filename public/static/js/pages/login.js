// Museflow v4.0 - Login Page (World-Class Design)

const Login = {
  /**
   * Initialize login page
   */
  init() {
    console.log('🔐 Loading Login Page');
    this.render();
    this.attachEvents();
  },
  
  /**
   * Render login page HTML
   */
  render() {
    const container = document.createElement('div');
    container.setAttribute('data-page', 'login');
    
    container.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
      ">
        <!-- Background Decorations -->
        <div style="
          position: absolute;
          top: -10%;
          right: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          bottom: -15%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        
        <!-- Left Side - Branding -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          position: relative;
          z-index: 1;
        ">
          <!-- Logo -->
          <div style="
            background: white;
            border-radius: 20px;
            padding: 24px 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          ">
            <img src="/static/images/logo-horizontal.png" alt="Museflow" style="height: 48px; width: auto;">
          </div>
          
          <!-- Branding Text -->
          <h1 style="
            font-size: 48px;
            font-weight: 800;
            color: white;
            margin-bottom: 16px;
            text-align: center;
          ">Welcome Back</h1>
          <p style="
            font-size: 20px;
            color: rgba(255,255,255,0.9);
            text-align: center;
            max-width: 400px;
            line-height: 1.6;
          ">
            Log in to continue managing your museum workflows with AI-powered automation
          </p>
        </div>
        
        <!-- Right Side - Login Form -->
        <div style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px;
          position: relative;
          z-index: 1;
        ">
          <div style="
            width: 100%;
            max-width: 480px;
            background: white;
            border-radius: 24px;
            padding: 48px;
            box-shadow: 0 30px 90px rgba(0,0,0,0.3);
          ">
            <!-- Header -->
            <div style="margin-bottom: 40px;">
              <h2 style="
                font-size: 32px;
                font-weight: 700;
                color: var(--gray-900);
                margin-bottom: 8px;
              ">Sign In</h2>
              <p style="
                font-size: 16px;
                color: var(--gray-600);
              ">Enter your credentials to access your account</p>
            </div>
            
            <!-- Login Form -->
            <form id="login-form">
              <!-- Email -->
              <div style="margin-bottom: 24px;">
                <label style="
                  display: block;
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--gray-700);
                  margin-bottom: 8px;
                ">Email Address</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  required
                  style="
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid var(--gray-300);
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.2s;
                    outline: none;
                  "
                />
              </div>
              
              <!-- Password -->
              <div style="margin-bottom: 24px;">
                <label style="
                  display: block;
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--gray-700);
                  margin-bottom: 8px;
                ">Password</label>
                <div style="position: relative;">
                  <input
                    type="password"
                    id="login-password"
                    placeholder="Enter your password"
                    required
                    style="
                      width: 100%;
                      padding: 14px 16px;
                      border: 2px solid var(--gray-300);
                      border-radius: 12px;
                      font-size: 16px;
                      transition: all 0.2s;
                      outline: none;
                    "
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    style="
                      position: absolute;
                      right: 16px;
                      top: 50%;
                      transform: translateY(-50%);
                      background: none;
                      border: none;
                      color: var(--gray-500);
                      cursor: pointer;
                      font-size: 20px;
                    "
                  >👁️</button>
                </div>
              </div>
              
              <!-- Remember Me & Forgot Password -->
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 32px;
              ">
                <label style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  cursor: pointer;
                  font-size: 14px;
                  color: var(--gray-700);
                ">
                  <input type="checkbox" id="remember-me" style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                  ">
                  <span>Remember me</span>
                </label>
                <a href="#" id="forgot-password" style="
                  font-size: 14px;
                  color: var(--primary-600);
                  font-weight: 600;
                ">Forgot password?</a>
              </div>
              
              <!-- Submit Button -->
              <button
                type="submit"
                id="login-submit"
                class="btn btn-primary btn-large"
                style="
                  width: 100%;
                  margin-bottom: 24px;
                  padding: 16px;
                  font-size: 16px;
                  font-weight: 600;
                "
              >
                Sign In
              </button>
              
              <!-- Divider -->
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 24px;
              ">
                <div style="flex: 1; height: 1px; background: var(--gray-300);"></div>
                <span style="padding: 0 16px; color: var(--gray-500); font-size: 14px;">or</span>
                <div style="flex: 1; height: 1px; background: var(--gray-300);"></div>
              </div>
              
              <!-- Social Login Buttons -->
              <div style="display: flex; gap: 12px; margin-bottom: 32px;">
                <button
                  type="button"
                  class="social-login-btn"
                  data-provider="google"
                  style="
                    flex: 1;
                    padding: 12px;
                    border: 2px solid var(--gray-300);
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--gray-700);
                  "
                >
                  <span style="font-size: 20px;">🔍</span>
                  Google
                </button>
                <button
                  type="button"
                  class="social-login-btn"
                  data-provider="github"
                  style="
                    flex: 1;
                    padding: 12px;
                    border: 2px solid var(--gray-300);
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--gray-700);
                  "
                >
                  <span style="font-size: 20px;">💻</span>
                  GitHub
                </button>
              </div>
              
              <!-- Sign Up Link -->
              <div style="text-align: center;">
                <span style="color: var(--gray-600); font-size: 14px;">
                  Don't have an account?
                </span>
                <a href="#" id="goto-signup" style="
                  color: var(--primary-600);
                  font-weight: 600;
                  font-size: 14px;
                  margin-left: 4px;
                ">Sign up</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('app').appendChild(container);
    
    // Add custom styles for form elements
    this.addFormStyles();
  },
  
  /**
   * Add custom form styles
   */
  addFormStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #login-email:focus,
      #login-password:focus {
        border-color: var(--primary-500);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }
      
      .social-login-btn:hover {
        border-color: var(--primary-500);
        background: var(--primary-50);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      @media (max-width: 768px) {
        [data-page="login"] > div {
          flex-direction: column;
        }
        [data-page="login"] > div > div {
          padding: 40px 24px;
        }
      }
    `;
    document.head.appendChild(style);
  },
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    // Form submission
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
    
    // Password toggle
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    toggleBtn?.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
    
    // Social login buttons
    document.querySelectorAll('.social-login-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.dataset.provider;
        this.handleSocialLogin(provider);
      });
    });
    
    // Goto signup
    document.getElementById('goto-signup')?.addEventListener('click', (e) => {
      e.preventDefault();
      Router.navigate('/signup');
    });
    
    // Forgot password
    document.getElementById('forgot-password')?.addEventListener('click', (e) => {
      e.preventDefault();
      Toast.info('Password reset feature coming soon!', 3000);
    });
  },
  
  /**
   * Handle login submission
   */
  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Disable button
    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
      // Call auth system
      const result = await Auth.login(email, password);
      
      if (result.success) {
        Toast.success('Welcome back! 👋', 2000);
        
        // Remember me
        if (rememberMe) {
          localStorage.setItem('museflow_remember', 'true');
        }
        
        // Navigate to project manager after short delay
        setTimeout(() => {
          Router.navigate('/project-manager');
        }, 1000);
      } else {
        Toast.error(result.error || 'Login failed', 3000);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.error('An error occurred. Please try again.', 3000);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  },
  
  /**
   * Handle social login
   */
  handleSocialLogin(provider) {
    Toast.info(`${provider} login coming soon! 🚀`, 3000);
    // TODO: Implement OAuth flow
  }
};

// Expose globally
window.Login = Login;
console.log('✅ Login Page loaded');
