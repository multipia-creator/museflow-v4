/**
 * MuseFlow V10.0 - Notification Automation System
 * Purpose: Auto-check budgets, deadlines, and project status
 */

class NotificationAutomation {
    constructor() {
        this.checkInterval = 60000; // Check every 1 minute
        this.notificationHistory = [];
        this.maxHistory = 100;
        
        // Load history from localStorage
        this.loadHistory();
        
        console.log('✅ Notification Automation initialized');
    }

    // Request browser notification permission
    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                this.showBrowserNotification('MuseFlow 알림 활성화', '이제 중요한 업데이트를 놓치지 마세요! 🔔');
            }
        }
    }

    // Show browser notification
    showBrowserNotification(title, body, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'museflow',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
    }

    // Check all projects for alerts
    async checkAllProjects() {
        try {
            // Get projects from API
            const userId = 2; // Default user
            const response = await fetch(`/api/projects?userId=${userId}`);
            const data = await response.json();

            if (!data.success || !data.projects) {
                console.warn('Failed to fetch projects for notification check');
                return;
            }

            const projects = data.projects;
            const alerts = [];

            // Check each project
            projects.forEach(project => {
                // 1. Budget 80% warning
                if (project.budget_total > 0 && project.budget_used >= project.budget_total * 0.8 && project.budget_used < project.budget_total) {
                    alerts.push({
                        type: 'budget_warning',
                        priority: 'medium',
                        project: project,
                        message: `예산 80% 사용: ${project.title}`,
                        detail: `₩${(project.budget_used).toLocaleString()} / ₩${(project.budget_total).toLocaleString()}`
                    });
                }

                // 2. Budget over 100%
                if (project.budget_total > 0 && project.budget_used > project.budget_total) {
                    alerts.push({
                        type: 'budget_over',
                        priority: 'high',
                        project: project,
                        message: `예산 초과: ${project.title}`,
                        detail: `₩${(project.budget_used - project.budget_total).toLocaleString()} 초과`
                    });
                }

                // 3. Deadline alerts (D-7, D-1)
                if (project.end_date) {
                    const endDate = new Date(project.end_date);
                    const today = new Date();
                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                    if (daysLeft === 7) {
                        alerts.push({
                            type: 'deadline_7',
                            priority: 'medium',
                            project: project,
                            message: `D-7 알림: ${project.title}`,
                            detail: `${project.end_date} 종료 예정`
                        });
                    } else if (daysLeft === 1) {
                        alerts.push({
                            type: 'deadline_1',
                            priority: 'high',
                            project: project,
                            message: `D-1 긴급: ${project.title}`,
                            detail: `내일 종료됩니다!`
                        });
                    } else if (daysLeft <= 0 && daysLeft >= -7) {
                        alerts.push({
                            type: 'deadline_passed',
                            priority: 'high',
                            project: project,
                            message: `마감 지남: ${project.title}`,
                            detail: `${Math.abs(daysLeft)}일 경과`
                        });
                    }
                }

                // 4. Long stagnant projects (30+ days)
                if (project.updated_at) {
                    const updatedDate = new Date(project.updated_at);
                    const today = new Date();
                    const daysSinceUpdate = Math.floor((today - updatedDate) / (1000 * 60 * 60 * 24));

                    if (daysSinceUpdate >= 30 && project.status !== 'completed') {
                        alerts.push({
                            type: 'stagnant',
                            priority: 'low',
                            project: project,
                            message: `장기 미진행: ${project.title}`,
                            detail: `${daysSinceUpdate}일째 업데이트 없음`
                        });
                    }
                }
            });

            // Process alerts
            if (alerts.length > 0) {
                this.processAlerts(alerts);
            }

        } catch (error) {
            console.error('Notification check failed:', error);
        }
    }

    // Process and show alerts
    processAlerts(alerts) {
        // Filter out already shown alerts (prevent spam)
        const newAlerts = alerts.filter(alert => {
            const key = `${alert.type}_${alert.project.id}`;
            const lastShown = localStorage.getItem(`alert_${key}`);
            
            if (!lastShown) return true;
            
            // Show again after 24 hours
            const lastShownTime = new Date(lastShown);
            const now = new Date();
            return (now - lastShownTime) > 24 * 60 * 60 * 1000;
        });

        if (newAlerts.length === 0) return;

        // Sort by priority
        newAlerts.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        // Show top 3 alerts
        const topAlerts = newAlerts.slice(0, 3);

        topAlerts.forEach(alert => {
            // Show in-app notification
            if (window.notificationSystem && typeof window.notificationSystem.show === 'function') {
                const icon = this.getAlertIcon(alert.type);
                const color = this.getAlertColor(alert.priority);
                
                window.notificationSystem.show(
                    `${icon} ${alert.message}`,
                    alert.detail,
                    alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info'
                );
            } else {
                // Fallback to console.log if notificationSystem not available
                console.log(`📢 Alert: ${alert.message} - ${alert.detail}`);
            }

            // Show browser notification for high priority
            if (alert.priority === 'high') {
                this.showBrowserNotification(
                    alert.message,
                    alert.detail,
                    { requireInteraction: true }
                );
            }

            // Save to history
            this.saveAlert(alert);

            // Mark as shown
            const key = `${alert.type}_${alert.project.id}`;
            localStorage.setItem(`alert_${key}`, new Date().toISOString());
        });

        console.log(`✅ Processed ${topAlerts.length} new alerts`);
    }

    // Get icon for alert type
    getAlertIcon(type) {
        const icons = {
            budget_warning: '⚠️',
            budget_over: '🚨',
            deadline_7: '📅',
            deadline_1: '⏰',
            deadline_passed: '❌',
            stagnant: '⏸️'
        };
        return icons[type] || '🔔';
    }

    // Get color for priority
    getAlertColor(priority) {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#3b82f6'
        };
        return colors[priority] || '#6b7280';
    }

    // Save alert to history
    saveAlert(alert) {
        this.notificationHistory.unshift({
            ...alert,
            timestamp: new Date().toISOString()
        });

        // Keep max history
        if (this.notificationHistory.length > this.maxHistory) {
            this.notificationHistory = this.notificationHistory.slice(0, this.maxHistory);
        }

        this.saveHistory();
    }

    // Load history from localStorage
    loadHistory() {
        try {
            const stored = localStorage.getItem('museflow_notification_history');
            if (stored) {
                this.notificationHistory = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load notification history:', e);
        }
    }

    // Save history to localStorage
    saveHistory() {
        try {
            localStorage.setItem('museflow_notification_history', JSON.stringify(this.notificationHistory));
        } catch (e) {
            console.warn('Failed to save notification history:', e);
        }
    }

    // Get notification history
    getHistory() {
        return this.notificationHistory;
    }

    // Clear history
    clearHistory() {
        this.notificationHistory = [];
        localStorage.removeItem('museflow_notification_history');
        console.log('✅ Notification history cleared');
    }

    // Start automatic checking
    start() {
        // Initial check
        this.checkAllProjects();

        // Periodic check
        this.intervalId = setInterval(() => {
            this.checkAllProjects();
        }, this.checkInterval);

        console.log(`✅ Notification automation started (every ${this.checkInterval / 1000}s)`);
    }

    // Stop automatic checking
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Notification automation stopped');
        }
    }
}

// Initialize global automation
window.notificationAutomation = new NotificationAutomation();

// Auto-start on page load
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    window.notificationAutomation.requestPermission();
    
    // Start automation
    window.notificationAutomation.start();
});

// Debug commands
console.log('%cMuseFlow V10.0 - Notification Automation', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
console.log('%cCommands:', 'color: #10b981; font-weight: bold');
console.log('  notificationAutomation.checkAllProjects() - Manual check');
console.log('  notificationAutomation.getHistory() - View alert history');
console.log('  notificationAutomation.clearHistory() - Clear history');
console.log('  notificationAutomation.stop() - Stop automation');
console.log('  notificationAutomation.start() - Start automation');
