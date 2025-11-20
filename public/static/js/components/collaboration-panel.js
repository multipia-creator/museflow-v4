/**
 * Collaboration Panel Component
 * Shows active users and collaboration status
 */

const CollaborationPanel = {
  /**
   * Render collaboration panel
   */
  render() {
    const panel = document.createElement('div');
    panel.id = 'collaboration-panel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 16px;
      min-width: 250px;
      z-index: 1000;
    `;
    
    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">
          👥 Active Users
        </h3>
        <div id="collab-status" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></div>
      </div>
      
      <div id="collab-users-list" style="display: flex; flex-direction: column; gap: 8px;">
        <!-- Users will be rendered here -->
      </div>
      
      <style>
        .collab-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .collab-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
          flex-shrink: 0;
        }
        
        .collab-user-info {
          flex: 1;
          min-width: 0;
        }
        
        .collab-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .collab-user-status {
          font-size: 11px;
          color: #6b7280;
        }
      </style>
    `;
    
    document.body.appendChild(panel);
    this.startUpdate();
  },
  
  /**
   * Update users list
   */
  update() {
    const usersList = document.getElementById('collab-users-list');
    const statusDot = document.getElementById('collab-status');
    
    if (!usersList || !statusDot) return;
    
    const collab = window.CollaborationClient;
    
    if (!collab || !collab.isConnected) {
      statusDot.style.background = '#ef4444';
      usersList.innerHTML = '<p style="font-size: 13px; color: #6b7280; margin: 0;">Not connected</p>';
      return;
    }
    
    statusDot.style.background = '#10b981';
    
    const users = collab.getUsers();
    
    if (users.length === 0) {
      usersList.innerHTML = '<p style="font-size: 13px; color: #6b7280; margin: 0;">Only you</p>';
      return;
    }
    
    usersList.innerHTML = users.map(user => {
      const isMe = user.id === collab.userId;
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      return `
        <div class="collab-user">
          <div class="collab-user-avatar" style="background: ${user.color}">
            ${initials}
          </div>
          <div class="collab-user-info">
            <div class="collab-user-name">${user.name}${isMe ? ' (You)' : ''}</div>
            <div class="collab-user-status">
              ${user.selectedNodes && user.selectedNodes.length > 0 ? 
                `Selected ${user.selectedNodes.length} node(s)` : 
                'Viewing'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Start auto-update
   */
  startUpdate() {
    this.update();
    this.updateInterval = setInterval(() => this.update(), 1000);
  },
  
  /**
   * Stop auto-update
   */
  stopUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  },
  
  /**
   * Remove panel
   */
  remove() {
    this.stopUpdate();
    const panel = document.getElementById('collaboration-panel');
    if (panel) {
      panel.remove();
    }
  }
};
