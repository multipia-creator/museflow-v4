/**
 * Canvas Page V2 - World-Class Node-Based Editor
 * Figma + Node System + Notion Style
 * 
 * Features:
 * - Infinite canvas with smooth zoom/pan
 * - 88+ specialized museum workflow nodes
 * - Bezier curve connections
 * - Left panel: Node library with search
 * - Right panel: Node properties editor
 * - Top toolbar: World-class icons
 * - Keyboard shortcuts
 * - Auto-save to localStorage
 */

const CanvasV2 = {
  // Current project
  currentProject: null,
  
  // Canvas state
  canvas: null,
  ctx: null,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
    minZoom: 0.1,
    maxZoom: 5
  },
  
  // Nodes and connections
  nodes: [],
  connections: [],
  selectedNodes: [],
  hoveredNode: null,
  
  // Interaction state
  isDragging: false,
  isPanning: false,
  isConnecting: false,
  dragStart: { x: 0, y: 0 },
  panStart: { x: 0, y: 0 },
  connectionStart: null,
  mousePos: { x: 0, y: 0 },
  
  // UI state
  leftPanelOpen: true,
  rightPanelOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  
  // Node ID counter
  nodeIdCounter: 1,
  
  /**
   * Initialize canvas
   */
  async init() {
    console.log('🎨 Initializing Canvas V2...');
    
    // Load project
    this.loadProject();
    if (!this.currentProject) {
      Toast.error('No project selected');
      Router.navigate('/project-manager');
      return;
    }
    
    // Initialize backend integration
    await this.initBackendIntegration();
    
    // Render UI
    this.render();
    
    // Wait for DOM to update before attaching events
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Initialize canvas
    this.canvas = document.getElementById('main-canvas');
    if (!this.canvas) {
      console.error('❌ Canvas element not found!');
      Toast.error('Canvas element not found');
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // Now attach events (canvas is ready)
    this.attachEvents();
    
    // Load saved data (from D1 or localStorage fallback)
    await this.loadCanvasData();
    
    // Start render loop
    this.startRenderLoop();
    
    // Auto-save every 10 seconds (to D1)
    setInterval(() => this.saveCanvasData(), 10000);
    
    console.log('✅ Canvas V2 initialized');
  },
  
  /**
   * Initialize backend integration (API, Sync, AI, Collaboration)
   */
  async initBackendIntegration() {
    try {
      // Initialize API client
      if (!window.MuseFlowAPI) {
        initMuseFlowAPI();
      }
      
      // Initialize Workflow Sync
      if (!window.WorkflowSync) {
        initWorkflowSync(window.MuseFlowAPI);
      }
      
      // Initialize AI Generator
      if (!window.AIGenerator) {
        initAIGenerator(window.MuseFlowAPI);
      }
      
      // Test AI connection
      const isAIReady = await window.AIGenerator.testConnection();
      console.log('🤖 AI Status:', isAIReady ? '✅ Ready' : '⚠️ Not available');
      
      // Initialize Collaboration (after loading workflow)
      setTimeout(() => {
        this.initCollaboration();
        
        // Show collaboration panel
        if (typeof CollaborationPanel !== 'undefined') {
          CollaborationPanel.render();
        }
      }, 1000);
      
    } catch (error) {
      console.warn('⚠️ Backend integration warning:', error.message);
      if (typeof Toast !== 'undefined') {
        Toast.warning('Running in offline mode');
      }
    }
  },
  
  /**
   * Initialize real-time collaboration
   */
  async initCollaboration() {
    if (!this.currentProject || typeof initCollaboration === 'undefined') {
      return;
    }
    
    try {
      const userId = 'user-' + Math.random().toString(36).substring(7);
      const userName = Auth.currentUser?.name || 'Anonymous';
      const workflowId = window.WorkflowSync?.workflowId || this.currentProject.id;
      
      // Initialize collaboration client
      const collab = initCollaboration(workflowId, userId, userName);
      
      // Connect to room
      await collab.connect();
      
      // Setup event listeners
      this.setupCollaborationListeners();
      
      console.log('✅ Collaboration initialized');
      
      if (typeof Toast !== 'undefined') {
        Toast.success('Collaboration enabled');
      }
    } catch (error) {
      console.warn('⚠️ Collaboration init failed:', error.message);
    }
  },
  
  /**
   * Setup collaboration event listeners
   */
  setupCollaborationListeners() {
    const collab = window.CollaborationClient;
    if (!collab) return;
    
    // User joined/left
    collab.on('user-joined', (user) => {
      console.log('👋 User joined:', user.name);
      if (typeof Toast !== 'undefined') {
        Toast.info(`${user.name} joined`);
      }
    });
    
    collab.on('user-left', (userId) => {
      console.log('👋 User left:', userId);
    });
    
    // Node updates from other users
    collab.on('node-update', ({ userId, node }) => {
      // Update node if it exists
      const existingNode = this.nodes.find(n => n.id === node.id);
      if (existingNode) {
        Object.assign(existingNode, node);
      }
    });
    
    collab.on('node-create', ({ userId, node }) => {
      // Add node if it doesn't exist
      const exists = this.nodes.find(n => n.id === node.id);
      if (!exists) {
        this.nodes.push(node);
      }
    });
    
    collab.on('node-delete', ({ userId, nodeId }) => {
      // Remove node
      this.nodes = this.nodes.filter(n => n.id !== nodeId);
    });
    
    // Send cursor position on mouse move (throttled)
    let lastCursorSend = 0;
    this.canvas.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastCursorSend < 50) return; // Throttle to 20fps
      lastCursorSend = now;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.viewport.x) / this.viewport.zoom;
      const y = (e.clientY - rect.top - this.viewport.y) / this.viewport.zoom;
      
      collab.sendCursor(x, y);
    });
  },
  
  /**
   * Load project from session storage
   */
  loadProject() {
    console.log('📦 Loading project from sessionStorage...');
    
    // Try both keys for compatibility
    let projectData = sessionStorage.getItem('museflow_current_project');
    if (!projectData) {
      projectData = sessionStorage.getItem('canvas_project');
    }
    
    if (projectData) {
      this.currentProject = JSON.parse(projectData);
      console.log('✅ Loaded project:', this.currentProject.name);
    } else {
      console.error('❌ No project data found in sessionStorage');
      console.log('Keys in sessionStorage:', Object.keys(sessionStorage));
    }
  },
  
  /**
   * Render the entire UI
   */
  render() {
    const container = document.createElement('div');
    container.setAttribute('data-page', 'canvas');
    
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100vh; background: #f9fafb; overflow: hidden;">
        
        <!-- Top Toolbar -->
        ${this.renderToolbar()}
        
        <!-- Main Content Area -->
        <div style="display: flex; flex: 1; overflow: hidden;">
          
          <!-- Left Panel: Node Library -->
          ${this.renderLeftPanel()}
          
          <!-- Canvas Area -->
          <div style="flex: 1; position: relative; overflow: hidden; background: #ffffff;">
            <canvas id="main-canvas" style="display: block; cursor: grab;"></canvas>
            
            <!-- Canvas Controls -->
            <div style="position: absolute; bottom: 24px; left: 24px; display: flex; gap: 8px;">
              ${this.renderCanvasControls()}
            </div>
            
            <!-- Zoom Indicator -->
            <div style="position: absolute; bottom: 24px; right: 24px; 
                        background: white; padding: 8px 16px; border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 13px; 
                        font-weight: 600; color: #6b7280;">
              ${Math.round(this.viewport.zoom * 100)}%
            </div>
          </div>
          
          <!-- Right Panel: Properties -->
          ${this.renderRightPanel()}
          
        </div>
      </div>
      
      <style>
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Node hover effect */
        .node-item:hover {
          background: #f3f4f6 !important;
        }
        
        /* Toolbar button hover */
        .toolbar-btn:hover {
          background: #f3f4f6 !important;
        }
        
        /* Panel transition */
        .side-panel {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      </style>
    `;
    
    document.getElementById('app').appendChild(container);
    console.log('✅ Canvas V2 UI rendered');
  },

  /**
   * Render top toolbar
   */
  renderToolbar() {
    return `
      <div style="height: 56px; background: white; border-bottom: 1px solid #e5e7eb;
                  display: flex; align-items: center; padding: 0 16px; gap: 16px;
                  flex-shrink: 0;">
        
        <!-- Back Button -->
        <button class="toolbar-btn" id="back-btn" title="Back to Projects"
                style="width: 36px; height: 36px; border: none; background: transparent;
                       border-radius: 8px; cursor: pointer; display: flex; align-items: center;
                       justify-content: center; color: #6b7280; font-size: 20px;">
          ←
        </button>
        
        <!-- Project Name -->
        <div style="flex: 1; font-weight: 600; color: #1f2937; font-size: 14px;">
          ${this.currentProject?.name || 'Untitled Project'}
        </div>
        
        <!-- Tool Buttons -->
        <div style="display: flex; gap: 4px; padding: 0 8px; border-left: 1px solid #e5e7eb;">
          <button class="toolbar-btn" id="tool-select" title="Select (V)"
                  style="width: 36px; height: 36px; border: none; background: #f3f4f6;
                         border-radius: 6px; cursor: pointer; font-size: 18px;">
            ⌖
          </button>
          <button class="toolbar-btn" id="tool-hand" title="Hand (H)"
                  style="width: 36px; height: 36px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 18px;">
            ✋
          </button>
          <button class="toolbar-btn" id="tool-comment" title="Comment (C)"
                  style="width: 36px; height: 36px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 18px;">
            💬
          </button>
        </div>
        
        <!-- View Controls -->
        <div style="display: flex; gap: 4px; padding: 0 8px; border-left: 1px solid #e5e7eb;">
          <button class="toolbar-btn" id="zoom-out" title="Zoom Out (-)"
                  style="width: 36px; height: 36px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 18px;">
            −
          </button>
          <button class="toolbar-btn" id="zoom-reset" title="Reset Zoom (0)"
                  style="width: 36px; height: 36px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
            ${Math.round(this.viewport.zoom * 100)}%
          </button>
          <button class="toolbar-btn" id="zoom-in" title="Zoom In (+)"
                  style="width: 36px; height: 36px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 18px;">
            +
          </button>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 8px; padding: 0 8px; border-left: 1px solid #e5e7eb;">
          <button class="toolbar-btn" id="undo-btn" title="Undo (Ctrl+Z)"
                  style="padding: 8px 16px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 13px; 
                         font-weight: 600; color: #6b7280;">
            ↶ Undo
          </button>
          <button class="toolbar-btn" id="redo-btn" title="Redo (Ctrl+Shift+Z)"
                  style="padding: 8px 16px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; font-size: 13px;
                         font-weight: 600; color: #6b7280;">
            ↷ Redo
          </button>
        </div>
        
        <!-- AI Generate Button -->
        <button id="ai-generate-btn" title="AI Generate Workflow (Ctrl+G)"
                style="padding: 8px 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                       color: white; border: none; border-radius: 8px; cursor: pointer;
                       font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          🤖 AI Generate
        </button>
        
        <!-- Save Button -->
        <button id="save-btn" title="Save (Ctrl+S)"
                style="padding: 8px 20px; background: linear-gradient(135deg, #667eea, #764ba2);
                       color: white; border: none; border-radius: 8px; cursor: pointer;
                       font-size: 13px; font-weight: 600;">
          💾 Save
        </button>
      </div>
    `;
  },

  /**
   * Render left panel with node library
   */
  renderLeftPanel() {
    if (!this.leftPanelOpen) {
      return `
        <button id="show-left-panel" 
                style="position: absolute; left: 0; top: 80px; z-index: 10;
                       width: 40px; height: 40px; background: white; border: 1px solid #e5e7eb;
                       border-left: none; border-radius: 0 8px 8px 0; cursor: pointer;
                       display: flex; align-items: center; justify-content: center;
                       font-size: 18px; color: #6b7280;">
          →
        </button>
      `;
    }
    
    return `
      <div class="side-panel" style="width: 280px; background: white; border-right: 1px solid #e5e7eb;
                                     display: flex; flex-direction: column; flex-shrink: 0;">
        
        <!-- Panel Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex;
                    align-items: center; justify-content: space-between;">
          <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
            📦 Nodes
          </div>
          <button id="hide-left-panel" 
                  style="width: 28px; height: 28px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 16px;">
            ←
          </button>
        </div>
        
        <!-- Search Box -->
        <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          <input type="text" id="node-search" placeholder="Search nodes..."
                 style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                        border-radius: 6px; font-size: 13px; box-sizing: border-box;">
        </div>
        
        <!-- Category Tabs -->
        <div style="display: flex; gap: 4px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
                    overflow-x: auto;">
          ${this.renderCategoryTabs()}
        </div>
        
        <!-- Nodes List -->
        <div style="flex: 1; overflow-y: auto; padding: 8px;">
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
      { id: 'all', name: 'All', icon: '📋' },
      { id: 'exhibition', name: 'Exhibition', icon: '🎨' },
      { id: 'education', name: 'Education', icon: '📚' },
      { id: 'archive', name: 'Archive', icon: '📦' },
      { id: 'publication', name: 'Publication', icon: '📰' },
      { id: 'research', name: 'Research', icon: '🔬' },
      { id: 'admin', name: 'Admin', icon: '⚙️' }
    ];
    
    return categories.map(cat => `
      <button class="category-tab" data-category="${cat.id}"
              style="padding: 6px 12px; border: none; 
                     background: ${this.selectedCategory === cat.id ? '#f3f4f6' : 'transparent'};
                     border-radius: 6px; cursor: pointer; font-size: 12px;
                     font-weight: ${this.selectedCategory === cat.id ? '600' : '500'};
                     color: ${this.selectedCategory === cat.id ? '#1f2937' : '#6b7280'};
                     white-space: nowrap;">
        ${cat.icon} ${cat.name}
      </button>
    `).join('');
  },

  /**
   * Render nodes list
   */
  renderNodesList() {
    const nodes = this.getFilteredNodes();
    
    if (nodes.length === 0) {
      return `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 13px;">No nodes found</div>
        </div>
      `;
    }
    
    return nodes.map(node => `
      <div class="node-item" data-node-type="${node.id}" draggable="true"
           style="padding: 10px 12px; margin-bottom: 4px; border-radius: 6px;
                  cursor: grab; display: flex; align-items: center; gap: 10px;
                  background: white; border: 1px solid transparent;">
        <div style="font-size: 20px; flex-shrink: 0;">${node.icon}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 500; color: #1f2937;
                      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${node.name}
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;
                      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${node.category}
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Get filtered nodes based on search and category
   */
  getFilteredNodes() {
    let nodes = this.getAllNodeTypes();
    
    // Filter by category
    if (this.selectedCategory !== 'all') {
      nodes = nodes.filter(n => n.category === this.selectedCategory);
    }
    
    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      nodes = nodes.filter(n => 
        n.name.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query)
      );
    }
    
    return nodes;
  },

  /**
   * Get all 88+ node types
   */
  getAllNodeTypes() {
    return [
      // Exhibition nodes (15)
      { id: 'exhibition-planning', name: 'Exhibition Planning', category: 'exhibition', icon: '🎨', color: '#8b5cf6' },
      { id: 'curator-assignment', name: 'Curator Assignment', category: 'exhibition', icon: '👤', color: '#8b5cf6' },
      { id: 'artwork-selection', name: 'Artwork Selection', category: 'exhibition', icon: '🖼️', color: '#8b5cf6' },
      { id: 'layout-design', name: 'Layout Design', category: 'exhibition', icon: '📐', color: '#8b5cf6' },
      { id: 'lighting-setup', name: 'Lighting Setup', category: 'exhibition', icon: '💡', color: '#8b5cf6' },
      { id: 'label-creation', name: 'Label Creation', category: 'exhibition', icon: '🏷️', color: '#8b5cf6' },
      { id: 'installation', name: 'Installation', category: 'exhibition', icon: '🔨', color: '#8b5cf6' },
      { id: 'opening-event', name: 'Opening Event', category: 'exhibition', icon: '🎉', color: '#8b5cf6' },
      { id: 'visitor-feedback', name: 'Visitor Feedback', category: 'exhibition', icon: '📝', color: '#8b5cf6' },
      { id: 'exhibition-tour', name: 'Exhibition Tour', category: 'exhibition', icon: '🚶', color: '#8b5cf6' },
      { id: 'multimedia-setup', name: 'Multimedia Setup', category: 'exhibition', icon: '🎬', color: '#8b5cf6' },
      { id: 'security-planning', name: 'Security Planning', category: 'exhibition', icon: '🔒', color: '#8b5cf6' },
      { id: 'climate-control', name: 'Climate Control', category: 'exhibition', icon: '🌡️', color: '#8b5cf6' },
      { id: 'accessibility', name: 'Accessibility', category: 'exhibition', icon: '♿', color: '#8b5cf6' },
      { id: 'deinstallation', name: 'Deinstallation', category: 'exhibition', icon: '📦', color: '#8b5cf6' },
      
      // Education nodes (15)
      { id: 'program-design', name: 'Program Design', category: 'education', icon: '📚', color: '#06b6d4' },
      { id: 'workshop-planning', name: 'Workshop Planning', category: 'education', icon: '🎓', color: '#06b6d4' },
      { id: 'educator-training', name: 'Educator Training', category: 'education', icon: '👨‍🏫', color: '#06b6d4' },
      { id: 'school-outreach', name: 'School Outreach', category: 'education', icon: '🏫', color: '#06b6d4' },
      { id: 'family-program', name: 'Family Program', category: 'education', icon: '👨‍👩‍👧', color: '#06b6d4' },
      { id: 'lecture-series', name: 'Lecture Series', category: 'education', icon: '🎤', color: '#06b6d4' },
      { id: 'online-learning', name: 'Online Learning', category: 'education', icon: '💻', color: '#06b6d4' },
      { id: 'curriculum-development', name: 'Curriculum Development', category: 'education', icon: '📖', color: '#06b6d4' },
      { id: 'assessment', name: 'Assessment', category: 'education', icon: '📊', color: '#06b6d4' },
      { id: 'resource-creation', name: 'Resource Creation', category: 'education', icon: '📄', color: '#06b6d4' },
      { id: 'community-partnership', name: 'Community Partnership', category: 'education', icon: '🤝', color: '#06b6d4' },
      { id: 'volunteer-program', name: 'Volunteer Program', category: 'education', icon: '🙋', color: '#06b6d4' },
      { id: 'student-exhibition', name: 'Student Exhibition', category: 'education', icon: '🎨', color: '#06b6d4' },
      { id: 'art-therapy', name: 'Art Therapy', category: 'education', icon: '💚', color: '#06b6d4' },
      { id: 'special-needs', name: 'Special Needs Program', category: 'education', icon: '🌟', color: '#06b6d4' },
      
      // Archive nodes (15)
      { id: 'digitization', name: 'Digitization', category: 'archive', icon: '📸', color: '#10b981' },
      { id: 'cataloging', name: 'Cataloging', category: 'archive', icon: '📋', color: '#10b981' },
      { id: 'metadata-creation', name: 'Metadata Creation', category: 'archive', icon: '🏷️', color: '#10b981' },
      { id: 'preservation', name: 'Preservation', category: 'archive', icon: '🛡️', color: '#10b981' },
      { id: 'restoration', name: 'Restoration', category: 'archive', icon: '🔧', color: '#10b981' },
      { id: 'storage-management', name: 'Storage Management', category: 'archive', icon: '📦', color: '#10b981' },
      { id: 'condition-report', name: 'Condition Report', category: 'archive', icon: '📝', color: '#10b981' },
      { id: 'photography', name: 'Photography', category: 'archive', icon: '📷', color: '#10b981' },
      { id: 'database-entry', name: 'Database Entry', category: 'archive', icon: '💾', color: '#10b981' },
      { id: 'provenance-research', name: 'Provenance Research', category: 'archive', icon: '🔍', color: '#10b981' },
      { id: 'inventory', name: 'Inventory', category: 'archive', icon: '📊', color: '#10b981' },
      { id: 'loan-management', name: 'Loan Management', category: 'archive', icon: '🤝', color: '#10b981' },
      { id: 'accession', name: 'Accession', category: 'archive', icon: '➕', color: '#10b981' },
      { id: 'deaccession', name: 'Deaccession', category: 'archive', icon: '➖', color: '#10b981' },
      { id: 'rights-management', name: 'Rights Management', category: 'archive', icon: '©️', color: '#10b981' },
      
      // Publication nodes (12)
      { id: 'catalog-writing', name: 'Catalog Writing', category: 'publication', icon: '✍️', color: '#f59e0b' },
      { id: 'essay-commission', name: 'Essay Commission', category: 'publication', icon: '📄', color: '#f59e0b' },
      { id: 'editing', name: 'Editing', category: 'publication', icon: '✏️', color: '#f59e0b' },
      { id: 'design-layout', name: 'Design & Layout', category: 'publication', icon: '🎨', color: '#f59e0b' },
      { id: 'image-selection', name: 'Image Selection', category: 'publication', icon: '🖼️', color: '#f59e0b' },
      { id: 'copyright-clearance', name: 'Copyright Clearance', category: 'publication', icon: '©️', color: '#f59e0b' },
      { id: 'printing', name: 'Printing', category: 'publication', icon: '🖨️', color: '#f59e0b' },
      { id: 'distribution', name: 'Distribution', category: 'publication', icon: '📦', color: '#f59e0b' },
      { id: 'digital-publication', name: 'Digital Publication', category: 'publication', icon: '💻', color: '#f59e0b' },
      { id: 'newsletter', name: 'Newsletter', category: 'publication', icon: '📧', color: '#f59e0b' },
      { id: 'press-release', name: 'Press Release', category: 'publication', icon: '📰', color: '#f59e0b' },
      { id: 'social-media', name: 'Social Media', category: 'publication', icon: '📱', color: '#f59e0b' },
      
      // Research nodes (12)
      { id: 'artwork-research', name: 'Artwork Research', category: 'research', icon: '🔬', color: '#ec4899' },
      { id: 'artist-biography', name: 'Artist Biography', category: 'research', icon: '👤', color: '#ec4899' },
      { id: 'historical-context', name: 'Historical Context', category: 'research', icon: '📜', color: '#ec4899' },
      { id: 'literature-review', name: 'Literature Review', category: 'research', icon: '📚', color: '#ec4899' },
      { id: 'archive-visit', name: 'Archive Visit', category: 'research', icon: '🏛️', color: '#ec4899' },
      { id: 'interview', name: 'Interview', category: 'research', icon: '🎤', color: '#ec4899' },
      { id: 'survey', name: 'Survey', category: 'research', icon: '📊', color: '#ec4899' },
      { id: 'data-analysis', name: 'Data Analysis', category: 'research', icon: '📈', color: '#ec4899' },
      { id: 'report-writing', name: 'Report Writing', category: 'research', icon: '📝', color: '#ec4899' },
      { id: 'peer-review', name: 'Peer Review', category: 'research', icon: '👥', color: '#ec4899' },
      { id: 'conference', name: 'Conference', category: 'research', icon: '🎓', color: '#ec4899' },
      { id: 'publication-submit', name: 'Publication Submit', category: 'research', icon: '📤', color: '#ec4899' },
      
      // Administration nodes (19)
      { id: 'budget-planning', name: 'Budget Planning', category: 'admin', icon: '💰', color: '#6366f1' },
      { id: 'funding-application', name: 'Funding Application', category: 'admin', icon: '💸', color: '#6366f1' },
      { id: 'staff-meeting', name: 'Staff Meeting', category: 'admin', icon: '👥', color: '#6366f1' },
      { id: 'hiring', name: 'Hiring', category: 'admin', icon: '🤝', color: '#6366f1' },
      { id: 'training', name: 'Training', category: 'admin', icon: '📚', color: '#6366f1' },
      { id: 'policy-development', name: 'Policy Development', category: 'admin', icon: '📋', color: '#6366f1' },
      { id: 'compliance', name: 'Compliance', category: 'admin', icon: '✅', color: '#6366f1' },
      { id: 'insurance', name: 'Insurance', category: 'admin', icon: '🛡️', color: '#6366f1' },
      { id: 'facility-management', name: 'Facility Management', category: 'admin', icon: '🏢', color: '#6366f1' },
      { id: 'it-support', name: 'IT Support', category: 'admin', icon: '💻', color: '#6366f1' },
      { id: 'vendor-management', name: 'Vendor Management', category: 'admin', icon: '🤝', color: '#6366f1' },
      { id: 'contract-negotiation', name: 'Contract Negotiation', category: 'admin', icon: '📜', color: '#6366f1' },
      { id: 'board-meeting', name: 'Board Meeting', category: 'admin', icon: '🎩', color: '#6366f1' },
      { id: 'fundraising', name: 'Fundraising', category: 'admin', icon: '💝', color: '#6366f1' },
      { id: 'marketing', name: 'Marketing', category: 'admin', icon: '📣', color: '#6366f1' },
      { id: 'visitor-services', name: 'Visitor Services', category: 'admin', icon: '🎫', color: '#6366f1' },
      { id: 'ticketing', name: 'Ticketing', category: 'admin', icon: '🎟️', color: '#6366f1' },
      { id: 'membership', name: 'Membership', category: 'admin', icon: '💳', color: '#6366f1' },
      { id: 'evaluation', name: 'Evaluation', category: 'admin', icon: '📊', color: '#6366f1' }
    ];
  },

  /**
   * Render right panel with node properties
   */
  renderRightPanel() {
    if (!this.rightPanelOpen || this.selectedNodes.length === 0) {
      return '';
    }
    
    const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
    if (!node) return '';
    
    return `
      <div class="side-panel" style="width: 300px; background: white; border-left: 1px solid #e5e7eb;
                                     display: flex; flex-direction: column; flex-shrink: 0;">
        
        <!-- Panel Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex;
                    align-items: center; justify-content: space-between;">
          <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
            ⚙️ Properties
          </div>
          <button id="hide-right-panel" 
                  style="width: 28px; height: 28px; border: none; background: transparent;
                         border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 16px;">
            →
          </button>
        </div>
        
        <!-- Properties Content -->
        <div style="flex: 1; overflow-y: auto; padding: 16px;">
          ${this.renderNodeProperties(node)}
        </div>
      </div>
    `;
  },

  /**
   * Render node properties editor
   */
  renderNodeProperties(node) {
    return `
      <!-- Node Type -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 32px; text-align: center; margin-bottom: 8px;">
          ${node.icon}
        </div>
        <div style="text-align: center; font-weight: 600; color: #1f2937; font-size: 14px;">
          ${node.type}
        </div>
      </div>
      
      <!-- Title -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; 
                      color: #6b7280; margin-bottom: 6px;">
          Title
        </label>
        <input type="text" id="node-title" value="${node.title || ''}"
               style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                      border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>
      
      <!-- Description -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600;
                      color: #6b7280; margin-bottom: 6px;">
          Description
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
          Status
        </label>
        <select id="node-status" 
                style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb;
                       border-radius: 6px; font-size: 13px; box-sizing: border-box;">
          <option value="todo" ${node.status === 'todo' ? 'selected' : ''}>To Do</option>
          <option value="in-progress" ${node.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${node.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
      </div>
      
      <!-- Color -->
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600;
                      color: #6b7280; margin-bottom: 6px;">
          Color
        </label>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444'].map(color => `
            <button class="color-btn" data-color="${color}"
                    style="width: 32px; height: 32px; border: 2px solid ${node.color === color ? color : 'transparent'};
                           background: ${color}; border-radius: 6px; cursor: pointer;">
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Actions -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <button id="delete-node-btn"
                style="width: 100%; padding: 10px; background: #fee2e2; color: #dc2626;
                       border: none; border-radius: 6px; cursor: pointer; font-size: 13px;
                       font-weight: 600;">
          🗑️ Delete Node
        </button>
      </div>
    `;
  },

  /**
   * Render canvas controls
   */
  renderCanvasControls() {
    return `
      <button id="fit-view-btn" title="Fit to View (Shift+1)"
              style="width: 40px; height: 40px; background: white; border: 1px solid #e5e7eb;
                     border-radius: 8px; cursor: pointer; display: flex; align-items: center;
                     justify-content: center; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        ⊡
      </button>
      <button id="zoom-100-btn" title="Zoom to 100% (Shift+0)"
              style="width: 40px; height: 40px; background: white; border: 1px solid #e5e7eb;
                     border-radius: 8px; cursor: pointer; display: flex; align-items: center;
                     justify-content: center; font-size: 12px; font-weight: 600;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        1:1
      </button>
    `;
  },

  // ... (계속됩니다)
  
  /**
   * Attach all event handlers
   */
  attachEvents() {
    console.log('📌 Attaching events...');
    
    // Toolbar events
    this.attachToolbarEvents();
    
    // Left panel events
    this.attachLeftPanelEvents();
    
    // Right panel events
    this.attachRightPanelEvents();
    
    // Canvas events
    this.attachCanvasEvents();
    
    // Keyboard shortcuts
    this.attachKeyboardEvents();
    
    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
    
    console.log('✅ Events attached');
  },
  
  /**
   * Attach toolbar event handlers
   */
  attachToolbarEvents() {
    // Back button
    document.getElementById('back-btn')?.addEventListener('click', () => {
      Router.navigate('/project-manager');
    });
    
    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.zoomIn();
    });
    
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.zoomOut();
    });
    
    document.getElementById('zoom-reset')?.addEventListener('click', () => {
      this.resetZoom();
    });
    
    // AI Generate button
    document.getElementById('ai-generate-btn')?.addEventListener('click', () => {
      if (window.AIGenerationModal) {
        AIGenerationModal.show();
      } else {
        Toast.error('AI features not available');
      }
    });
    
    // Save button
    document.getElementById('save-btn')?.addEventListener('click', async () => {
      await this.saveCanvasData();
      Toast.success('Canvas saved!');
    });
    
    // Undo/Redo (placeholder)
    document.getElementById('undo-btn')?.addEventListener('click', () => {
      Toast.info('Undo coming soon');
    });
    
    document.getElementById('redo-btn')?.addEventListener('click', () => {
      Toast.info('Redo coming soon');
    });
  },
  
  /**
   * Attach left panel event handlers
   */
  attachLeftPanelEvents() {
    // Search
    const searchInput = document.getElementById('node-search');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateNodesList();
    });
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.selectedCategory = tab.dataset.category;
        this.updateLeftPanel();
      });
    });
    
    // Node drag start
    document.querySelectorAll('.node-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const nodeType = item.dataset.nodeType;
        e.dataTransfer.setData('nodeType', nodeType);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
    
    // Panel toggle
    document.getElementById('hide-left-panel')?.addEventListener('click', () => {
      this.leftPanelOpen = false;
      this.updateUI();
    });
    
    document.getElementById('show-left-panel')?.addEventListener('click', () => {
      this.leftPanelOpen = true;
      this.updateUI();
    });
  },
  
  /**
   * Attach right panel event handlers
   */
  attachRightPanelEvents() {
    // Panel toggle
    document.getElementById('hide-right-panel')?.addEventListener('click', () => {
      this.rightPanelOpen = false;
      this.updateUI();
    });
    
    // Property inputs
    document.getElementById('node-title')?.addEventListener('input', (e) => {
      this.updateSelectedNodeProperty('title', e.target.value);
    });
    
    document.getElementById('node-description')?.addEventListener('input', (e) => {
      this.updateSelectedNodeProperty('description', e.target.value);
    });
    
    document.getElementById('node-status')?.addEventListener('change', (e) => {
      this.updateSelectedNodeProperty('status', e.target.value);
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateSelectedNodeProperty('color', btn.dataset.color);
        this.updateRightPanel();
      });
    });
    
    // Delete button
    document.getElementById('delete-node-btn')?.addEventListener('click', () => {
      this.deleteSelectedNodes();
    });
  },
  
  /**
   * Attach canvas event handlers
   */
  attachCanvasEvents() {
    if (!this.canvas) return;
    
    // Drop handler for adding nodes
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('nodeType');
      if (nodeType) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;
        this.addNode(nodeType, x, y);
      }
    });
    
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    
    // Canvas controls
    document.getElementById('fit-view-btn')?.addEventListener('click', () => {
      this.fitToView();
    });
    
    document.getElementById('zoom-100-btn')?.addEventListener('click', () => {
      this.resetZoom();
    });
  },
  
  /**
   * Attach keyboard event handlers
   */
  attachKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedNodes.length > 0) {
          e.preventDefault();
          this.deleteSelectedNodes();
        }
      }
      
      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveCanvasData();
        Toast.success('Canvas saved!');
      }
      
      // Ctrl+G - AI Generate
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        if (window.AIGenerationModal) {
          AIGenerationModal.show();
        }
      }
      
      // Ctrl+A - Select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        this.selectAllNodes();
      }
      
      // Escape - Clear selection
      if (e.key === 'Escape') {
        this.clearSelection();
      }
      
      // Zoom shortcuts
      if (e.key === '+' || e.key === '=') {
        this.zoomIn();
      }
      if (e.key === '-') {
        this.zoomOut();
      }
      if (e.key === '0') {
        this.resetZoom();
      }
    });
  },
  
  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },
  
  async loadCanvasData() {
    try {
      // Show loading overlay
      if (typeof LoadingOverlay !== 'undefined') {
        LoadingOverlay.show('Loading workflow from database...');
      }
      
      // Try loading from D1 database first
      if (window.WorkflowSync) {
        const data = await window.WorkflowSync.init(this.currentProject);
        if (data && data.nodes) {
          this.nodes = data.nodes;
          this.connections = data.connections;
          if (data.viewport) {
            this.viewport = data.viewport;
          }
          console.log('✅ Loaded from D1:', this.nodes.length, 'nodes');
          
          if (typeof LoadingOverlay !== 'undefined') {
            LoadingOverlay.hide();
          }
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ D1 load failed, falling back to localStorage:', error.message);
      
      // Show warning toast
      if (typeof Toast !== 'undefined') {
        Toast.warning('Using offline data');
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(`canvas_${this.currentProject?.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      this.nodes = data.nodes || [];
      this.connections = data.connections || [];
      this.viewport = data.viewport || this.viewport;
      console.log('✅ Loaded from localStorage:', this.nodes.length, 'nodes');
    }
    
    if (typeof LoadingOverlay !== 'undefined') {
      LoadingOverlay.hide();
    }
  },
  
  async saveCanvasData() {
    if (!this.currentProject) return;
    
    const data = {
      nodes: this.nodes,
      connections: this.connections,
      viewport: this.viewport
    };
    
    // Save to localStorage (instant)
    localStorage.setItem(`canvas_${this.currentProject.id}`, JSON.stringify(data));
    
    // Save to D1 database (async)
    try {
      if (window.WorkflowSync && window.WorkflowSync.workflowId) {
        await window.WorkflowSync.syncAll(this.nodes, this.connections, this.viewport);
        console.log('✅ Synced to D1');
      }
    } catch (error) {
      console.warn('⚠️ D1 sync failed:', error.message);
    }
  },
  
  /**
   * Load AI-generated workflow
   */
  async loadGeneratedWorkflow(workflowId) {
    try {
      const response = await window.MuseFlowAPI.getWorkflow(workflowId);
      
      if (response.success) {
        const { workflow, nodes, connections } = response.data;
        
        // Convert DB format to Canvas format
        this.nodes = nodes.map(window.WorkflowSync.convertDBNodeToCanvas);
        this.connections = connections.map(window.WorkflowSync.convertDBConnectionToCanvas);
        this.viewport = {
          x: workflow.viewport_x,
          y: workflow.viewport_y,
          zoom: workflow.viewport_zoom,
        };
        
        // Set workflow ID for future syncs
        window.WorkflowSync.workflowId = workflowId;
        window.WorkflowSync.startAutoSync();
        
        console.log(`✅ Loaded AI workflow: ${nodes.length} nodes`);
        
        if (typeof Toast !== 'undefined') {
          Toast.success(`Loaded ${nodes.length} nodes`);
        }
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('❌ Failed to load workflow:', error);
      
      if (typeof ErrorModal !== 'undefined') {
        ErrorModal.show({
          title: 'Failed to Load Workflow',
          message: 'Unable to load the generated workflow',
          details: error.message,
        });
      } else if (typeof Toast !== 'undefined') {
        Toast.error('Failed to load workflow');
      }
    }
  },
  
  startRenderLoop() {
    const render = () => {
      this.renderCanvas();
      requestAnimationFrame(render);
    };
    render();
  },
  
  renderCanvas() {
    if (!this.ctx) return;
    
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw connections
    this.connections.forEach(conn => this.drawConnection(conn));
    
    // Draw nodes
    this.nodes.forEach(node => this.drawNode(node));
    
    // Draw collaboration cursors and selections
    if (window.CollaborationClient) {
      this.drawCollaborationOverlay();
    }
  },
  
  /**
   * Draw collaboration overlay (cursors and selections)
   */
  drawCollaborationOverlay() {
    if (!window.CollaborationClient || !window.CollaborationClient.isConnected) return;
    
    const users = window.CollaborationClient.getUsers();
    
    users.forEach(user => {
      if (user.id === window.CollaborationClient.userId) return; // Skip self
      
      // Draw cursor
      if (user.cursor) {
        this.drawCollaborationCursor(user);
      }
      
      // Draw selection boxes
      if (user.selectedNodes && user.selectedNodes.length > 0) {
        this.drawCollaborationSelection(user);
      }
    });
  },
  
  /**
   * Draw collaboration cursor
   */
  drawCollaborationCursor(user) {
    const { x, y, zoom } = this.viewport;
    const cursorX = user.cursor.x * zoom + x;
    const cursorY = user.cursor.y * zoom + y;
    
    // Draw cursor pointer
    this.ctx.fillStyle = user.color;
    this.ctx.beginPath();
    this.ctx.moveTo(cursorX, cursorY);
    this.ctx.lineTo(cursorX + 12, cursorY + 4);
    this.ctx.lineTo(cursorX + 7, cursorY + 10);
    this.ctx.lineTo(cursorX + 4, cursorY + 16);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw user name tag
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.fillStyle = user.color;
    const textWidth = this.ctx.measureText(user.name).width;
    
    this.ctx.fillStyle = user.color;
    this.ctx.fillRect(cursorX + 16, cursorY, textWidth + 12, 20);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(user.name, cursorX + 22, cursorY + 14);
  },
  
  /**
   * Draw collaboration selection
   */
  drawCollaborationSelection(user) {
    const { x, y, zoom } = this.viewport;
    
    user.selectedNodes.forEach(nodeId => {
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const nodeX = node.x * zoom + x;
      const nodeY = node.y * zoom + y;
      const nodeWidth = node.width * zoom;
      const nodeHeight = node.height * zoom;
      
      // Draw selection outline
      this.ctx.strokeStyle = user.color;
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(nodeX - 2, nodeY - 2, nodeWidth + 4, nodeHeight + 4);
      this.ctx.setLineDash([]);
    });
  },
  
  drawGrid() {
    const { width, height } = this.canvas;
    const { x, y, zoom } = this.viewport;
    
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    
    const gridSize = 40 * zoom;
    const offsetX = x % gridSize;
    const offsetY = y % gridSize;
    
    // Vertical lines
    for (let i = offsetX; i < width; i += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = offsetY; i < height; i += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(width, i);
      this.ctx.stroke();
    }
  },
  
  drawNode(node) {
    const { x, y, zoom } = this.viewport;
    const nodeX = node.x * zoom + x;
    const nodeY = node.y * zoom + y;
    const nodeWidth = node.width * zoom;
    const nodeHeight = node.height * zoom;
    
    // Check if node is visible
    if (nodeX + nodeWidth < 0 || nodeX > this.canvas.width ||
        nodeY + nodeHeight < 0 || nodeY > this.canvas.height) {
      return;
    }
    
    // Node shadow
    if (this.selectedNodes.includes(node.id)) {
      this.ctx.shadowColor = node.color;
      this.ctx.shadowBlur = 20;
    } else {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 10;
    }
    
    // Node background
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.roundRect(nodeX, nodeY, nodeWidth, nodeHeight, 12 * zoom);
    this.ctx.fill();
    
    // Node border
    this.ctx.strokeStyle = this.selectedNodes.includes(node.id) ? node.color : '#e5e7eb';
    this.ctx.lineWidth = this.selectedNodes.includes(node.id) ? 3 : 2;
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;
    
    // Color bar
    this.ctx.fillStyle = node.color;
    this.ctx.beginPath();
    this.ctx.roundRect(nodeX, nodeY, nodeWidth, 6 * zoom, [12 * zoom, 12 * zoom, 0, 0]);
    this.ctx.fill();
    
    // Icon
    this.ctx.font = `${24 * zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.icon, nodeX + nodeWidth / 2, nodeY + 40 * zoom);
    
    // Title
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = `bold ${14 * zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    const title = node.title || node.type;
    this.ctx.fillText(this.truncateText(title, nodeWidth - 20 * zoom), nodeX + nodeWidth / 2, nodeY + 65 * zoom);
    
    // Status badge
    const statusColors = {
      'todo': '#94a3b8',
      'in-progress': '#3b82f6',
      'done': '#10b981'
    };
    this.ctx.fillStyle = statusColors[node.status] || '#94a3b8';
    this.ctx.beginPath();
    this.ctx.roundRect(nodeX + 12 * zoom, nodeY + nodeHeight - 32 * zoom, 60 * zoom, 20 * zoom, 10 * zoom);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${11 * zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.status.toUpperCase(), nodeX + 42 * zoom, nodeY + nodeHeight - 22 * zoom);
    
    // Connection ports
    const portSize = 10 * zoom;
    const portColor = this.hoveredNode === node.id ? node.color : '#cbd5e1';
    
    // Input port (left)
    this.ctx.fillStyle = portColor;
    this.ctx.beginPath();
    this.ctx.arc(nodeX, nodeY + nodeHeight / 2, portSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Output port (right)
    this.ctx.beginPath();
    this.ctx.arc(nodeX + nodeWidth, nodeY + nodeHeight / 2, portSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  },
  
  drawConnection(connection) {
    const fromNode = this.nodes.find(n => n.id === connection.from);
    const toNode = this.nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return;
    
    const { x, y, zoom } = this.viewport;
    
    const fromX = (fromNode.x + fromNode.width) * zoom + x;
    const fromY = (fromNode.y + fromNode.height / 2) * zoom + y;
    const toX = toNode.x * zoom + x;
    const toY = (toNode.y + toNode.height / 2) * zoom + y;
    
    // Bezier control points
    const controlPointOffset = Math.min(Math.abs(toX - fromX) / 2, 100 * zoom);
    const cp1x = fromX + controlPointOffset;
    const cp1y = fromY;
    const cp2x = toX - controlPointOffset;
    const cp2y = toY;
    
    // Draw connection line
    this.ctx.strokeStyle = fromNode.color;
    this.ctx.lineWidth = 3 * zoom;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    this.ctx.stroke();
    
    // Draw arrow
    const arrowSize = 10 * zoom;
    const angle = Math.atan2(cp2y - toY, cp2x - toX);
    
    this.ctx.fillStyle = fromNode.color;
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX + arrowSize * Math.cos(angle + Math.PI / 6),
      toY + arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.lineTo(
      toX + arrowSize * Math.cos(angle - Math.PI / 6),
      toY + arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();
  },
  
  // ===== Helper Methods =====
  
  /**
   * Truncate text to fit width
   */
  truncateText(text, maxWidth) {
    if (this.ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  },
  
  /**
   * Add a new node to canvas
   */
  addNode(nodeType, canvasX, canvasY) {
    const nodeTemplate = this.getAllNodeTypes().find(n => n.id === nodeType);
    if (!nodeTemplate) return;
    
    // Convert canvas coordinates to world coordinates
    const { x, y, zoom } = this.viewport;
    const worldX = (canvasX - x) / zoom;
    const worldY = (canvasY - y) / zoom;
    
    const node = {
      id: `node-${this.nodeIdCounter++}`,
      type: nodeTemplate.name,
      icon: nodeTemplate.icon,
      color: nodeTemplate.color,
      x: worldX - 100, // Center on cursor
      y: worldY - 75,
      width: 200,
      height: 150,
      title: '',
      description: '',
      status: 'todo'
    };
    
    this.nodes.push(node);
    this.selectNode(node.id);
    this.saveCanvasData();
    
    Toast.success(`Added ${nodeTemplate.name}`);
  },
  
  /**
   * Get node at position
   */
  getNodeAtPosition(canvasX, canvasY) {
    // Convert canvas coordinates to world coordinates
    const worldX = (canvasX - this.viewport.x) / this.viewport.zoom;
    const worldY = (canvasY - this.viewport.y) / this.viewport.zoom;
    
    // Check in reverse order (top to bottom)
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      
      if (worldX >= node.x && worldX <= node.x + node.width &&
          worldY >= node.y && worldY <= node.y + node.height) {
        return node;
      }
    }
    
    return null;
  },
  
  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = this.getNodeAtPosition(x, y);
    
    if (node) {
      // Start dragging node
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      
      if (!this.selectedNodes.includes(node.id)) {
        if (e.shiftKey) {
          this.selectedNodes.push(node.id);
        } else {
          this.selectedNodes = [node.id];
        }
        this.rightPanelOpen = true;
        this.updateUI();
      }
    } else if (e.button === 1 || e.shiftKey) {
      // Middle mouse or Shift+drag = pan
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = 'grabbing';
    }
  },
  
  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.mousePos = { x, y };
    
    if (this.isDragging) {
      // Drag selected nodes
      const dx = (e.clientX - this.dragStart.x) / this.viewport.zoom;
      const dy = (e.clientY - this.dragStart.y) / this.viewport.zoom;
      
      this.selectedNodes.forEach(nodeId => {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
          node.x += dx;
          node.y += dy;
        }
      });
      
      this.dragStart = { x: e.clientX, y: e.clientY };
    } else if (this.isPanning) {
      // Pan viewport
      const dx = e.clientX - this.panStart.x;
      const dy = e.clientY - this.panStart.y;
      
      this.viewport.x += dx;
      this.viewport.y += dy;
      
      this.panStart = { x: e.clientX, y: e.clientY };
    } else {
      // Update hover state
      const node = this.getNodeAtPosition(x, y);
      this.hoveredNode = node?.id || null;
      this.canvas.style.cursor = node ? 'pointer' : 'grab';
    }
  },
  
  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    if (this.isDragging) {
      this.saveCanvasData();
    }
    
    this.isDragging = false;
    this.isPanning = false;
    this.canvas.style.cursor = 'grab';
  },
  
  /**
   * Handle mouse wheel (zoom)
   */
  handleWheel(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(this.viewport.minZoom, Math.min(this.viewport.maxZoom, this.viewport.zoom * zoomFactor));
    
    // Zoom toward mouse position
    const zoomRatio = newZoom / this.viewport.zoom;
    this.viewport.x = mouseX - (mouseX - this.viewport.x) * zoomRatio;
    this.viewport.y = mouseY - (mouseY - this.viewport.y) * zoomRatio;
    this.viewport.zoom = newZoom;
    
    this.updateZoomIndicator();
  },
  
  /**
   * Handle click
   */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = this.getNodeAtPosition(x, y);
    
    if (!node && !e.shiftKey) {
      this.clearSelection();
    }
  },
  
  /**
   * Select node
   */
  selectNode(nodeId) {
    this.selectedNodes = [nodeId];
    this.rightPanelOpen = true;
    this.updateUI();
  },
  
  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedNodes = [];
    this.rightPanelOpen = false;
    this.updateUI();
  },
  
  /**
   * Select all nodes
   */
  selectAllNodes() {
    this.selectedNodes = this.nodes.map(n => n.id);
    if (this.selectedNodes.length > 0) {
      this.rightPanelOpen = true;
      this.updateUI();
    }
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
    
    Toast.success(`Deleted ${this.selectedNodes.length} node(s)`);
    
    this.selectedNodes = [];
    this.rightPanelOpen = false;
    this.saveCanvasData();
    this.updateUI();
  },
  
  /**
   * Update selected node property
   */
  updateSelectedNodeProperty(key, value) {
    if (this.selectedNodes.length === 0) return;
    
    const node = this.nodes.find(n => n.id === this.selectedNodes[0]);
    if (node) {
      node[key] = value;
      this.saveCanvasData();
    }
  },
  
  /**
   * Zoom in
   */
  zoomIn() {
    const newZoom = Math.min(this.viewport.maxZoom, this.viewport.zoom * 1.2);
    this.viewport.zoom = newZoom;
    this.updateZoomIndicator();
  },
  
  /**
   * Zoom out
   */
  zoomOut() {
    const newZoom = Math.max(this.viewport.minZoom, this.viewport.zoom / 1.2);
    this.viewport.zoom = newZoom;
    this.updateZoomIndicator();
  },
  
  /**
   * Reset zoom to 100%
   */
  resetZoom() {
    this.viewport.zoom = 1;
    this.viewport.x = 0;
    this.viewport.y = 0;
    this.updateZoomIndicator();
  },
  
  /**
   * Fit all nodes to view
   */
  fitToView() {
    if (this.nodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    this.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 50;
    
    const zoomX = (this.canvas.width - padding * 2) / contentWidth;
    const zoomY = (this.canvas.height - padding * 2) / contentHeight;
    this.viewport.zoom = Math.min(zoomX, zoomY, 1);
    
    this.viewport.x = (this.canvas.width - contentWidth * this.viewport.zoom) / 2 - minX * this.viewport.zoom;
    this.viewport.y = (this.canvas.height - contentHeight * this.viewport.zoom) / 2 - minY * this.viewport.zoom;
    
    this.updateZoomIndicator();
  },
  
  /**
   * Update zoom indicator
   */
  updateZoomIndicator() {
    const indicator = document.querySelector('[style*="bottom: 24px; right: 24px"]');
    if (indicator) {
      indicator.textContent = `${Math.round(this.viewport.zoom * 100)}%`;
    }
    
    const zoomResetBtn = document.getElementById('zoom-reset');
    if (zoomResetBtn) {
      zoomResetBtn.textContent = `${Math.round(this.viewport.zoom * 100)}%`;
    }
  },
  
  /**
   * Update entire UI
   */
  updateUI() {
    console.log('🔄 Updating UI panels only (not full re-render)...');
    
    // Only update panels, not the entire UI
    this.updateLeftPanel();
    this.updateRightPanel();
    
    // No need to recreate canvas or reattach events
    console.log('✅ Panels updated');
  },
  
  /**
   * Update left panel only
   */
  updateLeftPanel() {
    const leftPanel = document.querySelector('.side-panel');
    if (leftPanel) {
      leftPanel.outerHTML = this.renderLeftPanel();
      this.attachLeftPanelEvents();
    }
  },
  
  /**
   * Update nodes list only
   */
  updateNodesList() {
    const nodesList = document.querySelector('.side-panel > div:last-child');
    if (nodesList) {
      nodesList.innerHTML = this.renderNodesList();
      this.attachLeftPanelEvents();
    }
  },
  
  /**
   * Update right panel only
   */
  updateRightPanel() {
    // Find or create right panel
    let rightPanel = document.querySelectorAll('.side-panel')[1];
    const newPanelHTML = this.renderRightPanel();
    
    if (rightPanel && newPanelHTML) {
      rightPanel.outerHTML = newPanelHTML;
      this.attachRightPanelEvents();
    } else if (newPanelHTML && !rightPanel) {
      // Panel doesn't exist, add it
      const mainContent = document.querySelector('[data-page="canvas"] > div > div:nth-child(2)');
      if (mainContent) {
        mainContent.insertAdjacentHTML('beforeend', newPanelHTML);
        this.attachRightPanelEvents();
      }
    }
  }
};

// Expose globally
window.CanvasV2 = CanvasV2;
console.log('✅ Canvas V2 module loaded');
