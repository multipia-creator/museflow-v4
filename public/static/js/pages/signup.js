/**
 * Signup Page - World-Class Registration Experience
 * Features:
 * - Split-screen gradient design matching Login page
 * - Real-time password strength indicator
 * - Comprehensive form validation
 * - Terms & conditions acceptance
 * - Social registration options
 * - Smooth animations and transitions
 */

const Signup = {
  init() {
    console.log('🎨 Initializing Signup Page...');
    this.render();
    this.attachEvents();
  },

  render() {
    // Create page container
    const container = document.createElement('div');
    container.setAttribute('data-page', 'signup');
    
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        
        <!-- Left: Branding Section -->
        <div style="flex: 1; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; padding: 48px; color: white;">
          
          <!-- Logo -->
          <div style="width: 120px; height: 120px; background: white; 
                      border-radius: 30px; margin-bottom: 32px; display: flex; 
                      align-items: center; justify-content: center;
                      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                      animation: logoFloat 3s ease-in-out infinite;">
            <img src="/static/images/logo-square.png" alt="MuseFlow" style="width: 80px; height: 80px; border-radius: 16px; box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); mix-blend-mode: screen; background: transparent;">
          </div>
          
          <!-- Heading -->
          <h1 style="font-size: 48px; font-weight: 800; margin: 0 0 16px 0; 
                     text-align: center; text-shadow: 0 2px 20px rgba(0,0,0,0.2);">
            Join Museflow
          </h1>
          
          <p style="font-size: 20px; opacity: 0.9; text-align: center; 
                    max-width: 400px; line-height: 1.6; margin: 0;">
            Start your journey with AI-powered museum workflow management
          </p>
          
          <!-- Features List -->
          <div style="margin-top: 48px; text-align: left; max-width: 400px;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); 
                          border-radius: 12px; display: flex; align-items: center; 
                          justify-content: center; margin-right: 16px; font-size: 24px;">
                🎨
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">6 Specialized Modules</div>
                <div style="opacity: 0.8; font-size: 14px;">Exhibition, Education, Archive & more</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); 
                          border-radius: 12px; display: flex; align-items: center; 
                          justify-content: center; margin-right: 16px; font-size: 24px;">
                🤖
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">AI-Powered Tools</div>
                <div style="opacity: 0.8; font-size: 14px;">Intelligent automation & insights</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center;">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); 
                          border-radius: 12px; display: flex; align-items: center; 
                          justify-content: center; margin-right: 16px; font-size: 24px;">
                🌐
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">Cloud Collaboration</div>
                <div style="opacity: 0.8; font-size: 14px;">Work together in real-time</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right: Registration Form Section -->
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    padding: 48px;">
          
          <div style="background: white; border-radius: 24px; padding: 48px; 
                      width: 100%; max-width: 480px;
                      box-shadow: 0 30px 90px rgba(0,0,0,0.3);">
            
            <!-- Form Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
                Create Account
              </h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">
                Already have an account? 
                <a href="#" id="go-to-login" style="color: #6366f1; font-weight: 600; 
                                                     text-decoration: none;">
                  Sign in
                </a>
              </p>
            </div>
            
            <!-- Registration Form -->
            <form id="signup-form" style="display: flex; flex-direction: column; gap: 20px;">
              
              <!-- Full Name -->
              <div>
                <label style="display: block; font-weight: 600; color: #374151; 
                              margin-bottom: 8px; font-size: 14px;">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="signup-name" 
                  placeholder="Enter your full name"
                  required
                  style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; 
                         border-radius: 12px; font-size: 16px; transition: all 0.2s;
                         box-sizing: border-box;"
                  onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)';"
                  onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                />
              </div>
              
              <!-- Email -->
              <div>
                <label style="display: block; font-weight: 600; color: #374151; 
                              margin-bottom: 8px; font-size: 14px;">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="signup-email" 
                  placeholder="name@example.com"
                  required
                  style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; 
                         border-radius: 12px; font-size: 16px; transition: all 0.2s;
                         box-sizing: border-box;"
                  onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)';"
                  onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                />
              </div>
              
              <!-- Password -->
              <div>
                <label style="display: block; font-weight: 600; color: #374151; 
                              margin-bottom: 8px; font-size: 14px;">
                  Password
                </label>
                <div style="position: relative;">
                  <input 
                    type="password" 
                    id="signup-password" 
                    placeholder="Create a strong password"
                    required
                    style="width: 100%; padding: 14px 48px 14px 16px; border: 2px solid #e5e7eb; 
                           border-radius: 12px; font-size: 16px; transition: all 0.2s;
                           box-sizing: border-box;"
                    onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)';"
                    onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                  />
                  <button 
                    type="button" 
                    id="toggle-password"
                    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                           background: none; border: none; cursor: pointer; font-size: 20px;
                           padding: 8px; border-radius: 8px; transition: background 0.2s;"
                    onmouseover="this.style.background='#f3f4f6'"
                    onmouseout="this.style.background='none'"
                  >
                    👁️
                  </button>
                </div>
                
                <!-- Password Strength Indicator -->
                <div id="password-strength" style="margin-top: 8px; display: none;">
                  <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                    <div id="strength-bar-1" style="flex: 1; height: 4px; background: #e5e7eb; 
                                                     border-radius: 2px; transition: all 0.3s;"></div>
                    <div id="strength-bar-2" style="flex: 1; height: 4px; background: #e5e7eb; 
                                                     border-radius: 2px; transition: all 0.3s;"></div>
                    <div id="strength-bar-3" style="flex: 1; height: 4px; background: #e5e7eb; 
                                                     border-radius: 2px; transition: all 0.3s;"></div>
                    <div id="strength-bar-4" style="flex: 1; height: 4px; background: #e5e7eb; 
                                                     border-radius: 2px; transition: all 0.3s;"></div>
                  </div>
                  <p id="strength-text" style="font-size: 12px; color: #6b7280; margin: 0;"></p>
                </div>
              </div>
              
              <!-- Confirm Password -->
              <div>
                <label style="display: block; font-weight: 600; color: #374151; 
                              margin-bottom: 8px; font-size: 14px;">
                  Confirm Password
                </label>
                <div style="position: relative;">
                  <input 
                    type="password" 
                    id="signup-confirm-password" 
                    placeholder="Re-enter your password"
                    required
                    style="width: 100%; padding: 14px 48px 14px 16px; border: 2px solid #e5e7eb; 
                           border-radius: 12px; font-size: 16px; transition: all 0.2s;
                           box-sizing: border-box;"
                    onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)';"
                    onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                  />
                  <button 
                    type="button" 
                    id="toggle-confirm-password"
                    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                           background: none; border: none; cursor: pointer; font-size: 20px;
                           padding: 8px; border-radius: 8px; transition: background 0.2s;"
                    onmouseover="this.style.background='#f3f4f6'"
                    onmouseout="this.style.background='none'"
                  >
                    👁️
                  </button>
                </div>
                <p id="password-match-message" style="font-size: 12px; margin: 4px 0 0 0; display: none;"></p>
              </div>
              
              <!-- Terms & Conditions -->
              <div style="display: flex; align-items: start; gap: 12px;">
                <input 
                  type="checkbox" 
                  id="terms-checkbox" 
                  required
                  style="width: 20px; height: 20px; margin-top: 2px; cursor: pointer;
                         accent-color: #6366f1;"
                />
                <label for="terms-checkbox" style="font-size: 14px; color: #6b7280; cursor: pointer;">
                  I agree to the 
                  <a href="#" style="color: #6366f1; text-decoration: none; font-weight: 600;">
                    Terms of Service
                  </a> 
                  and 
                  <a href="#" style="color: #6366f1; text-decoration: none; font-weight: 600;">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <!-- Submit Button -->
              <button 
                type="submit"
                id="signup-button"
                style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea, #764ba2); 
                       color: white; border: none; border-radius: 12px; font-size: 16px; 
                       font-weight: 600; cursor: pointer; transition: all 0.3s;
                       box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.6)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';"
              >
                Create Account
              </button>
            </form>
            
            <!-- Divider -->
            <div style="display: flex; align-items: center; gap: 16px; margin: 32px 0;">
              <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
              <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Or sign up with</span>
              <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
            </div>
            
            <!-- Social Registration Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button 
                type="button"
                id="google-signup"
                style="padding: 14px; background: white; border: 2px solid #e5e7eb; 
                       border-radius: 12px; font-size: 15px; font-weight: 600; 
                       cursor: pointer; transition: all 0.2s; display: flex; 
                       align-items: center; justify-content: center; gap: 8px;"
                onmouseover="this.style.borderColor='#6366f1'; this.style.background='#f9fafb';"
                onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white';"
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                  <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                  <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                  <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                </svg>
                Google
              </button>
              
              <button 
                type="button"
                id="github-signup"
                style="padding: 14px; background: white; border: 2px solid #e5e7eb; 
                       border-radius: 12px; font-size: 15px; font-weight: 600; 
                       cursor: pointer; transition: all 0.2s; display: flex; 
                       align-items: center; justify-content: center; gap: 8px;"
                onmouseover="this.style.borderColor='#6366f1'; this.style.background='#f9fafb';"
                onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white';"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#24292e">
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Responsive Design */
        @media (max-width: 968px) {
          [data-page="signup"] > div {
            flex-direction: column !important;
          }
          
          [data-page="signup"] > div > div:first-child {
            padding: 32px 24px !important;
          }
          
          [data-page="signup"] > div > div:first-child h1 {
            font-size: 36px !important;
          }
          
          [data-page="signup"] > div > div:first-child > div:last-child {
            display: none !important;
          }
        }
        
        @media (max-width: 640px) {
          [data-page="signup"] > div > div:last-child {
            padding: 24px !important;
          }
          
          [data-page="signup"] > div > div:last-child > div {
            padding: 32px 24px !important;
          }
          
          [data-page="signup"] h2 {
            font-size: 24px !important;
          }
        }
      </style>
    `;
    
    document.getElementById('app').appendChild(container);
    console.log('✅ Signup page rendered');
  },

  attachEvents() {
    // Form submission
    const form = document.getElementById('signup-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSignup(e));
    }
    
    // Password visibility toggles
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('signup-password');
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.textContent = isPassword ? '🙈' : '👁️';
      });
    }
    
    if (toggleConfirmPassword) {
      toggleConfirmPassword.addEventListener('click', () => {
        const confirmInput = document.getElementById('signup-confirm-password');
        const isPassword = confirmInput.type === 'password';
        confirmInput.type = isPassword ? 'text' : 'password';
        toggleConfirmPassword.textContent = isPassword ? '🙈' : '👁️';
      });
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
    }
    
    // Password match validation
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => this.checkPasswordMatch());
    }
    
    // Navigate to login
    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
      goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/login');
      });
    }
    
    // Social signup buttons
    const googleSignup = document.getElementById('google-signup');
    const githubSignup = document.getElementById('github-signup');
    
    if (googleSignup) {
      googleSignup.addEventListener('click', () => this.handleSocialSignup('google'));
    }
    
    if (githubSignup) {
      githubSignup.addEventListener('click', () => this.handleSocialSignup('github'));
    }
    
    console.log('✅ Signup events attached');
  },

  updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('password-strength');
    const strengthText = document.getElementById('strength-text');
    
    if (!password) {
      strengthContainer.style.display = 'none';
      return;
    }
    
    strengthContainer.style.display = 'block';
    
    // Calculate strength
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    // Update bars
    const bars = [
      document.getElementById('strength-bar-1'),
      document.getElementById('strength-bar-2'),
      document.getElementById('strength-bar-3'),
      document.getElementById('strength-bar-4')
    ];
    
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#10b981'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    
    bars.forEach((bar, index) => {
      if (index < strength) {
        bar.style.background = colors[strength - 1];
      } else {
        bar.style.background = '#e5e7eb';
      }
    });
    
    if (strength > 0) {
      strengthText.textContent = `Password strength: ${labels[strength - 1]}`;
      strengthText.style.color = colors[strength - 1];
    }
  },

  checkPasswordMatch() {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const message = document.getElementById('password-match-message');
    
    if (!confirmPassword) {
      message.style.display = 'none';
      return;
    }
    
    message.style.display = 'block';
    
    if (password === confirmPassword) {
      message.textContent = '✓ Passwords match';
      message.style.color = '#10b981';
    } else {
      message.textContent = '✗ Passwords do not match';
      message.style.color = '#ef4444';
    }
  },

  async handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;
    const button = document.getElementById('signup-button');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      Toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (!termsAccepted) {
      Toast.error('Please accept the Terms of Service');
      return;
    }
    
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Creating account...';
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    
    try {
      // Register user
      const result = await Auth.register({
        name,
        email,
        password
      });
      
      if (result.success) {
        Toast.success(`Welcome, ${name}! 🎉`, 2000);
        
        // Redirect to Project Manager after short delay
        setTimeout(() => {
          Router.navigate('/project-manager');
        }, 1000);
      } else {
        Toast.error(result.error || 'Registration failed');
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      Toast.error('An error occurred during registration');
      button.textContent = originalText;
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    }
  },

  handleSocialSignup(provider) {
    console.log(`🔗 Social signup with ${provider} (not yet implemented)`);
    Toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup coming soon! 🚀`);
  }
};

// Expose globally
window.Signup = Signup;
console.log('✅ Signup page module loaded');
