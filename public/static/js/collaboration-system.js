/**
 * MuseFlow V4.0 - Collaboration System
 * Comments, mentions, and team activity tracking
 */

class CollaborationSystem {
    constructor() {
        this.comments = [];
        this.teamMembers = [];
        this.activityLog = [];
        this.initialized = false;
    }

    /**
     * Initialize collaboration system
     */
    async init() {
        if (this.initialized) return;
        
        await this.loadTeamMembers();
        this.loadComments();
        this.loadActivityLog();
        
        this.initialized = true;
    }

    /**
     * Load team members
     */
    async loadTeamMembers() {
        try {
            const response = await fetch('/api/team/members');
            const data = await response.json();
            
            if (data.success) {
                this.teamMembers = data.members;
            } else {
                // Mock data for demo
                this.teamMembers = [
                    { id: 1, name: '남현우 교수', email: 'admin@museflow.com', avatar: '👨‍🏫', role: 'director' },
                    { id: 2, name: '김지은 큐레이터', email: 'curator1@museflow.com', avatar: '👩‍🎨', role: 'curator' },
                    { id: 3, name: '이수진 어시스턴트', email: 'assistant1@museflow.com', avatar: '👩‍💼', role: 'assistant' },
                    { id: 4, name: '박민호 디자이너', email: 'designer1@museflow.com', avatar: '🎨', role: 'designer' }
                ];
            }
        } catch (error) {
            console.error('Failed to load team members:', error);
            // Use mock data
            this.teamMembers = [
                { id: 1, name: '남현우 교수', email: 'admin@museflow.com', avatar: '👨‍🏫', role: 'director' },
                { id: 2, name: '김지은 큐레이터', email: 'curator1@museflow.com', avatar: '👩‍🎨', role: 'curator' }
            ];
        }
    }

    /**
     * Get comments for a task/project
     */
    async getComments(taskId) {
        try {
            const response = await fetch(`/api/comments?taskId=${taskId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.comments;
            }
        } catch (error) {
            console.error('Failed to get comments:', error);
        }
        
        // Return from local storage
        const stored = localStorage.getItem(`comments_${taskId}`);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Add comment
     */
    async addComment(taskId, projectId, content, mentions = []) {
        const comment = {
            id: Date.now(),
            taskId,
            projectId,
            content,
            mentions,
            author: this.getCurrentUser(),
            timestamp: new Date().toISOString(),
            likes: []
        };

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
            
            const data = await response.json();
            
            if (data.success) {
                comment.id = data.commentId;
            }
        } catch (error) {
            console.error('Failed to save comment:', error);
        }

        // Save to local storage
        const comments = await this.getComments(taskId);
        comments.push(comment);
        localStorage.setItem(`comments_${taskId}`, JSON.stringify(comments));

        // Send notifications to mentioned users
        if (mentions.length > 0) {
            this.notifyMentionedUsers(mentions, comment, taskId, projectId);
        }

        // Log activity
        this.logActivity({
            type: 'comment',
            taskId,
            projectId,
            user: this.getCurrentUser(),
            content: `댓글 작성: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
        });

        return comment;
    }

    /**
     * Edit comment
     */
    async editComment(taskId, commentId, newContent) {
        const comments = await this.getComments(taskId);
        const comment = comments.find(c => c.id === commentId);
        
        if (comment) {
            comment.content = newContent;
            comment.edited = true;
            comment.editedAt = new Date().toISOString();
            
            localStorage.setItem(`comments_${taskId}`, JSON.stringify(comments));
            
            return true;
        }
        
        return false;
    }

    /**
     * Delete comment
     */
    async deleteComment(taskId, commentId) {
        const comments = await this.getComments(taskId);
        const filtered = comments.filter(c => c.id !== commentId);
        
        localStorage.setItem(`comments_${taskId}`, JSON.stringify(filtered));
        
        return true;
    }

