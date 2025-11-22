/**
 * Mobile Optimization Utilities
 * Touch event handlers, gesture recognition, and mobile-specific improvements
 * 
 * Features:
 * - Touch event normalization
 * - Pinch to zoom detection
 * - Swipe gesture detection
 * - Long press detection
 * - Double tap detection
 * - Mobile viewport optimization
 */

const MobileUtils = {
  // Device detection
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  
  // Touch state
  touchStart: null,
  touchEnd: null,
  touchDistance: 0,
  
  /**
   * Initialize mobile optimizations
   */
  init() {
    if (this.isMobile) {
      this.optimizeViewport();
      this.preventBounce();
      this.optimizeTapDelay();
    }
  },

  /**
   * Optimize viewport for mobile
   */
  optimizeViewport() {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  },

  /**
   * Prevent iOS bounce effect
   */
  preventBounce() {
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].pageY;
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      const y = e.touches[0].pageY;
      const scrollableElement = this.findScrollableParent(e.target);
      
      // If not in a scrollable element, prevent default
      if (!scrollableElement) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  /**
   * Find scrollable parent element
   */
  findScrollableParent(element) {
    let parent = element;
    
    while (parent && parent !== document.body) {
      const overflow = window.getComputedStyle(parent).overflow;
      if (overflow === 'auto' || overflow === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    
    return null;
  },

  /**
   * Optimize tap delay (remove 300ms delay)
   */
  optimizeTapDelay() {
    // Modern browsers already remove this delay
    // This is a fallback for older browsers
    document.addEventListener('touchstart', () => {}, { passive: true });
  },

  /**
   * Add touch event handlers to an element
   * @param {HTMLElement} element - Target element
   * @param {Object} handlers - Event handlers
   */
  addTouchHandlers(element, handlers = {}) {
    const {
      onTap,
      onDoubleTap,
      onLongPress,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onPinch,
      onDragStart,
      onDrag,
      onDragEnd
    } = handlers;

    let touchStartTime = 0;
    let touchStartPos = null;
    let lastTapTime = 0;
    let longPressTimer = null;
    let isDragging = false;
    let initialDistance = 0;

    // Touch start
    element.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };

      // Long press detection
      if (onLongPress) {
        longPressTimer = setTimeout(() => {
          onLongPress(e, touchStartPos);
        }, 500); // 500ms for long press
      }

      // Pinch detection
      if (e.touches.length === 2 && onPinch) {
        initialDistance = this.getTouchDistance(e.touches);
      }

      // Drag start
      if (onDragStart) {
        onDragStart(e, touchStartPos);
      }
    }, { passive: false });

    // Touch move
    element.addEventListener('touchmove', (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      // Pinch handling
      if (e.touches.length === 2 && onPinch) {
        const currentDistance = this.getTouchDistance(e.touches);
        const scale = currentDistance / initialDistance;
        onPinch(e, scale);
        return;
      }

      // Drag handling
      if (onDrag && touchStartPos) {
        isDragging = true;
        const currentPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        const delta = {
          x: currentPos.x - touchStartPos.x,
          y: currentPos.y - touchStartPos.y
        };
        onDrag(e, currentPos, delta);
      }
    }, { passive: false });

    // Touch end
    element.addEventListener('touchend', (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }

      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      if (e.changedTouches.length > 0) {
        const touchEndPos = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY
        };

        const deltaX = touchEndPos.x - touchStartPos.x;
        const deltaY = touchEndPos.y - touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Drag end
        if (isDragging && onDragEnd) {
          onDragEnd(e, touchEndPos);
          isDragging = false;
          return;
        }

        // Swipe detection (distance > 50px)
        if (distance > 50) {
          const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
          
          if (angle >= -45 && angle < 45 && onSwipeRight) {
            onSwipeRight(e, distance);
          } else if (angle >= 45 && angle < 135 && onSwipeDown) {
            onSwipeDown(e, distance);
          } else if ((angle >= 135 || angle < -135) && onSwipeLeft) {
            onSwipeLeft(e, distance);
          } else if (angle >= -135 && angle < -45 && onSwipeUp) {
            onSwipeUp(e, distance);
          }
          return;
        }

        // Tap detection (short duration, small distance)
        if (touchDuration < 200 && distance < 10) {
          // Double tap detection
          if (touchEndTime - lastTapTime < 300 && onDoubleTap) {
            onDoubleTap(e, touchEndPos);
            lastTapTime = 0; // Reset to prevent triple tap
          } else if (onTap) {
            onTap(e, touchEndPos);
            lastTapTime = touchEndTime;
          }
        }
      }

      isDragging = false;
    }, { passive: false });

    // Touch cancel
    element.addEventListener('touchcancel', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      isDragging = false;
    }, { passive: true });
  },

  /**
   * Get distance between two touch points
   */
  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Create mobile-friendly button
   * Adds larger touch target and haptic feedback
   */
  makeMobileFriendly(button) {
    button.style.minHeight = '44px'; // iOS recommended minimum
    button.style.minWidth = '44px';
    button.style.padding = '12px 16px';
    
    // Add haptic feedback (if supported)
    if ('vibrate' in navigator) {
      button.addEventListener('touchstart', () => {
        navigator.vibrate(10); // 10ms vibration
      }, { passive: true });
    }
  },

  /**
   * Show mobile-specific UI hints
   */
  showMobileHint(message, duration = 3000) {
    const hint = document.createElement('div');
    hint.textContent = message;
    hint.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 24px;
      font-size: 0.875rem;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(hint);
    
    // Fade in
    requestAnimationFrame(() => {
      hint.style.opacity = '1';
    });
    
    // Auto remove
    setTimeout(() => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 300);
    }, duration);
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileUtils.init());
} else {
  MobileUtils.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileUtils;
}
