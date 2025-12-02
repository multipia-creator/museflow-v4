/**
 * Curator AI Workflows - 학예사 업무 자동화
 * AI Orchestration for Museum Professionals
 */

const CuratorAIWorkflows = {
  // 워크플로우 템플릿
  templates: {
    exhibitionPlanning: {
      id: 'exhibition-planning',
      name: '전시 기획 자동화',
      description: '전시 아이디어부터 홍보까지 8시간 → 1시간',
      category: 'exhibition',
      icon: 'palette',
      estimatedTime: '1시간',
      savings: '87.5%',
      nodes: [
        { type: 'input', title: '전시 아이디어', x: 100, y: 200 },
        { type: 'ai-gemini-research', title: '작품 리서치', x: 350, y: 200 },
        { type: 'ai-docs-create', title: '기획안 작성', x: 600, y: 200 },
        { type: 'ai-budget-calc', title: '예산 계산', x: 850, y: 200 },
        { type: 'ai-calendar', title: '일정 생성', x: 1100, y: 200 },
        { type: 'ai-gemini-copywrite', title: '홍보 문구', x: 1350, y: 200 }
      ]
    },
    
    artworkRegistration: {
      id: 'artwork-registration',
      name: '소장품 등록 자동화',
      description: '신규 작품 등록 4시간 → 20분',
      category: 'collection',
      icon: 'image',
      estimatedTime: '20분',
      savings: '91.7%',
      nodes: [
        { type: 'input', title: '작품 기본 정보', x: 100, y: 200 },
        { type: 'ai-gemini-research', title: '작품 조사', x: 350, y: 200 },
        { type: 'ai-conservation', title: '보존 분석', x: 600, y: 200 },
        { type: 'ai-appraisal', title: '감정/가액', x: 850, y: 200 },
        { type: 'database', title: 'DB 입력', x: 1100, y: 200 }
      ]
    },
    
    educationProgram: {
      id: 'education-program',
      name: '교육 프로그램 생성',
      description: '교육 프로그램 기획 6시간 → 1.5시간',
      category: 'education',
      icon: 'graduation-cap',
      estimatedTime: '1.5시간',
      savings: '75%',
      nodes: [
        { type: 'input', title: '대상/주제', x: 100, y: 200 },
        { type: 'ai-curriculum', title: '커리큘럼', x: 350, y: 200 },
        { type: 'ai-worksheet', title: '활동지', x: 600, y: 200 },
        { type: 'ai-quiz', title: '퀴즈 생성', x: 850, y: 200 },
        { type: 'ai-sns-post', title: 'SNS 홍보', x: 1100, y: 200 }
      ]
    },
    
    researchPaper: {
      id: 'research-paper',
      name: '학술 논문 작성 지원',
      description: '논문 작성 20시간 → 5시간',
      category: 'research',
      icon: 'book-open',
      estimatedTime: '5시간',
      savings: '75%',
      nodes: [
        { type: 'input', title: '연구 주제', x: 100, y: 200 },
        { type: 'ai-literature', title: '문헌 조사', x: 350, y: 200 },
        { type: 'ai-citation', title: '참고문헌', x: 600, y: 200 },
        { type: 'ai-academic', title: '초안 작성', x: 850, y: 200 },
        { type: 'ai-translate', title: '영문 번역', x: 1100, y: 200 }
      ]
    },
    
    budgetReport: {
      id: 'budget-report',
      name: '예산 보고서 자동 생성',
      description: '예산 보고서 3시간 → 30분',
      category: 'admin',
      icon: 'dollar-sign',
      estimatedTime: '30분',
      savings: '83.3%',
      nodes: [
        { type: 'ai-data-collect', title: '지출 데이터', x: 100, y: 200 },
        { type: 'ai-budget-analysis', title: '예산 분석', x: 350, y: 200 },
        { type: 'ai-chart', title: '차트 생성', x: 600, y: 200 },
        { type: 'ai-docs-report', title: '보고서', x: 850, y: 200 }
      ]
    }
  },
  
  init() {
    this.addTemplateGalleryButton();
    this.addQuickStartButton();
    console.log('✅ Curator AI Workflows initialized');
  },
  
  addTemplateGalleryButton() {
    const toolbar = document.querySelector('.toolbar-right');
    if (!toolbar || document.getElementById('template-gallery-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'template-gallery-btn';
    btn.className = 'tool-btn ai-btn';
    btn.title = 'AI 워크플로우 템플릿';
    btn.innerHTML = '<i data-lucide="layout-template" style="width: 20px; height: 20px;"></i>';
    btn.onclick = () => this.showTemplateGallery();
    
    toolbar.insertBefore(btn, toolbar.firstChild);
    
    if (window.lucide) lucide.createIcons();
  },
  
  addQuickStartButton() {
    // Add floating quick start button
    if (document.getElementById('quick-start-btn')) return;
    
    const quickStart = document.createElement('div');
    quickStart.id = 'quick-start-btn';
    quickStart.className = 'quick-start-floating';
    quickStart.innerHTML = `
      <button class="quick-start-toggle" onclick="CuratorAIWorkflows.showQuickStart()">
        <i data-lucide="rocket" style="width: 24px; height: 24px; color: white;"></i>
        <span class="pulse-ring"></span>
      </button>
    `;
    
    document.body.appendChild(quickStart);
    
    if (window.lucide) lucide.createIcons();
  },
  
  showTemplateGallery() {
    const modal = document.createElement('div');
    modal.className = 'template-gallery-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="gallery-content">
        <div class="gallery-header">
          <h2>🎨 학예사 AI 워크플로우 템플릿</h2>
          <p>AI 자동화로 업무 시간을 80% 단축하세요</p>
          <button class="modal-close" onclick="this.closest('.template-gallery-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="template-grid">
          ${Object.values(this.templates).map(template => `
            <div class="template-card" onclick="CuratorAIWorkflows.loadTemplate('${template.id}')">
              <div class="template-icon">
                <i data-lucide="${template.icon}" style="width: 32px; height: 32px;"></i>
              </div>
              <h3>${template.name}</h3>
              <p>${template.description}</p>
              <div class="template-meta">
                <span class="meta-item">
                  <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                  ${template.estimatedTime}
                </span>
                <span class="meta-item savings">
                  <i data-lucide="trending-down" style="width: 14px; height: 14px;"></i>
                  ${template.savings} 절감
                </span>
              </div>
              <button class="use-template-btn">
                <i data-lucide="play-circle" style="width: 16px; height: 16px;"></i>
                사용하기
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="gallery-footer">
          <p>💡 <strong>Tip:</strong> 템플릿을 불러온 후 자신의 업무에 맞게 수정할 수 있습니다</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (window.lucide) lucide.createIcons();
  },
  
  showQuickStart() {
    const modal = document.createElement('div');
    modal.className = 'quick-start-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="quick-start-content">
        <div class="quick-start-header">
          <h2>🚀 빠른 시작</h2>
          <button class="modal-close" onclick="this.closest('.quick-start-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        
        <div class="quick-start-options">
          <button class="quick-start-card" onclick="CuratorAIWorkflows.quickAction('exhibition')">
            <i data-lucide="palette" style="width: 40px; height: 40px; color: #8b5cf6;"></i>
            <h3>전시 기획하기</h3>
            <p>AI가 작품 리서치부터 기획안까지</p>
          </button>
          
          <button class="quick-start-card" onclick="CuratorAIWorkflows.quickAction('artwork')">
            <i data-lucide="image" style="width: 40px; height: 40px; color: #ec4899;"></i>
            <h3>작품 등록하기</h3>
            <p>AI가 작품 정보를 자동으로 조사</p>
          </button>
          
          <button class="quick-start-card" onclick="CuratorAIWorkflows.quickAction('education')">
            <i data-lucide="graduation-cap" style="width: 40px; height: 40px; color: #f59e0b;"></i>
            <h3>교육 프로그램</h3>
            <p>AI가 커리큘럼과 활동지 생성</p>
          </button>
          
          <button class="quick-start-card" onclick="CuratorAIWorkflows.quickAction('research')">
            <i data-lucide="book-open" style="width: 40px; height: 40px; color: #10b981;"></i>
            <h3>논문 작성하기</h3>
            <p>AI가 문헌 조사와 초안 작성</p>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (window.lucide) lucide.createIcons();
  },
  
  quickAction(type) {
    document.querySelector('.quick-start-modal')?.remove();
    
    const templateMap = {
      'exhibition': 'exhibitionPlanning',
      'artwork': 'artworkRegistration',
      'education': 'educationProgram',
      'research': 'researchPaper'
    };
    
    const templateId = templateMap[type];
    if (templateId) {
      this.loadTemplate(templateId);
    }
  },
  
  loadTemplate(templateId) {
    const template = this.templates[templateId];
    if (!template) return;
    
    // Close modals
    document.querySelector('.template-gallery-modal')?.remove();
    
    // Show loading
    Toast.info(`"${template.name}" 템플릿을 불러오는 중...`, 2000);
    
    setTimeout(() => {
      if (!window.CanvasV3) return;
      
      // Create nodes
      const nodes = template.nodes.map((nodeConfig, index) => {
        const nodeInfo = this.getNodeInfo(nodeConfig.type);
        
        return {
          id: `node-${Date.now()}-${index}`,
          type: nodeConfig.type,
          category: nodeInfo?.category || 'basic',
          title: nodeConfig.title,
          description: '',
          x: nodeConfig.x,
          y: nodeConfig.y,
          width: 180,
          height: 80,
          color: nodeInfo?.color || '#8b5cf6',
          icon: nodeInfo?.icon || 'box',
          status: 'todo'
        };
      });
      
      // Create connections
      const connections = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        connections.push({
          id: `conn-${Date.now()}-${i}`,
          from: nodes[i].id,
          to: nodes[i + 1].id
        });
      }
      
      // Load to canvas
      CanvasV3.nodes = nodes;
      CanvasV3.connections = connections;
      CanvasV3.currentProject.name = template.name;
      
      // Update UI
      document.getElementById('project-title').textContent = template.name;
      
      if (window.CanvasEngine) {
        CanvasEngine.needsRedraw = true;
        
        // Fit to view
        setTimeout(() => {
          CanvasEngine.fitToContent(nodes);
        }, 100);
      }
      
      // Save
      CanvasV3.saveProjectData();
      
      Toast.success(`✨ "${template.name}" 템플릿을 불러왔습니다!\n예상 시간: ${template.estimatedTime}, ${template.savings} 절감`, 5000);
      
      // Show guide
      setTimeout(() => {
        this.showTemplateGuide(template);
      }, 1000);
    }, 500);
  },
  
  showTemplateGuide(template) {
    const guide = document.createElement('div');
    guide.className = 'template-guide';
    guide.innerHTML = `
      <div class="guide-content">
        <h3>🎯 워크플로우 가이드</h3>
        <p><strong>${template.name}</strong></p>
        <ul>
          <li>1️⃣ 첫 번째 노드에 정보를 입력하세요</li>
          <li>2️⃣ AI 노드가 자동으로 작업을 처리합니다</li>
          <li>3️⃣ 각 단계의 결과를 검토하세요</li>
          <li>4️⃣ 필요시 노드를 추가하거나 수정하세요</li>
        </ul>
        <button class="guide-close-btn" onclick="this.closest('.template-guide').remove()">
          알겠습니다
        </button>
      </div>
    `;
    
    document.body.appendChild(guide);
  },
  
  getNodeInfo(type) {
    // Basic node types
    const basicTypes = {
      'input': { category: 'basic', color: '#6366f1', icon: 'edit-3' },
      'database': { category: 'data', color: '#3b82f6', icon: 'database' },
      'ai-gemini-research': { category: 'ai', color: '#8b5cf6', icon: 'search' },
      'ai-docs-create': { category: 'ai', color: '#ec4899', icon: 'file-text' },
      'ai-budget-calc': { category: 'ai', color: '#f59e0b', icon: 'calculator' },
      'ai-calendar': { category: 'ai', color: '#10b981', icon: 'calendar' },
      'ai-gemini-copywrite': { category: 'ai', color: '#8b5cf6', icon: 'pen-tool' },
      'ai-conservation': { category: 'ai', color: '#6366f1', icon: 'shield' },
      'ai-appraisal': { category: 'ai', color: '#f59e0b', icon: 'dollar-sign' },
      'ai-curriculum': { category: 'ai', color: '#10b981', icon: 'book' },
      'ai-worksheet': { category: 'ai', color: '#3b82f6', icon: 'file-text' },
      'ai-quiz': { category: 'ai', color: '#ec4899', icon: 'help-circle' },
      'ai-sns-post': { category: 'ai', color: '#8b5cf6', icon: 'share-2' },
      'ai-literature': { category: 'ai', color: '#6366f1', icon: 'book-open' },
      'ai-citation': { category: 'ai', color: '#3b82f6', icon: 'quote' },
      'ai-academic': { category: 'ai', color: '#ec4899', icon: 'pen-tool' },
      'ai-translate': { category: 'ai', color: '#10b981', icon: 'languages' },
      'ai-data-collect': { category: 'ai', color: '#3b82f6', icon: 'database' },
      'ai-budget-analysis': { category: 'ai', color: '#f59e0b', icon: 'trending-up' },
      'ai-chart': { category: 'ai', color: '#10b981', icon: 'bar-chart' },
      'ai-docs-report': { category: 'ai', color: '#8b5cf6', icon: 'file-text' }
    };
    
    return basicTypes[type] || { category: 'basic', color: '#6b7280', icon: 'box' };
  }
};

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .template-gallery-modal,
  .quick-start-modal {
    position: fixed;
    inset: 0;
    z-index: 10002;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .gallery-content,
  .quick-start-content {
    position: relative;
    background: white;
    border-radius: 24px;
    max-width: 900px;
    width: 90%;
    max-height: 85vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease;
  }
  
  .gallery-header,
  .quick-start-header {
    padding: 32px;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
  }
  
  .gallery-header h2,
  .quick-start-header h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }
  
  .gallery-header p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
  
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 32px;
  }
  
  .template-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .template-card:hover {
    border-color: #8b5cf6;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
  }
  
  .template-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: white;
  }
  
  .template-card h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }
  
  .template-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .template-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 6px;
  }
  
  .meta-item.savings {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    font-weight: 600;
  }
  
  .use-template-btn {
    width: 100%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;
  }
  
  .use-template-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  }
  
  .gallery-footer {
    padding: 20px 32px 32px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }
  
  .quick-start-floating {
    position: fixed;
    right: 120px;
    bottom: 2rem;
    z-index: 997;
  }
  
  .quick-start-toggle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    transition: all 0.3s ease;
    position: relative;
  }
  
  .quick-start-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.7);
  }
  
  .pulse-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 3px solid rgba(16, 185, 129, 0.5);
    animation: pulse-ring 2s ease-out infinite;
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  
  .quick-start-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 32px;
  }
  
  .quick-start-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .quick-start-card:hover {
    border-color: #8b5cf6;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
  }
  
  .quick-start-card h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
  }
  
  .quick-start-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  .template-guide {
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 10000;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    animation: slideInRight 0.3s ease;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .guide-content h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #1a1a1a;
  }
  
  .guide-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
  }
  
  .guide-content ul {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
  }
  
  .guide-content li {
    font-size: 14px;
    color: #1a1a1a;
    margin-bottom: 8px;
    line-height: 1.6;
  }
  
  .guide-close-btn {
    width: 100%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .guide-close-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  }
  
  @media (max-width: 768px) {
    .template-grid {
      grid-template-columns: 1fr;
      padding: 20px;
    }
    
    .quick-start-options {
      grid-template-columns: 1fr;
    }
    
    .quick-start-floating {
      right: 20px;
      bottom: 100px;
    }
    
    .template-guide {
      left: 20px;
      right: 20px;
      max-width: none;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => CuratorAIWorkflows.init(), 1500);
  });
} else {
  setTimeout(() => CuratorAIWorkflows.init(), 1500);
}

console.log('✅ Curator AI Workflows loaded');
