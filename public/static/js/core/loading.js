/**
 * Loading Overlay System
 * Global loading indicators for async operations
 * 
 * Features:
 * - Full-page overlay with blur effect
 * - Customizable spinner styles
 * - Loading messages
 * - Multiple loading states support
 * - Accessible (ARIA labels)
 */

const Loading = {
  overlay: null,
  activeLoaders: 0,
  loaderId: 0,

  /**
   * Initialize loading overlay
   */
  init() {
    if (this.overlay) return; // Already initialized

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-overlay';
    this.overlay.setAttribute('role', 'status');
    this.overlay.setAttribute('aria-live', 'polite');
    this.overlay.setAttribute('aria-busy', 'false');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create spinner container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.id = 'loading-spinner-container';
    spinnerContainer.style.cssText = `
      text-align: center;
      color: white;
    `;

    // Create spinner
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="30" stroke="rgba(139, 92, 246, 0.3)" stroke-width="6" fill="none" />
        <circle cx="40" cy="40" r="30" stroke="url(#gradient)" stroke-width="6" fill="none" 
                stroke-dasharray="188.4" stroke-dashoffset="47.1" 
                stroke-linecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="1.5s"
            repeatCount="indefinite"/>
        </circle>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    `;

    // Create loading message
    const message = document.createElement('div');
    message.id = 'loading-message';
    message.style.cssText = `
      margin-top: 1.5rem;
      font-size: 1.125rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.95);
    `;
    message.textContent = 'Loading...';

    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(message);
    this.overlay.appendChild(spinnerContainer);
    document.body.appendChild(this.overlay);
  },

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   * @returns {number} - Loader ID for dismissing
   */
  show(message = 'Loading...') {
    this.init();

    const id = ++this.loaderId;
    this.activeLoaders++;

    // Update message
    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    // Show overlay
    if (this.activeLoaders === 1) {
      this.overlay.style.display = 'flex';
      this.overlay.setAttribute('aria-busy', 'true');
      
      // Trigger reflow for transition
      void this.overlay.offsetWidth;
      
      this.overlay.style.opacity = '1';
    }

    return id;
  },

  /**
   * Hide loading overlay
   * @param {number} id - Loader ID (optional)
   */
  hide(id = null) {
    if (!this.overlay) return;

    this.activeLoaders = Math.max(0, this.activeLoaders - 1);

    // Only hide when no active loaders
    if (this.activeLoaders === 0) {
      this.overlay.style.opacity = '0';
      this.overlay.setAttribute('aria-busy', 'false');

      setTimeout(() => {
        if (this.activeLoaders === 0) {
          this.overlay.style.display = 'none';
        }
      }, 300);
    }
  },

  /**
   * Force hide all loaders
   */
  hideAll() {
    this.activeLoaders = 0;
    this.hide();
  },

  /**
   * Wrap async function with loading indicator
   * @param {Function} fn - Async function to wrap
   * @param {string} message - Loading message
   * @returns {Function} - Wrapped function
   */
  wrap(fn, message = 'Loading...') {
    return async (...args) => {
      const loaderId = this.show(message);
      try {
        return await fn(...args);
      } finally {
        this.hide(loaderId);
      }
    };
  },

  /**
   * Create inline spinner (for buttons, etc.)
   * @param {Object} options - Spinner options
   * @returns {HTMLElement} - Spinner element
   */
  createSpinner(options = {}) {
    const {
      size = 16,
      color = '#8b5cf6',
      inline = true
    } = options;

    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    spinner.style.cssText = `
      font-size: ${size}px;
      color: ${color};
      ${inline ? 'display: inline-block; vertical-align: middle;' : ''}
    `;

    return spinner;
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Loading.init());
} else {
  Loading.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Loading;
}
