// Museflow v4.0 - Router System
// Clean, simple routing for Single Page Application

const Router = {
  // Route definitions
  routes: {
    '/': 'Features',
    '/modules': 'Modules',
    '/pricing': 'Pricing',
    '/about': 'About',
    '/login': 'Login',
    '/signup': 'Signup',
    '/project-manager': 'ProjectManager',
    '/profile': 'ProfileSettings',
    '/billing': 'ProfileSettings',
    '/help': 'ProfileSettings',
    '/admin': 'AdminDashboard',
    '/canvas': 'CanvasV2'
  },
  
  currentPage: null,
  
  /**
   * Initialize router
   * Sets up popstate event for browser back/forward
   */
  init() {
    console.log('🔀 Router initialized');
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigate(e.state.page, false);
      }
    });
    
    // Set initial state
    const initialPath = window.location.pathname;
    history.replaceState({ page: initialPath }, '', initialPath);
  },
  
  /**
   * Navigate to a page
   * @param {string} path - The path to navigate to (e.g., '/', '/login')
   * @param {boolean} pushState - Whether to add to browser history
   */
  navigate(path, pushState = true) {
    console.log(`🔀 Navigating to: ${path}`);
    
    // Clean up existing pages
    this.cleanup();
    
    // Get page name from routes
    const pageName = this.routes[path];
    
    if (!pageName) {
      console.error(`❌ Route not found: ${path}`);
      this.navigate('/', false);
      return;
    }
    
    // Check if page exists
    if (!window[pageName]) {
      console.error(`❌ Page component not found: ${pageName}`);
      return;
    }
    
    // Handle tab-based pages (ProfileSettings with different tabs)
    const tabMatch = path.match(/\/(profile|billing|help)/);
    if (tabMatch && pageName === 'ProfileSettings') {
      const tab = tabMatch[1];
      window[pageName].init(tab);
    } else {
      // Initialize the page normally
      window[pageName].init();
    }
    
    this.currentPage = pageName;
    
    // Update browser history
    if (pushState) {
      history.pushState({ page: path }, '', path);
    }
    
    // Update page title
    document.title = `Museflow - ${pageName}`;
  },
  
  /**
   * Clean up all existing page containers
   */
  cleanup() {
    const containers = document.querySelectorAll('[data-page]');
    containers.forEach(container => {
      container.remove();
    });
  },
  
  /**
   * Go back to previous page
   */
  back() {
    window.history.back();
  }
};

// Expose globally
window.Router = Router;
console.log('✅ Router loaded');
