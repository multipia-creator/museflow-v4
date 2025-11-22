/**
 * Toast Notification System
 * Global, reusable toast notifications for MuseFlow V4
 * 
 * Features:
 * - 4 types: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Multiple toasts support with stacking
 * - Smooth animations
 * - Progress bar indicator
 * - Click to dismiss
 * - Accessible (ARIA labels)
 */

const Toast = {
  container: null,
  toasts: [],
  idCounter: 0,

  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return; // Already initialized

    // Create toast container
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    this.container.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none;
    `;

    document.body.appendChild(this.container);

    // Inject toast styles
    this.injectStyles();
  },

  /**
   * Inject CSS styles for toasts
   */
  injectStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toastSlideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes toastSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      @keyframes toastProgress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      .toast {
        background: rgba(26, 15, 46, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 1rem 1.25rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: flex-start;
        gap: 0.875rem;
        min-width: 300px;
        max-width: 400px;
        animation: toastSlideIn 0.3s ease-out;
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
      }

      .toast:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
      }

      .toast.removing {
        animation: toastSlideOut 0.3s ease-in forwards;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .toast-content {
        flex: 1;
        color: white;
      }

      .toast-title {
        font-weight: 600;
        font-size: 0.9375rem;
        margin-bottom: 0.25rem;
      }

      .toast-message {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
      }

      .toast-close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s ease;
        color: rgba(255, 255, 255, 0.6);
      }

      .toast-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        opacity: 0.6;
        animation: toastProgress linear;
      }

      /* Toast Types */
      .toast.success {
        border-left: 4px solid #10b981;
      }

      .toast.success .toast-icon {
        color: #10b981;
      }

      .toast.success .toast-progress {
        color: #10b981;
      }

      .toast.error {
        border-left: 4px solid #ef4444;
      }

      .toast.error .toast-icon {
        color: #ef4444;
      }

      .toast.error .toast-progress {
        color: #ef4444;
      }

      .toast.warning {
        border-left: 4px solid #f59e0b;
      }

      .toast.warning .toast-icon {
        color: #f59e0b;
      }

      .toast.warning .toast-progress {
        color: #f59e0b;
      }

      .toast.info {
        border-left: 4px solid #6366f1;
      }

      .toast.info .toast-icon {
        color: #6366f1;
      }

      .toast.info .toast-progress {
        color: #6366f1;
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        #toast-container {
          right: 1rem;
          left: 1rem;
          top: 1rem;
          max-width: none;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: success, error, warning, info
   * @param {Object} options - Additional options
   */
  show(message, type = 'info', options = {}) {
    this.init();

    const {
      title = this.getDefaultTitle(type),
      duration = 3000,
      dismissible = true,
      icon = this.getDefaultIcon(type)
    } = options;

    const toastId = ++this.idCounter;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.dataset.toastId = toastId;

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      ${dismissible ? '<div class="toast-close"><i class="fas fa-times"></i></div>' : ''}
      ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
    `;

    // Add to container
    this.container.appendChild(toast);

    // Store toast reference
    this.toasts.push({ id: toastId, element: toast });

    // Click to dismiss (if dismissible)
    if (dismissible) {
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dismiss(toastId);
        });
      }

      // Click on toast to dismiss
      toast.addEventListener('click', () => {
        this.dismiss(toastId);
      });
    }

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toastId);
      }, duration);
    }

    return toastId;
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss(toastId) {
    const toastData = this.toasts.find(t => t.id === toastId);
    if (!toastData) return;

    const { element } = toastData;
    element.classList.add('removing');

    // Remove from DOM after animation
    setTimeout(() => {
      element.remove();
      this.toasts = this.toasts.filter(t => t.id !== toastId);
    }, 300);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach(toast => {
      this.dismiss(toast.id);
    });
  },

  /**
   * Get default title for toast type
   */
  getDefaultTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || 'Notification';
  },

  /**
   * Get default icon for toast type
   */
  getDefaultIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>'
    };
    return icons[type] || icons.info;
  },

  /**
   * Shorthand methods
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  },

  error(message, options = {}) {
    return this.show(message, 'error', { duration: 5000, ...options });
  },

  warning(message, options = {}) {
    return this.show(message, 'warning', { duration: 4000, ...options });
  },

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Toast.init());
} else {
  Toast.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toast;
}
