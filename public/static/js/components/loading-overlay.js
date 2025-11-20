/**
 * Loading Overlay Component
 * Global loading indicator for async operations
 */

const LoadingOverlay = {
  isVisible: false,
  
  /**
   * Show loading overlay
   */
  show(message = 'Loading...') {
    if (this.isVisible) return;
    
    this.isVisible = true;
    
    const overlay = `
      <div id="loading-overlay" 
           style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0, 0, 0, 0.5); z-index: 9999;
                  display: flex; align-items: center; justify-content: center;
                  animation: fadeIn 0.2s ease-out;">
        
        <div style="background: white; border-radius: 16px; padding: 32px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex; flex-direction: column; align-items: center; gap: 20px;
                    min-width: 300px;">
          
          <div class="spinner-large" 
               style="width: 48px; height: 48px; border: 4px solid #e5e7eb;
                      border-top-color: #3b82f6; border-radius: 50%;
                      animation: spin 0.8s linear infinite;"></div>
          
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
              ${message}
            </p>
            <p id="loading-detail" style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
              Please wait...
            </p>
          </div>
          
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', overlay);
  },
  
  /**
   * Update loading message
   */
  updateMessage(message) {
    const detailEl = document.getElementById('loading-detail');
    if (detailEl) {
      detailEl.textContent = message;
    }
  },
  
  /**
   * Hide loading overlay
   */
  hide() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => {
        overlay.remove();
        this.isVisible = false;
      }, 200);
    }
  }
};
