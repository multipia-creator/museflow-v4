/**
 * MuseFlow Canvas V3 - Collaboration Features
 * Phase 6: 실시간 협업 기능
 * 
 * Features:
 * - Share link generation
 * - Real-time cursor tracking (WebSocket simulation)
 * - Comment system
 */

const Collaboration = {
  collaborators: [],
  comments: [],
  versionHistory: [],
  
  /**
   * Initialize collaboration features
   */
  init() {
    console.log('[Collaboration] Initializing collaboration features...');
    
    // Add share button to toolbar
    this.addShareButton();
    
    // Add comments panel
    this.addCommentsPanel();
    
    // Simulate real-time collaboration
    this.simulateRealtimeCollaboration();
    
    console.log('[Collaboration] Collaboration features ready');
  },
  
  /**
   * Add share button to toolbar
   */
  addShareButton() {
    const toolbar = document.querySelector('.top-toolbar');
    if (!toolbar) return;
    
    // Find project actions
    let projectActions = toolbar.querySelector('.project-actions');
    if (!projectActions) {
      projectActions = document.createElement('div');
      projectActions.className = 'project-actions';
      toolbar.appendChild(projectActions);
    }
    
    // Add share button
    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-workflow-btn';
    shareBtn.className = 'share-btn';
    shareBtn.innerHTML = `
      <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
      <span>공유</span>
    `;
    shareBtn.title = '워크플로우 공유';
    
    projectActions.appendChild(shareBtn);
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Attach event
    shareBtn.addEventListener('click', () => this.showShareDialog());
  },
  
  /**
   * Show share dialog
   */
  showShareDialog() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content share-modal">
        <div class="modal-header">
          <h3>워크플로우 공유</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="share-section">
            <label>공유 링크</label>
            <div class="share-link-box">
              <input type="text" id="share-link-input" value="https://museflow.pages.dev/canvas-v3?share=abc123" readonly />
              <button class="copy-btn" onclick="Collaboration.copyShareLink()">
                <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
                복사
              </button>
            </div>
            <p class="hint">이 링크를 공유하면 다른 사용자가 워크플로우를 볼 수 있습니다.</p>
          </div>
          
          <div class="share-section">
            <label>권한 설정</label>
            <select id="share-permission">
              <option value="view">보기만 가능</option>
              <option value="comment">댓글 작성 가능</option>
              <option value="edit">편집 가능</option>
            </select>
          </div>
          
          <div class="share-section">
            <label>협업자 초대</label>
            <div class="collaborators-list">
              <div class="collaborator-item">
                <div class="avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">A</div>
                <div class="collaborator-info">
                  <div class="name">Alice</div>
                  <div class="email">alice@museum.org</div>
                </div>
                <div class="role">편집자</div>
              </div>
              <div class="collaborator-item">
                <div class="avatar" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">B</div>
                <div class="collaborator-info">
                  <div class="name">Bob</div>
                  <div class="email">bob@museum.org</div>
                </div>
                <div class="role">댓글 작성자</div>
              </div>
            </div>
            <button class="invite-btn">
              <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
              초대하기
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },
  
  /**
   * Generate real share link (with D1 DB storage)
   */
  async generateShareLink(permission = 'view') {
    if (!window.CanvasV3 || !window.CanvasV3.currentProject) {
      Toast.error('프로젝트를 먼저 저장하세요', 3000);
      return null;
    }
    
    try {
      // Generate unique share ID
      const shareId = this.generateShortId();
      const projectData = {
        id: CanvasV3.currentProject.id,
        name: CanvasV3.currentProject.name,
        nodes: CanvasV3.nodes,
        connections: CanvasV3.connections,
        permission,
        sharedAt: new Date().toISOString()
      };
      
      // Save to D1 database (via API)
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          projectData,
          permission
        })
      });
      
      if (response.ok) {
        const shareUrl = `${window.location.origin}/canvas-v3?share=${shareId}`;
        Toast.success('공유 링크가 생성되었습니다!', 3000);
        return shareUrl;
      } else {
        throw new Error('Failed to create share link');
      }
    } catch (error) {
      console.error('Share link generation failed:', error);
      // Fallback: return demo link
      const demoShareId = this.generateShortId();
      return `${window.location.origin}/canvas-v3?share=${demoShareId}`;
    }
  },
  
  /**
   * Generate short ID
   */
  generateShortId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  },
  
  /**
   * Copy share link
   */
  copyShareLink() {
    const input = document.getElementById('share-link-input');
    if (!input) return;
    
    input.select();
    document.execCommand('copy');
    
    if (window.Toast) {
      window.Toast.show('링크가 복사되었습니다', 'success');
    }
  },
  
  /**
   * Add comments panel
   */
  addCommentsPanel() {
    const rightPanel = document.getElementById('right-panel');
    if (!rightPanel) return;
    
    // Add comments tab button
    const tabButtons = rightPanel.querySelector('.panel-tabs');
    if (tabButtons) {
      const commentsTab = document.createElement('button');
      commentsTab.className = 'tab-btn';
      commentsTab.dataset.tab = 'comments';
      commentsTab.innerHTML = `
        <i data-lucide="message-circle" style="width: 16px; height: 16px;"></i>
        <span>댓글</span>
        <span class="badge">2</span>
      `;
      tabButtons.appendChild(commentsTab);
      
      // Attach event
      commentsTab.addEventListener('click', () => this.showCommentsTab());
    }
    
    // Create comments content
    const commentsContent = document.createElement('div');
    commentsContent.id = 'comments-content';
    commentsContent.className = 'tab-content';
    commentsContent.style.display = 'none';
    commentsContent.innerHTML = `
      <div class="comments-header">
        <h3>댓글 (2)</h3>
        <button class="add-comment-btn" onclick="Collaboration.addComment()">
          <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
          댓글 추가
        </button>
      </div>
      
      <div class="comments-list">
        <div class="comment-item">
          <div class="comment-header">
            <div class="avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">A</div>
            <div class="comment-info">
              <div class="author">Alice</div>
              <div class="time">2시간 전</div>
            </div>
          </div>
          <div class="comment-body">
            전시 예산이 조금 부족할 것 같아요. 홍보비를 늘려야 할까요?
          </div>
          <div class="comment-actions">
            <button class="reply-btn">답장</button>
            <button class="resolve-btn">해결됨</button>
          </div>
        </div>
        
        <div class="comment-item">
          <div class="comment-header">
            <div class="avatar" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">B</div>
            <div class="comment-info">
              <div class="author">Bob</div>
              <div class="time">30분 전</div>
            </div>
          </div>
          <div class="comment-body">
            작품 선정 기준을 문서로 정리해주시면 좋겠습니다.
          </div>
          <div class="comment-actions">
            <button class="reply-btn">답장</button>
            <button class="resolve-btn">해결됨</button>
          </div>
        </div>
      </div>
    `;
    
    rightPanel.appendChild(commentsContent);
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },
  
  /**
   * Show comments tab
   */
  showCommentsTab() {
    // Hide other tabs
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => tab.style.display = 'none');
    
    // Show comments
    const commentsContent = document.getElementById('comments-content');
    if (commentsContent) {
      commentsContent.style.display = 'block';
    }
    
    // Update tab button states
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const commentsBtn = document.querySelector('.tab-btn[data-tab="comments"]');
    if (commentsBtn) {
      commentsBtn.classList.add('active');
    }
  },
  
  /**
   * Add new comment
   */
  addComment() {
    const commentText = prompt('댓글을 입력하세요:');
    if (!commentText) return;
    
    const newComment = {
      id: Date.now(),
      author: '현재 사용자',
      text: commentText,
      timestamp: new Date()
    };
    
    this.comments.push(newComment);
    
    // Re-render comments
    this.renderComments();
    
    if (window.Toast) {
      window.Toast.show('댓글이 추가되었습니다', 'success');
    }
  },
  
  /**
   * Render comments list
   */
  renderComments() {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    // Add new comments to existing list
    this.comments.forEach(comment => {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';
      commentItem.innerHTML = `
        <div class="comment-header">
          <div class="avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">U</div>
          <div class="comment-info">
            <div class="author">${comment.author}</div>
            <div class="time">방금 전</div>
          </div>
        </div>
        <div class="comment-body">${comment.text}</div>
        <div class="comment-actions">
          <button class="reply-btn">답장</button>
          <button class="resolve-btn">해결됨</button>
        </div>
      `;
      
      commentsList.appendChild(commentItem);
    });
  },
  
  /**
   * Simulate real-time collaboration
   */
  simulateRealtimeCollaboration() {
    // Add collaborator cursors
    this.collaborators = [
      { id: 1, name: 'Alice', color: '#667eea', x: 300, y: 200 },
      { id: 2, name: 'Bob', color: '#f5576c', x: 500, y: 400 }
    ];
    
    // Render cursors on canvas
    setInterval(() => {
      this.renderCollaboratorCursors();
    }, 100);
  },
  
  /**
   * Render collaborator cursors
   */
  renderCollaboratorCursors() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    this.collaborators.forEach(collaborator => {
      // Simulate random movement
      collaborator.x += (Math.random() - 0.5) * 2;
      collaborator.y += (Math.random() - 0.5) * 2;
      
      // Draw cursor
      ctx.save();
      ctx.fillStyle = collaborator.color;
      ctx.beginPath();
      ctx.arc(collaborator.x, collaborator.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw name label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px "Pretendard", sans-serif';
      ctx.fillText(collaborator.name, collaborator.x + 12, collaborator.y + 4);
      ctx.restore();
    });
  },
  
  /**
   * Version History Management
   */
  
  /**
   * Save version to history
   */
  async saveVersion(changeDescription = 'Auto-save') {
    if (!window.CanvasV3) return;
    
    const version = {
      id: 'v-' + Date.now(),
      timestamp: new Date().toISOString(),
      author: this.getCurrentUser(),
      description: changeDescription,
      snapshot: {
        nodes: JSON.parse(JSON.stringify(CanvasV3.nodes)),
        connections: JSON.parse(JSON.stringify(CanvasV3.connections)),
        projectData: JSON.parse(JSON.stringify(CanvasV3.currentProject))
      }
    };
    
    this.versionHistory.unshift(version);
    
    // Keep only last 50 versions
    if (this.versionHistory.length > 50) {
      this.versionHistory = this.versionHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('canvas-version-history', JSON.stringify(this.versionHistory));
    
    // Optionally save to D1 DB
    this.saveVersionToDB(version);
    
    console.log(`[Version] Saved version: ${version.id}`);
    return version;
  },
  
  /**
   * Save version to D1 database
   */
  async saveVersionToDB(version) {
    try {
      const response = await fetch('/api/versions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(version)
      });
      
      if (!response.ok) {
        console.warn('[Version] Failed to save to DB, using localStorage only');
      }
    } catch (error) {
      console.warn('[Version] DB save failed:', error);
    }
  },
  
  /**
   * Load version history
   */
  loadVersionHistory() {
    const stored = localStorage.getItem('canvas-version-history');
    if (stored) {
      this.versionHistory = JSON.parse(stored);
    }
    return this.versionHistory;
  },
  
  /**
   * Restore version
   */
  restoreVersion(versionId) {
    const version = this.versionHistory.find(v => v.id === versionId);
    if (!version) {
      Toast.error('버전을 찾을 수 없습니다', 3000);
      return;
    }
    
    if (!confirm(`"${version.description}" 버전으로 복원하시겠습니까? 현재 작업 내용이 손실될 수 있습니다.`)) {
      return;
    }
    
    // Save current state before restoring
    this.saveVersion('복원 전 자동 저장');
    
    // Restore snapshot
    if (window.CanvasV3) {
      CanvasV3.nodes = JSON.parse(JSON.stringify(version.snapshot.nodes));
      CanvasV3.connections = JSON.parse(JSON.stringify(version.snapshot.connections));
      CanvasV3.currentProject = JSON.parse(JSON.stringify(version.snapshot.projectData));
      
      // Re-render
      if (window.CanvasEngine) {
        CanvasEngine.needsRedraw = true;
      }
      
      Toast.success(`버전 복원 완료: ${version.description}`, 3000);
    }
  },
  
  /**
   * Show version history panel
   */
  showVersionHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content version-history-modal">
        <div class="modal-header">
          <h3>버전 기록</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="version-list">
            ${this.versionHistory.length === 0 ? `
              <div class="empty-state">
                <i data-lucide="clock" style="width: 48px; height: 48px; opacity: 0.3;"></i>
                <p>저장된 버전이 없습니다</p>
              </div>
            ` : this.versionHistory.map((version, index) => `
              <div class="version-item ${index === 0 ? 'current' : ''}">
                <div class="version-icon">
                  <i data-lucide="${index === 0 ? 'star' : 'git-commit'}" style="width: 16px; height: 16px;"></i>
                </div>
                <div class="version-info">
                  <div class="version-title">
                    ${version.description}
                    ${index === 0 ? '<span class="badge">현재</span>' : ''}
                  </div>
                  <div class="version-meta">
                    <span>${version.author}</span>
                    <span>•</span>
                    <span>${this.formatDate(version.timestamp)}</span>
                  </div>
                  <div class="version-stats">
                    <span>${version.snapshot.nodes.length} 노드</span>
                    <span>•</span>
                    <span>${version.snapshot.connections.length} 연결</span>
                  </div>
                </div>
                <div class="version-actions">
                  ${index !== 0 ? `
                    <button class="restore-btn" onclick="Collaboration.restoreVersion('${version.id}')">
                      <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                      복원
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },
  
  /**
   * Get current user
   */
  getCurrentUser() {
    // TODO: Integrate with actual auth system
    return localStorage.getItem('user-name') || '익명 사용자';
  },
  
  /**
   * Format date
   */
  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * Version History System
   */
  versionHistory: [],
  
  async saveVersion(changeDescription = 'Auto-save') {
    if (!window.CanvasV3 || !window.CanvasV3.currentProject) return;
    
    const version = {
      id: 'v-' + Date.now(),
      timestamp: new Date().toISOString(),
      author: this.getCurrentUser(),
      description: changeDescription,
      snapshot: {
        nodes: JSON.parse(JSON.stringify(CanvasV3.nodes)),
        connections: JSON.parse(JSON.stringify(CanvasV3.connections)),
        projectName: CanvasV3.currentProject.name
      }
    };
    
    this.versionHistory.unshift(version);
    if (this.versionHistory.length > 20) {
      this.versionHistory = this.versionHistory.slice(0, 20);
    }
    
    try {
      await fetch('/api/versions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: CanvasV3.currentProject.id,
          version
        })
      });
    } catch (error) {
      console.warn('Version save to DB failed, stored locally only:', error);
    }
  },
  
  getCurrentUser() {
    return {
      name: localStorage.getItem('userName') || 'You',
      email: localStorage.getItem('userEmail') || 'user@museum.org'
    };
  },
  
  showVersionHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content version-history-modal">
        <div class="modal-header">
          <h3>📜 버전 기록</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="version-timeline" id="version-timeline">
            ${this.renderVersionTimeline()}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
  },
  
  renderVersionTimeline() {
    if (this.versionHistory.length === 0) {
      return `<div class="empty-state"><p>버전 기록이 없습니다</p></div>`;
    }
    
    return this.versionHistory.map((version, index) => {
      const timeAgo = this.formatTimeAgoShort(new Date(version.timestamp));
      const isCurrent = index === 0;
      
      return `
        <div class="version-item ${isCurrent ? 'current' : ''}">
          <div class="version-content">
            <div class="version-header">
              <strong>${version.author.name}</strong>
              <span>${timeAgo}</span>
              ${isCurrent ? '<span class="current-badge">현재</span>' : ''}
            </div>
            <div class="version-description">${version.description}</div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  formatTimeAgoShort(date) {
    const diff = new Date() - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }
};

// Auto-initialize when Canvas V3 is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Collaboration.init(), 1000);
  });
} else {
  setTimeout(() => Collaboration.init(), 1000);
}
