/**
 * MuseFlow V10.5 - Mobile Optimization
 * Advanced mobile-first optimizations and touch interactions
 */

class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.orientation = this.getOrientation();
        this.touchSupport = 'ontouchstart' in window;
        
        this.init();
    }

    init() {
        console.log('[Mobile] Initializing optimizer...', {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            touchSupport: this.touchSupport,
            orientation: this.orientation
        });

        if (this.isMobile || this.isTablet) {
            this.optimizeForMobile();
            this.setupTouchGestures();
            this.optimizeImages();
            this.setupOrientationHandler();
            this.enablePullToRefresh();
            this.optimizeScrolling();
        }

        this.setupViewportMeta();
        this.preventZoom();
    }

    // 1. Device Detection
    detectMobile() {
        return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    // 2. Mobile-First Optimizations
    optimizeForMobile() {
        console.log('[Mobile] Applying mobile optimizations...');

        // Reduce animations on mobile
        document.documentElement.style.setProperty('--animation-duration', '0.2s');

        // Optimize font sizes
        if (this.isMobile) {
            document.documentElement.style.fontSize = '14px';
        }

        // Add mobile-specific class
        document.body.classList.add('mobile-device');

        // Disable hover effects on touch devices
        if (this.touchSupport) {
            document.body.classList.add('touch-device');
            this.disableHoverEffects();
        }

        // Optimize navbar for mobile
        this.optimizeNavbar();

        // Add safe area padding for notched devices
        this.applySafeAreaPadding();
    }

    disableHoverEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-device *:hover {
                /* Disable hover effects on touch devices */
            }
        `;
        document.head.appendChild(style);
    }

    optimizeNavbar() {
        const navbar = document.querySelector('.unified-navbar');
        if (navbar && this.isMobile) {
            // Make navbar more compact on mobile
            navbar.style.padding = '0.5rem 1rem';
        }
    }

    applySafeAreaPadding() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Touch Gestures
    setupTouchGestures() {
        console.log('[Mobile] Setting up touch gestures...');

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        });

        // Long press for context menu
        this.setupLongPress();

        // Double tap to zoom
        this.setupDoubleTap();

        // Pinch to zoom
        this.setupPinchZoom();
    }

    handleGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const threshold = 50;

        // Swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        }
    }

    onSwipeRight() {
        console.log('[Mobile] Swipe right detected');
        // Navigate back or open sidebar
        if (window.history.length > 1) {
            // Can navigate back
        }
    }

    onSwipeLeft() {
        console.log('[Mobile] Swipe left detected');
        // Navigate forward or close sidebar
    }

    onSwipeDown() {
        console.log('[Mobile] Swipe down detected');
        // Pull to refresh (if at top)
    }

    onSwipeUp() {
        console.log('[Mobile] Swipe up detected');
        // Show more content
    }

    setupLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.onLongPress(e);
            }, 500);
        });

        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }

    onLongPress(e) {
        console.log('[Mobile] Long press detected');
        
        // Show context menu
        const target = e.target;
        if (target.tagName === 'IMG') {
            // Image context menu
            this.showImageContextMenu(e, target);
        }
    }

    showImageContextMenu(e, img) {
        e.preventDefault();
        
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(10, 10, 15, 0.98);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;

        menu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button onclick="window.open('${img.src}')" style="
                    padding: 1rem;
                    background: rgba(139, 92, 246, 0.2);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                ">
                    <i class="fas fa-external-link-alt"></i> Open in new tab
                </button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                ">
                    Cancel
                </button>
            </div>
        `;

        document.body.appendChild(menu);
    }

    setupDoubleTap() {
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                this.onDoubleTap(e);
            }
            
            lastTap = currentTime;
        });
    }

    onDoubleTap(e) {
        console.log('[Mobile] Double tap detected');
        // Zoom or favorite action
    }

    setupPinchZoom() {
        let initialDistance = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                if (scale > 1.1) {
                    this.onPinchOut();
                } else if (scale < 0.9) {
                    this.onPinchIn();
                }
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    onPinchOut() {
        console.log('[Mobile] Pinch out (zoom in)');
    }

    onPinchIn() {
        console.log('[Mobile] Pinch in (zoom out)');
    }

    // 4. Image Optimization
    optimizeImages() {
        console.log('[Mobile] Optimizing images for mobile...');

        document.querySelectorAll('img').forEach(img => {
            // Use srcset for responsive images
            if (!img.srcset && img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }

            // Lazy load images
            if (!img.loading) {
                img.loading = 'lazy';
            }

            // Reduce quality on mobile
            if (this.isMobile && img.src.includes('?')) {
                img.src += '&mobile=true&quality=70';
            }
        });
    }

    // 5. Orientation Handler
    setupOrientationHandler() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                console.log('[Mobile] Orientation changed:', this.orientation);
                
                this.handleOrientationChange();
            }, 100);
        });
    }

    handleOrientationChange() {
        // Show orientation hint for better UX
        if (this.orientation === 'landscape' && this.isMobile) {
            this.showOrientationHint('portrait');
        }

        // Adjust layout
        document.body.setAttribute('data-orientation', this.orientation);
    }

    showOrientationHint(suggestedOrientation) {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 15, 0.95);
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            z-index: 10001;
        `;

        hint.innerHTML = `
            <i class="fas fa-mobile-alt" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 1rem;"></i>
            <p style="color: white; font-size: 1.1rem;">
                For better experience, please rotate to ${suggestedOrientation} mode
            </p>
        `;

        document.body.appendChild(hint);

        setTimeout(() => hint.remove(), 3000);
    }

    // 6. Pull to Refresh
    enablePullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (pulling) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;

                if (pullDistance > 100) {
                    this.showPullToRefreshIndicator();
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (pulling && currentY - startY > 100) {
                this.triggerRefresh();
            }
            pulling = false;
            this.hidePullToRefreshIndicator();
        });
    }

    showPullToRefreshIndicator() {
        let indicator = document.getElementById('pull-refresh-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-refresh-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(139, 92, 246, 0.9);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 50px;
                z-index: 10000;
                font-size: 0.875rem;
                font-weight: 600;
            `;
            indicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Release to refresh';
            document.body.appendChild(indicator);
        }
    }

    hidePullToRefreshIndicator() {
        const indicator = document.getElementById('pull-refresh-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    triggerRefresh() {
        console.log('[Mobile] Pull to refresh triggered');
        window.location.reload();
    }

    // 7. Smooth Scrolling
    optimizeScrolling() {
        // Enable momentum scrolling on iOS
        document.body.style.webkitOverflowScrolling = 'touch';

        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // 8. Viewport Meta
    setupViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    // 9. Prevent Accidental Zoom
    preventZoom() {
        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    // 10. Performance Monitoring
    getMetrics() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            touchSupport: this.touchSupport,
            orientation: this.orientation,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio
        };
    }
}

// Initialize Mobile Optimizer
window.addEventListener('load', () => {
    window.mobileOptimizer = new MobileOptimizer();
    
    console.log('[Mobile] Optimizer ready');
    console.log('[Mobile] Metrics:', window.mobileOptimizer.getMetrics());
});
