/**
 * Chatbot Widget
 * Floating chat interface for museum visitor assistance
 */

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.sessionId = null;
    this.messages = [];
    this.isTyping = false;
    
    this.init();
  }

  async init() {
    this.createWidget();
    this.attachEventListeners();
    
    // Create session on init
    await this.createSession();
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'chatbot-widget';
    widget.innerHTML = `
      <!-- Floating Button -->
      <button class="chatbot-toggle" id="chatbot-toggle">
        <svg class="chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-badge" id="chatbot-badge" style="display: none;">1</span>
      </button>

      <!-- Chat Window -->
      <div class="chatbot-window" id="chatbot-window" style="display: none;">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div class="chatbot-header-text">
              <h3>뮤지엄 AI 가이드</h3>
              <p class="chatbot-status">
                <span class="chatbot-status-dot"></span>
                온라인
              </p>
            </div>
          </div>
          <button class="chatbot-close" id="chatbot-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Welcome message will be inserted here -->
        </div>

        <!-- Suggestions -->
        <div class="chatbot-suggestions" id="chatbot-suggestions" style="display: none;">
          <!-- Suggestions will be inserted here -->
        </div>

        <!-- Input -->
        <div class="chatbot-input">
          <textarea 
            id="chatbot-input-field" 
            placeholder="메시지를 입력하세요..."
            rows="1"
            maxlength="500"
          ></textarea>
          <button class="chatbot-send" id="chatbot-send" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input-field');
    const send = document.getElementById('chatbot-send');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.toggleChat());
    
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      send.disabled = !value;
      
      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!send.disabled) {
          this.sendMessage();
        }
      }
    });

    send.addEventListener('click', () => this.sendMessage());
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    
    if (this.isOpen) {
      window.style.display = 'flex';
      setTimeout(() => window.classList.add('chatbot-window-open'), 10);
      
      // Clear badge
      const badge = document.getElementById('chatbot-badge');
      badge.style.display = 'none';
      
      // Focus input
      document.getElementById('chatbot-input-field').focus();
      
      // Scroll to bottom
      this.scrollToBottom();
    } else {
      window.classList.remove('chatbot-window-open');
      setTimeout(() => window.style.display = 'none', 300);
    }
  }

  async createSession() {
    try {
      const response = await fetch('/api/chatbot/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'visitor-' + Date.now() })
      });

      const data = await response.json();
      
      if (data.success) {
        this.sessionId = data.session.sessionId;
        
        // Add welcome message
        this.addMessage({
          role: 'assistant',
          content: data.session.greeting,
          timestamp: new Date().toISOString()
        });
        
        // Show initial suggestions
        this.showSuggestions([
          '인상주의 작품을 보고 싶어요',
          '어린이와 함께 관람하기 좋은 전시는?',
          '오늘의 추천 작품은 무엇인가요?'
        ]);
      }
    } catch (error) {
      console.error('❌ Session creation failed:', error);
      this.addMessage({
        role: 'assistant',
        content: '죄송합니다. 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input-field');
    const message = input.value.trim();
    
    if (!message || !this.sessionId) return;

    // Add user message
    this.addMessage({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Clear input
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('chatbot-send').disabled = true;

    // Show typing indicator
    this.showTyping();

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message: message
        })
      });

      const data = await response.json();
      
      this.hideTyping();

      if (data.success) {
        // Add assistant message
        this.addMessage({
          role: 'assistant',
          content: data.response.message,
          timestamp: new Date().toISOString()
        });

        // Show suggestions
        if (data.response.suggestions && data.response.suggestions.length > 0) {
          this.showSuggestions(data.response.suggestions);
        }

        // Show artwork recommendations
        if (data.response.artworkRecommendations && data.response.artworkRecommendations.length > 0) {
          this.showArtworkRecommendations(data.response.artworkRecommendations);
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Send message failed:', error);
      this.hideTyping();
      
      this.addMessage({
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는데 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
    }
  }

  addMessage(message) {
    this.messages.push(message);
    
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message chatbot-message-${message.role}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageEl.innerHTML = `
      <div class="chatbot-message-content">
        <p>${this.formatMessage(message.content)}</p>
        <span class="chatbot-message-time">${time}</span>
      </div>
    `;

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  showTyping() {
    this.isTyping = true;
    const messagesContainer = document.getElementById('chatbot-messages');
    
    const typingEl = document.createElement('div');
    typingEl.id = 'chatbot-typing';
    typingEl.className = 'chatbot-message chatbot-message-assistant';
    typingEl.innerHTML = `
      <div class="chatbot-message-content">
        <div class="chatbot-typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const typingEl = document.getElementById('chatbot-typing');
    if (typingEl) {
      typingEl.remove();
    }
  }

  showSuggestions(suggestions) {
    const container = document.getElementById('chatbot-suggestions');
    container.innerHTML = '';
    
    suggestions.forEach(suggestion => {
      const button = document.createElement('button');
      button.className = 'chatbot-suggestion-btn';
      button.textContent = suggestion;
      button.onclick = () => {
        document.getElementById('chatbot-input-field').value = suggestion;
        document.getElementById('chatbot-send').disabled = false;
        this.sendMessage();
      };
      container.appendChild(button);
    });

    container.style.display = 'flex';
  }

  showArtworkRecommendations(artworks) {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    const recommendationsEl = document.createElement('div');
    recommendationsEl.className = 'chatbot-recommendations';
    
    let html = '<div class="chatbot-recommendations-title">추천 작품</div>';
    html += '<div class="chatbot-recommendations-list">';
    
    artworks.forEach(artwork => {
      html += `
        <div class="chatbot-recommendation-card">
          <h4>${artwork.title || '작품명'}</h4>
          <p class="chatbot-recommendation-artist">${artwork.artist || '작가'}</p>
          ${artwork.reason ? `<p class="chatbot-recommendation-reason">${artwork.reason}</p>` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    recommendationsEl.innerHTML = html;
    
    messagesContainer.appendChild(recommendationsEl);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const container = document.getElementById('chatbot-messages');
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  showNotification() {
    if (!this.isOpen) {
      const badge = document.getElementById('chatbot-badge');
      badge.style.display = 'flex';
      badge.textContent = '1';
    }
  }
}

// Initialize chatbot widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatbotWidget = new ChatbotWidget();
  });
} else {
  window.chatbotWidget = new ChatbotWidget();
}
