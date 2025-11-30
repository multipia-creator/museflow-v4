/**
 * MuseFlow V4.0 - Notification System
 * Real-time alerts for curators
 */

class NotificationSystem {
    constructor() {
        this.permission = 'default';
        this.notifications = [];
        this.initialized = false;
    }

    /**
     * Initialize notification system
     */
    async init() {
        if (this.initialized) return;
        
        // Check browser support
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        // Request permission
        if (Notification.permission === 'default') {
            this.permission = await Notification.requestPermission();
        } else {
            this.permission = Notification.permission;
        }

        this.initialized = true;
        this.loadNotifications();
        this.startAutoCheck();
        
        return this.permission === 'granted';
    }

    /**
     * Send browser notification
     */
    async sendNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/static/images/logo.png',
            badge: '/static/images/badge.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // Handle notification click
            notification.onclick = () => {
                window.focus();
                if (options.url) {
                    window.location.href = options.url;
                }
                notification.close();
            };

            // Store notification
            this.addNotification({
                title,
                body: options.body,
                timestamp: new Date().toISOString(),
                read: false,
                url: options.url
            });

            return notification;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return null;
        }
    }

    /**
     * Show in-app notification badge
     */
    showInAppNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const notifEl = document.createElement('div');
        notifEl.className = `notification-toast notification-${type}`;
        notifEl.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notifEl);

        // Auto remove
        setTimeout(() => {
            notifEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notifEl.remove(), 300);
        }, duration);
    }

    /**
     * Create notification container
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            urgent: 'fa-bell'
        };
        return icons[type] || icons.info;
    }

    /**
     * Check for urgent deadlines
     */
    async checkUrgentDeadlines() {
        try {
            const response = await fetch('/api/projects/urgent');
            const data = await response.json();

            if (data.success && data.projects.length > 0) {
                data.projects.forEach(project => {
                    const daysLeft = this.calculateDaysLeft(project.end_date);
                    
                    if (daysLeft <= 7 && daysLeft > 0) {
                        this.sendNotification(
                            `🚨 긴급: ${project.title}`,
                            {
                                body: `마감 D-${daysLeft}! 작업을 확인해주세요.`,
                                icon: '/static/images/urgent.png',
                                tag: `urgent-${project.id}`,
                                url: `/canvas?project=${project.id}`
                            }
                        );
                    }
                });
            }
        } catch (error) {
            console.error('Failed to check urgent deadlines:', error);
        }
    }

    /**
     * Calculate days left
     */
    calculateDaysLeft(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Start automatic checking
     */
    startAutoCheck() {
        // Check every 30 minutes
        setInterval(() => {
            this.checkUrgentDeadlines();
        }, 30 * 60 * 1000);

        // Initial check after 5 seconds
        setTimeout(() => {
            this.checkUrgentDeadlines();
        }, 5000);
    }

    /**
     * Load notifications from localStorage
     */
    loadNotifications() {
        const stored = localStorage.getItem('museflow_notifications');
        if (stored) {
            try {
                this.notifications = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to load notifications:', error);
                this.notifications = [];
            }
        }
    }

    /**
     * Add notification to storage
     */
    addNotification(notification) {
        this.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.saveNotifications();
        this.updateBadge();
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        try {
            localStorage.setItem('museflow_notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(index) {
        if (this.notifications[index]) {
            this.notifications[index].read = true;
            this.saveNotifications();
            this.updateBadge();
        }
    }

    /**
     * Mark all as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
    }

    /**
     * Get unread count
     */
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    /**
     * Update notification badge
     */
    updateBadge() {
        const count = this.getUnreadCount();
        const badges = document.querySelectorAll('.notification-badge');
        
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    /**
     * Get all notifications
     */
    getNotifications(unreadOnly = false) {
        if (unreadOnly) {
            return this.notifications.filter(n => !n.read);
        }
        return this.notifications;
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
    }

    /**
     * Render notification panel
     */
    renderNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (!panel) return;

        const unreadCount = this.getUnreadCount();
        const notifications = this.getNotifications();

        if (notifications.length === 0) {
            panel.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>알림이 없습니다</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="notification-header">
                <h3>알림 <span class="unread-count">${unreadCount}</span></h3>
                <div class="notification-actions">
                    <button onclick="notificationSystem.markAllAsRead()" class="btn-text">모두 읽음</button>
                    <button onclick="notificationSystem.clearAll()" class="btn-text">모두 삭제</button>
                </div>
            </div>
            <div class="notification-list">
                ${notifications.map((n, index) => `
                    <div class="notification-item ${n.read ? 'read' : 'unread'}" 
                         onclick="notificationSystem.handleNotificationClick(${index}, '${n.url || ''}')">
                        <div class="notification-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="notification-body">
                            <h4>${n.title}</h4>
                            <p>${n.body || ''}</p>
                            <span class="notification-time">${this.formatTime(n.timestamp)}</span>
                        </div>
                        ${!n.read ? '<div class="notification-dot"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        panel.innerHTML = html;
    }

    /**
     * Handle notification click
     */
    handleNotificationClick(index, url) {
        this.markAsRead(index);
        this.renderNotificationPanel();
        
        if (url && url !== 'undefined') {
            window.location.href = url;
        }
    }

    /**
     * Format time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return date.toLocaleDateString('ko-KR');
    }
}

// Global instance
window.notificationSystem = new NotificationSystem();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    notificationSystem.init();
});

// CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
    .notification-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    }

    .notification-toast {
        background: rgba(10, 10, 15, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease;
    }

    .notification-toast.notification-success {
        border-left: 4px solid var(--success);
    }

    .notification-toast.notification-warning {
        border-left: 4px solid var(--warning);
    }

    .notification-toast.notification-error {
        border-left: 4px solid var(--urgent);
    }

    .notification-toast.notification-info {
        border-left: 4px solid var(--info);
    }

    .notification-toast.notification-urgent {
        border-left: 4px solid var(--urgent);
        animation: slideIn 0.3s ease, pulse 2s ease infinite;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }

    .notification-content i {
        font-size: 1.25rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 4px;
        opacity: 0.6;
        transition: opacity 0.2s;
    }

    .notification-close:hover {
        opacity: 1;
    }

    .notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--urgent);
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .notification-panel {
        position: absolute;
        top: 100%;
        right: 0;
        width: 400px;
        max-height: 600px;
        overflow-y: auto;
        background: rgba(10, 10, 15, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        margin-top: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        z-index: 1000;
    }

    .notification-header {
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification-header h3 {
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .unread-count {
        background: var(--urgent);
        color: white;
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 10px;
    }

    .notification-actions {
        display: flex;
        gap: 8px;
    }

    .btn-text {
        background: none;
        border: none;
        color: var(--museum-purple);
        cursor: pointer;
        font-size: 0.85rem;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .btn-text:hover {
        background: rgba(139, 92, 246, 0.1);
    }

    .notification-list {
        max-height: 500px;
        overflow-y: auto;
    }

    .notification-item {
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
        position: relative;
    }

    .notification-item:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .notification-item.unread {
        background: rgba(139, 92, 246, 0.05);
    }

    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--museum-purple);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .notification-body h4 {
        font-size: 0.95rem;
        margin-bottom: 4px;
        color: #f5f5f7;
    }

    .notification-body p {
        font-size: 0.85rem;
        color: #999;
        margin-bottom: 4px;
    }

    .notification-time {
        font-size: 0.75rem;
        color: #666;
    }

    .notification-dot {
        position: absolute;
        top: 20px;
        right: 16px;
        width: 8px;
        height: 8px;
        background: var(--urgent);
        border-radius: 50%;
    }

    .notification-empty {
        padding: 60px 20px;
        text-align: center;
        color: #666;
    }

    .notification-empty i {
        font-size: 3rem;
        margin-bottom: 16px;
        opacity: 0.3;
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .notification-container {
            left: 20px;
            right: 20px;
            max-width: none;
        }

        .notification-panel {
            width: calc(100vw - 40px);
            right: auto;
            left: 0;
        }
    }
`;
document.head.appendChild(style);
