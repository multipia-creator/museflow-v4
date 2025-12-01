/**
 * MuseFlow V10.5 - AI-Powered Performance Optimizer
 * Machine learning-based performance optimization and predictive caching
 */

class AIPerformanceOptimizer {
    constructor() {
        this.userPatterns = this.loadUserPatterns();
        this.navigationHistory = [];
        this.resourceTimings = new Map();
        this.predictionModel = null;
        this.init();
    }

    init() {
        console.log('[AI Performance] Initializing...');
        this.trackNavigation();
        this.analyzeUserBehavior();
        this.predictivePrefetch();
        this.optimizeResourceLoading();
        this.adaptiveImageQuality();
    }

    // 1. User Behavior Analysis
    trackNavigation() {
        const startTime = Date.now();
        const currentPage = window.location.pathname;
        const referrer = document.referrer;

        this.navigationHistory.push({
            page: currentPage,
            timestamp: startTime,
            referrer: referrer,
            timeOnPage: 0
        });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.updateUserPatterns(currentPage, duration);
            this.saveUserPatterns();
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
        });
    }

    analyzeUserBehavior() {
        // Identify frequent navigation patterns
        const patterns = this.identifyPatterns();
        
        // Most visited pages
        const topPages = this.getTopPages(5);
        console.log('[AI Performance] Top pages:', topPages);

        // Peak usage times
        const peakHours = this.analyzePeakHours();
        console.log('[AI Performance] Peak hours:', peakHours);

        return { patterns, topPages, peakHours };
    }

    identifyPatterns() {
        const patterns = new Map();
        
        for (let i = 0; i < this.navigationHistory.length - 1; i++) {
            const from = this.navigationHistory[i].page;
            const to = this.navigationHistory[i + 1].page;
            const key = `${from}->${to}`;
            
            patterns.set(key, (patterns.get(key) || 0) + 1);
        }

        return Array.from(patterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    getTopPages(limit = 5) {
        const pageCounts = new Map();
        
        this.navigationHistory.forEach(entry => {
            pageCounts.set(entry.page, (pageCounts.get(entry.page) || 0) + 1);
        });

        return Array.from(pageCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    analyzePeakHours() {
        const hourCounts = new Array(24).fill(0);
        
        this.navigationHistory.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            hourCounts[hour]++;
        });

        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        return { peakHour, distribution: hourCounts };
    }

    // 2. Predictive Prefetching
    predictivePrefetch() {
        const currentPage = window.location.pathname;
        const likelyNextPages = this.predictNextPages(currentPage);

        console.log('[AI Performance] Predicted next pages:', likelyNextPages);

        // Prefetch likely next pages
        likelyNextPages.forEach((page, index) => {
            setTimeout(() => {
                this.prefetchPage(page.url, page.probability);
            }, index * 1000); // Stagger prefetch
        });
    }

    predictNextPages(currentPage) {
        // Simple ML: Use historical patterns
        const patterns = this.userPatterns.transitions || {};
        const nextPages = patterns[currentPage] || {};

        // Convert to probability distribution
        const total = Object.values(nextPages).reduce((sum, count) => sum + count, 0);
        
        return Object.entries(nextPages)
            .map(([url, count]) => ({
                url,
                probability: total > 0 ? count / total : 0
            }))
            .filter(p => p.probability > 0.2) // Only prefetch if >20% probability
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3);
    }

    prefetchPage(url, probability) {
        // High probability: prefetch as document
        // Low probability: just DNS prefetch
        const link = document.createElement('link');
        
        if (probability > 0.5) {
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'document';
            console.log(`[AI Performance] Prefetching ${url} (${(probability * 100).toFixed(0)}%)`);
        } else {
            link.rel = 'dns-prefetch';
            link.href = new URL(url, window.location.origin).origin;
            console.log(`[AI Performance] DNS prefetch ${url} (${(probability * 100).toFixed(0)}%)`);
        }

        document.head.appendChild(link);
    }

    // 3. Adaptive Resource Loading
    optimizeResourceLoading() {
        // Detect connection quality
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            const { effectiveType, downlink, rtt, saveData } = connection;
            
            console.log('[AI Performance] Connection:', {
                type: effectiveType,
                downlink: `${downlink} Mbps`,
                rtt: `${rtt} ms`,
                saveData
            });

            // Adjust loading strategy based on connection
            if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
                this.enableDataSaverMode();
            } else if (effectiveType === '4g' && downlink > 10) {
                this.enableHighQualityMode();
            }
        }
    }

    enableDataSaverMode() {
        console.log('[AI Performance] Data Saver Mode enabled');
        
        // Reduce image quality
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
                // Replace with lower quality version
                if (img.src.includes('?')) {
                    img.src += '&quality=50';
                } else {
                    img.src += '?quality=50';
                }
            }
        });

        // Disable video autoplay
        document.querySelectorAll('video[autoplay]').forEach(video => {
            video.removeAttribute('autoplay');
        });

        // Defer non-critical scripts
        document.querySelectorAll('script[data-priority="low"]').forEach(script => {
            script.remove();
        });
    }

    enableHighQualityMode() {
        console.log('[AI Performance] High Quality Mode enabled');
        
        // Preload high-res images
        document.querySelectorAll('img[data-hires]').forEach(img => {
            const hiresLink = document.createElement('link');
            hiresLink.rel = 'preload';
            hiresLink.href = img.dataset.hires;
            hiresLink.as = 'image';
            document.head.appendChild(hiresLink);
        });

        // Enable video preload
        document.querySelectorAll('video').forEach(video => {
            video.preload = 'auto';
        });
    }

    // 4. Adaptive Image Quality
    adaptiveImageQuality() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const quality = this.determineOptimalQuality(img);
                    this.loadImageWithQuality(img, quality);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    determineOptimalQuality(img) {
        const viewport = window.innerWidth;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const connection = navigator.connection;

        // Default quality
        let quality = 80;

        // Adjust based on viewport
        if (viewport < 768) quality = 60;
        else if (viewport >= 1920) quality = 90;

        // Adjust based on connection
        if (connection) {
            if (connection.saveData) quality = 50;
            else if (connection.effectiveType === '4g') quality = 90;
            else if (connection.effectiveType === '3g') quality = 70;
            else quality = 50;
        }

        // Adjust based on device pixel ratio
        if (devicePixelRatio >= 2) quality = Math.min(quality + 10, 100);

        return quality;
    }

    loadImageWithQuality(img, quality) {
        const src = img.dataset.src;
        const optimizedSrc = this.addQualityParam(src, quality);
        
        img.src = optimizedSrc;
        img.removeAttribute('data-src');
        
        console.log(`[AI Performance] Loading image: quality=${quality}`);
    }

    addQualityParam(url, quality) {
        try {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set('quality', quality);
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }

    // 5. Resource Timing Analysis
    analyzeResourceTimings() {
        const resources = performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
            const timing = {
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize,
                type: resource.initiatorType
            };

            this.resourceTimings.set(resource.name, timing);
        });

        // Identify slow resources
        const slowResources = resources
            .filter(r => r.duration > 1000) // >1s
            .map(r => ({
                name: r.name,
                duration: Math.round(r.duration),
                type: r.initiatorType
            }))
            .sort((a, b) => b.duration - a.duration);

        if (slowResources.length > 0) {
            console.warn('[AI Performance] Slow resources detected:', slowResources);
        }

        return slowResources;
    }

    // 6. User Pattern Storage
    loadUserPatterns() {
        try {
            const stored = localStorage.getItem('ai_performance_patterns');
            return stored ? JSON.parse(stored) : { transitions: {}, visits: {}, timing: {} };
        } catch (e) {
            return { transitions: {}, visits: {}, timing: {} };
        }
    }

    saveUserPatterns() {
        try {
            localStorage.setItem('ai_performance_patterns', JSON.stringify(this.userPatterns));
        } catch (e) {
            console.error('[AI Performance] Failed to save patterns:', e);
        }
    }

    updateUserPatterns(page, duration) {
        // Update visit count
        this.userPatterns.visits[page] = (this.userPatterns.visits[page] || 0) + 1;

        // Update average time on page
        if (!this.userPatterns.timing[page]) {
            this.userPatterns.timing[page] = { total: 0, count: 0 };
        }
        this.userPatterns.timing[page].total += duration;
        this.userPatterns.timing[page].count += 1;

        // Update transitions
        if (this.navigationHistory.length >= 2) {
            const previous = this.navigationHistory[this.navigationHistory.length - 2].page;
            const key = previous;
            
            if (!this.userPatterns.transitions[key]) {
                this.userPatterns.transitions[key] = {};
            }
            
            this.userPatterns.transitions[key][page] = (this.userPatterns.transitions[key][page] || 0) + 1;
        }
    }

    // 7. Performance Report
    generateReport() {
        const report = {
            userBehavior: this.analyzeUserBehavior(),
            slowResources: this.analyzeResourceTimings(),
            connectionQuality: this.getConnectionQuality(),
            recommendations: this.generateRecommendations()
        };

        console.log('[AI Performance] Report:', report);
        return report;
    }

    getConnectionQuality() {
        const connection = navigator.connection;
        if (!connection) return 'unknown';

        return {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const slowResources = this.analyzeResourceTimings();

        if (slowResources.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: `${slowResources.length} slow resources detected`,
                action: 'Consider lazy loading or CDN optimization'
            });
        }

        const connection = navigator.connection;
        if (connection && connection.saveData) {
            recommendations.push({
                type: 'data-saver',
                priority: 'medium',
                message: 'User has data saver enabled',
                action: 'Reduce image quality and defer non-critical resources'
            });
        }

        return recommendations;
    }
}

// Initialize AI Performance Optimizer
window.addEventListener('load', () => {
    window.aiPerformanceOptimizer = new AIPerformanceOptimizer();
    
    // Expose debug methods
    window.getPerformanceReport = () => window.aiPerformanceOptimizer.generateReport();
    
    console.log('[AI Performance] Ready - Type getPerformanceReport() for insights');
});
