/**
 * Unified Header Component for MuseFlow
 * Provides consistent navigation across all pages
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    logoPath: '/static/images/museflow-logo.png',
    logoAlt: 'MuseFlow Logo',
    homeUrl: '/',
    navItems: [
      { label: 'Home', url: '/', icon: 'fas fa-home', tooltip: 'Home' },
      { label: 'Dashboard', url: '/dashboard', icon: 'fas fa-chart-line', tooltip: 'Dashboard' },
      { label: 'Canvas', url: '/canvas-ultimate-clean', icon: 'fas fa-project-diagram', tooltip: 'Canvas' },
      { label: 'Projects', url: '/projects', icon: 'fas fa-folder', tooltip: 'Projects' },
      { label: 'Budget', url: '/budget', icon: 'fas fa-dollar-sign', tooltip: 'Budget' },
      { label: 'Analytics', url: '/analytics-dashboard', icon: 'fas fa-chart-bar', tooltip: 'Analytics' },
    ]
  };

  /**
   * Create unified header HTML
   */
  function createHeaderHTML() {
    const currentPath = window.location.pathname;
    
    const navItemsHTML = CONFIG.navItems.map(item => {
      const isActive = currentPath === item.url || currentPath.startsWith(item.url.split('.')[0]);
      return `
        <li>
          <a href="${item.url}" 
             data-page="${item.label.toLowerCase()}" 
             data-tooltip="${item.tooltip}"
             class="${isActive ? 'active' : ''}"
             aria-label="${item.tooltip}">
            <i class="${item.icon}" aria-hidden="true"></i>
            <span class="nav-label">${item.label}</span>
          </a>
        </li>
      `;
    }).join('');

    return `
      <nav class="unified-navbar" role="navigation" aria-label="Main navigation">
        <div class="unified-nav-container">
          <!-- Logo -->
          <a href="${CONFIG.homeUrl}" class="unified-nav-logo" aria-label="MuseFlow Home">
            <img src="${CONFIG.logoPath}" 
                 alt="${CONFIG.logoAlt}" 
                 width="40" 
                 height="40" 
                 class="logo-image"
                 onerror="this.onerror=null; this.src='/static/images/logo-fallback.svg';">
            <span class="logo-text">MuseFlow</span>
          </a>
          
          <!-- Main Navigation -->
          <ul class="unified-nav-links">
            ${navItemsHTML}
          </ul>
          
          <!-- Actions -->
          <div class="unified-nav-actions">
            <button class="unified-nav-btn" id="notificationsBtn" aria-label="Notifications">
              <i class="fas fa-bell" aria-hidden="true"></i>
              <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
            
            <button class="unified-nav-btn" id="accountBtn" aria-label="Account menu">
              <i class="fas fa-user-circle" aria-hidden="true"></i>
            </button>
            
            <button class="unified-nav-btn mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle mobile menu">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  /**
   * Create header styles
   */
  function createHeaderStyles() {
    return `
      <style>
        /* Unified Navbar Styles */
        .unified-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .unified-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          gap: 2rem;
        }

        /* Logo */
        .unified-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .unified-nav-logo:hover {
          opacity: 0.9;
        }

        .unified-nav-logo .logo-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .unified-nav-logo .logo-text {
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          letter-spacing: -0.02em;
        }

        /* Navigation Links */
        .unified-nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
        }

        .unified-nav-links li {
          margin: 0;
        }

        .unified-nav-links a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
          position: relative;
        }

        .unified-nav-links a:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .unified-nav-links a.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .unified-nav-links a.active::before {
          content: '';
          position: absolute;
          bottom: -0.75rem;
          left: 50%;
          transform: translateX(-50%);
          width: 30%;
          height: 3px;
          background: #8b5cf6;
          border-radius: 3px 3px 0 0;
        }

        .unified-nav-links a i {
          font-size: 1.1rem;
        }

        /* Actions */
        .unified-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .unified-nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
        }

        .unified-nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .mobile-menu-toggle {
          display: none;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .unified-nav-links a .nav-label {
            display: none;
          }

          .unified-nav-links a {
            padding: 0.625rem;
          }
        }

        @media (max-width: 768px) {
          .unified-nav-container {
            padding: 0.75rem 1rem;
            gap: 1rem;
          }

          .unified-nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .unified-nav-links.active {
            display: flex;
          }

          .unified-nav-links a {
            justify-content: flex-start;
            padding: 0.75rem 1rem;
          }

          .unified-nav-links a .nav-label {
            display: inline;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .unified-nav-actions {
            gap: 0.25rem;
          }

          .unified-nav-btn {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
        }

        /* Body padding for fixed navbar */
        body {
          padding-top: 70px;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .unified-navbar {
            background: linear-gradient(135deg, #0f0e1a 0%, #1a1625 100%);
          }
        }
      </style>
    `;
  }

  /**
   * Initialize header
   */
  function initHeader() {
    // Check if header already exists
    if (document.querySelector('.unified-navbar')) {
      console.log('✅ Unified header already exists');
      return;
    }

    // Insert styles
    const styleElement = document.createElement('div');
    styleElement.innerHTML = createHeaderStyles();
    document.head.appendChild(styleElement);

    // Insert header HTML
    const headerHTML = createHeaderHTML();
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Setup mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.unified-nav-links');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.unified-navbar')) {
          navLinks.classList.remove('active');
        }
      });
    }

    console.log('✅ Unified header initialized');
  }

  /**
   * Auto-initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  // Expose to global scope if needed
  window.MuseFlowHeader = {
    init: initHeader,
    config: CONFIG
  };
})();
