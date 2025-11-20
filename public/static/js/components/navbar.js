// Museflow v4.0 - Navigation Bar Component
// Reusable navigation component with logo

const Navbar = {
  /**
   * Render navigation bar HTML
   * @param {string} variant - 'light' or 'dark'
   * @returns {string} - HTML string
   */
  render(variant = 'light') {
    const isLight = variant === 'light';
    
    return `
      <header style="
        background: ${isLight ? 'white' : 'rgba(255, 255, 255, 0.95)'};
        border-bottom: 1px solid var(--gray-200);
        padding: 16px 0;
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(10px);
      ">
        <div class="container" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <!-- Logo -->
          <a href="/" data-nav="/" style="
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: opacity 0.3s var(--ease-out);
          " class="logo-link">
            <img 
              src="/static/images/logo-horizontal.png" 
              alt="Museflow" 
              style="
                height: 40px;
                width: auto;
                object-fit: contain;
              "
            />
          </a>
          
          <!-- Navigation -->
          <nav style="display: flex; align-items: center; gap: 32px;">
            <a href="#" data-nav="/features" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">Features</a>
            <a href="#" data-nav="/modules" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">Modules</a>
            <a href="#" data-nav="/pricing" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">Pricing</a>
            <a href="#" data-nav="/about" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">About</a>
            <button id="btn-login" class="btn btn-secondary">Login</button>
            <button id="btn-signup" class="btn btn-primary">Sign Up</button>
          </nav>
        </div>
      </header>
      
      <style>
        .logo-link:hover {
          opacity: 0.8;
        }
        
        .nav-link:hover {
          color: var(--primary-600) !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          header nav {
            gap: 16px !important;
          }
          
          header nav a.nav-link {
            display: none;
          }
          
          .logo-link img {
            height: 32px !important;
          }
        }
      </style>
    `;
  },
  
  /**
   * Render authenticated navigation bar
   * @returns {string} - HTML string
   */
  renderAuth() {
    return `
      <header style="
        background: white;
        border-bottom: 1px solid var(--gray-200);
        padding: 16px 0;
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
      ">
        <div class="container" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <!-- Logo -->
          <a href="/project-manager" data-nav="/project-manager" style="
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: opacity 0.3s var(--ease-out);
          " class="logo-link">
            <img 
              src="/static/images/logo-horizontal.png" 
              alt="Museflow" 
              style="
                height: 40px;
                width: auto;
                object-fit: contain;
              "
            />
          </a>
          
          <!-- Navigation -->
          <nav style="display: flex; align-items: center; gap: 24px;">
            <a href="#" data-nav="/project-manager" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">Projects</a>
            <a href="#" data-nav="/profile" class="nav-link" style="
              color: var(--gray-700);
              font-weight: 500;
              transition: color 0.2s;
              text-decoration: none;
            ">Settings</a>
            <button id="btn-logout" class="btn btn-secondary">Logout</button>
          </nav>
        </div>
      </header>
      
      <style>
        .logo-link:hover {
          opacity: 0.8;
        }
        
        .nav-link:hover {
          color: var(--primary-600) !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          header nav {
            gap: 12px !important;
          }
          
          .logo-link img {
            height: 32px !important;
          }
        }
      </style>
    `;
  },
  
  /**
   * Attach navigation events
   * @param {HTMLElement} container - Container element
   */
  attachEvents(container) {
    // Navigation links
    const navLinks = container.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-nav');
        Router.navigate(path);
      });
    });
    
    // Login button
    const btnLogin = container.querySelector('#btn-login');
    if (btnLogin) {
      btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/login');
      });
    }
    
    // Signup button
    const btnSignup = container.querySelector('#btn-signup');
    if (btnSignup) {
      btnSignup.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/signup');
      });
    }
    
    // Logout button
    const btnLogout = container.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        Router.navigate('/');
      });
    }
  }
};

// Expose globally
window.Navbar = Navbar;
console.log('✅ Navbar component loaded');
