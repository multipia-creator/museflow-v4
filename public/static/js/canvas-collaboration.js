/**
 * MuseFlow V10.5 - Real-time Canvas Collaboration
 * Multi-user editing with conflict resolution and change tracking
 */

class CanvasCollaboration {
    constructor(canvasInstance, projectId, userId) {
        this.canvas = canvasInstance;
        this.projectId = projectId;
        this.userId = userId || localStorage.getItem('userId') || '2';
        this.activeUsers = new Map();
        this.changeHistory = [];
        this.localChanges = [];
        this.syncInterval = null;
        this.cursors = new Map();
        
        this.init();
    }

    init() {
        console.log('[Collaboration] Initializing for project:', this.projectId);
        
        this.setupEventListeners();
        this.startSync();
        this.trackCursor();
        this.setupPresence();
        
        // Show collaboration UI
        this.renderCollaborationPanel();
    }

    // 1. Real-time Sync
    startSync() {
        // Sync every 3 seconds
        this.syncInterval = setInterval(() => {
            this.syncChanges();
        }, 3000);

        // Sync on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncChanges();
            }
        });

        // Initial sync
        this.syncChanges();
    }

    async syncChanges() {
        try {
            // 1. Send local changes to server
            if (this.localChanges.length > 0) {
                await this.pushChanges();
            }

            // 2. Fetch remote changes
            await this.pullChanges();

            // 3. Update active users
            await this.updateActiveUsers();

        } catch (error) {
            console.error('[Collaboration] Sync failed:', error);
        }
    }

    async pushChanges() {
        if (this.localChanges.length === 0) return;

        const changes = {
            projectId: this.projectId,
            userId: this.userId,
            timestamp: Date.now(),
            changes: this.localChanges
        };

        // Store in localStorage as mock server
        const key = `collaboration_${this.projectId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(changes);
        
        // Keep only last 100 changes
        if (existing.length > 100) {
            existing.splice(0, existing.length - 100);
        }
        
        localStorage.setItem(key, JSON.stringify(existing));

        console.log(`[Collaboration] Pushed ${this.localChanges.length} changes`);
        
        // Add to history
        this.changeHistory.push(...this.localChanges);
        this.localChanges = [];
    }

    async pullChanges() {
        const key = `collaboration_${this.projectId}`;
        const allChanges = JSON.parse(localStorage.getItem(key) || '[]');

        // Get changes from other users since last sync
        const lastSyncTime = this.getLastSyncTime();
        const newChanges = allChanges.filter(batch => 
            batch.userId !== this.userId && 
            batch.timestamp > lastSyncTime
        );

        if (newChanges.length > 0) {
            console.log(`[Collaboration] Pulled ${newChanges.length} change batches from other users`);
            
            // Apply remote changes
            newChanges.forEach(batch => {
                batch.changes.forEach(change => {
                    this.applyRemoteChange(change);
                });
            });

            this.updateLastSyncTime();
        }
    }

    applyRemoteChange(change) {
        switch (change.type) {
            case 'node_add':
                if (!this.canvas.nodes.find(n => n.id === change.data.id)) {
                    this.canvas.nodes.push(change.data);
                    this.showChangeNotification('added', change.data, change.userId);
                }
                break;

            case 'node_update':
                const nodeIndex = this.canvas.nodes.findIndex(n => n.id === change.data.id);
                if (nodeIndex !== -1) {
                    Object.assign(this.canvas.nodes[nodeIndex], change.data);
                    this.showChangeNotification('updated', change.data, change.userId);
                }
                break;

            case 'node_delete':
                const deleteIndex = this.canvas.nodes.findIndex(n => n.id === change.data.id);
                if (deleteIndex !== -1) {
                    this.canvas.nodes.splice(deleteIndex, 1);
                    this.showChangeNotification('deleted', change.data, change.userId);
                }
                break;

            case 'connection_add':
                if (!this.canvas.connections.find(c => c.id === change.data.id)) {
                    this.canvas.connections.push(change.data);
                }
                break;

            case 'connection_delete':
                const connIndex = this.canvas.connections.findIndex(c => c.id === change.data.id);
                if (connIndex !== -1) {
                    this.canvas.connections.splice(connIndex, 1);
                }
                break;
        }

        // Trigger canvas redraw
        if (this.canvas.render) {
            this.canvas.render();
        }
    }

    showChangeNotification(action, data, userId) {
        const userName = this.getUserName(userId);
        const nodeName = data.label || data.type || 'node';
        
        const notification = document.createElement('div');
        notification.className = 'collaboration-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(139, 92, 246, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
                <div>
                    <div style="font-weight: 600;">${userName}</div>
                    <div style="font-size: 0.875rem; opacity: 0.9;">
                        ${action} "${nodeName}"
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 2. Event Tracking
    setupEventListeners() {
        // Track node additions
        const originalAddNode = this.canvas.addNode?.bind(this.canvas);
        if (originalAddNode) {
            this.canvas.addNode = (...args) => {
                const result = originalAddNode(...args);
                
                if (result) {
                    this.localChanges.push({
                        type: 'node_add',
                        data: result,
                        timestamp: Date.now(),
                        userId: this.userId
                    });
                }
                
                return result;
            };
        }

        // Track node updates
        const originalUpdateNode = this.canvas.updateNode?.bind(this.canvas);
        if (originalUpdateNode) {
            this.canvas.updateNode = (...args) => {
                const result = originalUpdateNode(...args);
                
                this.localChanges.push({
                    type: 'node_update',
                    data: args[0],
                    timestamp: Date.now(),
                    userId: this.userId
                });
                
                return result;
            };
        }

        // Track node deletions
        const originalDeleteNode = this.canvas.deleteNode?.bind(this.canvas);
        if (originalDeleteNode) {
            this.canvas.deleteNode = (...args) => {
                const result = originalDeleteNode(...args);
                
                this.localChanges.push({
                    type: 'node_delete',
                    data: { id: args[0] },
                    timestamp: Date.now(),
                    userId: this.userId
                });
                
                return result;
            };
        }
    }

    // 3. Cursor Tracking
    trackCursor() {
        let lastPosition = { x: 0, y: 0 };
        let throttleTimeout = null;

        document.addEventListener('mousemove', (e) => {
            if (throttleTimeout) return;

            throttleTimeout = setTimeout(() => {
                lastPosition = { x: e.clientX, y: e.clientY };
                this.broadcastCursor(lastPosition);
                throttleTimeout = null;
            }, 100); // Throttle to 10fps
        });
    }

    broadcastCursor(position) {
        const key = `cursor_${this.projectId}_${this.userId}`;
        const data = {
            userId: this.userId,
            position,
            timestamp: Date.now()
        };

        localStorage.setItem(key, JSON.stringify(data));
    }

    async updateActiveUsers() {
        const now = Date.now();
        const activeThreshold = 10000; // 10 seconds

        // Get all cursor positions
        const keys = Object.keys(localStorage).filter(k => 
            k.startsWith(`cursor_${this.projectId}_`)
        );

        const activeUsersList = [];

        keys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                
                if (now - data.timestamp < activeThreshold && data.userId !== this.userId) {
                    activeUsersList.push({
                        userId: data.userId,
                        position: data.position,
                        lastSeen: data.timestamp
                    });

                    // Render cursor
                    this.renderRemoteCursor(data);
                }
            } catch (e) {
                // Invalid data
            }
        });

        // Update active users map
        this.activeUsers.clear();
        activeUsersList.forEach(user => {
            this.activeUsers.set(user.userId, user);
        });

        // Update UI
        this.updateCollaborationPanel();
    }

    renderRemoteCursor(data) {
        let cursor = this.cursors.get(data.userId);

        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'remote-cursor';
            cursor.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transition: all 0.1s ease;
            `;
            cursor.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M5 3L19 12L12 13L9 19L5 3Z" 
                          fill="${this.getUserColor(data.userId)}" 
                          stroke="white" 
                          stroke-width="1"/>
                </svg>
                <div style="
                    position: absolute;
                    left: 20px;
                    top: 20px;
                    background: ${this.getUserColor(data.userId)};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                ">
                    ${this.getUserName(data.userId)}
                </div>
            `;
            document.body.appendChild(cursor);
            this.cursors.set(data.userId, cursor);
        }

        cursor.style.left = data.position.x + 'px';
        cursor.style.top = data.position.y + 'px';
    }

    // 4. Presence System
    setupPresence() {
        // Heartbeat every 5 seconds
        setInterval(() => {
            const key = `presence_${this.projectId}_${this.userId}`;
            localStorage.setItem(key, JSON.stringify({
                userId: this.userId,
                timestamp: Date.now(),
                page: window.location.pathname
            }));
        }, 5000);
    }

    // 5. UI Components
    renderCollaborationPanel() {
        const panel = document.createElement('div');
        panel.id = 'collaboration-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(10, 10, 15, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 16px;
            padding: 16px;
            min-width: 200px;
            z-index: 999;
        `;

        panel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <i class="fas fa-users" style="color: var(--museum-purple);"></i>
                <span style="font-weight: 600; color: white;">Active Users</span>
            </div>
            <div id="active-users-list"></div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <button id="view-history-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: rgba(139, 92, 246, 0.2);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.875rem;
                ">
                    <i class="fas fa-history"></i> View History
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('view-history-btn')?.addEventListener('click', () => {
            this.showChangeHistory();
        });
    }

    updateCollaborationPanel() {
        const list = document.getElementById('active-users-list');
        if (!list) return;

        if (this.activeUsers.size === 0) {
            list.innerHTML = `
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem; text-align: center;">
                    No other users online
                </div>
            `;
        } else {
            list.innerHTML = Array.from(this.activeUsers.entries())
                .map(([userId, user]) => `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 0;
                        color: white;
                        font-size: 0.875rem;
                    ">
                        <div style="
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: ${this.getUserColor(userId)};
                        "></div>
                        <span>${this.getUserName(userId)}</span>
                    </div>
                `).join('');
        }
    }

    showChangeHistory() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(10, 10, 15, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 24px;
            padding: 32px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: white; margin: 0;">Change History</h3>
                <button id="close-history" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                ">×</button>
            </div>
            <div id="history-list"></div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Render history
        const historyList = content.querySelector('#history-list');
        const key = `collaboration_${this.projectId}`;
        const allChanges = JSON.parse(localStorage.getItem(key) || '[]');

        if (allChanges.length === 0) {
            historyList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5);">No changes yet</p>';
        } else {
            historyList.innerHTML = allChanges.reverse().slice(0, 50).map(batch => `
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 12px;
                    margin-bottom: 8px;
                ">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: ${this.getUserColor(batch.userId)}; font-weight: 600;">
                            ${this.getUserName(batch.userId)}
                        </span>
                        <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem;">
                            ${new Date(batch.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                        ${batch.changes.length} change(s): ${batch.changes.map(c => c.type).join(', ')}
                    </div>
                </div>
            `).join('');
        }

        // Close handlers
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        content.querySelector('#close-history').addEventListener('click', () => modal.remove());
    }

    // 6. Helper Methods
    getUserName(userId) {
        const names = {
            '1': 'Admin',
            '2': 'Curator',
            '3': 'Designer',
            '4': 'Manager'
        };
        return names[userId] || `User ${userId}`;
    }

    getUserColor(userId) {
        const colors = [
            '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', 
            '#3b82f6', '#ef4444', '#6366f1', '#14b8a6'
        ];
        const index = parseInt(userId) % colors.length;
        return colors[index];
    }

    getLastSyncTime() {
        return parseInt(localStorage.getItem(`last_sync_${this.projectId}`) || '0');
    }

    updateLastSyncTime() {
        localStorage.setItem(`last_sync_${this.projectId}`, Date.now().toString());
    }

    // 7. Cleanup
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.cursors.forEach(cursor => cursor.remove());
        document.getElementById('collaboration-panel')?.remove();
    }
}

// Auto-initialize on Canvas V3 pages
window.addEventListener('load', () => {
    if (window.location.pathname.includes('canvas-v3')) {
        const projectId = new URLSearchParams(window.location.search).get('projectId') || '1';
        
        // Wait for CanvasV3 to be available
        const initCollaboration = () => {
            if (window.CanvasV3) {
                window.canvasCollaboration = new CanvasCollaboration(window.CanvasV3, projectId);
                console.log('[Collaboration] Initialized');
            } else {
                setTimeout(initCollaboration, 500);
            }
        };

        initCollaboration();
    }
});
