/**
 * MuseFlow Canvas V5 - Sample Workflow Fix
 * Ensure sample workflow is immediately visible
 */

const SampleWorkflowFix = {
  loaded: false,
  
  /**
   * Load and display sample workflow immediately
   */
  loadSample() {
    if (this.loaded || !window.CanvasV3) return;
    
    console.log('[SampleWorkflow] Loading visible sample...');
    
    // Clear existing
    CanvasV3.nodes = [];
    CanvasV3.connections = [];
    
    // Create 3 sample nodes with emoji icons
    CanvasV3.nodes = [
      {
        id: 'sample-1',
        type: 'exhibition-planning',
        title: '🎨 전시 기획안 작성',
        description: '전시 컨셉과 목표 수립',
        x: 100,
        y: 200,
        width: 220,
        height: 100,
        color: '#8b5cf6',
        icon: 'palette',
        status: 'done',
        category: 'exhibition'
      },
      {
        id: 'sample-2',
        type: 'budget-planning',
        title: '💰 예산 편성',
        description: '전시 예산 계획 수립',
        x: 380,
        y: 200,
        width: 220,
        height: 100,
        color: '#ec4899',
        icon: 'dollar-sign',
        status: 'in-progress',
        category: 'admin'
      },
      {
        id: 'sample-3',
        type: 'ai-gemini-generate',
        title: '🤖 AI 홍보 문구 생성',
        description: 'Gemini로 홍보 콘텐츠 자동 생성',
        x: 660,
        y: 200,
        width: 220,
        height: 100,
        color: '#f59e0b',
        icon: 'sparkles',
        status: 'todo',
        category: 'ai'
      }
    ];
    
    // Create connections
    CanvasV3.connections = [
      {
        id: 'conn-1',
        from: 'sample-1',
        to: 'sample-2',
        type: 'normal'
      },
      {
        id: 'conn-2',
        from: 'sample-2',
        to: 'sample-3',
        type: 'ai'
      }
    ];
    
    this.loaded = true;
    
    // Force immediate render
    if (window.CanvasEngine) {
      CanvasEngine.needsRedraw = true;
      
      // Fit to content after 500ms
      setTimeout(() => {
        CanvasEngine.fitToContent(CanvasV3.nodes);
        console.log('[SampleWorkflow] ✅ Sample workflow displayed and fitted');
      }, 500);
    }
    
    // Show welcome toast
    setTimeout(() => {
      if (window.Toast) {
        Toast.success('✨ 샘플 워크플로우가 로드되었습니다!\n\n노드를 드래그하거나 연결해보세요.', 5000);
      }
    }, 1000);
  },
  
  /**
   * Initialize - wait for Canvas V3
   */
  init() {
    const checkCanvas = setInterval(() => {
      if (window.CanvasV3 && window.CanvasEngine) {
        clearInterval(checkCanvas);
        
        // Wait for canvas to be fully initialized
        setTimeout(() => {
          this.loadSample();
        }, 1500);
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkCanvas), 10000);
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SampleWorkflowFix.init();
  });
} else {
  SampleWorkflowFix.init();
}
