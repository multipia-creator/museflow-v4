/**
 * MuseFlow V18.0 - Google Analytics 4 Integration
 * Comprehensive event tracking for user behavior analysis
 */

(function() {
    'use strict';

    // GA4 Configuration
    const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Will be replaced in production
    
    /**
     * Initialize GA4
     */
    function initGA4() {
        // Check if already initialized
        if (window.gtag) {
            console.log('✅ GA4 already initialized');
            return;
        }

        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            dataLayer.push(arguments);
        };
        
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID, {
            send_page_view: true,
            cookie_flags: 'SameSite=None;Secure'
        });

        console.log('✅ GA4 initialized:', GA4_MEASUREMENT_ID);
    }

    /**
     * Track Custom Event
     */
    function trackEvent(eventName, eventParams = {}) {
        if (!window.gtag) {
            console.warn('GA4 not initialized');
            return;
        }

        gtag('event', eventName, eventParams);
        console.log('📊 GA4 Event:', eventName, eventParams);
    }

    /**
     * Track Page View
     */
    function trackPageView(pagePath, pageTitle) {
        trackEvent('page_view', {
            page_path: pagePath || window.location.pathname,
            page_title: pageTitle || document.title,
            page_location: window.location.href
        });
    }

    /**
     * Track User Engagement
     */
    function trackEngagement(action, category, label, value) {
        trackEvent('user_engagement', {
            engagement_action: action,
            engagement_category: category,
            engagement_label: label,
            engagement_value: value
        });
    }

    /**
     * AI Orchestrator Events
     */
    const aiOrchestratorTracking = {
        // Track AI Agent execution
        trackAgentExecution: function(agentType, success, duration) {
            trackEvent('ai_agent_execution', {
                agent_type: agentType,
                execution_success: success,
                execution_duration_ms: duration,
                timestamp: new Date().toISOString()
            });
        },

        // Track workflow completion
        trackWorkflowComplete: function(workflowName, nodesExecuted, totalDuration) {
            trackEvent('ai_workflow_complete', {
                workflow_name: workflowName,
                nodes_executed: nodesExecuted,
                total_duration_ms: totalDuration,
                timestamp: new Date().toISOString()
            });
        },

        // Track AI command input
        trackAICommand: function(command, source) {
            trackEvent('ai_command_input', {
                command: command,
                source: source, // 'canvas' or 'dashboard'
                timestamp: new Date().toISOString()
            });
        }
    };

    /**
     * Widget Interaction Tracking
     */
    const widgetTracking = {
        // Track widget drag
        trackWidgetDrag: function(widgetType) {
            trackEvent('widget_drag', {
                widget_type: widgetType,
                timestamp: new Date().toISOString()
            });
        },

        // Track widget drop
        trackWidgetDrop: function(widgetType, position) {
            trackEvent('widget_drop', {
                widget_type: widgetType,
                position_x: position.x,
                position_y: position.y,
                timestamp: new Date().toISOString()
            });
        },

        // Track widget interaction
        trackWidgetInteraction: function(widgetType, action) {
            trackEvent('widget_interaction', {
                widget_type: widgetType,
                interaction_action: action,
                timestamp: new Date().toISOString()
            });
        }
    };

    /**
     * Canvas Activity Tracking
     */
    const canvasTracking = {
        // Track canvas zoom
        trackZoom: function(zoomLevel) {
            trackEvent('canvas_zoom', {
                zoom_level: zoomLevel,
                timestamp: new Date().toISOString()
            });
        },

        // Track canvas pan
        trackPan: function(distance) {
            trackEvent('canvas_pan', {
                pan_distance: distance,
                timestamp: new Date().toISOString()
            });
        },

        // Track card creation
        trackCardCreate: function(cardType) {
            trackEvent('canvas_card_create', {
                card_type: cardType,
                timestamp: new Date().toISOString()
            });
        },

        // Track card connection
        trackCardConnect: function(sourceType, targetType) {
            trackEvent('canvas_card_connect', {
                source_card_type: sourceType,
                target_card_type: targetType,
                timestamp: new Date().toISOString()
            });
        }
    };

    /**
     * Dashboard Activity Tracking
     */
    const dashboardTracking = {
        // Track stat card view
        trackStatView: function(statName, statValue) {
            trackEvent('dashboard_stat_view', {
                stat_name: statName,
                stat_value: statValue,
                timestamp: new Date().toISOString()
            });
        },

        // Track chart interaction
        trackChartInteraction: function(chartType, action) {
            trackEvent('dashboard_chart_interaction', {
                chart_type: chartType,
                interaction_action: action,
                timestamp: new Date().toISOString()
            });
        }
    };

    /**
     * Performance Tracking
     */
    const performanceTracking = {
        // Track page load performance
        trackPageLoad: function() {
            if (!window.performance || !window.performance.timing) return;

            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                    
                    trackEvent('page_performance', {
                        page_load_time_ms: pageLoadTime,
                        dom_ready_time_ms: domReadyTime,
                        page_path: window.location.pathname,
                        timestamp: new Date().toISOString()
                    });
                }, 0);
            });
        },

        // Track Core Web Vitals
        trackWebVitals: function() {
            // LCP (Largest Contentful Paint)
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            trackEvent('web_vital_lcp', {
                                value: entry.renderTime || entry.loadTime,
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    console.warn('LCP observer failed:', e);
                }
            }
        }
    };

    /**
     * Error Tracking
     */
    const errorTracking = {
        // Track JavaScript errors
        trackError: function(error, source) {
            trackEvent('javascript_error', {
                error_message: error.message || String(error),
                error_source: source || 'unknown',
                error_stack: error.stack || '',
                page_path: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        },

        // Setup global error handler
        setupGlobalErrorHandler: function() {
            window.addEventListener('error', (event) => {
                this.trackError(event.error, 'global_handler');
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.trackError(new Error(event.reason), 'unhandled_promise');
            });
        }
    };

    /**
     * Auto-initialize and setup
     */
    function init() {
        // Initialize GA4
        initGA4();

        // Track page load performance
        performanceTracking.trackPageLoad();
        performanceTracking.trackWebVitals();

        // Setup error tracking
        errorTracking.setupGlobalErrorHandler();

        // Track initial page view
        trackPageView();

        console.log('✅ MuseFlow GA4 Analytics initialized');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export to global scope
    window.MuseFlowAnalytics = {
        trackEvent,
        trackPageView,
        trackEngagement,
        aiOrchestrator: aiOrchestratorTracking,
        widget: widgetTracking,
        canvas: canvasTracking,
        dashboard: dashboardTracking,
        performance: performanceTracking,
        error: errorTracking
    };

})();
