/**
 * MuseFlow V4 - AI Assistant (FAQ Bot)
 * 
 * Gemini Flash API를 활용한 대화형 도움말 봇.
 * 사용자 질문을 이해하고 관련 도움말 문서를 추천합니다.
 * 
 * Features:
 * - Gemini Flash API integration
 * - Semantic search for help articles
 * - Chat-based UI with message bubbles
 * - Quick question templates
 * - Related article recommendations
 * - Conversation history (localStorage)
 * - Typing indicator
 * - Message timestamps
 * 
 * Usage:
 *   <script src="/static/js/help/ai-assistant.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', () => {
 *       AIAssistant.init({
 *         apiEndpoint: '/api/help/ai-assistant',
 *         position: 'bottom-right',
 *         autoOpen: false
 *       });
 *     });
 *   </script>
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

const AIAssistant = {
  // Configuration
  config: {
    apiEndpoint: '/api/help/ai-assistant',
    position: 'bottom-right', // 'bottom-right', 'bottom-left'
    autoOpen: false,
    maxMessageLength: 500,
    enableHistory: true,
    historyLimit: 50,
    welcomeMessage: '안녕하세요! 👋 MuseFlow 도움말 봇입니다.\n\n무엇을 도와드릴까요?',
    quickQuestions: [
      '작품을 어떻게 등록하나요?',
      'AI 메타데이터 생성은 어떻게 하나요?',
      '전시를 만드는 방법을 알려주세요',
      '사용자 역할은 어떻게 변경하나요?',
      '환경 모니터링 설정 방법은?'
    ]
  },

  // State
  state: {
    isOpen: false,
    isTyping: false,
    conversationId: null,
    messages: [],
    currentInput: ''
  },

  // DOM elements
  elements: {
    container: null,
    toggleBtn: null,
    chatBox: null,
    messagesContainer: null,
    inputField: null,
    sendBtn: null
  },

  /**
   * Initialize AI Assistant
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    console.log('[AIAssistant] Initializing...');
    
    // Merge config
    this.config = { ...this.config, ...options };
    
    // Generate conversation ID
    this.state.conversationId = this.generateConversationId();
    
    // Load conversation history
    if (this.config.enableHistory) {
      this.loadHistory();
    }
    
    // Inject styles
    this.injectStyles();
    
    // Create UI
    this.createUI();
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Show welcome message
    if (this.state.messages.length === 0) {
      this.addMessage('assistant', this.config.welcomeMessage);
      this.showQuickQuestions();
    }
    
    // Auto-open if configured
    if (this.config.autoOpen) {
      this.open();
    }
    
    console.log('[AIAssistant] Initialized successfully');
  },

  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('ai-assistant-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-assistant-styles';
    style.textContent = `
      /* AI Assistant Container */
      .ai-assistant {
        position: fixed;
        ${this.config.position.includes('bottom') ? 'bottom: 24px' : 'top: 24px'};
        ${this.config.position.includes('right') ? 'right: 24px' : 'left: 24px'};
        z-index: 2000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* Toggle Button */
      .ai-assistant-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        border: none;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .ai-assistant-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
      }

      .ai-assistant-toggle.active {
        transform: rotate(45deg);
      }

      .ai-assistant-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }

      /* Chat Box */
      .ai-assistant-chatbox {
        position: absolute;
        ${this.config.position.includes('bottom') ? 'bottom: 80px' : 'top: 80px'};
        ${this.config.position.includes('right') ? 'right: 0' : 'left: 0'};
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        transform-origin: ${this.config.position.includes('right') ? 'bottom right' : 'bottom left'};
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .ai-assistant-chatbox.open {
        display: flex;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Chat Header */
      .ai-assistant-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .ai-assistant-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ai-assistant-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .ai-assistant-header-text h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .ai-assistant-header-text p {
        margin: 0;
        font-size: 12px;
        opacity: 0.9;
      }

      .ai-assistant-header-actions {
        display: flex;
        gap: 8px;
      }

      .ai-assistant-header-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.2s;
      }

      .ai-assistant-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Messages Container */
      .ai-assistant-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ai-assistant-messages::-webkit-scrollbar {
        width: 6px;
      }

      .ai-assistant-messages::-webkit-scrollbar-track {
        background: #f3f4f6;
      }

      .ai-assistant-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      /* Message Bubble */
      .ai-message {
        display: flex;
        gap: 12px;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ai-message.user {
        flex-direction: row-reverse;
      }

      .ai-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .ai-message.assistant .ai-message-avatar {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
      }

      .ai-message-content {
        max-width: 75%;
      }

      .ai-message-bubble {
        padding: 12px 16px;
        border-radius: 16px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .ai-message.user .ai-message-bubble {
        background: #4f46e5;
        color: white;
      }

      .ai-message-time {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 4px;
        padding: 0 4px;
      }

      /* Typing Indicator */
      .ai-typing-indicator {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        background: white;
        border-radius: 16px;
        width: fit-content;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .ai-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: typingBounce 1.4s infinite;
      }

      .ai-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .ai-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      /* Quick Questions */
      .ai-quick-questions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .ai-quick-questions-title {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .ai-quick-question-btn {
        padding: 10px 12px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        font-size: 13px;
        color: #374151;
        transition: all 0.2s;
      }

      .ai-quick-question-btn:hover {
        background: #e5e7eb;
        border-color: #4f46e5;
        transform: translateX(4px);
      }

      /* Related Articles */
      .ai-related-articles {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
      }

      .ai-related-article {
        padding: 12px;
        background: #f9fafb;
        border-left: 3px solid #4f46e5;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .ai-related-article:hover {
        background: #f3f4f6;
        transform: translateX(4px);
      }

      .ai-related-article-title {
        font-size: 13px;
        font-weight: 600;
        color: #4f46e5;
        margin-bottom: 4px;
      }

      .ai-related-article-summary {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      }

      /* Input Area */
      .ai-assistant-input {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: white;
        flex-shrink: 0;
      }

      .ai-assistant-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      .ai-assistant-textarea {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        outline: none;
        max-height: 120px;
        transition: border-color 0.2s;
      }

      .ai-assistant-textarea:focus {
        border-color: #4f46e5;
      }

      .ai-assistant-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #4f46e5;
        color: white;
        border: none;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .ai-assistant-send-btn:hover:not(:disabled) {
        background: #4338ca;
        transform: scale(1.05);
      }

      .ai-assistant-send-btn:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        cursor: not-allowed;
      }

      .ai-assistant-input-hint {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 8px;
        text-align: center;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .ai-assistant-chatbox {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
        }

        .ai-assistant {
          right: 16px;
          bottom: 16px;
        }
      }

      /* Empty State */
      .ai-assistant-empty {
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
      }

      .ai-assistant-empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .ai-assistant-empty-text {
        font-size: 14px;
        line-height: 1.6;
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Create UI elements
   */
  createUI() {
    // Create container
    const container = document.createElement('div');
    container.className = 'ai-assistant';
    container.id = 'ai-assistant-container';

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'ai-assistant-toggle';
    toggleBtn.innerHTML = '🤖';
    toggleBtn.title = 'AI 도움말 봇';

    // Badge (optional)
    if (this.state.messages.length === 0) {
      const badge = document.createElement('span');
      badge.className = 'ai-assistant-badge';
      badge.textContent = '!';
      toggleBtn.appendChild(badge);
    }

    // Chat box
    const chatBox = document.createElement('div');
    chatBox.className = 'ai-assistant-chatbox';
    chatBox.innerHTML = `
      <div class="ai-assistant-header">
        <div class="ai-assistant-header-info">
          <div class="ai-assistant-avatar">🤖</div>
          <div class="ai-assistant-header-text">
            <h3>도움말 봇</h3>
            <p>AI 기반 질문 응답</p>
          </div>
        </div>
        <div class="ai-assistant-header-actions">
          <button class="ai-assistant-header-btn" data-action="clear" title="대화 초기화">🗑️</button>
          <button class="ai-assistant-header-btn" data-action="close" title="닫기">✖️</button>
        </div>
      </div>
      
      <div class="ai-assistant-messages" id="ai-assistant-messages">
        <!-- Messages will be inserted here -->
      </div>
      
      <div class="ai-assistant-input">
        <div class="ai-assistant-input-wrapper">
          <textarea 
            class="ai-assistant-textarea" 
            id="ai-assistant-textarea"
            placeholder="질문을 입력하세요..."
            rows="1"
            maxlength="${this.config.maxMessageLength}"
          ></textarea>
          <button class="ai-assistant-send-btn" id="ai-assistant-send-btn" disabled>
            📤
          </button>
        </div>
        <div class="ai-assistant-input-hint">
          Enter로 전송 | Shift+Enter로 줄바꿈
        </div>
      </div>
    `;

    container.appendChild(toggleBtn);
    container.appendChild(chatBox);
    document.body.appendChild(container);

    // Store references
    this.elements.container = container;
    this.elements.toggleBtn = toggleBtn;
    this.elements.chatBox = chatBox;
    this.elements.messagesContainer = chatBox.querySelector('#ai-assistant-messages');
    this.elements.inputField = chatBox.querySelector('#ai-assistant-textarea');
    this.elements.sendBtn = chatBox.querySelector('#ai-assistant-send-btn');

    // Render existing messages
    this.renderMessages();
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle button
    this.elements.toggleBtn.addEventListener('click', () => this.toggle());

    // Header actions
    this.elements.chatBox.querySelector('[data-action="close"]').addEventListener('click', () => this.close());
    this.elements.chatBox.querySelector('[data-action="clear"]').addEventListener('click', () => this.clearHistory());

    // Input field
    this.elements.inputField.addEventListener('input', (e) => {
      this.state.currentInput = e.target.value;
      this.elements.sendBtn.disabled = !e.target.value.trim();
      
      // Auto-resize
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    // Enter to send
    this.elements.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.state.currentInput.trim()) {
          this.sendMessage(this.state.currentInput.trim());
        }
      }
    });

    // Send button
    this.elements.sendBtn.addEventListener('click', () => {
      if (this.state.currentInput.trim()) {
        this.sendMessage(this.state.currentInput.trim());
      }
    });

    // Delegated events for quick questions and related articles
    this.elements.messagesContainer.addEventListener('click', (e) => {
      const quickQuestion = e.target.closest('.ai-quick-question-btn');
      if (quickQuestion) {
        const question = quickQuestion.textContent;
        this.sendMessage(question);
        return;
      }

      const relatedArticle = e.target.closest('.ai-related-article');
      if (relatedArticle) {
        const articleId = relatedArticle.dataset.articleId;
        this.openArticle(articleId);
        return;
      }
    });
  },

  /**
   * Generate conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Open chat box
   */
  open() {
    this.state.isOpen = true;
    this.elements.chatBox.classList.add('open');
    this.elements.toggleBtn.classList.add('active');
    this.elements.inputField.focus();

    // Remove badge
    const badge = this.elements.toggleBtn.querySelector('.ai-assistant-badge');
    if (badge) badge.remove();

    this.trackEvent('chatbox_opened');
  },

  /**
   * Close chat box
   */
  close() {
    this.state.isOpen = false;
    this.elements.chatBox.classList.remove('open');
    this.elements.toggleBtn.classList.remove('active');

    this.trackEvent('chatbox_closed');
  },

  /**
   * Toggle chat box
   */
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Add message to conversation
   */
  addMessage(role, content, metadata = {}) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: role, // 'user' or 'assistant'
      content: content,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.state.messages.push(message);
    this.renderMessage(message);
    this.saveHistory();
    this.scrollToBottom();
  },

  /**
   * Render all messages
   */
  renderMessages() {
    this.elements.messagesContainer.innerHTML = '';
    this.state.messages.forEach(msg => this.renderMessage(msg));
    this.scrollToBottom();
  },

  /**
   * Render single message
   */
  renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${message.role}`;
    messageDiv.dataset.messageId = message.id;

    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageDiv.innerHTML = `
      <div class="ai-message-avatar">${message.role === 'assistant' ? '🤖' : '👤'}</div>
      <div class="ai-message-content">
        <div class="ai-message-bubble">${this.escapeHtml(message.content)}</div>
        <div class="ai-message-time">${time}</div>
        ${message.relatedArticles ? this.renderRelatedArticles(message.relatedArticles) : ''}
      </div>
    `;

    this.elements.messagesContainer.appendChild(messageDiv);
  },

  /**
   * Show quick questions
   */
  showQuickQuestions() {
    const quickQuestionsDiv = document.createElement('div');
    quickQuestionsDiv.className = 'ai-message assistant';
    quickQuestionsDiv.innerHTML = `
      <div class="ai-message-avatar">🤖</div>
      <div class="ai-message-content">
        <div class="ai-quick-questions">
          <div class="ai-quick-questions-title">💡 자주 묻는 질문</div>
          ${this.config.quickQuestions.map(q => `
            <button class="ai-quick-question-btn">${q}</button>
          `).join('')}
        </div>
      </div>
    `;

    this.elements.messagesContainer.appendChild(quickQuestionsDiv);
    this.scrollToBottom();
  },

  /**
   * Render related articles
   */
  renderRelatedArticles(articles) {
    if (!articles || articles.length === 0) return '';

    return `
      <div class="ai-related-articles">
        ${articles.map(article => `
          <div class="ai-related-article" data-article-id="${article.id}">
            <div class="ai-related-article-title">📄 ${article.title}</div>
            <div class="ai-related-article-summary">${article.summary}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Send message
   */
  async sendMessage(content) {
    // Add user message
    this.addMessage('user', content);

    // Clear input
    this.elements.inputField.value = '';
    this.state.currentInput = '';
    this.elements.sendBtn.disabled = true;
    this.elements.inputField.style.height = 'auto';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Call API
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          conversationId: this.state.conversationId,
          context: this.getContext()
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Remove typing indicator
      this.hideTypingIndicator();

      // Add assistant response
      this.addMessage('assistant', data.answer, {
        relatedArticles: data.relatedArticles || []
      });

      this.trackEvent('message_sent', { userMessage: content, aiResponse: data.answer });

    } catch (error) {
      console.error('[AIAssistant] Error sending message:', error);
      
      this.hideTypingIndicator();
      
      // Show error message
      this.addMessage('assistant', 
        '죄송합니다. 일시적인 오류가 발생했습니다. 😔\n\n잠시 후 다시 시도해주세요. 문제가 계속되면 Help Center를 직접 검색해보세요.'
      );
    }
  },

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    this.state.isTyping = true;

    const indicator = document.createElement('div');
    indicator.className = 'ai-message assistant';
    indicator.id = 'ai-typing-indicator';
    indicator.innerHTML = `
      <div class="ai-message-avatar">🤖</div>
      <div class="ai-message-content">
        <div class="ai-typing-indicator">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
        </div>
      </div>
    `;

    this.elements.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  },

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    this.state.isTyping = false;
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  },

  /**
   * Get current context
   */
  getContext() {
    return {
      currentUrl: window.location.pathname,
      userRole: this.config.userRole || 'curator',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Open article in Help Center
   */
  openArticle(articleId) {
    console.log('[AIAssistant] Opening article:', articleId);
    
    // Dispatch event for HelpCenter to handle
    window.dispatchEvent(new CustomEvent('help:openArticle', {
      detail: { articleId }
    }));

    // If HelpCenter is available, call directly
    if (window.HelpCenter && typeof window.HelpCenter.showArticle === 'function') {
      window.HelpCenter.showArticle(articleId);
    } else {
      // Fallback: navigate to help center with article
      window.location.href = `/help-center.html#article/${articleId}`;
    }

    this.trackEvent('article_opened_from_bot', { articleId });
  },

  /**
   * Clear conversation history
   */
  clearHistory() {
    if (confirm('대화 내역을 모두 삭제하시겠습니까?')) {
      this.state.messages = [];
      this.state.conversationId = this.generateConversationId();
      this.elements.messagesContainer.innerHTML = '';
      
      // Show welcome message again
      this.addMessage('assistant', this.config.welcomeMessage);
      this.showQuickQuestions();
      
      this.saveHistory();
      this.trackEvent('history_cleared');
    }
  },

  /**
   * Save conversation history to localStorage
   */
  saveHistory() {
    if (!this.config.enableHistory) return;

    try {
      const history = {
        conversationId: this.state.conversationId,
        messages: this.state.messages.slice(-this.config.historyLimit),
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('ai_assistant_history', JSON.stringify(history));
    } catch (error) {
      console.error('[AIAssistant] Failed to save history:', error);
    }
  },

  /**
   * Load conversation history from localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem('ai_assistant_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.state.conversationId = history.conversationId;
        this.state.messages = history.messages || [];
        console.log('[AIAssistant] Loaded history:', this.state.messages.length, 'messages');
      }
    } catch (error) {
      console.error('[AIAssistant] Failed to load history:', error);
    }
  },

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    setTimeout(() => {
      this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }, 100);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  },

  /**
   * Track event analytics
   */
  trackEvent(eventName, data = {}) {
    const event = {
      type: 'ai_assistant',
      name: eventName,
      timestamp: new Date().toISOString(),
      conversationId: this.state.conversationId,
      ...data
    };

    console.log('[AIAssistant] Track event:', event);

    // Store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('ai_assistant_events') || '[]');
    events.push(event);
    localStorage.setItem('ai_assistant_events', JSON.stringify(events.slice(-100)));
  },

  /**
   * Destroy AI Assistant
   */
  destroy() {
    if (this.elements.container) {
      this.elements.container.remove();
    }

    const styles = document.getElementById('ai-assistant-styles');
    if (styles) styles.remove();

    console.log('[AIAssistant] Destroyed');
  }
};

// Auto-initialize if data attribute present
if (document.querySelector('[data-ai-assistant-auto-init]')) {
  document.addEventListener('DOMContentLoaded', () => {
    const config = document.querySelector('[data-ai-assistant-auto-init]').dataset;
    AIAssistant.init({
      apiEndpoint: config.apiEndpoint || '/api/help/ai-assistant',
      position: config.position || 'bottom-right',
      autoOpen: config.autoOpen === 'true'
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAssistant;
}
