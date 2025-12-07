/**
 * MuseFlow AI Assistant Widget V26.0
 * 
 * Context-aware AI Assistant for Help Center & Canvas
 * 
 * Features:
 * - Smart Chat Widget with context awareness
 * - Integration with BehaviorDetector (idle/stuck/error)
 * - Role-based help suggestions
 * - Quick action buttons
 * - Multi-language support (Korean primary)
 * 
 * @version 26.0.0
 * @date 2025-12-07
 */

const AIAssistantWidget = {
  version: '26.0.0',
  
  /**
   * Configuration
   */
  config: {
    position: 'bottom-right',
    zIndex: 9999,
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    maxMessages: 50,
    autoSuggestDelay: 3000,
    welcomeMessage: 'MuseFlow AI 도우미입니다. 무엇을 도와드릴까요? 🎨'
  },

  /**
   * State Management
   */
  state: {
    isOpen: false,
    isMinimized: false,
    messages: [],
    currentContext: null,
    userRole: null,
    lastActivity: Date.now(),
    suggestions: [],
    language: 'ko' // 'ko' or 'en'
  },

  /**
   * Multi-language Support
   */
  i18n: {
    ko: {
      welcomeMessage: 'MuseFlow AI 도우미입니다. 무엇을 도와드릴까요? 🎨',
      headerTitle: 'AI 도우미',
      headerSubtitle: 'MuseFlow V26.0',
      inputPlaceholder: '질문을 입력하세요... (예: Canvas 사용법, 전시 기획 도움말)',
      clearHistoryConfirm: '대화 이력을 모두 삭제하시겠습니까?',
      buttons: {
        minimize: '최소화',
        close: '닫기',
        clearHistory: '대화 이력 초기화'
      }
    },
    en: {
      welcomeMessage: 'I\'m MuseFlow AI Assistant. How can I help you? 🎨',
      headerTitle: 'AI Assistant',
      headerSubtitle: 'MuseFlow V26.0',
      inputPlaceholder: 'Ask a question... (e.g., How to use Canvas, Exhibition planning help)',
      clearHistoryConfirm: 'Are you sure you want to clear all conversation history?',
      buttons: {
        minimize: 'Minimize',
        close: 'Close',
        clearHistory: 'Clear History'
      }
    }
  },

  /**
   * Context-Aware Help Database
   */
  contextHelp: {
    idle: {
      icon: '😴',
      title: '잠시 쉬고 계신가요?',
      suggestions: [
        { text: '튜토리얼 다시 보기', action: 'showTutorial' },
        { text: '샘플 데이터 둘러보기', action: 'exploreSampleData' },
        { text: '도움말 센터 열기', action: 'openHelpCenter' }
      ]
    },
    stuck: {
      icon: '🤔',
      title: '어려움을 겪고 계신가요?',
      suggestions: [
        { text: '이 작업 가이드 보기', action: 'showGuide' },
        { text: '비슷한 사례 찾기', action: 'showExamples' },
        { text: '전문가에게 문의하기', action: 'contactSupport' }
      ]
    },
    error: {
      icon: '⚠️',
      title: '오류가 발생했습니다',
      suggestions: [
        { text: '문제 해결 가이드', action: 'showTroubleshooting' },
        { text: '초기화하고 다시 시작', action: 'resetAndRestart' },
        { text: '오류 보고하기', action: 'reportError' }
      ]
    }
  },

  /**
   * Role-based Quick Actions (7 Museum Roles)
   */
  roleActions: {
    exhibition: {
      icon: '🎨',
      title: '전시 기획',
      actions: [
        { text: '전시 기획서 작성법', link: '/help-center?role=exhibition&article=planning' },
        { text: '작품 선정 가이드', link: '/help-center?role=exhibition&article=selection' },
        { text: '전시 일정 관리', link: '/help-center?role=exhibition&article=schedule' }
      ]
    },
    education: {
      icon: '📚',
      title: '교육 프로그램',
      actions: [
        { text: '커리큘럼 설계법', link: '/help-center?role=education&article=curriculum' },
        { text: '교육 자료 제작', link: '/help-center?role=education&article=materials' },
        { text: '강사진 관리', link: '/help-center?role=education&article=instructors' }
      ]
    },
    collection: {
      icon: '🏛️',
      title: '소장품 수집',
      actions: [
        { text: '수집 절차 안내', link: '/help-center?role=collection&article=process' },
        { text: '작품 평가 기준', link: '/help-center?role=collection&article=evaluation' },
        { text: '등록 관리', link: '/help-center?role=collection&article=registration' }
      ]
    },
    conservation: {
      icon: '🔬',
      title: '보존 처리',
      actions: [
        { text: '보존 처리 절차', link: '/help-center?role=conservation&article=treatment' },
        { text: '환경 관리 기준', link: '/help-center?role=conservation&article=environment' },
        { text: '모니터링 방법', link: '/help-center?role=conservation&article=monitoring' }
      ]
    },
    publishing: {
      icon: '📖',
      title: '학술 출판',
      actions: [
        { text: '학술지 발간 절차', link: '/help-center?role=publishing&article=journal' },
        { text: '논문 심사 가이드', link: '/help-center?role=publishing&article=review' },
        { text: '출판 배포 관리', link: '/help-center?role=publishing&article=distribution' }
      ]
    },
    research: {
      icon: '🔍',
      title: '학술 연구',
      actions: [
        { text: '연구 계획 수립', link: '/help-center?role=research&article=planning' },
        { text: '자료 조사 방법', link: '/help-center?role=research&article=investigation' },
        { text: '연구 논문 작성', link: '/help-center?role=research&article=writing' }
      ]
    },
    administration: {
      icon: '💼',
      title: '행정 관리',
      actions: [
        { text: '예산 집행 관리', link: '/help-center?role=administration&article=budget' },
        { text: '인력 관리', link: '/help-center?role=administration&article=hr' },
        { text: '시설 관리', link: '/help-center?role=administration&article=facility' }
      ]
    }
  },

  /**
   * Initialize Widget
   */
  init() {
    console.log('[AIAssistant] Initializing AI Assistant Widget v' + this.version);
    
    // Inject CSS
    this.injectStyles();
    
    // Create Widget UI
    this.createWidget();
    
    // Setup Event Listeners
    this.setupEventListeners();
    
    // Detect user context
    this.detectContext();
    
    // Load conversation history
    this.loadConversationHistory();
    
    // Show welcome message (only if no history)
    if (this.state.messages.length === 0) {
      setTimeout(() => {
        this.addMessage('assistant', this.config.welcomeMessage);
        this.showQuickActions();
      }, 1000);
    } else {
      console.log('[AIAssistant] Loaded ' + this.state.messages.length + ' previous messages');
    }
    
    console.log('[AIAssistant] Widget initialized successfully');
  },

  /**
   * Inject CSS Styles
   */
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* AI Assistant Widget Styles */
      .ai-assistant-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: ${this.config.zIndex};
        font-family: 'Inter', sans-serif;
      }

      .ai-chat-toggle {
        width: 48px;
        height: 48px;
        background: #18181b;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        position: relative;
      }

      .ai-chat-toggle:hover {
        border-color: rgba(255, 255, 255, 0.2);
        background: #1f1f23;
      }

      .ai-chat-toggle .icon {
        font-size: 20px;
        color: #a1a1aa;
      }

      .ai-chat-toggle .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        background: #ef4444;
        border-radius: 50%;
        border: 2px solid #0a0a0f;
        font-size: 9px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .ai-chat-window {
        position: absolute;
        bottom: 56px;
        right: 0;
        width: 360px;
        height: 540px;
        background: #0d0d0d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.2s ease;
      }

      .ai-chat-window.open {
        display: flex;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ai-chat-header {
        padding: 1rem;
        background: transparent;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ai-chat-header-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ai-chat-header-title .icon {
        font-size: 18px;
        color: #a1a1aa;
      }

      .ai-chat-header-title .text h3 {
        color: #e5e7eb;
        font-size: 0.9375rem;
        font-weight: 500;
        margin: 0;
      }

      .ai-chat-header-title .text p {
        color: #71717a;
        font-size: 0.75rem;
        margin: 0;
      }

      .ai-chat-header-actions {
        display: flex;
        gap: 8px;
      }

      .ai-chat-header-actions button {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #a1a1aa;
      }

      .ai-chat-header-actions button:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        color: #e5e7eb;
      }

      .ai-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
      }

      .ai-message {
        display: flex;
        gap: 12px;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ai-message.user {
        flex-direction: row-reverse;
      }

      .ai-message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .ai-message.assistant .ai-message-avatar {
        background: rgba(255, 255, 255, 0.06);
        color: #a1a1aa;
      }

      .ai-message.user .ai-message-avatar {
        background: rgba(255, 255, 255, 0.04);
        color: #71717a;
      }

      .ai-message-content {
        max-width: 75%;
        background: rgba(255, 255, 255, 0.02);
        padding: 0.625rem 0.875rem;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: #d4d4d8;
        font-size: 0.8125rem;
        line-height: 1.5;
      }

      .ai-message.user .ai-message-content {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
        color: #e5e7eb;
      }

      .ai-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .ai-quick-action-btn {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #a1a1aa;
        padding: 0.375rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .ai-quick-action-btn:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.15);
        color: #e5e7eb;
      }

      .ai-chat-input-container {
        padding: 0.875rem;
        background: transparent;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .ai-chat-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 0.625rem 2.5rem 0.625rem 0.75rem;
        color: #e5e7eb;
        font-size: 0.8125rem;
        resize: none;
        outline: none;
        font-family: inherit;
        transition: all 0.2s;
      }

      .ai-chat-input:focus {
        border-color: ${this.config.primaryColor};
      }

      .ai-chat-input::placeholder {
        color: #6b7280;
      }

      .ai-chat-send-btn {
        position: absolute;
        right: 28px;
        bottom: 24px;
        background: ${this.config.primaryColor};
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .ai-chat-send-btn:hover {
        background: ${this.config.secondaryColor};
        transform: translateY(-1px);
      }

      .ai-context-banner {
        padding: 12px 20px;
        background: rgba(139, 92, 246, 0.1);
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #d1d5db;
      }

      .ai-context-banner .icon {
        font-size: 20px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .ai-assistant-widget {
          bottom: 16px;
          right: 16px;
        }

        .ai-chat-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          bottom: 80px;
          right: -8px;
        }

        .ai-chat-toggle {
          width: 56px;
          height: 56px;
        }

        .ai-chat-toggle .icon {
          font-size: 28px;
        }
      }

      /* Scrollbar Styles */
      .ai-chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .ai-chat-messages::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }

      .ai-chat-messages::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 3px;
      }

      .ai-chat-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }
    `;
    
    document.head.appendChild(style);
  },

  /**
   * Create Widget UI
   */
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'ai-assistant-widget';
    widget.innerHTML = `
      <button class="ai-chat-toggle" id="aiChatToggle">
        <span class="icon">🤖</span>
        <span class="notification-badge" id="aiNotificationBadge" style="display: none;">1</span>
      </button>

      <div class="ai-chat-window" id="aiChatWindow">
        <!-- Context Banner (conditional) -->
        <div class="ai-context-banner" id="aiContextBanner" style="display: none;">
          <span class="icon" id="aiContextIcon"></span>
          <span id="aiContextText"></span>
        </div>

        <!-- Header -->
        <div class="ai-chat-header">
          <div class="ai-chat-header-title">
            <span class="icon">🤖</span>
            <div class="text">
              <h3>AI 도우미</h3>
              <p>MuseFlow V26.0</p>
            </div>
          </div>
          <div class="ai-chat-header-actions">
            <button id="aiClearHistoryBtn" title="대화 이력 초기화">🗑️</button>
            <button id="aiMinimizeBtn" title="최소화">_</button>
            <button id="aiCloseBtn" title="닫기">×</button>
          </div>
        </div>

        <!-- Messages -->
        <div class="ai-chat-messages" id="aiChatMessages"></div>

        <!-- Input -->
        <div class="ai-chat-input-container" style="position: relative;">
          <textarea 
            class="ai-chat-input" 
            id="aiChatInput" 
            placeholder="질문을 입력하세요... (예: Canvas 사용법, 전시 기획 도움말)"
            rows="2"
          ></textarea>
          <button class="ai-chat-send-btn" id="aiChatSendBtn">
            <span style="color: white; font-size: 20px;">➤</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  },

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    // Toggle chat window
    document.getElementById('aiChatToggle').addEventListener('click', () => {
      this.toggleChat();
    });

    // Close button
    document.getElementById('aiCloseBtn').addEventListener('click', () => {
      this.toggleChat();
    });

    // Minimize button
    document.getElementById('aiMinimizeBtn').addEventListener('click', () => {
      this.minimizeChat();
    });

    // Clear history button
    document.getElementById('aiClearHistoryBtn').addEventListener('click', () => {
      if (confirm('대화 이력을 모두 삭제하시겠습니까?')) {
        this.clearConversationHistory();
      }
    });

    // Send message
    document.getElementById('aiChatSendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter to send (Shift+Enter for new line)
    document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Track user activity
    ['click', 'keypress', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        this.state.lastActivity = Date.now();
      });
    });

    // Listen for BehaviorDetector events (if available)
    this.setupBehaviorDetectorIntegration();
  },

  /**
   * Toggle Chat Window
   */
  toggleChat() {
    this.state.isOpen = !this.state.isOpen;
    const window = document.getElementById('aiChatWindow');
    
    if (this.state.isOpen) {
      window.classList.add('open');
      document.getElementById('aiNotificationBadge').style.display = 'none';
      this.scrollToBottom();
    } else {
      window.classList.remove('open');
    }
  },

  /**
   * Minimize Chat
   */
  minimizeChat() {
    this.state.isMinimized = !this.state.isMinimized;
    const window = document.getElementById('aiChatWindow');
    
    if (this.state.isMinimized) {
      window.style.height = '80px';
    } else {
      window.style.height = '600px';
    }
  },

  /**
   * Add Message
   */
  addMessage(role, content, actions = null) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const message = document.createElement('div');
    message.className = `ai-message ${role}`;
    
    const avatar = role === 'assistant' ? '🤖' : '👤';
    
    message.innerHTML = `
      <div class="ai-message-avatar">${avatar}</div>
      <div class="ai-message-content">
        ${content}
        ${actions ? `
          <div class="ai-quick-actions">
            ${actions.map(action => `
              <button class="ai-quick-action-btn" data-action="${action.action || ''}" data-link="${action.link || ''}">
                ${action.text}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    messagesContainer.appendChild(message);

    // Setup action buttons
    if (actions) {
      message.querySelectorAll('.ai-quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          const link = btn.getAttribute('data-link');
          
          if (link) {
            window.location.href = link;
          } else if (action) {
            this.handleAction(action);
          }
        });
      });
    }

    this.state.messages.push({ role, content, timestamp: Date.now() });
    this.scrollToBottom();

    // Limit message history
    if (this.state.messages.length > this.config.maxMessages) {
      this.state.messages = this.state.messages.slice(-this.config.maxMessages);
      messagesContainer.removeChild(messagesContainer.firstChild);
    }
  },

  /**
   * Send User Message
   */
  sendMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    this.addMessage('user', message);
    input.value = '';

    // Process message and respond
    setTimeout(() => {
      this.processUserMessage(message);
    }, 500);
  },

  /**
   * Process User Message and Generate Response (Enhanced)
   */
  processUserMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Enhanced keyword matching with scoring
    const keywords = {
      tutorial: ['튜토리얼', '시작', '처음', '배우', '학습', 'tutorial', 'start', 'begin'],
      sample: ['샘플', '예시', '데이터', '예제', 'sample', 'example', 'data'],
      canvas: ['canvas', '캔버스', '워크플로우', '카드', 'workflow', 'card'],
      help: ['도움말', '가이드', '도와', 'help', 'guide', 'assist'],
      exhibition: ['전시', '기획', '큐레이팅', 'exhibition', 'curating'],
      education: ['교육', '프로그램', '강좌', 'education', 'program'],
      collection: ['소장품', '수집', '작품', 'collection', 'artwork'],
      conservation: ['보존', '복원', '처리', 'conservation', 'restoration'],
      publishing: ['출판', '학술지', '논문', 'publishing', 'journal', 'paper'],
      research: ['연구', '조사', '분석', 'research', 'investigation'],
      administration: ['행정', '관리', '예산', 'administration', 'budget', 'management'],
      task: ['작업', '업무', '태스크', 'task', 'work'],
      connection: ['연결', '링크', '관계', 'connection', 'link', 'relationship']
    };

    // Calculate keyword scores
    const scores = {};
    for (const [category, words] of Object.entries(keywords)) {
      scores[category] = words.filter(word => lowerMessage.includes(word)).length;
    }

    // Find highest score
    const maxScore = Math.max(...Object.values(scores));
    const topCategory = Object.keys(scores).find(key => scores[key] === maxScore);

    let response = '';
    let actions = null;

    // Generate response based on top category
    if (scores.tutorial > 0) {
      response = '튜토리얼을 시작하시겠습니까? 7가지 박물관 업무별 가이드를 제공합니다.';
      actions = [
        { text: '🎨 전시 기획', action: 'startTutorial_exhibition' },
        { text: '📚 교육 프로그램', action: 'startTutorial_education' },
        { text: '모든 튜토리얼', link: '/help-center' }
      ];
    } else if (scores.sample > 0) {
      response = 'MuseFlow V26.0은 7가지 박물관 업무별 샘플 데이터를 제공합니다. Canvas에서 샘플 워크플로우를 확인해보세요!';
      actions = [
        { text: 'Canvas 열기', link: '/canvas-ultimate-clean' },
        { text: '샘플 데이터 설명', link: '/help-center' }
      ];
    } else if (scores.canvas > 0) {
      response = 'Canvas는 워크플로우를 시각화하는 공간입니다. 카드를 드래그하여 이동하고, 연결선으로 흐름을 표현할 수 있습니다.';
      actions = [
        { text: 'Canvas 가이드', link: '/help-center?article=canvas' },
        { text: 'Canvas 열기', link: '/canvas-ultimate-clean' }
      ];
    } else if (scores.task > 0) {
      response = 'Tasks는 프로젝트의 할 일 목록입니다. 우선순위를 설정하고, 마감일을 관리하며, 진행 상태를 추적할 수 있습니다.';
      actions = [
        { text: 'Task 관리 가이드', link: '/help-center?article=tasks' },
        { text: 'Canvas에서 보기', link: '/canvas-ultimate-clean' }
      ];
    } else if (scores.connection > 0) {
      response = 'Canvas Card 간의 연결선은 워크플로우의 흐름을 표현합니다. 카드를 클릭하여 연결선을 생성할 수 있습니다.';
      actions = [
        { text: '연결선 사용법', link: '/help-center?article=connections' },
        { text: 'Canvas 열기', link: '/canvas-ultimate-clean' }
      ];
    } else if (scores.exhibition > 0) {
      response = '전시 기획 업무를 도와드리겠습니다. 전시 기획서 작성부터 개막까지의 전 과정을 지원합니다.';
      actions = this.roleActions.exhibition.actions;
    } else if (scores.education > 0) {
      response = '교육 프로그램 기획을 도와드리겠습니다. 커리큘럼 설계부터 교육 자료 제작까지 지원합니다.';
      actions = this.roleActions.education.actions;
    } else if (scores.collection > 0) {
      response = '소장품 수집 업무를 도와드리겠습니다. 작품 평가부터 등록 관리까지 전 과정을 안내합니다.';
      actions = this.roleActions.collection.actions;
    } else if (scores.conservation > 0) {
      response = '보존 처리 업무를 도와드리겠습니다. 과학적 분석부터 처리 계획 수립까지 지원합니다.';
      actions = this.roleActions.conservation.actions;
    } else if (scores.publishing > 0) {
      response = '학술 출판 업무를 도와드리겠습니다. 논문 심사부터 학술지 발간까지 안내합니다.';
      actions = this.roleActions.publishing.actions;
    } else if (scores.research > 0) {
      response = '학술 연구 업무를 도와드리겠습니다. 연구 계획 수립부터 논문 발표까지 지원합니다.';
      actions = this.roleActions.research.actions;
    } else if (scores.administration > 0) {
      response = '행정 관리 업무를 도와드리겠습니다. 예산 집행부터 인력 관리까지 안내합니다.';
      actions = this.roleActions.administration.actions;
    } else if (scores.help > 0) {
      response = '도움말 센터에서 7가지 업무별 실무 가이드를 확인하세요!';
      actions = Object.keys(this.roleActions).slice(0, 3).map(role => ({
        text: this.roleActions[role].title,
        link: `/help-center?role=${role}`
      }));
    } else {
      response = '궁금하신 내용을 더 구체적으로 말씀해주시면 도와드리겠습니다. 아래 버튼을 눌러 주제를 선택하실 수도 있습니다.';
      actions = [
        { text: '📚 가이드 보기', link: '/help-center' },
        { text: '🎨 Canvas 열기', link: '/canvas-ultimate-clean' },
        { text: '💬 자주 묻는 질문', link: '/help-center#faq' }
      ];
    }

    this.addMessage('assistant', response, actions);
    
    // Save conversation after each message
    this.saveConversationHistory();
  },

  /**
   * Show Quick Actions
   */
  showQuickActions() {
    const actions = [
      { text: '🎓 튜토리얼 시작', action: 'showTutorial' },
      { text: '📚 도움말 센터', link: '/help-center' },
      { text: '🎨 Canvas 열기', link: '/canvas-ultimate-clean' }
    ];

    this.addMessage('assistant', '빠른 시작 메뉴를 선택하세요:', actions);
  },

  /**
   * Handle Quick Action
   */
  handleAction(action) {
    console.log('[AIAssistant] Action triggered:', action);

    if (action === 'showTutorial') {
      this.addMessage('assistant', '어떤 업무 튜토리얼을 시작하시겠습니까?', [
        { text: '🎨 전시 기획', action: 'startTutorial_exhibition' },
        { text: '📚 교육 프로그램', action: 'startTutorial_education' },
        { text: '🏛️ 소장품 수집', action: 'startTutorial_collection' },
        { text: '더보기', link: '/help-center' }
      ]);
    } else if (action.startsWith('startTutorial_')) {
      const role = action.replace('startTutorial_', '');
      const roleData = this.roleActions[role];
      
      if (roleData) {
        this.addMessage('assistant', `${roleData.icon} ${roleData.title} 튜토리얼을 시작합니다. Canvas로 이동합니다...`);
        setTimeout(() => {
          window.location.href = `/canvas-ultimate-clean?tutorial=${role}`;
        }, 1000);
      }
    } else if (action === 'exploreSampleData') {
      window.location.href = '/canvas-ultimate-clean';
    } else if (action === 'openHelpCenter') {
      window.location.href = '/help-center';
    } else if (action === 'showGuide') {
      window.location.href = '/help-center';
    } else if (action === 'contactSupport') {
      this.addMessage('assistant', '문의사항: gallerypia@gmail.com (교수님: 남현우)');
    }
  },

  /**
   * Detect User Context
   */
  detectContext() {
    // Detect current page
    const path = window.location.pathname;
    
    if (path.includes('canvas')) {
      this.state.currentContext = 'canvas';
    } else if (path.includes('dashboard')) {
      this.state.currentContext = 'dashboard';
    } else if (path.includes('help')) {
      this.state.currentContext = 'help';
    }

    // Detect user role from URL params or storage
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || localStorage.getItem('museflow_user_role');
    
    if (role && this.roleActions[role]) {
      this.state.userRole = role;
      this.showContextBanner(this.roleActions[role]);
    }

    // Auto-suggest based on idle time
    setInterval(() => {
      const idleTime = Date.now() - this.state.lastActivity;
      
      if (idleTime > 180000 && !this.state.isOpen) { // 3 minutes
        this.showContextSuggestion('idle');
      }
    }, 60000); // Check every minute
  },

  /**
   * Show Context Banner
   */
  showContextBanner(roleData) {
    const banner = document.getElementById('aiContextBanner');
    const icon = document.getElementById('aiContextIcon');
    const text = document.getElementById('aiContextText');

    icon.textContent = roleData.icon;
    text.textContent = `${roleData.title} 업무 지원 모드`;

    banner.style.display = 'flex';
  },

  /**
   * Show Context Suggestion
   */
  showContextSuggestion(type) {
    const suggestion = this.contextHelp[type];
    
    if (!suggestion) return;

    // Show notification badge
    document.getElementById('aiNotificationBadge').style.display = 'flex';
    document.getElementById('aiNotificationBadge').textContent = '!';

    // Add suggestion message (but don't auto-open)
    this.addMessage('assistant', `${suggestion.icon} ${suggestion.title}`, suggestion.suggestions);
  },

  /**
   * Setup BehaviorDetector Integration
   */
  setupBehaviorDetectorIntegration() {
    // Listen for custom events from BehaviorDetector
    document.addEventListener('museflow:behavior:idle', (e) => {
      console.log('[AIAssistant] Idle behavior detected', e.detail);
      this.showContextSuggestion('idle');
    });

    document.addEventListener('museflow:behavior:stuck', (e) => {
      console.log('[AIAssistant] Stuck behavior detected', e.detail);
      this.showContextSuggestion('stuck');
    });

    document.addEventListener('museflow:behavior:error', (e) => {
      console.log('[AIAssistant] Error behavior detected', e.detail);
      this.showContextSuggestion('error');
    });

    console.log('[AIAssistant] BehaviorDetector integration ready');
  },

  /**
   * Scroll to Bottom
   */
  scrollToBottom() {
    const messagesContainer = document.getElementById('aiChatMessages');
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  },

  /**
   * Save Conversation History to localStorage
   */
  saveConversationHistory() {
    try {
      const historyData = {
        messages: this.state.messages,
        lastSaved: Date.now(),
        userRole: this.state.userRole,
        currentContext: this.state.currentContext
      };

      localStorage.setItem('ai_assistant_conversation', JSON.stringify(historyData));
      console.log('[AIAssistant] Conversation history saved (' + this.state.messages.length + ' messages)');
    } catch (error) {
      console.error('[AIAssistant] Failed to save conversation:', error);
    }
  },

  /**
   * Load Conversation History from localStorage
   */
  loadConversationHistory() {
    try {
      const stored = localStorage.getItem('ai_assistant_conversation');
      
      if (!stored) {
        console.log('[AIAssistant] No previous conversation found');
        return;
      }

      const historyData = JSON.parse(stored);
      
      // Check if history is not too old (7 days max)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - historyData.lastSaved > maxAge) {
        console.log('[AIAssistant] Conversation history expired, clearing...');
        localStorage.removeItem('ai_assistant_conversation');
        return;
      }

      // Restore messages
      this.state.messages = historyData.messages || [];
      this.state.userRole = historyData.userRole || null;
      this.state.currentContext = historyData.currentContext || null;

      // Render messages in UI
      const messagesContainer = document.getElementById('aiChatMessages');
      if (messagesContainer) {
        messagesContainer.innerHTML = ''; // Clear existing
        
        this.state.messages.forEach(msg => {
          const message = document.createElement('div');
          message.className = `ai-message ${msg.role}`;
          
          const avatar = msg.role === 'assistant' ? '🤖' : '👤';
          
          message.innerHTML = `
            <div class="ai-message-avatar">${avatar}</div>
            <div class="ai-message-content">${msg.content}</div>
          `;
          
          messagesContainer.appendChild(message);
        });

        this.scrollToBottom();
      }

      console.log('[AIAssistant] Loaded ' + this.state.messages.length + ' messages from history');
    } catch (error) {
      console.error('[AIAssistant] Failed to load conversation:', error);
      localStorage.removeItem('ai_assistant_conversation');
    }
  },

  /**
   * Clear Conversation History
   */
  clearConversationHistory() {
    try {
      localStorage.removeItem('ai_assistant_conversation');
      this.state.messages = [];
      
      const messagesContainer = document.getElementById('aiChatMessages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }

      // Show welcome message again
      setTimeout(() => {
        this.addMessage('assistant', this.config.welcomeMessage);
        this.showQuickActions();
      }, 500);

      console.log('[AIAssistant] Conversation history cleared');
    } catch (error) {
      console.error('[AIAssistant] Failed to clear conversation:', error);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AIAssistantWidget.init();
  });
} else {
  AIAssistantWidget.init();
}

// Export for external use
window.AIAssistantWidget = AIAssistantWidget;