    /**
     * Like comment
     */
    async likeComment(taskId, commentId) {
        const comments = await this.getComments(taskId);
        const comment = comments.find(c => c.id === commentId);
        
        if (comment) {
            const currentUser = this.getCurrentUser();
            const userIndex = comment.likes.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) {
                comment.likes.push(currentUser);
            } else {
                comment.likes.splice(userIndex, 1);
            }
            
            localStorage.setItem(`comments_${taskId}`, JSON.stringify(comments));
            
            return comment.likes.length;
        }
        
        return 0;
    }

    /**
     * Notify mentioned users
     */
    notifyMentionedUsers(mentions, comment, taskId, projectId) {
        mentions.forEach(userId => {
            const user = this.teamMembers.find(m => m.id === userId);
            if (user && window.notificationSystem) {
                window.notificationSystem.sendNotification(
                    `${comment.author.name}님이 멘션했습니다`,
                    {
                        body: comment.content.substring(0, 100),
                        icon: '/static/images/mention.png',
                        tag: `mention-${comment.id}`,
                        url: `/canvas?project=${projectId}&task=${taskId}`
                    }
                );
            }
        });
    }

    /**
     * Parse mentions in text
     */
    parseMentions(text) {
        const mentionPattern = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionPattern.exec(text)) !== null) {
            const memberName = match[1];
            const member = this.teamMembers.find(m => 
                m.name.toLowerCase().includes(memberName.toLowerCase())
            );
            
            if (member && !mentions.includes(member.id)) {
                mentions.push(member.id);
            }
        }
        
        return mentions;
    }

    /**
     * Render comment with mentions highlighted
     */
    renderCommentContent(content) {
        let html = content;
        
        // Highlight mentions
        html = html.replace(/@(\w+)/g, (match, name) => {
            const member = this.teamMembers.find(m => 
                m.name.toLowerCase().includes(name.toLowerCase())
            );
            
            if (member) {
                return `<span class="mention" data-user-id="${member.id}">@${member.name}</span>`;
            }
            
            return match;
        });
        
        // Convert URLs to links
        html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="comment-link">$1</a>');
        
        return html;
    }

    /**
     * Render comments section
     */
    renderCommentsSection(taskId, projectId, container) {
        this.getComments(taskId).then(comments => {
            const currentUser = this.getCurrentUser();
            
            const html = `
                <div class="comments-section">
                    <div class="comments-header">
                        <h4><i class="fas fa-comments"></i> 댓글 ${comments.length}</h4>
                    </div>
                    
                    <div class="comments-list">
                        ${comments.length === 0 ? `
                            <div class="comments-empty">
                                <i class="fas fa-comment-slash"></i>
                                <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                            </div>
                        ` : comments.map(comment => `
                            <div class="comment-item" data-comment-id="${comment.id}">
                                <div class="comment-avatar">${comment.author.avatar || '👤'}</div>
                                <div class="comment-body">
                                    <div class="comment-header">
                                        <span class="comment-author">${comment.author.name}</span>
                                        <span class="comment-role">${this.getRoleLabel(comment.author.role)}</span>
                                        <span class="comment-time">${this.formatTime(comment.timestamp)}</span>
                                        ${comment.edited ? '<span class="comment-edited">(편집됨)</span>' : ''}
                                    </div>
                                    <div class="comment-content">
                                        ${this.renderCommentContent(comment.content)}
                                    </div>
                                    <div class="comment-actions">
                                        <button onclick="collaborationSystem.likeComment(${taskId}, ${comment.id}).then(() => collaborationSystem.renderCommentsSection(${taskId}, ${projectId}, document.querySelector('.comments-container')))" 
                                                class="comment-action ${comment.likes.some(u => u.id === currentUser.id) ? 'active' : ''}">
                                            <i class="fas fa-heart"></i> ${comment.likes.length}
                                        </button>
                                        ${comment.author.id === currentUser.id ? `
                                            <button onclick="collaborationSystem.editCommentPrompt(${taskId}, ${projectId}, ${comment.id})" class="comment-action">
                                                <i class="fas fa-edit"></i> 편집
                                            </button>
                                            <button onclick="collaborationSystem.deleteComment(${taskId}, ${comment.id}).then(() => collaborationSystem.renderCommentsSection(${taskId}, ${projectId}, document.querySelector('.comments-container')))" class="comment-action">
                                                <i class="fas fa-trash"></i> 삭제
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="comment-input-area">
                        <textarea id="comment-input-${taskId}" class="comment-input" placeholder="댓글을 입력하세요... (@로 팀원 멘션 가능)" rows="3"></textarea>
                        <div class="comment-input-actions">
                            <div class="mention-suggestions" id="mention-suggestions-${taskId}" style="display: none;"></div>
                            <button onclick="collaborationSystem.submitComment(${taskId}, ${projectId})" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> 댓글 작성
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Add mention autocomplete
            this.setupMentionAutocomplete(taskId);
        });
    }

    /**
     * Setup mention autocomplete
     */
    setupMentionAutocomplete(taskId) {
        const input = document.getElementById(`comment-input-${taskId}`);
        const suggestions = document.getElementById(`mention-suggestions-${taskId}`);
        
        if (!input || !suggestions) return;
        
        input.addEventListener('input', (e) => {
            const text = e.target.value;
            const cursorPos = e.target.selectionStart;
            const textBeforeCursor = text.substring(0, cursorPos);
            const match = textBeforeCursor.match(/@(\w*)$/);
            
            if (match) {
                const query = match[1].toLowerCase();
                const filtered = this.teamMembers.filter(m => 
                    m.name.toLowerCase().includes(query)
                );
                
                if (filtered.length > 0) {
                    suggestions.innerHTML = filtered.map(m => `
                        <div class="mention-suggestion" onclick="collaborationSystem.insertMention(${taskId}, '${m.name}')">
                            <span class="mention-avatar">${m.avatar}</span>
                            <span class="mention-name">${m.name}</span>
                            <span class="mention-role">${this.getRoleLabel(m.role)}</span>
                        </div>
                    `).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            } else {
                suggestions.style.display = 'none';
            }
        });
    }

    /**
     * Insert mention
     */
    insertMention(taskId, memberName) {
        const input = document.getElementById(`comment-input-${taskId}`);
        const suggestions = document.getElementById(`mention-suggestions-${taskId}`);
        
        if (!input) return;
        
        const text = input.value;
        const cursorPos = input.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const textAfterCursor = text.substring(cursorPos);
        const lastAtPos = textBeforeCursor.lastIndexOf('@');
        
        const newText = text.substring(0, lastAtPos) + `@${memberName} ` + textAfterCursor;
        input.value = newText;
        input.focus();
        
        suggestions.style.display = 'none';
    }

    /**
     * Submit comment
     */
    async submitComment(taskId, projectId) {
        const input = document.getElementById(`comment-input-${taskId}`);
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) {
            console.log('댓글 내용을 입력해주세요.');
            return;
        }
        
        const mentions = this.parseMentions(content);
        
        await this.addComment(taskId, projectId, content, mentions);
        
        input.value = '';
        
        // Re-render comments
        const container = document.querySelector('.comments-container');
        if (container) {
            this.renderCommentsSection(taskId, projectId, container);
        }
        
        // Show success notification
        if (window.notificationSystem) {
            window.notificationSystem.showInAppNotification('댓글이 작성되었습니다.', 'success');
        }
    }

    /**
     * Edit comment prompt
     */
    editCommentPrompt(taskId, projectId, commentId) {
        this.getComments(taskId).then(comments => {
            const comment = comments.find(c => c.id === commentId);
            if (!comment) return;
            
            const newContent = prompt('댓글 수정:', comment.content);
            if (newContent && newContent.trim()) {
                this.editComment(taskId, commentId, newContent.trim()).then(() => {
                    const container = document.querySelector('.comments-container');
                    if (container) {
                        this.renderCommentsSection(taskId, projectId, container);
                    }
                });
            }
        });
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        // Try to get from session/localStorage
        const stored = localStorage.getItem('museflow_current_user');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return default user (admin)
        return {
            id: 1,
            name: '남현우 교수',
            email: 'admin@museflow.com',
            avatar: '👨‍🏫',
            role: 'director'
        };
    }

    /**
     * Get role label
     */
    getRoleLabel(role) {
        const labels = {
            director: '관장',
            curator: '큐레이터',
            assistant: '어시스턴트',
            designer: '디자이너'
        };
        return labels[role] || role;
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

    /**
     * Load comments from storage
     */
    loadComments() {
        // Comments are loaded per-task, so this is just initialization
        this.comments = [];
    }

    /**
     * Log activity
     */
    logActivity(activity) {
        activity.id = Date.now();
        activity.timestamp = new Date().toISOString();
        
        this.activityLog.unshift(activity);
        
        // Keep only last 100 activities
        if (this.activityLog.length > 100) {
            this.activityLog = this.activityLog.slice(0, 100);
        }
        
        this.saveActivityLog();
    }

    /**
     * Load activity log
     */
    loadActivityLog() {
        const stored = localStorage.getItem('museflow_activity_log');
        if (stored) {
            try {
                this.activityLog = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to load activity log:', error);
                this.activityLog = [];
            }
        }
    }

    /**
     * Save activity log
     */
    saveActivityLog() {
        try {
            localStorage.setItem('museflow_activity_log', JSON.stringify(this.activityLog));
        } catch (error) {
            console.error('Failed to save activity log:', error);
        }
    }

    /**
     * Get activity log
     */
    getActivityLog(limit = 20) {
        return this.activityLog.slice(0, limit);
    }
}

// Global instance
window.collaborationSystem = new CollaborationSystem();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    collaborationSystem.init();
});

// CSS styles for collaboration
const style = document.createElement('style');
style.textContent = `
    .comments-section {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1rem;
    }

    .comments-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .comments-header h4 {
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .comments-empty {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
    }

    .comments-empty i {
        font-size: 2rem;
        margin-bottom: 1rem;
        opacity: 0.3;
    }

    .comment-item {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .comment-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--museum-purple);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
    }

    .comment-body {
        flex: 1;
    }

    .comment-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }

    .comment-author {
        font-weight: 600;
        color: #f5f5f7;
    }

    .comment-role {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(139, 92, 246, 0.2);
        color: var(--museum-purple);
    }

    .comment-time {
        font-size: 0.85rem;
        color: #666;
    }

    .comment-edited {
        font-size: 0.75rem;
        color: #888;
        font-style: italic;
    }

    .comment-content {
        color: #ccc;
        line-height: 1.6;
        margin-bottom: 0.75rem;
    }

    .mention {
        color: var(--museum-purple);
        font-weight: 600;
        cursor: pointer;
    }

    .mention:hover {
        text-decoration: underline;
    }

    .comment-link {
        color: var(--info);
        text-decoration: none;
    }

    .comment-link:hover {
        text-decoration: underline;
    }

    .comment-actions {
        display: flex;
        gap: 1rem;
    }

    .comment-action {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .comment-action:hover {
        color: var(--museum-purple);
        background: rgba(139, 92, 246, 0.1);
    }

    .comment-action.active {
        color: var(--urgent);
    }

    .comment-input-area {
        margin-top: 1.5rem;
        position: relative;
    }

    .comment-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        color: #f5f5f7;
        font-size: 0.95rem;
        resize: vertical;
        min-height: 80px;
    }

    .comment-input:focus {
        outline: none;
        border-color: var(--museum-purple);
        background: rgba(255, 255, 255, 0.08);
    }

    .comment-input-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.75rem;
        position: relative;
    }

    .mention-suggestions {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 15, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
    }

    .mention-suggestion {
        padding: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .mention-suggestion:hover {
        background: rgba(139, 92, 246, 0.1);
    }

    .mention-avatar {
        font-size: 1.5rem;
    }

    .mention-name {
        font-weight: 600;
        flex: 1;
    }

    .mention-role {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(139, 92, 246, 0.2);
        color: var(--museum-purple);
    }

    @media (max-width: 768px) {
        .comment-item {
            flex-direction: column;
            gap: 0.75rem;
        }

        .comment-avatar {
            width: 36px;
            height: 36px;
            font-size: 1.25rem;
        }

        .comment-actions {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
    }
`;
document.head.appendChild(style);
