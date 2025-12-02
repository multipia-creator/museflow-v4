/**
 * Onboarding System - Interactive Tutorial
 * First-time user experience optimization
 */

const Onboarding = {
  currentStep: 0,
  isActive: false,
  
  steps: [
    {
      target: '.left-panel',
      title: '🎨 노드 라이브러리',
      content: '왼쪽 패널에서 88개의 전문 노드를 선택할 수 있습니다. 드래그하여 캔버스에 배치하세요.',
      position: 'right',
      highlight: true,
      action: () => {
        document.querySelector('.left-panel').style.transform = 'translateX(0)';
      }
    },
    {
      target: '#node-search',
      title: '🔍 빠른 검색',
      content: '노드가 너무 많으신가요? 검색창으로 원하는 노드를 빠르게 찾으세요!',
      position: 'bottom',
      highlight: true
    },
    {
      target: '.canvas-container',
      title: '✨ 캔버스',
      content: '여기에 노드를 배치하고 연결하여 워크플로우를 만드세요. 마우스 휠로 줌, 드래그로 이동할 수 있습니다.',
      position: 'center',
      highlight: false
    },
    {
      target: '.floating-toolbar',
      title: '🛠️ 도구 모음',
      content: 'Select(V), Hand(H), Connection(C) 도구를 사용하세요. 키보드 단축키도 지원합니다!',
      position: 'top',
      highlight: true
    },
    {
      target: '.ai-quick-panel',
      title: '🤖 AI 기능',
      content: 'AI로 자동화된 워크플로우를 만들어보세요! Gemini, Docs, Gmail 등 11개 AI 노드를 사용할 수 있습니다.',
      position: 'left',
      highlight: true
    },
    {
      target: '.right-panel',
      title: '⚙️ 속성 패널',
      content: '노드를 선택하면 여기서 세부 정보를 편집할 수 있습니다.',
      position: 'left',
      highlight: true
    }
  ],
  
  sampleWorkflows: {
    beginner: {
      name: '첫 번째 전시 기획',
      description: '간단한 전시 기획 워크플로우 예제',
      nodes: [
        { 
          id: 'sample-1',
          type: 'ex-01',
          category: 'exhibition',
          x: 150,
          y: 150,
          width: 180,
          height: 80,
          title: '전시 기획안',
          description: '2025년 봄 특별전',
          color: '#8b5cf6'
        },
        {
          id: 'sample-2',
          type: 'ai-gemini-generate',
          category: 'ai',
          x: 400,
          y: 150,
          width: 180,
          height: 80,
          title: 'AI 작품 리서치',
          description: 'Gemini로 작품 정보 수집',
          color: '#ec4899'
        },
        {
          id: 'sample-3',
          type: 'ex-02',
          category: 'exhibition',
          x: 650,
          y: 150,
          width: 180,
          height: 80,
          title: '예산 편성',
          description: '전시 예산 계획',
          color: '#8b5cf6'
        }
      ],
      connections: [
        { id: 'conn-1', from: 'sample-1', to: 'sample-2' },
        { id: 'conn-2', from: 'sample-2', to: 'sample-3' }
      ]
    },
    
    aiWorkflow: {
      name: 'AI 자동화 워크플로우',
      description: '학예사 업무 자동화 예제',
      nodes: [
        {
          id: 'ai-1',
          type: 'input',
          category: 'basic',
          x: 100,
          y: 200,
          width: 180,
          height: 80,
          title: '전시 주제 입력',
          description: '르네상스 미술',
          color: '#6366f1'
        },
        {
          id: 'ai-2',
          type: 'ai-gemini-research',
          category: 'ai',
          x: 350,
          y: 200,
          width: 180,
          height: 80,
          title: '작품 리서치',
          description: 'AI가 작품 정보 조사',
          color: '#8b5cf6'
        },
        {
          id: 'ai-3',
          type: 'ai-docs-create',
          category: 'ai',
          x: 600,
          y: 200,
          width: 180,
          height: 80,
          title: '기획안 작성',
          description: 'AI가 기획안 생성',
          color: '#ec4899'
        },
        {
          id: 'ai-4',
          type: 'ai-calendar',
          category: 'ai',
          x: 850,
          y: 200,
          width: 180,
          height: 80,
          title: '일정 생성',
          description: 'AI가 일정 자동 생성',
          color: '#f59e0b'
        }
      ],
      connections: [
        { id: 'ai-conn-1', from: 'ai-1', to: 'ai-2' },
        { id: 'ai-conn-2', from: 'ai-2', to: 'ai-3' },
        { id: 'ai-conn-3', from: 'ai-3', to: 'ai-4' }
      ]
    }
  },
  
  init() {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_completed');
    
    if (!completed && !window.location.hash.includes('skip-onboarding')) {
      setTimeout(() => this.start(), 1000);
    }
    
    // Add skip button to UI
    this.addSkipButton();
  },
  
  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.showWelcomeModal();
  },
  
  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'onboarding-welcome-modal';
    modal.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-icon">🎨</div>
        <h2>MuseFlow Canvas V3에 오신 것을 환영합니다!</h2>
        <p>세계 최초의 학예사 전용 AI Orchestration 플랫폼입니다.</p>
        
        <div class="welcome-features">
          <div class="feature-item">
            <i data-lucide="zap" style="width: 24px; height: 24px; color: #8b5cf6;"></i>
            <span>88개 전문 노드</span>
          </div>
          <div class="feature-item">
            <i data-lucide="sparkles" style="width: 24px; height: 24px; color: #ec4899;"></i>
            <span>11개 AI 자동화</span>
          </div>
          <div class="feature-item">
            <i data-lucide="layout-grid" style="width: 24px; height: 24px; color: #f59e0b;"></i>
            <span>무한 캔버스</span>
          </div>
        </div>
        
        <div class="welcome-buttons">
          <button class="btn-primary" onclick="Onboarding.startTutorial()">
            <i data-lucide="play-circle"></i>
            튜토리얼 시작 (추천)
          </button>
          <button class="btn-secondary" onclick="Onboarding.loadSample('beginner')">
            <i data-lucide="file-code"></i>
            샘플 워크플로우 보기
          </button>
          <button class="btn-text" onclick="Onboarding.skip()">
            건너뛰기
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },
  
  startTutorial() {
    // Remove welcome modal
    document.querySelector('.onboarding-welcome-modal')?.remove();
    
    // Show first step
    this.showStep(0);
  },
  
  showStep(index) {
    if (index >= this.steps.length) {
      this.complete();
      return;
    }
    
    this.currentStep = index;
    const step = this.steps[index];
    
    // Create overlay
    this.createOverlay();
    
    // Highlight target
    if (step.highlight && step.target) {
      this.highlightElement(step.target);
    }
    
    // Execute step action
    if (step.action) {
      step.action();
    }
    
    // Show tooltip
    this.showTooltip(step);
  },
  
  createOverlay() {
    // Remove existing overlay
    document.querySelector('.onboarding-overlay')?.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      pointer-events: auto;
    `;
    
    document.body.appendChild(overlay);
  },
  
  highlightElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    
    // Create highlight
    const highlight = document.createElement('div');
    highlight.className = 'onboarding-highlight';
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left - 8}px;
      top: ${rect.top - 8}px;
      width: ${rect.width + 16}px;
      height: ${rect.height + 16}px;
      border: 3px solid #8b5cf6;
      border-radius: 12px;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3),
                  0 0 40px rgba(139, 92, 246, 0.5);
      z-index: 9999;
      pointer-events: none;
      animation: pulse-border 2s ease-in-out infinite;
    `;
    
    document.body.appendChild(highlight);
  },
  
  showTooltip(step) {
    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    
    const target = document.querySelector(step.target);
    const rect = target ? target.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <h3>${step.title}</h3>
        <span class="step-counter">${this.currentStep + 1}/${this.steps.length}</span>
      </div>
      <p>${step.content}</p>
      <div class="tooltip-buttons">
        ${this.currentStep > 0 ? '<button class="btn-text" onclick="Onboarding.prevStep()">이전</button>' : ''}
        <button class="btn-primary" onclick="Onboarding.nextStep()">
          ${this.currentStep < this.steps.length - 1 ? '다음' : '완료'}
        </button>
        <button class="btn-text" onclick="Onboarding.skip()">건너뛰기</button>
      </div>
    `;
    
    // Position tooltip
    let tooltipStyle = `
      position: fixed;
      z-index: 10000;
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      animation: fadeInUp 0.3s ease;
    `;
    
    switch(step.position) {
      case 'right':
        tooltipStyle += `left: ${rect.right + 20}px; top: ${rect.top}px;`;
        break;
      case 'left':
        tooltipStyle += `right: ${window.innerWidth - rect.left + 20}px; top: ${rect.top}px;`;
        break;
      case 'bottom':
        tooltipStyle += `left: ${rect.left}px; top: ${rect.bottom + 20}px;`;
        break;
      case 'top':
        tooltipStyle += `left: ${rect.left}px; bottom: ${window.innerHeight - rect.top + 20}px;`;
        break;
      case 'center':
      default:
        tooltipStyle += `left: 50%; top: 50%; transform: translate(-50%, -50%);`;
    }
    
    tooltip.style.cssText = tooltipStyle;
    document.body.appendChild(tooltip);
  },
  
  nextStep() {
    this.clearStep();
    this.showStep(this.currentStep + 1);
  },
  
  prevStep() {
    if (this.currentStep > 0) {
      this.clearStep();
      this.showStep(this.currentStep - 1);
    }
  },
  
  clearStep() {
    document.querySelector('.onboarding-overlay')?.remove();
    document.querySelector('.onboarding-highlight')?.remove();
    document.querySelector('.onboarding-tooltip')?.remove();
  },
  
  complete() {
    this.clearStep();
    localStorage.setItem('onboarding_completed', 'true');
    this.isActive = false;
    
    // Show completion message
    Toast.success('온보딩을 완료했습니다! 이제 워크플로우를 만들어보세요 🎉', 5000);
    
    // Offer to load sample
    setTimeout(() => {
      if (confirm('샘플 워크플로우를 불러올까요?')) {
        this.loadSample('beginner');
      }
    }, 1000);
  },
  
  skip() {
    if (confirm('온보딩을 건너뛰시겠습니까?')) {
      this.clearStep();
      document.querySelector('.onboarding-welcome-modal')?.remove();
      localStorage.setItem('onboarding_completed', 'true');
      this.isActive = false;
      Toast.info('언제든지 도움말(?)에서 튜토리얼을 다시 볼 수 있습니다', 3000);
    }
  },
  
  loadSample(type) {
    const sample = this.sampleWorkflows[type];
    if (!sample) return;
    
    // Clear current workflow
    if (window.CanvasV3) {
      CanvasV3.nodes = sample.nodes;
      CanvasV3.connections = sample.connections;
      CanvasV3.currentProject.name = sample.name;
      
      // Update UI
      document.getElementById('project-title').textContent = sample.name;
      
      // Redraw canvas
      if (window.CanvasEngine) {
        CanvasEngine.needsRedraw = true;
      }
      
      // Save
      CanvasV3.saveProjectData();
      
      Toast.success(`샘플 워크플로우 "${sample.name}"을 불러왔습니다!`, 3000);
    }
    
    // Close modals
    document.querySelector('.onboarding-welcome-modal')?.remove();
    this.clearStep();
  },
  
  addSkipButton() {
    // Add help button to toolbar
    const toolbar = document.querySelector('.toolbar-right');
    if (toolbar && !document.getElementById('help-btn')) {
      const helpBtn = document.createElement('button');
      helpBtn.id = 'help-btn';
      helpBtn.className = 'tool-btn';
      helpBtn.title = '도움말 (?)';
      helpBtn.innerHTML = '<i data-lucide="help-circle" style="width: 20px; height: 20px;"></i>';
      helpBtn.onclick = () => {
        localStorage.removeItem('onboarding_completed');
        this.start();
      };
      
      toolbar.insertBefore(helpBtn, toolbar.firstChild);
      
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  },
  
  restart() {
    localStorage.removeItem('onboarding_completed');
    this.start();
  }
};

// Add CSS for onboarding
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse-border {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3),
                  0 0 40px rgba(139, 92, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.5),
                  0 0 60px rgba(139, 92, 246, 0.7);
    }
  }
  
  .onboarding-welcome-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: fadeIn 0.3s ease;
  }
  
  .welcome-content {
    background: white;
    border-radius: 24px;
    padding: 48px;
    max-width: 600px;
    text-align: center;
    animation: fadeInUp 0.5s ease;
  }
  
  .welcome-icon {
    font-size: 64px;
    margin-bottom: 24px;
  }
  
  .welcome-content h2 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #1a1a1a;
  }
  
  .welcome-content p {
    font-size: 16px;
    color: #6b7280;
    margin-bottom: 32px;
  }
  
  .welcome-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 32px;
  }
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .feature-item span {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .welcome-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  }
  
  .btn-secondary {
    background: #f3f4f6;
    color: #1a1a1a;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .btn-secondary:hover {
    background: #e5e7eb;
  }
  
  .btn-text {
    background: transparent;
    color: #6b7280;
    border: none;
    padding: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .btn-text:hover {
    color: #1a1a1a;
  }
  
  .onboarding-tooltip {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }
  
  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .tooltip-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }
  
  .step-counter {
    font-size: 12px;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
  }
  
  .onboarding-tooltip p {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
  .tooltip-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    .welcome-content {
      padding: 32px 24px;
      max-width: 90%;
    }
    
    .welcome-features {
      grid-template-columns: 1fr;
    }
    
    .onboarding-tooltip {
      max-width: 90% !important;
      left: 5% !important;
      right: 5% !important;
      transform: none !important;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Onboarding.init());
} else {
  Onboarding.init();
}

console.log('✅ Onboarding System loaded');
