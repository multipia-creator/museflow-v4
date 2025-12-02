/**
 * Canvas V3 - World-Class Node-Based Editor
 * Figma + Node System + Notion Style
 * 
 * Features:
 * - Infinite canvas with smooth zoom/pan
 * - 88+ specialized museum workflow nodes
 * - 4-language support (ko, en, zh, ja)
 * - Lucide Icons integration
 * - 2-level category accordion
 * - Bezier curve connections
 * - Real-time collaboration
 * - D1 database sync
 * 
 * Architecture:
 * - CanvasEngine: Viewport, zoom, pan, grid
 * - CanvasEvents: User interactions
 * - NodeFactory: Node creation and management
 * - i18n: Multi-language support
 */

const CanvasV3 = {
  // Project data
  currentProject: null,
  
  // Canvas elements
  canvasElement: null,
  
  // Nodes and connections
  nodes: [],
  connections: [],
  selectedNodes: [],
  hoveredNode: null,
  
  // Tools
  currentTool: 'select', // select | hand | connection
  
  // Interaction state
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  draggedNodes: [],
  mousePos: { x: 0, y: 0 },
  
  // Connection state
  isConnecting: false,
  connectionStart: null,
  connectionPreview: null,
  
  // UI state
  leftPanelOpen: true,
  rightPanelOpen: true,
  searchQuery: '',
  selectedCategory: 'all',
  moduleFilter: null, // Filter by module: exhibition, education, archive, publication, research, admin
  expandedSubcategories: new Set(['planning', 'installation', 'evaluation', 'program', 'execution', 'acquisition', 'preservation', 'research', 'content', 'production', 'fieldwork', 'analysis', 'strategic', 'operations', 'engagement']),
  
  // Node ID counter
  nodeIdCounter: 1,
  
  /**
   * Initialize Canvas V3
   */
  async init() {
    console.log('🎨 Initializing Canvas V3...');
    
    // Load project from session storage
    this.loadProject();
    
    // Create default project if none exists
    if (!this.currentProject) {
      console.log('⚠️ No project found, creating default project...');
      this.currentProject = {
        id: 'default-' + Date.now(),
        name: 'Untitled Workflow',
        description: 'A new workflow project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // Save to session storage
      sessionStorage.setItem('museflow_current_project', JSON.stringify(this.currentProject));
      console.log('✅ Default project created:', this.currentProject.name);
    }
    
    // Render UI
    this.render();
    
    // Wait for DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize canvas
    this.initCanvas();
    
    // Attach events
    this.attachEvents();
    
    // Initialize backend integration
    console.log('🔌 Initializing backend...');
    await this.initBackendIntegration();
    
    // Load project data
    await this.loadProjectData();
    
    // Start render loop
    this.startRenderLoop();
    
    // Auto-save every 10 seconds
    setInterval(() => this.saveProjectData(), 10000);
    
    // Initialize AI Orchestrator
    if (window.AIOrchestrator) {
      window.AIOrchestrator.init();
    }
    
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
    
    console.log('✅ Canvas V3 initialized');
  },
  
  /**
   * Initialize backend integration (API, Sync, AI)
   */
  async initBackendIntegration() {
    try {
      // Initialize API client
      if (typeof initMuseFlowAPI === 'function') {
        initMuseFlowAPI();
      }
      
      // Initialize Workflow Sync
      if (typeof initWorkflowSync === 'function' && window.MuseFlowAPI) {
        initWorkflowSync(window.MuseFlowAPI);
      }
      
      // Initialize AI Generator
      if (typeof initAIGenerator === 'function' && window.MuseFlowAPI) {
        initAIGenerator(window.MuseFlowAPI);
      }
      
      // Test AI connection
      if (window.AIGenerator && typeof window.AIGenerator.testConnection === 'function') {
        const isAIReady = await window.AIGenerator.testConnection();
        console.log('🤖 AI Status:', isAIReady ? '✅ Ready' : '⚠️ Not available');
      }
      
      console.log('✅ Backend integration completed');
      
    } catch (error) {
      console.warn('⚠️ Backend integration warning:', error.message);
      // Don't use Toast if not available
      if (typeof Toast !== 'undefined' && Toast.warning) {
        Toast.warning('Running in offline mode');
      }
    }
  },
  
  /**
   * Start render loop
   */
  startRenderLoop() {
    const loop = () => {
      if (CanvasEngine.needsRedraw) {
        this.renderCanvas();
        CanvasEngine.needsRedraw = false;
      }
      requestAnimationFrame(loop);
    };
    loop();
    console.log('🔄 Render loop started');
  },
  
  /**
   * Load project from session storage
   */
  loadProject() {
    const projectData = sessionStorage.getItem('museflow_current_project');
    if (projectData) {
      this.currentProject = JSON.parse(projectData);
      console.log('✅ Project loaded:', this.currentProject.name);
    }
  },
  
  /**
   * Initialize canvas element
   */
  initCanvas() {
    this.canvasElement = document.getElementById('canvas');
    if (!this.canvasElement) {
      console.error('❌ Canvas element not found');
      return;
    }
    
    // Initialize CanvasEngine
    CanvasEngine.init(this.canvasElement);
    
    // Set custom render callback
    CanvasEngine.onRender = () => this.renderCanvas();
    
    console.log('✅ Canvas element initialized');
  },
  
  /**
   * Render main UI
   */
  render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                  display: flex; flex-direction: column; background: #f9fafb;">
        
        ${this.renderToolbar()}
        
        <!-- Main Canvas Area -->
        <div style="flex: 1; display: flex; position: relative; overflow: hidden;">
          
          ${this.renderLeftPanel()}
          
          <!-- Canvas Container -->
          <div id="canvas-container" style="flex: 1; position: relative; background: #f9fafb;">
            <canvas id="main-canvas"></canvas>
            
            <!-- Minimap -->
            <div style="position: absolute; bottom: 20px; right: 20px; 
                        width: 200px; height: 150px; background: white; 
                        border: 2px solid #e5e7eb; border-radius: 12px; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; 
                          font-size: 11px; font-weight: 600; color: #6b7280;">
                ${i18n.t('minimap') || 'Minimap'}
              </div>
              <canvas id="minimap-canvas" style="width: 100%; height: calc(100% - 32px);"></canvas>
            </div>
          </div>
          
          ${this.renderRightPanel()}
        </div>
      </div>
      
      ${this.renderStyles()}
    `;
  },
  
  /**
   * Render top toolbar
   */
  renderToolbar() {
    return `
      <div id="canvas-toolbar" style="height: 60px; background: white; 
                                      border-bottom: 1px solid #e5e7eb; 
                                      display: flex; align-items: center; 
                                      justify-content: space-between; padding: 0 20px; 
                                      flex-shrink: 0; z-index: 100;">
        
        <!-- Left: Back + Project Info -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <button 
            id="back-btn"
            style="width: 36px; height: 36px; border-radius: 8px; border: none; 
                   background: #f3f4f6; cursor: pointer; display: flex; 
                   align-items: center; justify-content: center; transition: all 0.2s;"
            title="${i18n.t('backToProjects')}"
          >
            <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
          </button>
          
          <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
          
          <div>
            <div style="font-weight: 700; font-size: 16px; color: #1f2937;">
              ${this.currentProject?.name || i18n.t('untitledProject')}
            </div>
            <div style="font-size: 12px; color: #9ca3af;">
              ${this.nodes.length} ${i18n.t('nodes') || 'nodes'} • Auto-saving
            </div>
          </div>
        </div>
        
        <!-- Center: Tools -->
        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="display: flex; gap: 4px; background: #f3f4f6; 
                      padding: 4px; border-radius: 10px;">
            <button 
              class="tool-btn" 
              data-tool="select"
              style="width: 40px; height: 40px; border-radius: 8px; border: none; 
                     background: white; cursor: pointer; display: flex; 
                     align-items: center; justify-content: center;
                     transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
              title="${i18n.t('selectTool')}"
            >
              <i data-lucide="mouse-pointer-2" style="width: 18px; height: 18px;"></i>
            </button>
            <button 
              class="tool-btn" 
              data-tool="hand"
              style="width: 40px; height: 40px; border-radius: 8px; border: none; 
                     background: transparent; cursor: pointer; display: flex; 
                     align-items: center; justify-content: center;
                     transition: all 0.2s;"
              title="${i18n.t('handTool')}"
            >
              <i data-lucide="hand" style="width: 18px; height: 18px;"></i>
            </button>
            <button 
              class="tool-btn" 
              data-tool="connection"
              style="width: 40px; height: 40px; border-radius: 8px; border: none; 
                     background: transparent; cursor: pointer; display: flex; 
                     align-items: center; justify-content: center;
                     transition: all 0.2s;"
              title="${i18n.t('addConnection')}"
            >
              <i data-lucide="link" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
          
          <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
          
          <!-- Zoom Controls -->
          <button 
            id="zoom-out"
            style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                   background: white; cursor: pointer; display: flex; 
                   align-items: center; justify-content: center;"
            title="${i18n.t('zoomOut')}"
          >
            <i data-lucide="minus" style="width: 16px; height: 16px;"></i>
          </button>
          
          <div id="zoom-display" style="min-width: 60px; text-align: center; 
                                       font-size: 13px; font-weight: 600; color: #6b7280;">
            100%
          </div>
          
          <button 
            id="zoom-in"
            style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                   background: white; cursor: pointer; display: flex; 
                   align-items: center; justify-content: center;"
            title="${i18n.t('zoomIn')}"
          >
            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
          </button>
          
          <button 
            id="zoom-fit"
            style="padding: 0 12px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                   background: white; cursor: pointer; font-size: 12px; font-weight: 600; 
                   color: #6b7280; display: flex; align-items: center; gap: 6px;"
            title="${i18n.t('fitToView')}"
          >
            <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i>
            ${i18n.t('fitToView').split(' ')[0] || 'Fit'}
          </button>
          
          <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
          
          <!-- Grid Toggle -->
          <button 
            id="grid-toggle"
            style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                   background: white; cursor: pointer; display: flex; 
                   align-items: center; justify-content: center;"
            title="Toggle Grid"
          >
            <i data-lucide="grid-3x3" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        
        <!-- Right: Actions -->
        <div style="display: flex; gap: 12px; align-items: center;">
          <button 
            id="ai-generate-btn"
            style="padding: 0 16px; height: 36px; border-radius: 8px; 
                   background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
                   color: white; border: none; cursor: pointer; font-size: 14px; 
                   font-weight: 600; transition: all 0.2s; display: flex; 
                   align-items: center; gap: 8px;"
            title="${i18n.t('aiGenerate')}"
          >
            <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
            AI ${i18n.currentLang === 'ko' ? '생성' : 'Generate'}
          </button>
          
          <button 
            id="export-btn"
            style="padding: 0 16px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; 
                   background: white; cursor: pointer; font-size: 14px; font-weight: 600; 
                   color: #6b7280; transition: all 0.2s; display: flex; 
                   align-items: center; gap: 8px;"
          >
            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
            Export
          </button>
          
          <button 
            id="save-btn"
            style="padding: 0 16px; height: 36px; border-radius: 8px; 
                   background: linear-gradient(135deg, #667eea, #764ba2); 
                   color: white; border: none; cursor: pointer; font-size: 14px; 
                   font-weight: 600; transition: all 0.2s; display: flex; 
                   align-items: center; gap: 8px;"
            title="${i18n.t('saveCanvas')}"
          >
            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
            ${i18n.t('save')}
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * Render left panel (node palette)
   */
  renderLeftPanel() {
    if (!this.leftPanelOpen) {
      return `
        <button id="show-left-panel" 
                style="position: absolute; left: 0; top: 80px; z-index: 10;
                       width: 40px; height: 40px; background: white; 
                       border: 1px solid #e5e7eb; border-left: none; 
                       border-radius: 0 8px 8px 0; cursor: pointer;
                       display: flex; align-items: center; justify-content: center;">
          <i data-lucide="chevron-right" style="width: 20px; height: 20px;"></i>
        </button>
      `;
    }
    
    return `
      <div id="left-panel" style="width: 320px; background: white; 
                                  border-right: 1px solid #e5e7eb; 
                                  display: flex; flex-direction: column;
                                  transition: all 0.3s; flex-shrink: 0;">
        
        <!-- Panel Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; 
                    display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="package" style="width: 18px; height: 18px; color: #6b7280;"></i>
            <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
              ${i18n.t('nodes')}
            </div>
          </div>
          <button id="hide-left-panel" 
                  style="width: 28px; height: 28px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; display: flex; 
                         align-items: center; justify-content: center;">
            <i data-lucide="chevron-left" style="width: 18px; height: 18px; color: #6b7280;"></i>
          </button>
        </div>
        
        <!-- Search Box -->
        <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="position: relative;">
            <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; 
                                          transform: translateY(-50%); width: 16px; 
                                          height: 16px; color: #9ca3af;"></i>
            <input 
              type="text" 
              id="node-search"
              placeholder="${i18n.t('searchNodes')}"
              style="width: 100%; padding: 8px 12px 8px 36px; border: 1px solid #e5e7eb; 
                     border-radius: 8px; font-size: 13px; box-sizing: border-box;
                     transition: all 0.2s;"
            />
          </div>
        </div>
        
        <!-- Category Tabs -->
        <div style="display: flex; gap: 4px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
                    overflow-x: auto; flex-shrink: 0;">
          ${this.renderCategoryTabs()}
        </div>
        
        <!-- Nodes List -->
        <div id="node-categories" style="flex: 1; overflow-y: auto; padding: 8px;">
          ${this.renderNodesList()}
        </div>
      </div>
    `;
  },
  
  /**
   * Render category tabs
   */
  renderCategoryTabs() {
    const categories = [
      { id: 'all', icon: 'list' },
      { id: 'ai', icon: 'sparkles' },
      { id: 'exhibition', icon: 'palette' },
      { id: 'education', icon: 'book-open' },
      { id: 'archive', icon: 'archive' },
      { id: 'publication', icon: 'newspaper' },
      { id: 'research', icon: 'flask-conical' },
      { id: 'admin', icon: 'settings' }
    ];
    
    return categories.map(cat => `
      <button class="category-tab" data-category="${cat.id}"
              style="padding: 6px 12px; border: none; 
                     background: ${this.selectedCategory === cat.id ? '#f3f4f6' : 'transparent'};
                     border-radius: 6px; cursor: pointer; font-size: 12px;
                     font-weight: ${this.selectedCategory === cat.id ? '600' : '500'};
                     color: ${this.selectedCategory === cat.id ? '#1f2937' : '#6b7280'};
                     white-space: nowrap; display: flex; align-items: center; gap: 6px;
                     transition: all 0.2s;">
        <i data-lucide="${cat.icon}" style="width: 14px; height: 14px;"></i>
        ${i18n.t(cat.id)}
      </button>
    `).join('');
  },
  
  /**
   * Render nodes list with 2-level category structure
   */
  renderNodesList() {
    const nodes = this.getFilteredNodes();
    
    if (nodes.length === 0) {
      return `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <i data-lucide="search-x" style="width: 48px; height: 48px; margin: 0 auto 12px;"></i>
          <div style="font-size: 13px;">No nodes found</div>
        </div>
      `;
    }
    
    // Group by subcategory
    const grouped = this.groupNodesBySubcategory(nodes);
    
    return Object.keys(grouped).map(subcat => {
      const subcatNodes = grouped[subcat];
      const isExpanded = this.expandedSubcategories.has(subcat);
      
      return `
        <!-- Subcategory Header -->
        <div class="subcategory-header" data-subcategory="${subcat}"
             style="padding: 8px 12px; margin: 8px 0 4px 0; cursor: pointer;
                    display: flex; align-items: center; justify-content: space-between;
                    border-radius: 8px; background: #f9fafb; user-select: none;
                    transition: all 0.2s;">
          <div style="font-size: 11px; font-weight: 600; color: #6b7280; 
                      letter-spacing: 0.05em; text-transform: uppercase;">
            ${this.getSubcategoryName(subcat)}
          </div>
          <i data-lucide="chevron-down" 
             style="width: 14px; height: 14px; color: #9ca3af; transition: transform 0.2s;
                    transform: rotate(${isExpanded ? '0deg' : '-90deg'});"></i>
        </div>
        
        <!-- Subcategory Nodes -->
        <div class="subcategory-nodes" data-subcategory="${subcat}"
             style="display: ${isExpanded ? 'block' : 'none'}; margin-bottom: 8px;">
          ${subcatNodes.map(node => `
            <div class="node-palette-item" data-node-type="${node.id}" draggable="true"
                 style="padding: 10px 12px; margin: 4px 0; border-radius: 8px;
                        cursor: grab; display: flex; align-items: center; gap: 10px;
                        background: white; border: 1px solid transparent;
                        transition: all 0.2s;">
              <div style="width: 32px; height: 32px; border-radius: 6px; 
                          background: ${node.color}15; display: flex; 
                          align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="${node.icon}" style="width: 16px; height: 16px; color: ${node.color};"></i>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 500; color: #1f2937;
                            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${i18n.t(node.id)}
                </div>
                <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;
                            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${i18n.t(node.category)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  },
  
  /**
   * Group nodes by subcategory
   */
  groupNodesBySubcategory(nodes) {
    const grouped = {};
    
    nodes.forEach(node => {
      const subcat = node.subcategory || 'other';
      if (!grouped[subcat]) {
        grouped[subcat] = [];
      }
      grouped[subcat].push(node);
    });
    
    return grouped;
  },
  
  /**
   * Get subcategory display name
   */
  getSubcategoryName(subcatId) {
    const subcategoryNames = {
      'planning': i18n.currentLang === 'ko' ? '기획 & 큐레이팅' : 
                  i18n.currentLang === 'zh' ? '策划与策展' :
                  i18n.currentLang === 'ja' ? '企画とキュレーション' : 'Planning & Curation',
      'installation': i18n.currentLang === 'ko' ? '설치 & 운영' :
                      i18n.currentLang === 'zh' ? '安装与运营' :
                      i18n.currentLang === 'ja' ? '設置と運営' : 'Installation & Operation',
      'evaluation': i18n.currentLang === 'ko' ? '평가 & 피드백' :
                    i18n.currentLang === 'zh' ? '评估与反馈' :
                    i18n.currentLang === 'ja' ? '評価とフィードバック' : 'Evaluation & Feedback',
      'program': i18n.currentLang === 'ko' ? '프로그램 개발' :
                 i18n.currentLang === 'zh' ? '项目开发' :
                 i18n.currentLang === 'ja' ? 'プログラム開発' : 'Program Development',
      'execution': i18n.currentLang === 'ko' ? '실행 & 운영' :
                   i18n.currentLang === 'zh' ? '执行与运营' :
                   i18n.currentLang === 'ja' ? '実行と運営' : 'Execution & Operation',
      'acquisition': i18n.currentLang === 'ko' ? '수집 & 등록' :
                     i18n.currentLang === 'zh' ? '采集与登录' :
                     i18n.currentLang === 'ja' ? '収集と登録' : 'Acquisition & Registration',
      'preservation': i18n.currentLang === 'ko' ? '보존 & 관리' :
                      i18n.currentLang === 'zh' ? '保存与管理' :
                      i18n.currentLang === 'ja' ? '保存と管理' : 'Preservation & Management',
      'research': i18n.currentLang === 'ko' ? '연구 & 활용' :
                  i18n.currentLang === 'zh' ? '研究与利用' :
                  i18n.currentLang === 'ja' ? '研究と活用' : 'Research & Utilization',
      'content': i18n.currentLang === 'ko' ? '콘텐츠 제작' :
                 i18n.currentLang === 'zh' ? '内容制作' :
                 i18n.currentLang === 'ja' ? 'コンテンツ制作' : 'Content Creation',
      'production': i18n.currentLang === 'ko' ? '제작 & 배포' :
                    i18n.currentLang === 'zh' ? '制作与分发' :
                    i18n.currentLang === 'ja' ? '制作と配布' : 'Production & Distribution',
      'fieldwork': i18n.currentLang === 'ko' ? '현장 조사' :
                   i18n.currentLang === 'zh' ? '现场调查' :
                   i18n.currentLang === 'ja' ? 'フィールドワーク' : 'Fieldwork',
      'analysis': i18n.currentLang === 'ko' ? '분석 & 보고' :
                  i18n.currentLang === 'zh' ? '分析与报告' :
                  i18n.currentLang === 'ja' ? '分析とレポート' : 'Analysis & Reporting',
      'strategic': i18n.currentLang === 'ko' ? '전략 & 기획' :
                   i18n.currentLang === 'zh' ? '战略与规划' :
                   i18n.currentLang === 'ja' ? '戦略と企画' : 'Strategic Planning',
      'operations': i18n.currentLang === 'ko' ? '운영 & 관리' :
                    i18n.currentLang === 'zh' ? '运营与管理' :
                    i18n.currentLang === 'ja' ? '運営と管理' : 'Operations & Management',
      'engagement': i18n.currentLang === 'ko' ? '소통 & 서비스' :
                    i18n.currentLang === 'zh' ? '沟通与服务' :
                    i18n.currentLang === 'ja' ? 'コミュニケーションとサービス' : 'Engagement & Services',
      'other': i18n.t('other') || 'Other'
    };
    
    return subcategoryNames[subcatId] || subcatId;
  },
  
  /**
   * Get filtered nodes
   */
  getFilteredNodes() {
    let nodes = this.getAllNodeTypes();
    
    // Filter by module (if moduleFilter is set from URL parameter)
    if (this.moduleFilter) {
      nodes = nodes.filter(n => n.category === this.moduleFilter);
    }
    
    // Filter by category (manual selection)
    if (this.selectedCategory !== 'all' && !this.moduleFilter) {
      nodes = nodes.filter(n => n.category === this.selectedCategory);
    }
    
    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      nodes = nodes.filter(n => {
        const nodeName = i18n.t(n.id).toLowerCase();
        const categoryName = i18n.t(n.category).toLowerCase();
        return nodeName.includes(query) || categoryName.includes(query);
      });
    }
    
    return nodes;
  },
  
  /**
   * Get all 88 node types with Lucide icons
   */
  getAllNodeTypes() {
    return [
      // Exhibition nodes (15) - Planning & Curation
      { id: 'exhibition-planning', category: 'exhibition', subcategory: 'planning', icon: 'sparkles', color: '#8b5cf6' },
      { id: 'curator-assignment', category: 'exhibition', subcategory: 'planning', icon: 'user-check', color: '#8b5cf6' },
      { id: 'artwork-selection', category: 'exhibition', subcategory: 'planning', icon: 'image', color: '#8b5cf6' },
      { id: 'layout-design', category: 'exhibition', subcategory: 'planning', icon: 'layout', color: '#8b5cf6' },
      
      // Exhibition nodes - Installation & Operation
      { id: 'lighting-setup', category: 'exhibition', subcategory: 'installation', icon: 'lightbulb', color: '#8b5cf6' },
      { id: 'label-creation', category: 'exhibition', subcategory: 'installation', icon: 'tag', color: '#8b5cf6' },
      { id: 'installation', category: 'exhibition', subcategory: 'installation', icon: 'hammer', color: '#8b5cf6' },
      { id: 'multimedia-setup', category: 'exhibition', subcategory: 'installation', icon: 'monitor', color: '#8b5cf6' },
      { id: 'security-planning', category: 'exhibition', subcategory: 'installation', icon: 'shield', color: '#8b5cf6' },
      { id: 'climate-control', category: 'exhibition', subcategory: 'installation', icon: 'thermometer', color: '#8b5cf6' },
      { id: 'accessibility', category: 'exhibition', subcategory: 'installation', icon: 'accessibility', color: '#8b5cf6' },
      
      // Exhibition nodes - Evaluation & Feedback
      { id: 'opening-event', category: 'exhibition', subcategory: 'evaluation', icon: 'party-popper', color: '#8b5cf6' },
      { id: 'visitor-feedback', category: 'exhibition', subcategory: 'evaluation', icon: 'message-square', color: '#8b5cf6' },
      { id: 'exhibition-tour', category: 'exhibition', subcategory: 'evaluation', icon: 'move', color: '#8b5cf6' },
      { id: 'deinstallation', category: 'exhibition', subcategory: 'evaluation', icon: 'package-x', color: '#8b5cf6' },
      
      // Education nodes (15) - Program Development
      { id: 'program-design', category: 'education', subcategory: 'program', icon: 'layout-grid', color: '#06b6d4' },
      { id: 'workshop-planning', category: 'education', subcategory: 'program', icon: 'users', color: '#06b6d4' },
      { id: 'educator-training', category: 'education', subcategory: 'program', icon: 'graduation-cap', color: '#06b6d4' },
      { id: 'curriculum-development', category: 'education', subcategory: 'program', icon: 'book-open', color: '#06b6d4' },
      { id: 'resource-creation', category: 'education', subcategory: 'program', icon: 'file-text', color: '#06b6d4' },
      
      // Education nodes - Execution & Operation
      { id: 'school-outreach', category: 'education', subcategory: 'execution', icon: 'school', color: '#06b6d4' },
      { id: 'family-program', category: 'education', subcategory: 'execution', icon: 'home', color: '#06b6d4' },
      { id: 'lecture-series', category: 'education', subcategory: 'execution', icon: 'mic', color: '#06b6d4' },
      { id: 'online-learning', category: 'education', subcategory: 'execution', icon: 'monitor', color: '#06b6d4' },
      { id: 'community-partnership', category: 'education', subcategory: 'execution', icon: 'handshake', color: '#06b6d4' },
      { id: 'volunteer-program', category: 'education', subcategory: 'execution', icon: 'heart-handshake', color: '#06b6d4' },
      { id: 'student-exhibition', category: 'education', subcategory: 'execution', icon: 'palette', color: '#06b6d4' },
      { id: 'art-therapy', category: 'education', subcategory: 'execution', icon: 'heart', color: '#06b6d4' },
      { id: 'special-needs', category: 'education', subcategory: 'execution', icon: 'star', color: '#06b6d4' },
      
      // Education nodes - Evaluation & Improvement
      { id: 'assessment', category: 'education', subcategory: 'evaluation', icon: 'clipboard-check', color: '#06b6d4' },
      
      // Archive nodes (15) - Acquisition & Registration
      { id: 'accession', category: 'archive', subcategory: 'acquisition', icon: 'file-plus', color: '#10b981' },
      { id: 'cataloging', category: 'archive', subcategory: 'acquisition', icon: 'list', color: '#10b981' },
      { id: 'metadata-creation', category: 'archive', subcategory: 'acquisition', icon: 'tags', color: '#10b981' },
      { id: 'photography', category: 'archive', subcategory: 'acquisition', icon: 'camera', color: '#10b981' },
      { id: 'database-entry', category: 'archive', subcategory: 'acquisition', icon: 'database', color: '#10b981' },
      { id: 'provenance-research', category: 'archive', subcategory: 'acquisition', icon: 'search', color: '#10b981' },
      
      // Archive nodes - Preservation & Management
      { id: 'digitization', category: 'archive', subcategory: 'preservation', icon: 'scan', color: '#10b981' },
      { id: 'preservation', category: 'archive', subcategory: 'preservation', icon: 'shield-check', color: '#10b981' },
      { id: 'restoration', category: 'archive', subcategory: 'preservation', icon: 'wrench', color: '#10b981' },
      { id: 'storage-management', category: 'archive', subcategory: 'preservation', icon: 'warehouse', color: '#10b981' },
      { id: 'condition-report', category: 'archive', subcategory: 'preservation', icon: 'clipboard', color: '#10b981' },
      { id: 'inventory', category: 'archive', subcategory: 'preservation', icon: 'package-check', color: '#10b981' },
      { id: 'rights-management', category: 'archive', subcategory: 'preservation', icon: 'copyright', color: '#10b981' },
      
      // Archive nodes - Research & Utilization
      { id: 'loan-management', category: 'archive', subcategory: 'research', icon: 'package-open', color: '#10b981' },
      { id: 'deaccession', category: 'archive', subcategory: 'research', icon: 'package-minus', color: '#10b981' },
      
      // Publication nodes (12) - Content Creation
      { id: 'catalog-writing', category: 'publication', subcategory: 'content', icon: 'book', color: '#f59e0b' },
      { id: 'essay-commission', category: 'publication', subcategory: 'content', icon: 'file-edit', color: '#f59e0b' },
      { id: 'editing', category: 'publication', subcategory: 'content', icon: 'edit-3', color: '#f59e0b' },
      { id: 'design-layout', category: 'publication', subcategory: 'content', icon: 'layout', color: '#f59e0b' },
      { id: 'image-selection', category: 'publication', subcategory: 'content', icon: 'images', color: '#f59e0b' },
      
      // Publication nodes - Production & Distribution
      { id: 'copyright-clearance', category: 'publication', subcategory: 'production', icon: 'copyright', color: '#f59e0b' },
      { id: 'printing', category: 'publication', subcategory: 'production', icon: 'printer', color: '#f59e0b' },
      { id: 'distribution', category: 'publication', subcategory: 'production', icon: 'truck', color: '#f59e0b' },
      { id: 'digital-publication', category: 'publication', subcategory: 'production', icon: 'globe', color: '#f59e0b' },
      { id: 'newsletter', category: 'publication', subcategory: 'production', icon: 'mail', color: '#f59e0b' },
      { id: 'press-release', category: 'publication', subcategory: 'production', icon: 'newspaper', color: '#f59e0b' },
      { id: 'social-media', category: 'publication', subcategory: 'production', icon: 'share-2', color: '#f59e0b' },
      
      // Research nodes (12) - Fieldwork
      { id: 'artwork-research', category: 'research', subcategory: 'fieldwork', icon: 'microscope', color: '#ec4899' },
      { id: 'artist-biography', category: 'research', subcategory: 'fieldwork', icon: 'user', color: '#ec4899' },
      { id: 'historical-context', category: 'research', subcategory: 'fieldwork', icon: 'scroll', color: '#ec4899' },
      { id: 'literature-review', category: 'research', subcategory: 'fieldwork', icon: 'library', color: '#ec4899' },
      { id: 'archive-visit', category: 'research', subcategory: 'fieldwork', icon: 'map-pin', color: '#ec4899' },
      { id: 'interview', category: 'research', subcategory: 'fieldwork', icon: 'mic', color: '#ec4899' },
      { id: 'survey', category: 'research', subcategory: 'fieldwork', icon: 'clipboard-list', color: '#ec4899' },
      
      // Research nodes - Analysis & Reporting
      { id: 'data-analysis', category: 'research', subcategory: 'analysis', icon: 'bar-chart', color: '#ec4899' },
      { id: 'report-writing', category: 'research', subcategory: 'analysis', icon: 'file-text', color: '#ec4899' },
      { id: 'peer-review', category: 'research', subcategory: 'analysis', icon: 'users-2', color: '#ec4899' },
      { id: 'conference', category: 'research', subcategory: 'analysis', icon: 'presentation', color: '#ec4899' },
      { id: 'publication-submit', category: 'research', subcategory: 'analysis', icon: 'send', color: '#ec4899' },
      
      // Admin nodes (19) - Strategic Planning
      { id: 'budget-planning', category: 'admin', subcategory: 'strategic', icon: 'calculator', color: '#6366f1' },
      { id: 'funding-application', category: 'admin', subcategory: 'strategic', icon: 'file-text', color: '#6366f1' },
      { id: 'policy-development', category: 'admin', subcategory: 'strategic', icon: 'file-check', color: '#6366f1' },
      { id: 'board-meeting', category: 'admin', subcategory: 'strategic', icon: 'users', color: '#6366f1' },
      { id: 'fundraising', category: 'admin', subcategory: 'strategic', icon: 'piggy-bank', color: '#6366f1' },
      { id: 'marketing', category: 'admin', subcategory: 'strategic', icon: 'megaphone', color: '#6366f1' },
      
      // Admin nodes - Operations & Management
      { id: 'staff-meeting', category: 'admin', subcategory: 'operations', icon: 'calendar', color: '#6366f1' },
      { id: 'hiring', category: 'admin', subcategory: 'operations', icon: 'user-plus', color: '#6366f1' },
      { id: 'training', category: 'admin', subcategory: 'operations', icon: 'book-open', color: '#6366f1' },
      { id: 'compliance', category: 'admin', subcategory: 'operations', icon: 'check-circle', color: '#6366f1' },
      { id: 'insurance', category: 'admin', subcategory: 'operations', icon: 'shield', color: '#6366f1' },
      { id: 'facility-management', category: 'admin', subcategory: 'operations', icon: 'building', color: '#6366f1' },
      { id: 'it-support', category: 'admin', subcategory: 'operations', icon: 'laptop', color: '#6366f1' },
      { id: 'vendor-management', category: 'admin', subcategory: 'operations', icon: 'package', color: '#6366f1' },
      { id: 'contract-negotiation', category: 'admin', subcategory: 'operations', icon: 'file-signature', color: '#6366f1' },
      
      // Admin nodes - Engagement & Services
      { id: 'visitor-services', category: 'admin', subcategory: 'engagement', icon: 'heart-handshake', color: '#6366f1' },
      { id: 'ticketing', category: 'admin', subcategory: 'engagement', icon: 'ticket', color: '#6366f1' },
      { id: 'membership', category: 'admin', subcategory: 'engagement', icon: 'credit-card', color: '#6366f1' },
      { id: 'evaluation', category: 'admin', subcategory: 'engagement', icon: 'chart-bar', color: '#6366f1' },
      
      // AI Automation nodes (11) - NEW
      { id: 'ai-gemini-generate', category: 'ai', subcategory: 'ai-automation', icon: 'sparkles', color: '#a855f7' },
      { id: 'ai-gemini-improve', category: 'ai', subcategory: 'ai-automation', icon: 'wand-2', color: '#a855f7' },
      { id: 'ai-gemini-translate', category: 'ai', subcategory: 'ai-automation', icon: 'languages', color: '#a855f7' },
      { id: 'ai-gemini-summarize', category: 'ai', subcategory: 'ai-automation', icon: 'minimize-2', color: '#a855f7' },
      { id: 'ai-google-docs', category: 'ai', subcategory: 'ai-automation', icon: 'file-text', color: '#4285f4' },
      { id: 'ai-gmail-draft', category: 'ai', subcategory: 'ai-automation', icon: 'mail', color: '#ea4335' },
      { id: 'ai-calendar-event', category: 'ai', subcategory: 'ai-automation', icon: 'calendar-plus', color: '#34a853' },
      { id: 'ai-data-analysis', category: 'ai', subcategory: 'ai-automation', icon: 'bar-chart-2', color: '#a855f7' },
      { id: 'ai-image-generate', category: 'ai', subcategory: 'ai-automation', icon: 'image', color: '#a855f7' },
      { id: 'ai-workflow-automate', category: 'ai', subcategory: 'ai-automation', icon: 'zap', color: '#a855f7' },
      { id: 'ai-custom-plugin', category: 'ai', subcategory: 'ai-automation', icon: 'puzzle', color: '#a855f7' }
    ];
  },
  
  /**
   * Render right panel (inspector)
   */
  renderRightPanel() {
    if (!this.rightPanelOpen || this.selectedNodes.length === 0) {
      return '';
    }
    
    const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
    if (!node) return '';
    
    return `
      <div id="right-panel" style="width: 320px; background: white; 
                                   border-left: 1px solid #e5e7eb; 
                                   display: flex; flex-direction: column;
                                   transition: all 0.3s; flex-shrink: 0;">
        
        <!-- Panel Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; 
                    display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="settings" style="width: 18px; height: 18px; color: #6b7280;"></i>
            <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
              ${i18n.t('properties')}
            </div>
          </div>
          <button id="hide-right-panel" 
                  style="width: 28px; height: 28px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; display: flex; 
                         align-items: center; justify-content: center;">
            <i data-lucide="chevron-right" style="width: 18px; height: 18px; color: #6b7280;"></i>
          </button>
        </div>
        
        <!-- Properties Content -->
        <div id="inspector-content" style="flex: 1; overflow-y: auto; padding: 16px;">
          ${this.renderNodeProperties(node)}
        </div>
      </div>
    `;
  },
  
  /**
   * Render node properties
   */
  renderNodeProperties(node) {
    return `
      <!-- Node Icon & Type -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 64px; height: 64px; margin: 0 auto 12px; 
                    background: ${node.color}15; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;">
          <i data-lucide="${node.icon}" style="width: 32px; height: 32px; color: ${node.color};"></i>
        </div>
        <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
          ${i18n.t(node.type)}
        </div>
      </div>
      
      <!-- Title -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; 
                      color: #6b7280; margin-bottom: 6px;">
          ${i18n.t('title')}
        </label>
        <input type="text" id="node-title" value="${node.title || ''}"
               style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                      border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>
      
      <!-- Description -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600;
                      color: #6b7280; margin-bottom: 6px;">
          ${i18n.t('description')}
        </label>
        <textarea id="node-description" rows="4"
                  style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                         border-radius: 6px; font-size: 13px; resize: vertical; 
                         box-sizing: border-box;">${node.description || ''}</textarea>
      </div>
      
      <!-- Status -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600;
                      color: #6b7280; margin-bottom: 6px;">
          ${i18n.t('status')}
        </label>
        <select id="node-status" 
                style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                       border-radius: 6px; font-size: 13px; box-sizing: border-box;">
          <option value="todo" ${node.status === 'todo' ? 'selected' : ''}>${i18n.t('todo')}</option>
          <option value="in-progress" ${node.status === 'in-progress' ? 'selected' : ''}>${i18n.t('inProgress')}</option>
          <option value="done" ${node.status === 'done' ? 'selected' : ''}>${i18n.t('done')}</option>
        </select>
      </div>
      
      <!-- Delete Button -->
      <button id="delete-node-btn" 
              style="width: 100%; padding: 10px; border: 1px solid #ef4444;
                     background: white; color: #ef4444; border-radius: 8px;
                     font-size: 13px; font-weight: 600; cursor: pointer;
                     transition: all 0.2s; display: flex; align-items: center;
                     justify-content: center; gap: 8px;">
        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        ${i18n.t('delete')}
      </button>
    `;
  },
  
  /**
   * Render canvas content
   */
  renderCanvas() {
    // Use CanvasV3Complete rendering engine
    if (window.CanvasV3Complete && window.CanvasV3Complete.renderCanvas) {
      // Sync state
      window.CanvasV3Complete.nodes = this.nodes;
      window.CanvasV3Complete.connections = this.connections;
      window.CanvasV3Complete.selectedNodes = this.selectedNodes;
      window.CanvasV3Complete.hoveredNode = this.hoveredNode;
      window.CanvasV3Complete.isConnecting = this.isConnecting;
      window.CanvasV3Complete.connectionStart = this.connectionStart;
      window.CanvasV3Complete.mousePos = this.mousePos;
      window.CanvasV3Complete.canvasElement = this.canvasElement;
      
      // Render
      window.CanvasV3Complete.renderCanvas();
      return;
    }
    
    // Fallback rendering (original)
    if (!this.canvasElement || !CanvasEngine.ctx) return;
    
    const ctx = CanvasEngine.ctx;
    const viewport = CanvasEngine.viewport;
    
    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    ctx.restore();
    
    // Apply viewport transform
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);
    
    // Draw connections
    this.drawConnections(ctx);
    
    // Draw nodes
    this.drawNodes(ctx);
    
    // Draw connection preview
    if (this.isConnecting && this.connectionStart) {
      this.drawConnectionPreview(ctx);
    }
    
    ctx.restore();
  },
  
  /**
   * Draw connections
   */
  drawConnections(ctx) {
    this.connections.forEach(conn => {
      const fromNode = this.nodes.find(n => n.id === conn.from);
      const toNode = this.nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return;
      
      const fromX = fromNode.x + fromNode.width;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x;
      const toY = toNode.y + toNode.height / 2;
      
      // Bezier curve
      const cp1x = fromX + 100;
      const cp1y = fromY;
      const cp2x = toX - 100;
      const cp2y = toY;
      
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
      ctx.stroke();
      
      // Arrow
      const arrowSize = 8;
      const angle = Math.atan2(toY - cp2y, toX - cp2x);
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowSize * Math.cos(angle - Math.PI / 6),
        toY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - arrowSize * Math.cos(angle + Math.PI / 6),
        toY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    });
  },
  
  /**
   * Draw connection preview
   */
  drawConnectionPreview(ctx) {
    const fromNode = this.nodes.find(n => n.id === this.connectionStart);
    if (!fromNode) return;
    
    const fromX = fromNode.x + fromNode.width;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = this.mousePos.x;
    const toY = this.mousePos.y;
    
    const cp1x = fromX + 100;
    const cp1y = fromY;
    const cp2x = toX - 100;
    const cp2y = toY;
    
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  
  /**
   * Draw nodes
   */
  drawNodes(ctx) {
    this.nodes.forEach(node => {
      const isSelected = this.selectedNodes.includes(node.id);
      const isHovered = this.hoveredNode === node.id;
      
      // Node shadow
      if (isSelected || isHovered) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      }
      
      // Node background
      ctx.fillStyle = 'white';
      ctx.strokeStyle = isSelected ? node.color : '#e5e7eb';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      this.roundRect(ctx, node.x, node.y, node.width, node.height, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Node header (color bar)
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x, node.y, node.width, 4);
      
      // Node title
      ctx.fillStyle = '#1f2937';
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(
        node.title || i18n.t(node.type),
        node.x + 16,
        node.y + 30,
        node.width - 32
      );
      
      // Node type (subtitle)
      ctx.fillStyle = '#9ca3af';
      ctx.font = '400 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(
        i18n.t(node.category),
        node.x + 16,
        node.y + 48,
        node.width - 32
      );
      
      // Status badge
      const statusColors = {
        'todo': '#ef4444',
        'in-progress': '#f59e0b',
        'done': '#10b981'
      };
      
      if (node.status) {
        const statusX = node.x + node.width - 60;
        const statusY = node.y + 20;
        
        ctx.fillStyle = statusColors[node.status] + '20';
        this.roundRect(ctx, statusX, statusY, 50, 20, 4);
        ctx.fill();
        
        ctx.fillStyle = statusColors[node.status];
        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          i18n.t(node.status).substring(0, 6),
          statusX + 25,
          statusY + 14
        );
        ctx.textAlign = 'left';
      }
      
      // Connection points
      this.drawConnectionPoints(ctx, node);
    });
  },
  
  /**
   * Draw connection points
   */
  drawConnectionPoints(ctx, node) {
    // Left point (input)
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(node.x, node.y + node.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Right point (output)
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x + node.width, node.y + node.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  },
  
  /**
   * Helper: Draw rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },
  
  /**
   * Render styles
   */
  renderStyles() {
    return `
      <style>
        #main-canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: default;
        }
        
        .tool-btn:hover {
          background: white !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        
        .category-tab:hover {
          background: #f3f4f6 !important;
        }
        
        .subcategory-header:hover {
          background: #f3f4f6 !important;
        }
        
        .node-palette-item:hover {
          background: #f9fafb !important;
          border-color: #e5e7eb !important;
          transform: translateX(4px);
        }
        
        .node-palette-item:active {
          cursor: grabbing !important;
        }
        
        /* Scrollbar */
        #left-panel::-webkit-scrollbar,
        #right-panel::-webkit-scrollbar,
        #node-categories::-webkit-scrollbar {
          width: 6px;
        }
        
        #left-panel::-webkit-scrollbar-thumb,
        #right-panel::-webkit-scrollbar-thumb,
        #node-categories::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        #left-panel::-webkit-scrollbar-track,
        #right-panel::-webkit-scrollbar-track,
        #node-categories::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Input focus styles */
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        /* Button hover effects */
        button:hover {
          opacity: 0.9;
        }
        
        #export-btn:hover {
          background: #f9fafb !important;
        }
        
        #save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        #delete-node-btn:hover {
          background: #ef4444 !important;
          color: white !important;
        }
      </style>
    `;
  },
  
  /**
   * Attach all events
   */
  attachEvents() {
    this.attachToolbarEvents();
    this.attachPanelEvents();
    this.attachCanvasEvents();
    this.attachNodePaletteEvents();
    this.attachInspectorEvents();
    this.attachKeyboardEvents();
    
    console.log('✅ All events attached');
  },
  
  /**
   * Attach toolbar events
   */
  attachToolbarEvents() {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.saveProjectData();
        Router.navigate('/projects');
      });
    }
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.currentTool = tool;
        
        // Update button styles
        document.querySelectorAll('.tool-btn').forEach(b => {
          b.style.background = 'transparent';
          b.style.boxShadow = 'none';
        });
        btn.style.background = 'white';
        btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        
        // Update cursor
        const container = document.getElementById('canvas-container');
        if (tool === 'hand') {
          container.style.cursor = 'grab';
        } else if (tool === 'connection') {
          container.style.cursor = 'crosshair';
        } else {
          container.style.cursor = 'default';
        }
        
        console.log('🔧 Tool changed:', tool);
      });
    });
    
    // Zoom controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomFit = document.getElementById('zoom-fit');
    
    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        CanvasEngine.setZoom(CanvasEngine.viewport.zoom * 1.2);
        this.updateZoomDisplay();
      });
    }
    
    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        CanvasEngine.setZoom(CanvasEngine.viewport.zoom / 1.2);
        this.updateZoomDisplay();
      });
    }
    
    if (zoomFit) {
      zoomFit.addEventListener('click', () => {
        CanvasEngine.fitToContent(this.nodes);
        this.updateZoomDisplay();
      });
    }
    
    // Grid toggle
    const gridToggle = document.getElementById('grid-toggle');
    if (gridToggle) {
      gridToggle.addEventListener('click', () => {
        CanvasEngine.toggleGrid();
      });
    }
    
    // AI Generate button
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    if (aiGenerateBtn) {
      aiGenerateBtn.addEventListener('click', async () => {
        if (!window.AIGenerator) {
          console.warn('⚠️ AI features not available');
          return;
        }
        
        try {
          console.log('🤖 AI generating workflow...');
          
          // Get AI suggestions based on project context
          const context = {
            projectName: this.currentProject.name,
            projectDescription: this.currentProject.description,
            existingNodes: this.nodes.length
          };
          
          const result = await window.AIGenerator.generateWorkflow(context);
          
          if (result && result.nodes) {
            // Add AI generated nodes to canvas
            result.nodes.forEach((nodeData, index) => {
              const nodeDef = this.getAllNodeTypes().find(n => n.id === nodeData.type);
              if (nodeDef) {
                const newNode = {
                  id: `node-${this.nodeIdCounter++}`,
                  type: nodeDef.id,
                  category: nodeDef.category,
                  subcategory: nodeDef.subcategory,
                  icon: nodeDef.icon,
                  color: nodeDef.color,
                  title: nodeData.title || '',
                  description: nodeData.description || '',
                  status: 'todo',
                  x: 100 + (index % 3) * 250,
                  y: 100 + Math.floor(index / 3) * 120,
                  width: 200,
                  height: 80
                };
                this.nodes.push(newNode);
              }
            });
            
            // Add connections
            if (result.connections) {
              result.connections.forEach(conn => {
                this.connections.push({
                  id: `conn-${Date.now()}-${Math.random()}`,
                  from: conn.from,
                  to: conn.to
                });
              });
            }
            
            CanvasEngine.needsRedraw = true;
            this.saveProjectData();
            console.log('✅ AI workflow generated! ✨');
          }
          
        } catch (error) {
          console.error('AI generation failed:', error);
          console.error('❌ AI generation failed. Please try again.');
        }
      });
    }
    
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveProjectData();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        console.log('📤 Export feature coming soon!');
      });
    }
  },
  
  /**
   * Attach panel toggle events
   */
  attachPanelEvents() {
    // Left panel toggle
    const hideLeft = document.getElementById('hide-left-panel');
    const showLeft = document.getElementById('show-left-panel');
    
    if (hideLeft) {
      hideLeft.addEventListener('click', () => {
        this.leftPanelOpen = false;
        this.render();
        setTimeout(() => {
          this.attachEvents();
          if (window.lucide) lucide.createIcons();
        }, 50);
      });
    }
    
    if (showLeft) {
      showLeft.addEventListener('click', () => {
        this.leftPanelOpen = true;
        this.render();
        setTimeout(() => {
          this.attachEvents();
          if (window.lucide) lucide.createIcons();
        }, 50);
      });
    }
    
    // Right panel toggle
    const hideRight = document.getElementById('hide-right-panel');
    
    if (hideRight) {
      hideRight.addEventListener('click', () => {
        this.rightPanelOpen = false;
        this.render();
        setTimeout(() => {
          this.attachEvents();
          if (window.lucide) lucide.createIcons();
        }, 50);
      });
    }
  },
  
  /**
   * Attach node palette events
   */
  attachNodePaletteEvents() {
    // Search box
    const searchBox = document.getElementById('node-search');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.updateNodesList();
      });
    }
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.selectedCategory = tab.dataset.category;
        this.updateNodesList();
        this.updateCategoryTabs();
      });
    });
    
    // Subcategory headers (accordion)
    document.querySelectorAll('.subcategory-header').forEach(header => {
      header.addEventListener('click', () => {
        const subcat = header.dataset.subcategory;
        
        if (this.expandedSubcategories.has(subcat)) {
          this.expandedSubcategories.delete(subcat);
        } else {
          this.expandedSubcategories.add(subcat);
        }
        
        this.updateNodesList();
      });
    });
    
    // Node palette items (drag to create)
    document.querySelectorAll('.node-palette-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const nodeType = item.dataset.nodeType;
        e.dataTransfer.setData('nodeType', nodeType);
        e.dataTransfer.effectAllowed = 'copy';
        console.log('🎯 Drag start:', nodeType);
      });
    });
  },
  
  /**
   * Attach canvas events
   */
  attachCanvasEvents() {
    const canvas = this.canvasElement;
    if (!canvas) return;
    
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    // Mouse down
    canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    
    // Mouse move
    canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    
    // Mouse up
    canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
    
    // Mouse wheel (zoom)
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      CanvasEngine.setZoom(CanvasEngine.viewport.zoom * delta, e.offsetX, e.offsetY);
      this.updateZoomDisplay();
    }, { passive: false });
    
    // Drop (create node)
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('nodeType');
      if (nodeType) {
        this.createNodeFromDrop(nodeType, e.clientX, e.clientY);
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      CanvasEngine.resize();
    });
  },
  
  /**
   * Handle canvas mouse down
   */
  handleCanvasMouseDown(e) {
    const rect = this.canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (x - CanvasEngine.viewport.x) / CanvasEngine.viewport.zoom;
    const worldY = (y - CanvasEngine.viewport.y) / CanvasEngine.viewport.zoom;
    
    // Check if clicked on a node
    const clickedNode = this.getNodeAtPosition(worldX, worldY);
    
    if (this.currentTool === 'select') {
      if (clickedNode) {
        // Start dragging node(s)
        if (!e.shiftKey) {
          this.selectedNodes = [clickedNode.id];
        } else if (!this.selectedNodes.includes(clickedNode.id)) {
          this.selectedNodes.push(clickedNode.id);
        }
        
        this.isDragging = true;
        this.dragStart = { x: worldX, y: worldY };
        this.draggedNodes = this.selectedNodes.map(id => {
          const node = this.nodes.find(n => n.id === id);
          return {
            id,
            startX: node.x,
            startY: node.y
          };
        });
        
        this.rightPanelOpen = true;
        this.render();
        setTimeout(() => {
          this.attachEvents();
          if (window.lucide) lucide.createIcons();
        }, 50);
      } else {
        // Deselect
        this.selectedNodes = [];
        this.rightPanelOpen = false;
        this.render();
        setTimeout(() => {
          this.attachEvents();
          if (window.lucide) lucide.createIcons();
        }, 50);
      }
    } else if (this.currentTool === 'hand') {
      // Start panning
      CanvasEngine.isPanning = true;
      CanvasEngine.panStart = { x, y };
    } else if (this.currentTool === 'connection') {
      if (clickedNode) {
        // Start connection
        this.isConnecting = true;
        this.connectionStart = clickedNode.id;
      }
    }
    
    CanvasEngine.needsRedraw = true;
  },
  
  /**
   * Handle canvas mouse move
   */
  handleCanvasMouseMove(e) {
    const rect = this.canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (x - CanvasEngine.viewport.x) / CanvasEngine.viewport.zoom;
    const worldY = (y - CanvasEngine.viewport.y) / CanvasEngine.viewport.zoom;
    
    this.mousePos = { x: worldX, y: worldY };
    
    // Update hovered node
    const hoveredNode = this.getNodeAtPosition(worldX, worldY);
    this.hoveredNode = hoveredNode ? hoveredNode.id : null;
    
    // Handle dragging
    if (this.isDragging && this.draggedNodes.length > 0) {
      const dx = worldX - this.dragStart.x;
      const dy = worldY - this.dragStart.y;
      
      this.draggedNodes.forEach(({ id, startX, startY }) => {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
          node.x = startX + dx;
          node.y = startY + dy;
        }
      });
      
      CanvasEngine.needsRedraw = true;
    }
    
    // Handle panning
    if (CanvasEngine.isPanning) {
      const dx = x - CanvasEngine.panStart.x;
      const dy = y - CanvasEngine.panStart.y;
      
      CanvasEngine.viewport.x += dx;
      CanvasEngine.viewport.y += dy;
      
      CanvasEngine.panStart = { x, y };
      CanvasEngine.needsRedraw = true;
    }
    
    // Handle connection preview
    if (this.isConnecting) {
      CanvasEngine.needsRedraw = true;
    }
  },
  
  /**
   * Handle canvas mouse up
   */
  handleCanvasMouseUp(e) {
    const rect = this.canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (x - CanvasEngine.viewport.x) / CanvasEngine.viewport.zoom;
    const worldY = (y - CanvasEngine.viewport.y) / CanvasEngine.viewport.zoom;
    
    // Finish connection
    if (this.isConnecting) {
      const targetNode = this.getNodeAtPosition(worldX, worldY);
      
      if (targetNode && targetNode.id !== this.connectionStart) {
        // Create connection
        const newConnection = {
          id: `conn-${Date.now()}`,
          from: this.connectionStart,
          to: targetNode.id
        };
        
        this.connections.push(newConnection);
        
        console.log('🔗 Connection created:', this.connectionStart, '→', targetNode.id);
        
        // Auto-execute AI workflow if target is AI node
        if (targetNode.type.startsWith('ai-')) {
          console.log('🤖 AI node detected, triggering auto-execution...');
          
          const sourceNode = this.nodes.find(n => n.id === this.connectionStart);
          
          if (window.AIOrchestrator && sourceNode) {
            // Execute AI workflow asynchronously
            setTimeout(async () => {
              await window.AIOrchestrator.executeWorkflow(sourceNode, targetNode);
              CanvasEngine.needsRedraw = true;
            }, 100);
          }
        }
        
        console.log('✅ Connection created!');
      }
      
      this.isConnecting = false;
      this.connectionStart = null;
      CanvasEngine.needsRedraw = true;
    }
    
    // Finish dragging
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedNodes = [];
      this.saveProjectData();
    }
    
    // Finish panning
    if (CanvasEngine.isPanning) {
      CanvasEngine.isPanning = false;
    }
  },
  
  /**
   * Attach inspector events
   */
  attachInspectorEvents() {
    // Title input
    const titleInput = document.getElementById('node-title');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        if (this.selectedNodes.length > 0) {
          const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
          if (node) {
            node.title = e.target.value;
            CanvasEngine.needsRedraw = true;
          }
        }
      });
      
      titleInput.addEventListener('blur', () => {
        this.saveProjectData();
      });
    }
    
    // Description textarea
    const descInput = document.getElementById('node-description');
    if (descInput) {
      descInput.addEventListener('input', (e) => {
        if (this.selectedNodes.length > 0) {
          const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
          if (node) {
            node.description = e.target.value;
          }
        }
      });
      
      descInput.addEventListener('blur', () => {
        this.saveProjectData();
      });
    }
    
    // Status select
    const statusSelect = document.getElementById('node-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        if (this.selectedNodes.length > 0) {
          const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
          if (node) {
            node.status = e.target.value;
            CanvasEngine.needsRedraw = true;
            this.saveProjectData();
          }
        }
      });
    }
    
    // Delete button
    const deleteBtn = document.getElementById('delete-node-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.selectedNodes.length > 0) {
          this.deleteSelectedNodes();
        }
      });
    }
  },
  
  /**
   * Attach keyboard events
   */
  attachKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') {
        this.currentTool = 'select';
        document.querySelector('[data-tool="select"]')?.click();
      } else if (e.key === 'h' || e.key === 'H') {
        this.currentTool = 'hand';
        document.querySelector('[data-tool="hand"]')?.click();
      } else if (e.key === 'c' || e.key === 'C') {
        this.currentTool = 'connection';
        document.querySelector('[data-tool="connection"]')?.click();
      }
      
      // Delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNodes.length > 0) {
        e.preventDefault();
        this.deleteSelectedNodes();
      }
      
      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveProjectData();
      }
      
      // Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this.selectedNodes = this.nodes.map(n => n.id);
        CanvasEngine.needsRedraw = true;
      }
    });
  },
  
  /**
   * Get node at position
   */
  getNodeAtPosition(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      if (x >= node.x && x <= node.x + node.width &&
          y >= node.y && y <= node.y + node.height) {
        return node;
      }
    }
    return null;
  },
  
  /**
   * Create node from drop
   */
  createNodeFromDrop(nodeType, clientX, clientY) {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    
    // Convert to canvas coordinates
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (canvasX - CanvasEngine.viewport.x) / CanvasEngine.viewport.zoom;
    const worldY = (canvasY - CanvasEngine.viewport.y) / CanvasEngine.viewport.zoom;
    
    // Get node definition
    const nodeDef = this.getAllNodeTypes().find(n => n.id === nodeType);
    if (!nodeDef) {
      console.error('❌ Node type not found:', nodeType);
      return;
    }
    
    // Create new node
    const newNode = {
      id: `node-${this.nodeIdCounter++}`,
      type: nodeDef.id,
      category: nodeDef.category,
      subcategory: nodeDef.subcategory,
      icon: nodeDef.icon,
      color: nodeDef.color,
      title: '',
      description: '',
      status: 'todo',
      x: worldX - 100,
      y: worldY - 40,
      width: 200,
      height: 80
    };
    
    this.nodes.push(newNode);
    this.selectedNodes = [newNode.id];
    this.rightPanelOpen = true;
    
    console.log('✨ Node created:', newNode.type, 'at', { x: newNode.x, y: newNode.y });
    CanvasEngine.needsRedraw = true;
    
    // Re-render to show properties panel
    this.render();
    setTimeout(() => {
      this.attachEvents();
      if (window.lucide) lucide.createIcons();
    }, 50);
    
    this.saveProjectData();
  },
  
  /**
   * Delete selected nodes
   */
  deleteSelectedNodes() {
    if (this.selectedNodes.length === 0) return;
    
    // Remove nodes
    this.nodes = this.nodes.filter(n => !this.selectedNodes.includes(n.id));
    
    // Remove connections
    this.connections = this.connections.filter(c => 
      !this.selectedNodes.includes(c.from) && !this.selectedNodes.includes(c.to)
    );
    
    console.log('🗑️ Deleted nodes:', this.selectedNodes.length);
    console.log(`✅ ${this.selectedNodes.length} node(s) deleted`);
    
    this.selectedNodes = [];
    this.rightPanelOpen = false;
    
    CanvasEngine.needsRedraw = true;
    this.render();
    setTimeout(() => {
      this.attachEvents();
      if (window.lucide) lucide.createIcons();
    }, 50);
    
    this.saveProjectData();
  },
  
  /**
   * Update zoom display
   */
  updateZoomDisplay() {
    const display = document.getElementById('zoom-display');
    if (display) {
      display.textContent = Math.round(CanvasEngine.viewport.zoom * 100) + '%';
    }
  },
  
  /**
   * Update nodes list
   */
  updateNodesList() {
    const container = document.getElementById('node-categories');
    if (container) {
      container.innerHTML = this.renderNodesList();
      this.attachNodePaletteEvents();
      if (window.lucide) lucide.createIcons();
    }
  },
  
  /**
   * Update category tabs
   */
  updateCategoryTabs() {
    const container = document.querySelector('[style*="overflow-x: auto"]');
    if (container) {
      container.innerHTML = this.renderCategoryTabs();
      
      // Re-attach events
      document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.selectedCategory = tab.dataset.category;
          this.updateNodesList();
          this.updateCategoryTabs();
        });
      });
      
      if (window.lucide) lucide.createIcons();
    }
  },
  
  /**
   * Load project data from D1/localStorage
   */
  async loadProjectData() {
    console.log('📦 Loading project data...');
    
    // Try D1 first, fallback to localStorage
    try {
      const response = await fetch(`/api/projects/${this.currentProject.id}/canvas`);
      if (response.ok) {
        const data = await response.json();
        this.nodes = data.nodes || [];
        this.connections = data.connections || [];
        console.log('✅ Data loaded from D1');
        return;
      }
    } catch (error) {
      console.warn('⚠️ D1 load failed, using localStorage');
    }
    
    // Fallback to localStorage
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
      const currentUser = Auth.getCurrentUser();
      if (currentUser) {
        const storageKey = `museflow_canvas_${currentUser.id}_${this.currentProject.id}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const data = JSON.parse(stored);
          this.nodes = data.nodes || [];
          this.connections = data.connections || [];
          console.log('✅ Data loaded from localStorage');
          return;
        }
      }
    }
    
    // If no data, load sample workflow for demo
    if (this.nodes.length === 0 && this.currentProject.name === '샘플 워크플로우') {
      console.log('📋 Loading sample workflow...');
      this.loadSampleWorkflow();
    }
  },
  
  /**
   * Load sample workflow for demo/tutorial
   */
  loadSampleWorkflow() {
    // Sample Workflow 1: Exhibition Planning Process (전시 기획 프로세스)
    this.nodes = [
      // Planning Phase
      { id: 1, type: 'exhibition-concept', category: 'exhibition', x: 100, y: 100, label: '전시 컨셉 기획' },
      { id: 2, type: 'exhibition-research', category: 'exhibition', x: 100, y: 220, label: '전시 조사' },
      { id: 3, type: 'budget-planning', category: 'admin', x: 100, y: 340, label: '예산 편성' },
      
      // Design Phase
      { id: 4, type: 'exhibition-design', category: 'exhibition', x: 400, y: 100, label: '전시 디자인' },
      { id: 5, type: 'space-planning', category: 'exhibition', x: 400, y: 220, label: '공간 계획' },
      
      // Content Phase
      { id: 6, type: 'artifact-selection', category: 'archive', x: 700, y: 100, label: '유물 선정' },
      { id: 7, type: 'label-writing', category: 'publication', x: 700, y: 220, label: '레이블 작성' },
      { id: 8, type: 'catalog-writing', category: 'publication', x: 700, y: 340, label: '도록 작성' },
      
      // Installation Phase
      { id: 9, type: 'exhibition-installation', category: 'exhibition', x: 1000, y: 100, label: '전시 설치' },
      { id: 10, type: 'lighting-setup', category: 'exhibition', x: 1000, y: 220, label: '조명 설치' },
      
      // Opening Phase
      { id: 11, type: 'opening-event', category: 'engagement', x: 1300, y: 160, label: '오프닝 행사' },
      
      // Education Programs
      { id: 12, type: 'education-program', category: 'education', x: 1000, y: 340, label: '교육 프로그램' },
      { id: 13, type: 'docent-training', category: 'education', x: 1000, y: 460, label: '도슨트 교육' }
    ];
    
    this.connections = [
      // Planning → Design
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      
      // Design → Content
      { from: 4, to: 6 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 6, to: 8 },
      
      // Content → Installation
      { from: 7, to: 9 },
      { from: 8, to: 9 },
      { from: 9, to: 10 },
      
      // Installation → Opening
      { from: 10, to: 11 },
      
      // Opening → Education
      { from: 11, to: 12 },
      { from: 12, to: 13 }
    ];
    
    console.log('✅ Sample workflow loaded:', this.nodes.length, 'nodes');
    this.render();
  },
  
  /**
   * Save project data to D1/localStorage
   */
  async saveProjectData() {
    console.log('💾 Saving project data...');
    
    const data = {
      nodes: this.nodes,
      connections: this.connections
    };
    
    // Try D1 first
    try {
      const response = await fetch(`/api/projects/${this.currentProject.id}/canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('✅ Data saved to D1');
        console.log('✅ Canvas saved');
        return;
      }
    } catch (error) {
      console.warn('⚠️ D1 save failed, using localStorage');
    }
    
    // Fallback to localStorage
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
      const currentUser = Auth.getCurrentUser();
      if (currentUser) {
        const storageKey = `museflow_canvas_${currentUser.id}_${this.currentProject.id}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('✅ Data saved to localStorage');
      }
    }
    console.log('✅ Canvas saved');
  }
};

// Expose globally
window.CanvasV3 = CanvasV3;
console.log('✅ Canvas V3 loaded');
