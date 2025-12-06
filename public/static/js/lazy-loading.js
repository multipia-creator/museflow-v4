/**
 * MuseFlow V18.0 - Lazy Loading Module
 * Implements native lazy loading and Intersection Observer API for optimal performance
 */

(function() {
    'use strict';

    /**
     * Initialize Lazy Loading for Images
     */
    function initImageLazyLoading() {
        // Check for native lazy loading support
        const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

        if (supportsNativeLazyLoading) {
            console.log('✅ Native lazy loading supported');
            
            // Add loading="lazy" to all images without it
            const images = document.querySelectorAll('img:not([loading])');
            images.forEach(img => {
                img.setAttribute('loading', 'lazy');
            });
            
            return;
        }

        // Fallback to Intersection Observer for older browsers
        console.log('⚠️ Using Intersection Observer fallback');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before entering viewport
            threshold: 0.01
        });

        // Observe all images with data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /**
     * Lazy Load Background Images
     */
    function initBackgroundImageLazyLoading() {
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bgImage = element.dataset.bgImage;
                    
                    if (bgImage) {
                        element.style.backgroundImage = `url(${bgImage})`;
                        element.removeAttribute('data-bg-image');
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        const lazyBackgrounds = document.querySelectorAll('[data-bg-image]');
        lazyBackgrounds.forEach(el => bgObserver.observe(el));
    }

    /**
     * Lazy Load Scripts
     */
    function lazyLoadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        if (callback) {
            script.onload = callback;
        }
        
        document.head.appendChild(script);
    }

    /**
     * Lazy Load CSS
     */
    function lazyLoadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
        
        document.head.appendChild(link);
    }

    /**
     * Preload Critical Resources
     */
    function preloadCriticalResources() {
        // Preload logo
        const logoLink = document.createElement('link');
        logoLink.rel = 'preload';
        logoLink.as = 'image';
        logoLink.href = '/static/images/logo-neon-m.png';
        document.head.appendChild(logoLink);
    }

    /**
     * Canvas Widget Image Lazy Loading
     * For dynamically created widget thumbnails
     */
    window.lazyLoadCanvasImage = function(imageUrl, callback) {
        const img = new Image();
        
        img.onload = function() {
            if (callback) callback(img);
        };
        
        img.onerror = function() {
            console.warn('Failed to load image:', imageUrl);
            if (callback) callback(null);
        };
        
        // Use native lazy loading if supported
        if ('loading' in img) {
            img.loading = 'lazy';
        }
        
        img.src = imageUrl;
        
        return img;
    };

    /**
     * Defer Non-Critical JavaScript
     */
    function deferNonCriticalJS() {
        // Get all scripts marked as defer-load
        const deferScripts = document.querySelectorAll('script[data-defer-load]');
        
        // Load them after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                deferScripts.forEach(script => {
                    const src = script.dataset.deferLoad;
                    lazyLoadScript(src);
                });
            }, 1000); // Delay 1 second after page load
        });
    }

    /**
     * Performance Monitoring
     */
    function logPerformanceMetrics() {
        if (!window.performance || !window.performance.timing) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                const firstPaint = perfData.responseStart - perfData.navigationStart;

                console.log('📊 Performance Metrics (Lazy Loading):');
                console.log(`   • Page Load Time: ${(pageLoadTime / 1000).toFixed(2)}s`);
                console.log(`   • DOM Ready: ${(domReadyTime / 1000).toFixed(2)}s`);
                console.log(`   • First Paint: ${(firstPaint / 1000).toFixed(2)}s`);
                
                // Store for analytics
                window.museflowPerformance = {
                    pageLoadTime,
                    domReadyTime,
                    firstPaint
                };
            }, 0);
        });
    }

    /**
     * Initialize All Lazy Loading Features
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initImageLazyLoading();
                initBackgroundImageLazyLoading();
                preloadCriticalResources();
                deferNonCriticalJS();
                logPerformanceMetrics();
            });
        } else {
            initImageLazyLoading();
            initBackgroundImageLazyLoading();
            preloadCriticalResources();
            deferNonCriticalJS();
            logPerformanceMetrics();
        }

        console.log('✅ MuseFlow V18.0 Lazy Loading initialized');
    }

    // Auto-initialize
    init();

    // Export for use in other scripts
    window.MuseFlowLazyLoading = {
        lazyLoadScript,
        lazyLoadCSS,
        lazyLoadCanvasImage: window.lazyLoadCanvasImage
    };

})();
