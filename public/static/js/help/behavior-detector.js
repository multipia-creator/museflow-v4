/**
 * MuseFlow V4 - User Behavior Detection Engine
 * 
 * 사용자 행동 패턴을 실시간으로 분석하고, 도움이 필요한 순간을
 * 자동으로 감지해 proactive하게 도움을 제공합니다.
 * 
 * Features:
 * - Idle detection (30s+ inactivity)
 * - Error detection (form validation, API failures)
 * - Form abandonment detection (started but not completed)
 * - High correction rate detection (repeated edits)
 * - Stuck detection (same page, no progress)
 * - Proactive help offers (automatic suggestions)
 * - Behavior analytics (pattern analysis)
 * 
 * Usage:
 *   <script src="/static/js/help/behavior-detector.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', () => {
 *       BehaviorDetector.init({
 *         idleTimeout: 30000,
 *         enableProactiveHelp: true
 *       });
 *     });
 *   </script>
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

const BehaviorDetector = {
  // Configuration
  config: {
    idleTimeout: 30000, // 30 seconds
    abandonmentTimeout: 120000, // 2 minutes
    highCorrectionThreshold: 5, // 5+ corrections = high correction rate
    stuckThreshold: 180000, // 3 minutes on same step
    enableProactiveHelp: true,
    enableAnalytics: true,
    debugMode: false
  },

  // State
  state: {
    isIdle: false,
    lastActivity: Date.now(),
    currentPage: null,
    currentStep: null,
    pageStartTime: Date.now(),
    formInteractions: {},
    errors: [],
    corrections: {},
    stuckCounter: 0,
    sessionStartTime: Date.now()
  },

  // Timers
  timers: {
    idleTimer: null,
    abandonmentTimer: null,
    stuckTimer: null
  },

  // Detected behaviors
  detectedBehaviors: [],

  // Help offers shown
  helpOffersShown: [],

  /**
   * Initialize Behavior Detector
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    console.log('[BehaviorDetector] Initializing...');
    
    // Merge config
    this.config = { ...this.config, ...options };
    
    // Detect initial context
    this.detectContext();
    
    // Setup event listeners
    this.attachEventListeners();
    
    // Start idle detection
    this.startIdleDetection();
    
    // Start stuck detection
    this.startStuckDetection();
    
    // Inject styles for help modals
    this.injectStyles();
    
    console.log('[BehaviorDetector] Initialized successfully');
  },

  /**
   * Inject CSS styles for help modals
   */
  injectStyles() {
    if (document.getElementById('behavior-detector-styles')) return;

    const style = document.createElement('style');
    style.id = 'behavior-detector-styles';
    style.textContent = `
      /* Help Offer Modal */
      .help-offer-modal {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .help-offer-header {
        padding: 20px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .help-offer-icon {
        font-size: 32px;
        animation: bounce 1s infinite;
      }

      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      .help-offer-header-text h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .help-offer-header-text p {
        margin: 4px 0 0 0;
        font-size: 13px;
        opacity: 0.9;
      }

      .help-offer-body {
        padding: 20px;
      }

      .help-offer-message {
        font-size: 15px;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 20px;
      }

      .help-offer-actions {
        display: flex;
        gap: 12px;
      }

      .help-offer-btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .help-offer-btn-primary {
        background: #4f46e5;
        color: white;
      }

      .help-offer-btn-primary:hover {
        background: #4338ca;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }

      .help-offer-btn-secondary {
        background: #f3f4f6;
        color: #6b7280;
      }

      .help-offer-btn-secondary:hover {
        background: #e5e7eb;
      }

      .help-offer-suggestions {
        margin-top: 16px;
      }

      .help-offer-suggestions-title {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 12px;
      }

      .help-offer-suggestion {
        padding: 12px;
        background: #f9fafb;
        border-left: 3px solid #4f46e5;
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .help-offer-suggestion:hover {
        background: #f3f4f6;
        transform: translateX(4px);
      }

      .help-offer-suggestion-title {
        font-size: 13px;
        font-weight: 600;
        color: #4f46e5;
        margin-bottom: 4px;
      }

      .help-offer-suggestion-desc {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      }

      .help-offer-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .help-offer-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Responsive */
      @media (max-width: 480px) {
        .help-offer-modal {
          width: calc(100% - 32px);
          left: 16px;
          right: 16px;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Detect current context
   */
  detectContext() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s);

    this.state.currentPage = segments[0] || 'home';

    // Detect wizard step
    const stepIndicator = document.querySelector('[data-step]');
    if (stepIndicator) {
      this.state.currentStep = stepIndicator.dataset.step;
    }

    // Detect form presence
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const formId = form.id || form.name || 'anonymous-form';
      this.state.formInteractions[formId] = {
        started: false,
        completed: false,
        startTime: null,
        fields: {},
        corrections: 0
      };
    });

    this.log('Context detected:', {
      page: this.state.currentPage,
      step: this.state.currentStep,
      forms: Object.keys(this.state.formInteractions).length
    });
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Activity events (reset idle timer)
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), { passive: true });
    });

    // Form field interactions
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.handleFieldInput(e.target);
      }
    }, true);

    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        this.handleFormSubmit(e.target);
      }
    }, true);

    // Error detection
    document.addEventListener('invalid', (e) => {
      this.handleValidationError(e.target);
    }, true);

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Before unload (abandonment)
    window.addEventListener('beforeunload', (e) => {
      this.handleBeforeUnload(e);
    });

    // URL changes (for SPAs)
    window.addEventListener('popstate', () => {
      this.handlePageChange();
    });

    // Global error handler
    window.addEventListener('error', (e) => {
      this.handleGlobalError(e);
    });

    // Unhandled promise rejections (API errors)
    window.addEventListener('unhandledrejection', (e) => {
      this.handleUnhandledRejection(e);
    });
  },

  /**
   * Record user activity
   */
  recordActivity() {
    this.state.lastActivity = Date.now();
    
    if (this.state.isIdle) {
      this.state.isIdle = false;
      this.recordBehavior('activity_resumed');
      this.log('User resumed activity');
    }

    // Reset idle timer
    this.resetIdleTimer();
  },

  /**
   * Start idle detection
   */
  startIdleDetection() {
    this.resetIdleTimer();
  },

  /**
   * Reset idle timer
   */
  resetIdleTimer() {
    clearTimeout(this.timers.idleTimer);
    
    this.timers.idleTimer = setTimeout(() => {
      this.handleIdleDetected();
    }, this.config.idleTimeout);
  },

  /**
   * Handle idle detected
   */
  handleIdleDetected() {
    this.state.isIdle = true;
    this.recordBehavior('idle_detected', {
      duration: this.config.idleTimeout,
      page: this.state.currentPage,
      step: this.state.currentStep
    });

    this.log('User is idle for', this.config.idleTimeout / 1000, 'seconds');

    // Offer proactive help
    if (this.config.enableProactiveHelp) {
      this.offerHelp('idle', {
        title: '도움이 필요하신가요?',
        message: '잠시 멈춰 계시네요. 막히신 부분이 있으신가요?',
        suggestions: this.getHelpSuggestionsForContext()
      });
    }
  },

  /**
   * Start stuck detection
   */
  startStuckDetection() {
    this.timers.stuckTimer = setInterval(() => {
      const timeOnPage = Date.now() - this.state.pageStartTime;
      
      if (timeOnPage > this.config.stuckThreshold) {
        this.state.stuckCounter++;
        
        this.recordBehavior('stuck_detected', {
          duration: timeOnPage,
          page: this.state.currentPage,
          step: this.state.currentStep,
          stuckCount: this.state.stuckCounter
        });

        this.log('User appears stuck on', this.state.currentPage, 'for', timeOnPage / 1000, 'seconds');

        // Offer help (but not too frequently)
        if (this.config.enableProactiveHelp && this.state.stuckCounter === 1) {
          this.offerHelp('stuck', {
            title: '진행에 어려움이 있으신가요?',
            message: `이 페이지에서 ${Math.floor(timeOnPage / 60000)}분 이상 작업하고 계시네요. 도움을 드릴까요?`,
            suggestions: this.getHelpSuggestionsForContext()
          });
        }
      }
    }, 60000); // Check every minute
  },

  /**
   * Handle field input
   */
  handleFieldInput(field) {
    const form = field.closest('form');
    if (!form) return;

    const formId = form.id || form.name || 'anonymous-form';
    const fieldId = field.id || field.name || 'anonymous-field';

    if (!this.state.formInteractions[formId]) {
      this.state.formInteractions[formId] = {
        started: false,
        completed: false,
        startTime: null,
        fields: {},
        corrections: 0
      };
    }

    const formState = this.state.formInteractions[formId];

    // Mark form as started
    if (!formState.started) {
      formState.started = true;
      formState.startTime = Date.now();
      this.recordBehavior('form_started', { formId });
      this.log('Form started:', formId);

      // Start abandonment timer
      this.startAbandonmentTimer(formId);
    }

    // Track field edits
    if (!formState.fields[fieldId]) {
      formState.fields[fieldId] = {
        editCount: 0,
        firstEdit: Date.now(),
        lastEdit: Date.now()
      };
    }

    formState.fields[fieldId].editCount++;
    formState.fields[fieldId].lastEdit = Date.now();

    // High correction rate detection
    if (formState.fields[fieldId].editCount >= this.config.highCorrectionThreshold) {
      formState.corrections++;
      
      this.recordBehavior('high_correction_rate', {
        formId,
        fieldId,
        editCount: formState.fields[fieldId].editCount
      });

      this.log('High correction rate detected on field:', fieldId);

      // Offer help
      if (this.config.enableProactiveHelp && formState.corrections === 1) {
        this.offerHelp('high_corrections', {
          title: '입력에 어려움이 있으신가요?',
          message: '일부 필드를 여러 번 수정하고 계시네요. 도움이 필요하신가요?',
          suggestions: this.getFieldHelp(fieldId)
        });
      }
    }
  },

  /**
   * Handle form submit
   */
  handleFormSubmit(form) {
    const formId = form.id || form.name || 'anonymous-form';
    
    if (this.state.formInteractions[formId]) {
      this.state.formInteractions[formId].completed = true;
      
      const duration = Date.now() - this.state.formInteractions[formId].startTime;
      
      this.recordBehavior('form_completed', {
        formId,
        duration,
        fields: Object.keys(this.state.formInteractions[formId].fields).length,
        corrections: this.state.formInteractions[formId].corrections
      });

      this.log('Form completed:', formId, 'in', duration / 1000, 'seconds');

      // Clear abandonment timer
      clearTimeout(this.timers.abandonmentTimer);
    }
  },

  /**
   * Handle validation error
   */
  handleValidationError(field) {
    const error = {
      type: 'validation',
      field: field.id || field.name || 'unknown',
      message: field.validationMessage,
      timestamp: Date.now()
    };

    this.state.errors.push(error);

    this.recordBehavior('validation_error', error);

    this.log('Validation error:', error);

    // Offer help after multiple errors
    if (this.state.errors.length >= 3 && this.config.enableProactiveHelp) {
      this.offerHelp('validation_errors', {
        title: '입력 오류가 발생했습니다',
        message: '여러 필드에서 오류가 발생했습니다. 도움말을 확인하시겠습니까?',
        suggestions: this.getFieldHelp(field.id || field.name)
      });
    }
  },

  /**
   * Handle global error
   */
  handleGlobalError(event) {
    const error = {
      type: 'runtime',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now()
    };

    this.state.errors.push(error);

    this.recordBehavior('runtime_error', error);

    this.log('Runtime error:', error);
  },

  /**
   * Handle unhandled rejection (API errors)
   */
  handleUnhandledRejection(event) {
    const error = {
      type: 'api',
      message: event.reason?.message || 'Unknown error',
      timestamp: Date.now()
    };

    this.state.errors.push(error);

    this.recordBehavior('api_error', error);

    this.log('API error:', error);

    // Offer help immediately for API errors
    if (this.config.enableProactiveHelp) {
      this.offerHelp('api_error', {
        title: '네트워크 오류가 발생했습니다',
        message: '서버와의 통신 중 문제가 발생했습니다. 새로고침하거나 나중에 다시 시도해주세요.',
        suggestions: [
          {
            title: '페이지 새로고침',
            description: '현재 페이지를 새로고침합니다',
            action: () => window.location.reload()
          }
        ]
      });
    }
  },

  /**
   * Start abandonment timer
   */
  startAbandonmentTimer(formId) {
    clearTimeout(this.timers.abandonmentTimer);

    this.timers.abandonmentTimer = setTimeout(() => {
      const formState = this.state.formInteractions[formId];
      
      if (formState && formState.started && !formState.completed) {
        this.recordBehavior('form_abandoned', {
          formId,
          duration: Date.now() - formState.startTime,
          fieldsStarted: Object.keys(formState.fields).length
        });

        this.log('Form abandoned:', formId);
      }
    }, this.config.abandonmentTimeout);
  },

  /**
   * Handle page hidden
   */
  handlePageHidden() {
    this.recordBehavior('page_hidden', {
      page: this.state.currentPage,
      timeOnPage: Date.now() - this.state.pageStartTime
    });

    this.log('Page hidden');
  },

  /**
   * Handle page visible
   */
  handlePageVisible() {
    this.recordBehavior('page_visible', {
      page: this.state.currentPage
    });

    this.log('Page visible');
  },

  /**
   * Handle before unload
   */
  handleBeforeUnload(event) {
    // Check for unsaved form data
    const uncompletedForms = Object.entries(this.state.formInteractions)
      .filter(([_, state]) => state.started && !state.completed);

    if (uncompletedForms.length > 0) {
      this.recordBehavior('page_exit_with_unsaved_data', {
        forms: uncompletedForms.length
      });

      this.log('User attempting to leave with unsaved data');

      // Show browser confirmation dialog
      // Note: Custom messages are no longer supported in modern browsers
      event.preventDefault();
      event.returnValue = '';
    }
  },

  /**
   * Handle page change (SPA navigation)
   */
  handlePageChange() {
    const oldPage = this.state.currentPage;
    const timeOnPage = Date.now() - this.state.pageStartTime;

    this.recordBehavior('page_change', {
      from: oldPage,
      duration: timeOnPage
    });

    // Reset state for new page
    this.detectContext();
    this.state.pageStartTime = Date.now();
    this.state.stuckCounter = 0;

    this.log('Page changed from', oldPage, 'to', this.state.currentPage);
  },

  /**
   * Offer proactive help
   */
  offerHelp(reason, options) {
    const offerId = `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Avoid duplicate offers
    const recentOffer = this.helpOffersShown.find(
      offer => offer.reason === reason && Date.now() - offer.timestamp < 60000
    );

    if (recentOffer) {
      this.log('Skipping duplicate help offer for:', reason);
      return;
    }

    this.helpOffersShown.push({
      id: offerId,
      reason,
      timestamp: Date.now()
    });

    this.recordBehavior('help_offered', { reason, offerId });

    this.log('Offering help:', reason, options);

    // Show help modal
    this.showHelpModal(offerId, options);
  },

  /**
   * Show help modal
   */
  showHelpModal(offerId, options) {
    // Remove existing modal
    const existing = document.querySelector('.help-offer-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'help-offer-modal';
    modal.dataset.offerId = offerId;

    modal.innerHTML = `
      <div class="help-offer-header">
        <button class="help-offer-close">✖</button>
        <div class="help-offer-icon">💡</div>
        <div class="help-offer-header-text">
          <h3>${options.title}</h3>
          <p>MuseFlow 도움말</p>
        </div>
      </div>
      
      <div class="help-offer-body">
        <div class="help-offer-message">${options.message}</div>
        
        ${options.suggestions && options.suggestions.length > 0 ? `
          <div class="help-offer-suggestions">
            <div class="help-offer-suggestions-title">💡 추천 도움말</div>
            ${options.suggestions.map((sug, idx) => `
              <div class="help-offer-suggestion" data-suggestion-index="${idx}">
                <div class="help-offer-suggestion-title">${sug.title}</div>
                <div class="help-offer-suggestion-desc">${sug.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="help-offer-actions">
          <button class="help-offer-btn help-offer-btn-primary" data-action="accept">
            도움말 보기
          </button>
          <button class="help-offer-btn help-offer-btn-secondary" data-action="dismiss">
            괜찮습니다
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.help-offer-close').addEventListener('click', () => {
      this.dismissHelpModal(offerId, 'close_button');
    });

    modal.querySelector('[data-action="accept"]').addEventListener('click', () => {
      this.acceptHelpOffer(offerId);
    });

    modal.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
      this.dismissHelpModal(offerId, 'dismiss_button');
    });

    // Suggestion clicks
    modal.querySelectorAll('.help-offer-suggestion').forEach(sug => {
      sug.addEventListener('click', () => {
        const index = parseInt(sug.dataset.suggestionIndex);
        const suggestion = options.suggestions[index];
        
        if (suggestion.action) {
          suggestion.action();
        } else if (suggestion.articleId) {
          this.openHelpArticle(suggestion.articleId);
        }
        
        this.dismissHelpModal(offerId, 'suggestion_clicked');
      });
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.querySelector(`[data-offer-id="${offerId}"]`)) {
        this.dismissHelpModal(offerId, 'auto_dismiss');
      }
    }, 30000);
  },

  /**
   * Accept help offer
   */
  acceptHelpOffer(offerId) {
    this.recordBehavior('help_accepted', { offerId });
    this.log('Help accepted:', offerId);

    // Open help center or AI assistant
    if (window.HelpCenter) {
      window.HelpCenter.showHome();
    } else if (window.AIAssistant) {
      window.AIAssistant.open();
    } else {
      window.location.href = '/help-center.html';
    }

    this.dismissHelpModal(offerId, 'accept');
  },

  /**
   * Dismiss help modal
   */
  dismissHelpModal(offerId, reason) {
    this.recordBehavior('help_dismissed', { offerId, reason });
    this.log('Help dismissed:', offerId, reason);

    const modal = document.querySelector(`[data-offer-id="${offerId}"]`);
    if (modal) {
      modal.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * Open help article
   */
  openHelpArticle(articleId) {
    this.log('Opening help article:', articleId);

    if (window.HelpCenter && typeof window.HelpCenter.showArticle === 'function') {
      window.HelpCenter.showArticle(articleId);
    } else {
      window.location.href = `/help-center.html#article/${articleId}`;
    }
  },

  /**
   * Get help suggestions for current context
   */
  getHelpSuggestionsForContext() {
    const suggestions = [];

    // Context-based suggestions
    if (this.state.currentPage === 'collections' && this.state.currentStep === 'register') {
      suggestions.push({
        title: '작품 등록 가이드',
        description: '6단계 등록 프로세스 상세 설명',
        articleId: 'artwork-registration'
      });
    }

    if (this.state.errors.some(e => e.type === 'validation')) {
      suggestions.push({
        title: '입력 필드 도움말',
        description: '필수 필드와 올바른 입력 형식 확인',
        articleId: 'required-fields'
      });
    }

    // Generic suggestions
    suggestions.push({
      title: 'AI 도움말 봇',
      description: '질문하면 자동으로 답변해드립니다',
      action: () => window.AIAssistant && window.AIAssistant.open()
    });

    return suggestions.slice(0, 3); // Max 3 suggestions
  },

  /**
   * Get field-specific help
   */
  getFieldHelp(fieldId) {
    // Map common field IDs to help articles
    const fieldHelpMap = {
      'accession_number': 'accession-numbers',
      'title': 'artwork-registration',
      'artist': 'artwork-registration',
      'date_created': 'artwork-registration',
      'medium': 'artwork-registration'
    };

    const articleId = fieldHelpMap[fieldId];
    
    if (articleId) {
      return [{
        title: '이 필드 도움말',
        description: '올바른 입력 방법 확인',
        articleId: articleId
      }];
    }

    return [];
  },

  /**
   * Record behavior
   */
  recordBehavior(type, data = {}) {
    const behavior = {
      type,
      timestamp: Date.now(),
      page: this.state.currentPage,
      step: this.state.currentStep,
      sessionDuration: Date.now() - this.state.sessionStartTime,
      ...data
    };

    this.detectedBehaviors.push(behavior);

    // Store in localStorage for analytics
    if (this.config.enableAnalytics) {
      this.saveToStorage(behavior);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('behavior:detected', {
      detail: behavior
    }));

    // Dispatch specific events for AI Assistant integration
    if (type === 'idle_detected') {
      document.dispatchEvent(new CustomEvent('museflow:behavior:idle', { detail: behavior }));
    } else if (type === 'stuck_detected') {
      document.dispatchEvent(new CustomEvent('museflow:behavior:stuck', { detail: behavior }));
    } else if (type.includes('error')) {
      document.dispatchEvent(new CustomEvent('museflow:behavior:error', { detail: behavior }));
    }
  },

  /**
   * Save to localStorage
   */
  saveToStorage(behavior) {
    try {
      const stored = JSON.parse(localStorage.getItem('behavior_data') || '[]');
      stored.push(behavior);
      
      // Keep last 200 behaviors
      const trimmed = stored.slice(-200);
      localStorage.setItem('behavior_data', JSON.stringify(trimmed));
    } catch (error) {
      console.error('[BehaviorDetector] Failed to save to storage:', error);
    }
  },

  /**
   * Get analytics summary
   */
  getAnalytics() {
    try {
      const behaviors = JSON.parse(localStorage.getItem('behavior_data') || '[]');
      
      return {
        total: behaviors.length,
        byType: this.groupBy(behaviors, 'type'),
        recentBehaviors: behaviors.slice(-20),
        helpOffered: behaviors.filter(b => b.type === 'help_offered').length,
        helpAccepted: behaviors.filter(b => b.type === 'help_accepted').length,
        acceptanceRate: this.calculateAcceptanceRate(behaviors)
      };
    } catch (error) {
      console.error('[BehaviorDetector] Failed to get analytics:', error);
      return null;
    }
  },

  /**
   * Group array by key
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  },

  /**
   * Calculate help acceptance rate
   */
  calculateAcceptanceRate(behaviors) {
    const offered = behaviors.filter(b => b.type === 'help_offered').length;
    const accepted = behaviors.filter(b => b.type === 'help_accepted').length;
    
    return offered > 0 ? (accepted / offered * 100).toFixed(1) : 0;
  },

  /**
   * Log (debug mode)
   */
  log(...args) {
    if (this.config.debugMode) {
      console.log('[BehaviorDetector]', ...args);
    }
  },

  /**
   * Destroy behavior detector
   */
  destroy() {
    clearTimeout(this.timers.idleTimer);
    clearTimeout(this.timers.abandonmentTimer);
    clearInterval(this.timers.stuckTimer);

    const styles = document.getElementById('behavior-detector-styles');
    if (styles) styles.remove();

    const modal = document.querySelector('.help-offer-modal');
    if (modal) modal.remove();

    console.log('[BehaviorDetector] Destroyed');
  }
};

// Auto-initialize if data attribute present
if (document.querySelector('[data-behavior-detector-auto-init]')) {
  document.addEventListener('DOMContentLoaded', () => {
    const config = document.querySelector('[data-behavior-detector-auto-init]').dataset;
    BehaviorDetector.init({
      idleTimeout: parseInt(config.idleTimeout) || 30000,
      enableProactiveHelp: config.enableProactiveHelp !== 'false',
      debugMode: config.debugMode === 'true'
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BehaviorDetector;
}
