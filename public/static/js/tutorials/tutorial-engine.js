/**
 * MuseFlow V4 - Interactive Tutorial Engine
 * 
 * 사용자가 실제 UI 위에서 단계별 가이드를 따라가며 학습할 수 있는
 * 인터랙티브 튜토리얼 시스템입니다.
 * 
 * Features:
 * - Spotlight overlay (highlight specific elements)
 * - Step-by-step guided walkthrough
 * - Interactive prompts (wait for user actions)
 * - Progress tracking & persistence
 * - Skip/Restart functionality
 * - Multi-device responsive design
 * - Event-driven architecture
 * - Screenshot capture for feedback
 * 
 * Usage:
 *   <script src="/static/js/tutorials/tutorial-engine.js"></script>
 *   <script>
 *     TutorialEngine.start('exhibition-creation', {
 *       onComplete: () => console.log('Tutorial completed!'),
 *       onSkip: () => console.log('Tutorial skipped')
 *     });
 *   </script>
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

const TutorialEngine = {
  // Configuration
  config: {
    enableProgress: true,
    enableSkip: true,
    enableRestart: true,
    autoAdvance: false,
    spotlightPadding: 8,
    animationDuration: 300,
    debugMode: false
  },

  // State
  state: {
    isActive: false,
    currentTutorialId: null,
    currentStepIndex: 0,
    totalSteps: 0,
    startTime: null,
    stepsCompleted: [],
    userActions: []
  },

  // Current tutorial data
  currentTutorial: null,

  // DOM elements
  elements: {
    overlay: null,
    spotlight: null,
    tooltip: null,
    progressBar: null
  },

  // Registered tutorials
  tutorials: {},

  /**
   * Register a tutorial
   * @param {string} id - Tutorial ID
   * @param {Object} tutorialData - Tutorial configuration
   */
  registerTutorial(id, tutorialData) {
    this.tutorials[id] = {
      id,
      title: tutorialData.title,
      description: tutorialData.description,
      category: tutorialData.category,
      difficulty: tutorialData.difficulty,
      estimatedTime: tutorialData.estimatedTime,
      prerequisites: tutorialData.prerequisites || [],
      steps: tutorialData.steps,
      onStart: tutorialData.onStart,
      onComplete: tutorialData.onComplete,
      onSkip: tutorialData.onSkip
    };

    this.log('Tutorial registered:', id);
  },

  /**
   * Start a tutorial
   * @param {string} tutorialId - Tutorial ID
   * @param {Object} options - Configuration options
   */
  async start(tutorialId, options = {}) {
    // Check if tutorial exists
    if (!this.tutorials[tutorialId]) {
      console.error('[TutorialEngine] Tutorial not found:', tutorialId);
      return;
    }

    // Check if already active
    if (this.state.isActive) {
      console.warn('[TutorialEngine] Tutorial already active');
      return;
    }

    // Merge options
    this.config = { ...this.config, ...options };

    // Load tutorial
    this.currentTutorial = this.tutorials[tutorialId];
    this.state.currentTutorialId = tutorialId;
    this.state.totalSteps = this.currentTutorial.steps.length;
    this.state.currentStepIndex = 0;
    this.state.startTime = Date.now();
    this.state.isActive = true;
    this.state.stepsCompleted = [];
    this.state.userActions = [];

    this.log('Starting tutorial:', tutorialId);

    // Check prerequisites
    if (this.currentTutorial.prerequisites.length > 0) {
      const hasPrereqs = await this.checkPrerequisites();
      if (!hasPrereqs) {
        this.showPrerequisitesWarning();
        return;
      }
    }

    // Inject styles
    this.injectStyles();

    // Create UI
    this.createUI();

    // Call onStart callback
    if (this.currentTutorial.onStart) {
      this.currentTutorial.onStart();
    }

    // Show first step
    this.showStep(0);

    // Track event
    this.trackEvent('tutorial_started', {
      tutorialId,
      totalSteps: this.state.totalSteps
    });
  },

  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('tutorial-engine-styles')) return;

    const style = document.createElement('style');
    style.id = 'tutorial-engine-styles';
    style.textContent = `
      /* Tutorial Overlay */
      .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 99998;
        pointer-events: none;
        transition: opacity ${this.config.animationDuration}ms ease;
      }

      .tutorial-overlay.hidden {
        opacity: 0;
        pointer-events: none;
      }

      /* Spotlight */
      .tutorial-spotlight {
        position: absolute;
        border: 3px solid #4f46e5;
        border-radius: 8px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(79, 70, 229, 0.5);
        pointer-events: none;
        transition: all ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 99999;
      }

      .tutorial-spotlight.pulse {
        animation: spotlightPulse 2s infinite;
      }

      @keyframes spotlightPulse {
        0%, 100% {
          border-color: #4f46e5;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(79, 70, 229, 0.5);
        }
        50% {
          border-color: #7c3aed;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(124, 58, 237, 0.8);
        }
      }

      /* Tooltip */
      .tutorial-tooltip {
        position: absolute;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        z-index: 100000;
        animation: tooltipSlideIn ${this.config.animationDuration}ms ease;
      }

      @keyframes tooltipSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tutorial-tooltip-header {
        padding: 20px 20px 16px;
        border-bottom: 1px solid #f3f4f6;
      }

      .tutorial-tooltip-step {
        font-size: 12px;
        font-weight: 600;
        color: #4f46e5;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .tutorial-tooltip-title {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }

      .tutorial-tooltip-body {
        padding: 20px;
      }

      .tutorial-tooltip-content {
        font-size: 15px;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 20px;
      }

      .tutorial-tooltip-hint {
        padding: 12px;
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
        border-radius: 6px;
        font-size: 13px;
        color: #78350f;
        margin-bottom: 20px;
      }

      .tutorial-tooltip-actions {
        display: flex;
        gap: 12px;
      }

      .tutorial-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tutorial-btn-primary {
        flex: 1;
        background: #4f46e5;
        color: white;
      }

      .tutorial-btn-primary:hover {
        background: #4338ca;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }

      .tutorial-btn-primary:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }

      .tutorial-btn-secondary {
        background: #f3f4f6;
        color: #6b7280;
      }

      .tutorial-btn-secondary:hover {
        background: #e5e7eb;
      }

      /* Progress Bar */
      .tutorial-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        z-index: 100001;
      }

      .tutorial-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
        transition: width ${this.config.animationDuration}ms ease;
      }

      /* Control Panel */
      .tutorial-controls {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        z-index: 100001;
      }

      .tutorial-control-btn {
        padding: 12px 20px;
        background: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s;
      }

      .tutorial-control-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .tutorial-control-btn.danger {
        color: #ef4444;
      }

      /* Waiting State */
      .tutorial-waiting {
        position: relative;
      }

      .tutorial-waiting::after {
        content: '';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid #4f46e5;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: translateY(-50%) rotate(360deg); }
      }

      /* Arrow Pointer */
      .tutorial-arrow {
        position: absolute;
        width: 0;
        height: 0;
        z-index: 99999;
      }

      .tutorial-arrow.top {
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 12px solid white;
        top: -12px;
      }

      .tutorial-arrow.bottom {
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 12px solid white;
        bottom: -12px;
      }

      .tutorial-arrow.left {
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        border-right: 12px solid white;
        left: -12px;
      }

      .tutorial-arrow.right {
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        border-left: 12px solid white;
        right: -12px;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .tutorial-tooltip {
          max-width: calc(100vw - 32px);
          left: 16px !important;
          right: 16px !important;
        }

        .tutorial-controls {
          flex-direction: column;
          width: calc(100% - 32px);
          left: 16px;
          transform: none;
        }

        .tutorial-control-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Create UI elements
   */
  createUI() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
    this.elements.overlay = overlay;

    // Create spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'tutorial-spotlight pulse';
    document.body.appendChild(spotlight);
    this.elements.spotlight = spotlight;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    document.body.appendChild(tooltip);
    this.elements.tooltip = tooltip;

    // Create progress bar
    const progress = document.createElement('div');
    progress.className = 'tutorial-progress';
    progress.innerHTML = '<div class="tutorial-progress-bar"></div>';
    document.body.appendChild(progress);
    this.elements.progressBar = progress.querySelector('.tutorial-progress-bar');

    // Create control panel
    const controls = document.createElement('div');
    controls.className = 'tutorial-controls';
    controls.innerHTML = `
      ${this.config.enableSkip ? '<button class="tutorial-control-btn danger" data-action="skip">건너뛰기</button>' : ''}
      ${this.config.enableRestart ? '<button class="tutorial-control-btn" data-action="restart">처음부터</button>' : ''}
      <button class="tutorial-control-btn" data-action="exit">종료</button>
    `;
    document.body.appendChild(controls);

    // Attach event listeners
    controls.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleControlAction(action);
      });
    });
  },

  /**
   * Show a specific step
   * @param {number} stepIndex - Step index
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.state.totalSteps) {
      this.log('Invalid step index:', stepIndex);
      return;
    }

    this.state.currentStepIndex = stepIndex;
    const step = this.currentTutorial.steps[stepIndex];

    this.log('Showing step:', stepIndex, step);

    // Update progress
    this.updateProgress();

    // Highlight target element
    if (step.target) {
      this.highlightElement(step.target);
    } else {
      this.hideSpotlight();
    }

    // Show tooltip
    this.showTooltip(step);

    // Setup action listener
    if (step.waitFor) {
      this.setupActionListener(step);
    }

    // Track event
    this.trackEvent('tutorial_step_viewed', {
      tutorialId: this.state.currentTutorialId,
      stepIndex,
      stepTitle: step.title
    });
  },

  /**
   * Highlight target element
   * @param {string} selector - CSS selector
   */
  highlightElement(selector) {
    const element = document.querySelector(selector);
    
    if (!element) {
      this.log('Target element not found:', selector);
      this.hideSpotlight();
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = this.config.spotlightPadding;

    this.elements.spotlight.style.top = `${rect.top - padding + window.scrollY}px`;
    this.elements.spotlight.style.left = `${rect.left - padding}px`;
    this.elements.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.elements.spotlight.style.height = `${rect.height + padding * 2}px`;
    this.elements.spotlight.style.display = 'block';

    // Scroll into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /**
   * Hide spotlight
   */
  hideSpotlight() {
    this.elements.spotlight.style.display = 'none';
  },

  /**
   * Show tooltip
   * @param {Object} step - Step data
   */
  showTooltip(step) {
    const isWaiting = !!step.waitFor;

    this.elements.tooltip.innerHTML = `
      <div class="tutorial-tooltip-header">
        <div class="tutorial-tooltip-step">
          Step ${this.state.currentStepIndex + 1} of ${this.state.totalSteps}
        </div>
        <h3 class="tutorial-tooltip-title">${step.title}</h3>
      </div>
      
      <div class="tutorial-tooltip-body">
        <div class="tutorial-tooltip-content">${step.content}</div>
        
        ${step.hint ? `
          <div class="tutorial-tooltip-hint">
            💡 ${step.hint}
          </div>
        ` : ''}
        
        <div class="tutorial-tooltip-actions">
          ${this.state.currentStepIndex > 0 ? `
            <button class="tutorial-btn tutorial-btn-secondary" data-action="prev">
              ← 이전
            </button>
          ` : ''}
          
          <button 
            class="tutorial-btn tutorial-btn-primary ${isWaiting ? 'tutorial-waiting' : ''}" 
            data-action="next"
            ${isWaiting ? 'disabled' : ''}
          >
            ${isWaiting ? '작업 완료 대기 중...' : 
              this.state.currentStepIndex < this.state.totalSteps - 1 ? '다음 →' : '완료'}
          </button>
        </div>
      </div>
    `;

    // Position tooltip
    this.positionTooltip(step.target);

    // Attach event listeners
    this.elements.tooltip.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleTooltipAction(action);
      });
    });
  },

  /**
   * Position tooltip relative to target
   * @param {string} selector - CSS selector
   */
  positionTooltip(selector) {
    if (!selector) {
      // Center on screen
      this.elements.tooltip.style.top = '50%';
      this.elements.tooltip.style.left = '50%';
      this.elements.tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const element = document.querySelector(selector);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const tooltipRect = this.elements.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine best position (prefer bottom, then top, then right, then left)
    let top, left, arrowClass;

    // Try bottom
    if (rect.bottom + tooltipRect.height + 24 < viewportHeight) {
      top = rect.bottom + window.scrollY + 24;
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      arrowClass = 'top';
    }
    // Try top
    else if (rect.top - tooltipRect.height - 24 > 0) {
      top = rect.top + window.scrollY - tooltipRect.height - 24;
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      arrowClass = 'bottom';
    }
    // Try right
    else if (rect.right + tooltipRect.width + 24 < viewportWidth) {
      top = rect.top + window.scrollY + rect.height / 2 - tooltipRect.height / 2;
      left = rect.right + 24;
      arrowClass = 'left';
    }
    // Default to left
    else {
      top = rect.top + window.scrollY + rect.height / 2 - tooltipRect.height / 2;
      left = rect.left - tooltipRect.width - 24;
      arrowClass = 'right';
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, viewportWidth - tooltipRect.width - 16));
    top = Math.max(16, top);

    this.elements.tooltip.style.top = `${top}px`;
    this.elements.tooltip.style.left = `${left}px`;
    this.elements.tooltip.style.transform = 'none';

    // Add arrow (placeholder for now)
    // In production, you'd calculate arrow position based on actual tooltip placement
  },

  /**
   * Setup action listener for interactive steps
   * @param {Object} step - Step data
   */
  setupActionListener(step) {
    const { type, target, expectedValue } = step.waitFor;

    this.log('Setting up action listener:', type, target);

    const handler = (e) => {
      this.log('Action detected:', e.type, e.target);

      // Validate action
      let isValid = false;

      switch (type) {
        case 'click':
          isValid = e.target.matches(target) || e.target.closest(target);
          break;
        
        case 'input':
          if (e.target.matches(target)) {
            if (expectedValue) {
              isValid = e.target.value === expectedValue;
            } else {
              isValid = e.target.value.trim().length > 0;
            }
          }
          break;
        
        case 'change':
          isValid = e.target.matches(target);
          break;
        
        case 'submit':
          isValid = e.target.matches(target) || e.target.closest(target);
          break;
      }

      if (isValid) {
        this.log('Action validated, advancing step');
        document.removeEventListener(type, handler, true);
        
        // Record action
        this.state.userActions.push({
          stepIndex: this.state.currentStepIndex,
          type,
          target,
          timestamp: Date.now()
        });

        // Advance to next step
        setTimeout(() => {
          if (this.config.autoAdvance) {
            this.nextStep();
          } else {
            // Enable next button
            const nextBtn = this.elements.tooltip.querySelector('[data-action="next"]');
            if (nextBtn) {
              nextBtn.disabled = false;
              nextBtn.classList.remove('tutorial-waiting');
              nextBtn.textContent = this.state.currentStepIndex < this.state.totalSteps - 1 ? '다음 →' : '완료';
            }
          }
        }, 500);
      }
    };

    document.addEventListener(type, handler, true);

    // Store handler for cleanup
    this._currentActionHandler = { type, handler };
  },

  /**
   * Handle tooltip action
   * @param {string} action - Action type
   */
  handleTooltipAction(action) {
    switch (action) {
      case 'next':
        this.nextStep();
        break;
      case 'prev':
        this.prevStep();
        break;
    }
  },

  /**
   * Handle control action
   * @param {string} action - Action type
   */
  handleControlAction(action) {
    switch (action) {
      case 'skip':
        this.skip();
        break;
      case 'restart':
        this.restart();
        break;
      case 'exit':
        this.exit();
        break;
    }
  },

  /**
   * Go to next step
   */
  nextStep() {
    // Mark current step as completed
    this.state.stepsCompleted.push(this.state.currentStepIndex);

    // Cleanup action listener
    if (this._currentActionHandler) {
      document.removeEventListener(
        this._currentActionHandler.type,
        this._currentActionHandler.handler,
        true
      );
      this._currentActionHandler = null;
    }

    // Check if last step
    if (this.state.currentStepIndex >= this.state.totalSteps - 1) {
      this.complete();
      return;
    }

    // Show next step
    this.showStep(this.state.currentStepIndex + 1);
  },

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.state.currentStepIndex > 0) {
      // Cleanup action listener
      if (this._currentActionHandler) {
        document.removeEventListener(
          this._currentActionHandler.type,
          this._currentActionHandler.handler,
          true
        );
        this._currentActionHandler = null;
      }

      this.showStep(this.state.currentStepIndex - 1);
    }
  },

  /**
   * Update progress bar
   */
  updateProgress() {
    const progress = ((this.state.currentStepIndex + 1) / this.state.totalSteps) * 100;
    this.elements.progressBar.style.width = `${progress}%`;
  },

  /**
   * Complete tutorial
   */
  complete() {
    const duration = Date.now() - this.state.startTime;

    this.log('Tutorial completed:', {
      tutorialId: this.state.currentTutorialId,
      duration,
      stepsCompleted: this.state.stepsCompleted.length
    });

    // Track event
    this.trackEvent('tutorial_completed', {
      tutorialId: this.state.currentTutorialId,
      duration,
      stepsCompleted: this.state.stepsCompleted.length,
      totalSteps: this.state.totalSteps
    });

    // Save progress
    this.saveProgress('completed');

    // Call onComplete callback
    if (this.currentTutorial.onComplete) {
      this.currentTutorial.onComplete({
        duration,
        stepsCompleted: this.state.stepsCompleted,
        userActions: this.state.userActions
      });
    }

    // Show completion message
    this.showCompletionMessage();

    // Cleanup after delay
    setTimeout(() => {
      this.cleanup();
    }, 3000);
  },

  /**
   * Show completion message
   */
  showCompletionMessage() {
    this.hideSpotlight();

    this.elements.tooltip.innerHTML = `
      <div class="tutorial-tooltip-header">
        <div class="tutorial-tooltip-step">축하합니다! 🎉</div>
        <h3 class="tutorial-tooltip-title">튜토리얼 완료!</h3>
      </div>
      
      <div class="tutorial-tooltip-body">
        <div class="tutorial-tooltip-content">
          <strong>${this.currentTutorial.title}</strong> 튜토리얼을 성공적으로 완료했습니다!
        </div>
        
        <div class="tutorial-tooltip-actions">
          <button class="tutorial-btn tutorial-btn-primary" data-action="close">
            닫기
          </button>
        </div>
      </div>
    `;

    // Center tooltip
    this.elements.tooltip.style.top = '50%';
    this.elements.tooltip.style.left = '50%';
    this.elements.tooltip.style.transform = 'translate(-50%, -50%)';

    // Attach event listener
    this.elements.tooltip.querySelector('[data-action="close"]').addEventListener('click', () => {
      this.cleanup();
    });
  },

  /**
   * Skip tutorial
   */
  skip() {
    if (!confirm('튜토리얼을 건너뛰시겠습니까?')) {
      return;
    }

    this.log('Tutorial skipped');

    // Track event
    this.trackEvent('tutorial_skipped', {
      tutorialId: this.state.currentTutorialId,
      currentStep: this.state.currentStepIndex,
      duration: Date.now() - this.state.startTime
    });

    // Save progress
    this.saveProgress('skipped');

    // Call onSkip callback
    if (this.currentTutorial.onSkip) {
      this.currentTutorial.onSkip({
        currentStep: this.state.currentStepIndex,
        stepsCompleted: this.state.stepsCompleted
      });
    }

    this.cleanup();
  },

  /**
   * Restart tutorial
   */
  restart() {
    if (!confirm('튜토리얼을 처음부터 다시 시작하시겠습니까?')) {
      return;
    }

    this.log('Tutorial restarted');

    // Track event
    this.trackEvent('tutorial_restarted', {
      tutorialId: this.state.currentTutorialId,
      previousStep: this.state.currentStepIndex
    });

    // Reset state
    this.state.currentStepIndex = 0;
    this.state.stepsCompleted = [];
    this.state.userActions = [];
    this.state.startTime = Date.now();

    // Show first step
    this.showStep(0);
  },

  /**
   * Exit tutorial
   */
  exit() {
    if (!confirm('튜토리얼을 종료하시겠습니까?')) {
      return;
    }

    this.log('Tutorial exited');

    // Track event
    this.trackEvent('tutorial_exited', {
      tutorialId: this.state.currentTutorialId,
      currentStep: this.state.currentStepIndex,
      duration: Date.now() - this.state.startTime
    });

    // Save progress
    this.saveProgress('exited');

    this.cleanup();
  },

  /**
   * Check prerequisites
   */
  async checkPrerequisites() {
    // Check if prerequisite tutorials are completed
    const completed = JSON.parse(localStorage.getItem('tutorial_progress') || '{}');
    
    return this.currentTutorial.prerequisites.every(prereqId => {
      return completed[prereqId]?.status === 'completed';
    });
  },

  /**
   * Show prerequisites warning
   */
  showPrerequisitesWarning() {
    console.log(`이 튜토리얼을 시작하려면 먼저 다음 튜토리얼을 완료해야 합니다:\n\n${
      this.currentTutorial.prerequisites.map(id => `- ${this.tutorials[id]?.title || id}`).join('\n')
    }`);
  },

  /**
   * Save progress
   */
  saveProgress(status) {
    if (!this.config.enableProgress) return;

    try {
      const progress = JSON.parse(localStorage.getItem('tutorial_progress') || '{}');
      
      progress[this.state.currentTutorialId] = {
        status,
        currentStep: this.state.currentStepIndex,
        stepsCompleted: this.state.stepsCompleted,
        lastUpdated: new Date().toISOString(),
        duration: Date.now() - this.state.startTime
      };

      localStorage.setItem('tutorial_progress', JSON.stringify(progress));
      
      this.log('Progress saved:', progress[this.state.currentTutorialId]);
    } catch (error) {
      console.error('[TutorialEngine] Failed to save progress:', error);
    }
  },

  /**
   * Track event
   */
  trackEvent(eventName, data = {}) {
    const event = {
      type: 'tutorial',
      name: eventName,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.log('Track event:', event);

    // Store in localStorage
    try {
      const events = JSON.parse(localStorage.getItem('tutorial_events') || '[]');
      events.push(event);
      localStorage.setItem('tutorial_events', JSON.stringify(events.slice(-100)));
    } catch (error) {
      console.error('[TutorialEngine] Failed to track event:', error);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('tutorial:event', {
      detail: event
    }));
  },

  /**
   * Cleanup UI
   */
  cleanup() {
    // Cleanup action listener
    if (this._currentActionHandler) {
      document.removeEventListener(
        this._currentActionHandler.type,
        this._currentActionHandler.handler,
        true
      );
      this._currentActionHandler = null;
    }

    // Remove elements
    if (this.elements.overlay) this.elements.overlay.remove();
    if (this.elements.spotlight) this.elements.spotlight.remove();
    if (this.elements.tooltip) this.elements.tooltip.remove();
    if (this.elements.progressBar) this.elements.progressBar.parentElement.remove();
    
    const controls = document.querySelector('.tutorial-controls');
    if (controls) controls.remove();

    // Reset state
    this.state.isActive = false;
    this.state.currentTutorialId = null;
    this.currentTutorial = null;

    this.log('Tutorial cleanup complete');
  },

  /**
   * Log (debug mode)
   */
  log(...args) {
    if (this.config.debugMode) {
      console.log('[TutorialEngine]', ...args);
    }
  },

  /**
   * Get tutorial progress
   */
  getProgress(tutorialId) {
    try {
      const progress = JSON.parse(localStorage.getItem('tutorial_progress') || '{}');
      return progress[tutorialId] || null;
    } catch (error) {
      console.error('[TutorialEngine] Failed to get progress:', error);
      return null;
    }
  },

  /**
   * Get all tutorial progress
   */
  getAllProgress() {
    try {
      return JSON.parse(localStorage.getItem('tutorial_progress') || '{}');
    } catch (error) {
      console.error('[TutorialEngine] Failed to get all progress:', error);
      return {};
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TutorialEngine;
}
