// Museflow v4.0 - Application Initialization
// Main entry point for the application

const App = {
  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 Museflow v4.0 Starting...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // 1. Initialize Router
      Router.init();
      console.log('✅ Router initialized');
      
      // 2. Check authentication
      const isAuthenticated = Auth.check();
      console.log(`🔐 Auth status: ${isAuthenticated ? 'Logged in' : 'Guest'}`);
      
      // 3. Determine initial route
      const currentPath = window.location.pathname;
      
      if (currentPath === '/' || currentPath === '') {
        // Landing page
        if (isAuthenticated) {
          console.log('📍 Redirecting to Project Manager');
          Router.navigate('/project-manager', false);
        } else {
          console.log('📍 Showing Landing Page');
          Router.navigate('/', false);
        }
      } else {
        // Use current path
        console.log(`📍 Navigating to: ${currentPath}`);
        Router.navigate(currentPath, false);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Museflow initialized successfully');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
    }
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Expose globally
window.App = App;
console.log('✅ App loaded');
