/**
 * MuseFlow V9.7 - Production Error Logger
 * Purpose: Track and log client-side errors for debugging
 */

// Global error logger
class ErrorLogger {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Keep last 50 errors
        this.init();
    }

    init() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'runtime',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        console.log('✅ Error Logger initialized');
    }

    logError(error) {
        this.errors.push(error);
        
        // Maintain max limit
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Save to localStorage for persistence
        try {
            localStorage.setItem('museflow_errors', JSON.stringify(this.errors));
        } catch (e) {
            console.warn('Failed to save errors to localStorage:', e);
        }

        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('sandbox')) {
            console.error('🐛 Error logged:', error);
        }
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('museflow_errors');
        console.log('✅ Error log cleared');
    }

    exportErrors() {
        const blob = new Blob([JSON.stringify(this.errors, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `museflow-errors-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global error logger
window.errorLogger = new ErrorLogger();

// Add debugging commands to console
console.log('%cMuseFlow V9.7 Production', 'color: #8b5cf6; font-weight: bold; font-size: 16px');
console.log('%cDebug Commands:', 'color: #10b981; font-weight: bold');
console.log('  errorLogger.getErrors()  - View logged errors');
console.log('  errorLogger.clearErrors() - Clear error log');
console.log('  errorLogger.exportErrors() - Export errors to JSON');
