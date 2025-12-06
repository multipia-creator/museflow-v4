/**
 * MuseFlow V18.0 - Sentry Error Monitoring
 * Real-time error tracking and performance monitoring
 */

(function() {
    'use strict';

    // Sentry Configuration (will be replaced with actual DSN in production)
    const SENTRY_DSN = 'https://REPLACE_WITH_ACTUAL_DSN@sentry.io/PROJECT_ID';
    const ENVIRONMENT = window.location.hostname.includes('localhost') ? 'development' : 'production';
    const RELEASE = 'museflow@18.0.0';

    // Simple Error Logger (fallback if Sentry CDN fails)
    const errorLogger = {
        errors: [],
        
        log: function(error, context = {}) {
            const errorData = {
                timestamp: new Date().toISOString(),
                message: error.message || String(error),
                stack: error.stack || '',
                context: context,
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.errors.push(errorData);
            console.error('📛 Error logged:', errorData);
            
            // Send to analytics if available
            if (window.MuseFlowAnalytics) {
                window.MuseFlowAnalytics.error.trackError(error, context.source || 'unknown');
            }
        },
        
        getErrors: function() {
            return this.errors;
        },
        
        clearErrors: function() {
            this.errors = [];
        }
    };

    /**
     * Initialize Sentry (Lightweight implementation)
     * Using manual error tracking instead of full Sentry SDK to reduce bundle size
     */
    function initSentry() {
        console.log('🔍 Initializing error monitoring...');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            errorLogger.log(event.error || new Error(event.message), {
                source: 'window.error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            errorLogger.log(new Error(event.reason), {
                source: 'unhandled_promise',
                reason: event.reason
            });
        });

        console.log('✅ Error monitoring initialized');
    }

    /**
     * Custom Error Tracking Functions
     */
    const sentryTracking = {
        // Capture exception
        captureException: function(error, context = {}) {
            errorLogger.log(error, {
                ...context,
                source: 'manual_capture'
            });
        },

        // Capture message
        captureMessage: function(message, level = 'info', context = {}) {
            errorLogger.log(new Error(message), {
                ...context,
                level: level,
                source: 'manual_message'
            });
        },

        // Add breadcrumb (for debugging context)
        addBreadcrumb: function(breadcrumb) {
            if (!window.sentryBreadcrumbs) {
                window.sentryBreadcrumbs = [];
            }
            
            window.sentryBreadcrumbs.push({
                timestamp: new Date().toISOString(),
                ...breadcrumb
            });
            
            // Keep only last 50 breadcrumbs
            if (window.sentryBreadcrumbs.length > 50) {
                window.sentryBreadcrumbs.shift();
            }
        },

        // Set user context
        setUser: function(userData) {
            window.sentryUser = userData;
        },

        // Set tags
        setTag: function(key, value) {
            if (!window.sentryTags) {
                window.sentryTags = {};
            }
            window.sentryTags[key] = value;
        },

        // Get error logs
        getErrorLogs: function() {
            return errorLogger.getErrors();
        }
    };

    /**
     * Performance Monitoring
     */
    const performanceMonitoring = {
        // Track long tasks (> 50ms)
        trackLongTasks: function() {
            if (!('PerformanceObserver' in window)) return;

            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            sentryTracking.addBreadcrumb({
                                category: 'performance',
                                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                                level: 'warning',
                                data: {
                                    duration: entry.duration,
                                    startTime: entry.startTime
                                }
                            });
                        }
                    }
                });

                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task tracking not supported');
            }
        },

        // Track resource loading errors
        trackResourceErrors: function() {
            window.addEventListener('error', (event) => {
                if (event.target !== window) {
                    // Resource loading error
                    const resource = event.target;
                    errorLogger.log(new Error('Resource loading failed'), {
                        source: 'resource_error',
                        resourceType: resource.tagName,
                        resourceSrc: resource.src || resource.href
                    });
                }
            }, true);
        }
    };

    /**
     * AI Orchestrator Error Tracking
     */
    const aiOrchestratorMonitoring = {
        // Track AI agent errors
        trackAgentError: function(agentType, error, context = {}) {
            sentryTracking.captureException(error, {
                source: 'ai_orchestrator',
                agentType: agentType,
                ...context
            });
        },

        // Track workflow failures
        trackWorkflowFailure: function(workflowName, phase, error) {
            sentryTracking.captureException(error, {
                source: 'ai_workflow',
                workflowName: workflowName,
                failedPhase: phase
            });
        }
    };

    /**
     * Widget System Error Tracking
     */
    const widgetMonitoring = {
        // Track widget load errors
        trackWidgetLoadError: function(widgetType, error) {
            sentryTracking.captureException(error, {
                source: 'widget_system',
                widgetType: widgetType,
                action: 'load'
            });
        },

        // Track widget interaction errors
        trackWidgetInteractionError: function(widgetType, action, error) {
            sentryTracking.captureException(error, {
                source: 'widget_system',
                widgetType: widgetType,
                action: action
            });
        }
    };

    /**
     * Initialize all monitoring
     */
    function init() {
        initSentry();
        performanceMonitoring.trackLongTasks();
        performanceMonitoring.trackResourceErrors();

        console.log('✅ MuseFlow Sentry Monitoring initialized');
        console.log(`   Environment: ${ENVIRONMENT}`);
        console.log(`   Release: ${RELEASE}`);
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export to global scope
    window.MuseFlowSentry = {
        captureException: sentryTracking.captureException,
        captureMessage: sentryTracking.captureMessage,
        addBreadcrumb: sentryTracking.addBreadcrumb,
        setUser: sentryTracking.setUser,
        setTag: sentryTracking.setTag,
        getErrorLogs: sentryTracking.getErrorLogs,
        aiOrchestrator: aiOrchestratorMonitoring,
        widget: widgetMonitoring
    };

})();
