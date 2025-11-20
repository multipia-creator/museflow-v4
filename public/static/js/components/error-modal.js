/**
 * Error Modal Component
 * User-friendly error display with retry options
 */

const ErrorModal = {
  /**
   * Show error modal
   */
  show(options = {}) {
    const {
      title = 'Error',
      message = 'An error occurred',
      details = null,
      onRetry = null,
      onClose = null,
    } = options;
    
    const modal = `
      <div id="error-modal" 
           style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0, 0, 0, 0.5); z-index: 10000;
                  display: flex; align-items: center; justify-content: center;
                  animation: fadeIn 0.2s ease-out;">
        
        <div style="background: white; border-radius: 16px; 
                    width: 90%; max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;">
          
          <!-- Header -->
          <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;
                      display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 50%;
                        background: #fee2e2; display: flex; align-items: center;
                        justify-content: center; font-size: 24px; flex-shrink: 0;">
              ⚠️
            </div>
            <div style="flex: 1;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                ${title}
              </h2>
              <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">
                ${message}
              </p>
            </div>
          </div>
          
          <!-- Content -->
          ${details ? `
            <div style="padding: 20px 24px; background: #f9fafb;">
              <details>
                <summary style="cursor: pointer; font-size: 13px; font-weight: 600; color: #6b7280;">
                  Show technical details
                </summary>
                <pre style="margin: 12px 0 0; padding: 12px; background: white;
                           border: 1px solid #e5e7eb; border-radius: 6px;
                           font-size: 12px; color: #374151; overflow-x: auto;">${details}</pre>
              </details>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb;
                      display: flex; gap: 12px; justify-content: flex-end;">
            ${onRetry ? `
              <button id="error-retry-btn"
                      style="padding: 10px 20px; border: 1px solid #e5e7eb;
                             background: white; border-radius: 8px; font-size: 14px;
                             font-weight: 600; color: #374151; cursor: pointer;">
                🔄 Retry
              </button>
            ` : ''}
            <button id="error-close-btn"
                    style="padding: 10px 24px; border: none; 
                           background: #3b82f6; border-radius: 8px; font-size: 14px;
                           font-weight: 600; color: white; cursor: pointer;">
              Close
            </button>
          </div>
          
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        #error-retry-btn:hover {
          background: #f9fafb !important;
        }
        
        #error-close-btn:hover {
          background: #2563eb !important;
        }
      </style>
    `;
    
    // Remove existing error modal
    this.hide();
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Attach events
    document.getElementById('error-close-btn').addEventListener('click', () => {
      this.hide();
      if (onClose) onClose();
    });
    
    if (onRetry) {
      document.getElementById('error-retry-btn')?.addEventListener('click', () => {
        this.hide();
        onRetry();
      });
    }
    
    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        if (onClose) onClose();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },
  
  /**
   * Hide error modal
   */
  hide() {
    const modal = document.getElementById('error-modal');
    if (modal) {
      modal.remove();
    }
  },
  
  /**
   * Show API error (with retry)
   */
  showAPIError(error, retryCallback) {
    this.show({
      title: 'API Request Failed',
      message: 'Unable to connect to the server',
      details: error.message || error,
      onRetry: retryCallback,
    });
  },
  
  /**
   * Show validation error
   */
  showValidationError(message) {
    this.show({
      title: 'Validation Error',
      message: message,
    });
  },
  
  /**
   * Show permission error
   */
  showPermissionError() {
    this.show({
      title: 'Permission Denied',
      message: 'You don\'t have permission to perform this action',
    });
  }
};
