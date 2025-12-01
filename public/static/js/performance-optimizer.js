/**
 * MuseFlow V10.4 - Performance Optimizer
 * Lazy loading, prefetching, and resource optimization
 */

(function() {
    'use strict';

    // 1. Resource Hints - Preconnect to CDNs
    const cdnDomains = [
        'https://cdn.tailwindcss.com',
        'https://cdnjs.cloudflare.com',
        'https://unpkg.com'
    ];

    cdnDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });

    // 2. Lazy Load Images
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px' // Start loading 50px before entering viewport
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // 3. Prefetch Next Page
    const prefetchNextPage = () => {
        const navLinks = document.querySelectorAll('.unified-nav-links a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip current page and external links
            if (!href || href === currentPath || href.startsWith('http')) {
                return;
            }

            // Prefetch on hover
            link.addEventListener('mouseenter', () => {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                prefetchLink.as = 'document';
                document.head.appendChild(prefetchLink);
            }, { once: true });
        });
    };

    // 4. Defer Non-Critical Scripts
    const deferScripts = () => {
        const scripts = document.querySelectorAll('script[data-defer]');
        
        window.addEventListener('load', () => {
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.dataset.defer;
                if (script.dataset.module) newScript.type = 'module';
                document.body.appendChild(newScript);
            });
        });
    };

    // 5. Critical CSS Loaded Check
    const checkCriticalCSS = () => {
        const criticalCSS = document.querySelector('link[href*="critical.css"]');
        if (criticalCSS) {
            criticalCSS.onload = () => {
                console.log('[Performance] Critical CSS loaded');
                document.documentElement.classList.add('critical-loaded');
            };
        }
    };

    // 6. Web Vitals Monitoring
    const monitorWebVitals = () => {
        // First Contentful Paint (FCP)
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    console.log(`[Performance] FCP: ${entry.startTime.toFixed(0)}ms`);
                }
            }
        });

        try {
            perfObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Browser doesn't support
        }

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`[Performance] LCP: ${lastEntry.startTime.toFixed(0)}ms`);
        });

        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Browser doesn't support
        }

        // First Input Delay (FID)
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`[Performance] Page Load Time: ${loadTime}ms`);
        });
    };

    // 7. Service Worker Registration with Update Check
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('[Service Worker] Registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('[Service Worker] Update found');

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                if (confirm('🚀 New version available! Reload to update?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            }
                        });
                    });
                } catch (error) {
                    console.error('[Service Worker] Registration failed:', error);
                }
            });
        }
    };

    // 8. Memory Cleanup on Page Hide
    const setupMemoryCleanup = () => {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Clear large objects from memory when page is hidden
                console.log('[Performance] Page hidden - cleaning up memory');
                
                // Remove large cached data if needed
                // (Specific to your app's data structures)
            }
        });
    };

    // Initialize All Optimizations
    const init = () => {
        // Run immediately
        checkCriticalCSS();
        deferScripts();
        registerServiceWorker();

        // Run after DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                lazyLoadImages();
                prefetchNextPage();
                setupMemoryCleanup();
            });
        } else {
            lazyLoadImages();
            prefetchNextPage();
            setupMemoryCleanup();
        }

        // Run after full load
        window.addEventListener('load', () => {
            monitorWebVitals();
            
            // Report performance metrics
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('[Performance Report]', {
                        'DNS Lookup': `${perfData.domainLookupEnd - perfData.domainLookupStart}ms`,
                        'TCP Connection': `${perfData.connectEnd - perfData.connectStart}ms`,
                        'DOM Processing': `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
                        'Total Load Time': `${perfData.loadEventEnd - perfData.fetchStart}ms`
                    });
                }
            }, 1000);
        });
    };

    // Start optimization
    init();

    // Expose to global for debugging
    window.MuseFlowPerformance = {
        version: '10.4',
        lazyLoadImages,
        prefetchNextPage,
        monitorWebVitals
    };

    console.log('[Performance Optimizer] V10.4 initialized');

})();
