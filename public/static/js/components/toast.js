// Museflow v4.0 - Toast Notification Component

const Toast = {
  /**
   * Show a toast message
   * @param {string} message - The message to display
   * @param {string} type - Type: 'success', 'error', 'info'
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  show(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">${this.getIcon(type)}</span>
        <span style="font-weight: 500; color: #374151;">${message}</span>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  },
  
  /**
   * Show success toast
   */
  success(message, duration) {
    this.show(message, 'success', duration);
  },
  
  /**
   * Show error toast
   */
  error(message, duration) {
    this.show(message, 'error', duration);
  },
  
  /**
   * Show info toast
   */
  info(message, duration) {
    this.show(message, 'info', duration);
  },
  
  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
};

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// Expose globally
window.Toast = Toast;
console.log('✅ Toast loaded');
