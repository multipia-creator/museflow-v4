// Museflow v4.0 - Authentication System
// LocalStorage-based authentication

const Auth = {
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  check() {
    const user = localStorage.getItem('museflow_current_user');
    return !!user;
  },
  
  /**
   * Get current logged-in user
   * @returns {Object|null}
   */
  getCurrentUser() {
    const user = localStorage.getItem('museflow_current_user');
    return user ? JSON.parse(user) : null;
  },
  
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    console.log('🔐 Login attempt:', email);
    
    try {
      // Get all users from localStorage
      const users = this.getAllUsers();
      
      // Find user
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (!user) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        };
      }
      
      // Save current user
      localStorage.setItem('museflow_current_user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      }));
      
      console.log('✅ Login successful');
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다.'
      };
    }
  },
  
  /**
   * Register new user
   * @param {Object} userData - {email, password, name}
   * @returns {Promise<Object>}
   */
  async register(userData) {
    console.log('📝 Register attempt:', userData.email);
    
    try {
      const { email, password, name } = userData;
      
      // Validation
      if (!email || !password || !name) {
        return {
          success: false,
          error: '모든 필드를 입력해주세요.'
        };
      }
      
      // Get all users
      const users = this.getAllUsers();
      
      // Check if email already exists
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return {
          success: false,
          error: '이미 등록된 이메일입니다.'
        };
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        email: email,
        password: password, // In production, this should be hashed
        name: name,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array
      users.push(newUser);
      
      // Save to localStorage
      localStorage.setItem('museflow_users', JSON.stringify(users));
      
      // Auto-login
      localStorage.setItem('museflow_current_user', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }));
      
      console.log('✅ Registration successful');
      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: '회원가입 중 오류가 발생했습니다.'
      };
    }
  },
  
  /**
   * Logout current user
   */
  logout() {
    console.log('👋 Logging out');
    localStorage.removeItem('museflow_current_user');
  },
  
  /**
   * Get all users from localStorage
   * @returns {Array}
   */
  getAllUsers() {
    const users = localStorage.getItem('museflow_users');
    return users ? JSON.parse(users) : [];
  },
  
  /**
   * Require authentication
   * Redirects to login if not authenticated
   * @returns {boolean}
   */
  requireAuth() {
    if (!this.check()) {
      console.log('⚠️ Authentication required - redirecting to login');
      Router.navigate('/login');
      return false;
    }
    return true;
  }
};

// Expose globally
window.Auth = Auth;
console.log('✅ Auth loaded');
