/**
 * MuseFlow Behavior Tracker
 * Tracks user interactions for personalization and analytics
 * Version: 1.0.0
 */

class BehaviorTracker {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/api/behaviors/track';
        this.batchSize = options.batchSize || 5;
        this.flushInterval = options.flushInterval || 30000; // 30 seconds
        this.enabled = options.enabled !== false;
        
        this.sessionStart = Date.now();
        this.events = [];
        this.pageStartTime = Date.now();
        this.currentPage = window.location.pathname;
        
        if (this.enabled) {
            this.init();
        }
    }
    
    init() {
        // Auto-track page views
        this.trackPageView();
        
        // Auto-track clicks with data-track attribute
        document.addEventListener('click', (e) => this.handleClick(e), true);
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Flush events before page unload
        window.addEventListener('beforeunload', () => this.flush(true));
        
        // Periodic flush
        this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
        
        console.log('🔍 BehaviorTracker initialized');
    }
    
    /**
     * Track a custom event
     * @param {string} eventType - Type of event (click, view, edit, delete, create, search)
     * @param {string} resourceType - Type of resource (project, workflow, canvas, page)
     * @param {number|null} resourceId - ID of the resource
     * @param {object} metadata - Additional metadata
     */
    track(eventType, resourceType, resourceId = null, metadata = {}) {
        if (!this.enabled) return;
        
        const event = {
            event_type: eventType,
            resource_type: resourceType,
            resource_id: resourceId,
            page_path: this.currentPage,
            duration: Math.floor((Date.now() - this.sessionStart) / 1000),
            metadata: JSON.stringify(metadata),
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        console.log('📊 Tracked:', eventType, resourceType, resourceId);
        
        // Auto-flush if batch size reached
        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        this.pageStartTime = Date.now();
        this.currentPage = window.location.pathname;
        
        this.track('view', 'page', null, {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer
        });
    }
    
    /**
     * Track page duration when leaving
     */
    trackPageDuration() {
        const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
        
        if (duration > 1) { // Only track if stayed more than 1 second
            this.track('duration', 'page', null, {
                url: window.location.href,
                duration: duration
            });
        }
    }
    
    /**
     * Handle click events
     */
    handleClick(e) {
        const target = e.target.closest('[data-track]');
        if (!target) return;
        
        const trackType = target.dataset.trackType || 'click';
        const trackResource = target.dataset.trackResource || 'unknown';
        const trackId = target.dataset.trackId ? parseInt(target.dataset.trackId) : null;
        const trackMeta = target.dataset.trackMeta ? JSON.parse(target.dataset.trackMeta) : {};
        
        this.track(trackType, trackResource, trackId, trackMeta);
    }
    
    /**
     * Handle visibility change (tab switch)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.trackPageDuration();
            this.flush();
        } else {
            this.pageStartTime = Date.now();
        }
    }
    
    /**
     * Flush events to server
     * @param {boolean} sync - Use synchronous request (for beforeunload)
     */
    async flush(sync = false) {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ No auth token, skipping behavior tracking');
            return;
        }
        
        const payload = {
            events: eventsToSend
        };
        
        try {
            if (sync) {
                // Synchronous request for beforeunload
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(this.apiEndpoint, blob);
                console.log('📤 Sent', eventsToSend.length, 'events (beacon)');
            } else {
                // Asynchronous request for normal flush
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    console.log('✅ Sent', eventsToSend.length, 'events');
                } else {
                    console.error('❌ Failed to send events:', response.status);
                    // Re-add events if failed
                    this.events.unshift(...eventsToSend);
                }
            }
        } catch (error) {
            console.error('❌ Error sending events:', error);
            // Re-add events if failed
            this.events.unshift(...eventsToSend);
        }
    }
    
    /**
     * Destroy tracker
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
        this.enabled = false;
        console.log('🛑 BehaviorTracker destroyed');
    }
}

// Auto-initialize if not already initialized
if (typeof window !== 'undefined' && !window.tracker) {
    window.tracker = new BehaviorTracker({
        enabled: true,
        batchSize: 5,
        flushInterval: 30000
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BehaviorTracker;
}
