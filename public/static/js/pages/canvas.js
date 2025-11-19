/**
 * Canvas Page - Figma-Style Infinite Canvas
 * World-class node-based workflow system with 88+ specialized nodes
 */

const Canvas = {
  // Project data
  currentProject: null,
  
  // Canvas elements
  canvasElement: null,
  
  // Nodes and connections
  nodes: [],
  selectedNodes: [],
  hoveredNode: null,
  
  // Tools
  currentTool: 'select', // select | hand | connection
  
  // Interaction state
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  draggedNode: null,
  
  // Connection state
  isConnecting: false,
  connectionStart: null,
  connectionPreview: null,
  
  // Selection box
  isBoxSelecting: false,
  selectionBox: null,
  
  // UI panels
  leftPanelOpen: true,
  rightPanelOpen: true,
  
  // AI suggestions
  aiSuggestions: [],
  
  /**
   * Initialize canvas page
   */
  init() {
    console.log('🎨 Initializing Canvas Page...');
    
    // Load project from session storage
    this.loadProject();
    
    if (!this.currentProject) {
      Toast.error('No project selected');
      Router.navigate('/project-manager');
      return;
    }
    
    this.render();
    this.initCanvas();
    this.attachEvents();
    this.loadProjectData();
    
    // Generate AI suggestions
    this.generateAISuggestions();
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
   * Load project data (nodes and connections)
   */
  loadProjectData() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const storageKey = `museflow_canvas_${currentUser.id}_${this.currentProject.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const data = JSON.parse(stored);
      
      // Reconstruct nodes
      data.nodes.forEach(nodeData => {
        const node = NodeFactory.createNode(
          nodeData.type,
          nodeData.module,
          nodeData.x,
          nodeData.y
        );
        Object.assign(node, nodeData);
        this.nodes.push(node);
      });
      
      // Reconstruct connections
      data.connections.forEach(connData => {
        const sourceNode = this.nodes.find(n => n.id === connData.sourceNodeId);
        const targetNode = this.nodes.find(n => n.id === connData.targetNodeId);
        
        if (sourceNode && targetNode) {
          ConnectionManager.addConnection(
            sourceNode,
            connData.sourceIndex,
            targetNode,
            connData.targetIndex,
            connData.type
          );
        }
      });
      
      console.log(`✅ Loaded ${this.nodes.length} nodes and ${ConnectionManager.connections.length} connections`);
      
      // Fit to content
      if (this.nodes.length > 0) {
        setTimeout(() => {
          CanvasEngine.fitToContent(this.nodes);
        }, 100);
      }
    } else {
      // Create welcome nodes for new project
      this.createWelcomeNodes();
    }
    
    CanvasEngine.requestRedraw();
  },
  
  /**
   * Create welcome nodes for new project
   */
  createWelcomeNodes() {
    const modules = this.currentProject.modules || [];
    
    if (modules.length === 0) return;
    
    // Create one starter node per module
    modules.forEach((moduleName, index) => {
      const moduleNodes = NodeFactory.getModuleNodes(moduleName);
      if (moduleNodes.length > 0) {
        const firstNodeType = moduleNodes[0].type;
        const node = NodeFactory.createNode(
          firstNodeType,
          moduleName,
          200 + index * 350,
          200
        );
        this.nodes.push(node);
      }
    });
    
    Toast.success(`Welcome to ${this.currentProject.name}! 🎉`);
    this.saveProjectData();
  },
  
  /**
   * Save project data
   */
  saveProjectData() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const storageKey = `museflow_canvas_${currentUser.id}_${this.currentProject.id}`;
    
    const data = {
      nodes: this.nodes.map(n => n.toJSON()),
      connections: ConnectionManager.connections.map(c => c.toJSON()),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('💾 Canvas data saved');
  },
  
  /**
   * Auto-save (every 10 seconds)
   */
  startAutoSave() {
    setInterval(() => {
      this.saveProjectData();
    }, 10000);
  },
  
  /**
   * Render canvas page
   */
  render() {
    const container = document.createElement('div');
    container.setAttribute('data-page', 'canvas');
    
    const moduleInfo = MODULES[this.currentProject.modules[0]] || MODULES.exhibition;
    
    container.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                  display: flex; flex-direction: column; background: #f9fafb;">
        
        <!-- Top Toolbar -->
        <div id="canvas-toolbar" style="height: 60px; background: white; 
                                        border-bottom: 1px solid #e5e7eb; 
                                        display: flex; align-items: center; 
                                        justify-content: space-between; padding: 0 20px; z-index: 100;">
          
          <!-- Left: Back + Project Info -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <button 
              id="back-btn"
              style="width: 36px; height: 36px; border-radius: 8px; border: none; 
                     background: #f3f4f6; cursor: pointer; font-size: 18px; 
                     transition: all 0.2s;"
              onmouseover="this.style.background='#e5e7eb'"
              onmouseout="this.style.background='#f3f4f6'"
              title="Back to Projects"
            >
              ←
            </button>
            
            <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
            
            <div>
              <div style="font-weight: 700; font-size: 16px; color: #1f2937;">
                ${this.currentProject.name}
              </div>
              <div style="font-size: 12px; color: #9ca3af;">
                ${this.currentProject.modules.length} modules • Auto-saving
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
                       background: white; cursor: pointer; font-size: 18px; 
                       transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
                title="Selection Tool (V)"
              >
                ↖
              </button>
              <button 
                class="tool-btn" 
                data-tool="hand"
                style="width: 40px; height: 40px; border-radius: 8px; border: none; 
                       background: transparent; cursor: pointer; font-size: 18px; 
                       transition: all 0.2s;"
                title="Hand Tool (H)"
              >
                ✋
              </button>
              <button 
                class="tool-btn" 
                data-tool="connection"
                style="width: 40px; height: 40px; border-radius: 8px; border: none; 
                       background: transparent; cursor: pointer; font-size: 18px; 
                       transition: all 0.2s;"
                title="Connection Tool (C)"
              >
                🔗
              </button>
            </div>
            
            <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
            
            <!-- Zoom Controls -->
            <button 
              id="zoom-out"
              style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                     background: white; cursor: pointer; font-weight: 700; color: #6b7280;"
              title="Zoom Out"
            >
              −
            </button>
            
            <div id="zoom-display" style="min-width: 60px; text-align: center; 
                                         font-size: 13px; font-weight: 600; color: #6b7280;">
              100%
            </div>
            
            <button 
              id="zoom-in"
              style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                     background: white; cursor: pointer; font-weight: 700; color: #6b7280;"
              title="Zoom In"
            >
              +
            </button>
            
            <button 
              id="zoom-fit"
              style="padding: 0 12px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                     background: white; cursor: pointer; font-size: 12px; font-weight: 600; 
                     color: #6b7280;"
              title="Fit to Screen"
            >
              Fit
            </button>
            
            <div style="height: 30px; width: 1px; background: #e5e7eb;"></div>
            
            <!-- Grid Toggle -->
            <button 
              id="grid-toggle"
              style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e5e7eb; 
                     background: white; cursor: pointer; font-size: 16px;"
              title="Toggle Grid"
            >
              #
            </button>
          </div>
          
          <!-- Right: Actions -->
          <div style="display: flex; gap: 12px; align-items: center;">
            <button 
              id="export-btn"
              style="padding: 0 16px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; 
                     background: white; cursor: pointer; font-size: 14px; font-weight: 600; 
                     color: #6b7280; transition: all 0.2s;"
              onmouseover="this.style.background='#f9fafb'"
              onmouseout="this.style.background='white'"
            >
              📤 Export
            </button>
            
            <button 
              id="share-btn"
              style="padding: 0 16px; height: 36px; border-radius: 8px; 
                     background: linear-gradient(135deg, #667eea, #764ba2); 
                     color: white; border: none; cursor: pointer; font-size: 14px; 
                     font-weight: 600; transition: all 0.2s;"
              onmouseover="this.style.transform='translateY(-1px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              👥 Share
            </button>
          </div>
        </div>
        
        <!-- Main Canvas Area -->
        <div style="flex: 1; display: flex; position: relative; overflow: hidden;">
          
          <!-- Left Panel: Node Palette -->
          <div id="left-panel" style="width: 280px; background: white; 
                                      border-right: 1px solid #e5e7eb; 
                                      overflow-y: auto; transition: all 0.3s;">
            
            <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 700; font-size: 14px; color: #1f2937; margin-bottom: 8px;">
                Node Palette
              </div>
              <input 
                type="text" 
                id="node-search"
                placeholder="Search nodes..."
                style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; 
                       border-radius: 8px; font-size: 13px; box-sizing: border-box;"
              />
            </div>
            
            <div id="node-categories">
              ${this.renderNodePalette()}
            </div>
          </div>
          
          <!-- Canvas Container -->
          <div id="canvas-container" style="flex: 1; position: relative; cursor: crosshair;">
            <canvas id="main-canvas"></canvas>
            
            <!-- Node HTML overlays will be added here -->
            <div id="node-overlay" style="position: absolute; top: 0; left: 0; 
                                          width: 100%; height: 100%; pointer-events: none;">
            </div>
            
            <!-- Minimap -->
            <div style="position: absolute; bottom: 20px; right: 20px; 
                        width: 200px; height: 150px; background: white; 
                        border: 2px solid #e5e7eb; border-radius: 12px; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; 
                          font-size: 11px; font-weight: 600; color: #6b7280;">
                Minimap
              </div>
              <canvas id="minimap-canvas" style="width: 100%; height: calc(100% - 32px);"></canvas>
            </div>
          </div>
          
          <!-- Right Panel: Inspector -->
          <div id="right-panel" style="width: 320px; background: white; 
                                       border-left: 1px solid #e5e7eb; 
                                       overflow-y: auto; transition: all 0.3s;">
            
            <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                Inspector
              </div>
            </div>
            
            <div id="inspector-content">
              ${this.renderInspector()}
            </div>
          </div>
        </div>
      </div>
      
      <style>
        #main-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .tool-btn:hover {
          background: white !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .node-palette-item {
          padding: 10px 16px;
          cursor: grab;
          transition: all 0.2s;
          border-radius: 8px;
          margin: 4px 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid transparent;
        }
        
        .node-palette-item:hover {
          background: #f9fafb;
          border-color: #e5e7eb;
        }
        
        .node-palette-item:active {
          cursor: grabbing;
        }
        
        .module-category {
          margin-bottom: 8px;
        }
        
        .module-header {
          padding: 12px 16px;
          font-weight: 600;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.2s;
        }
        
        .module-header:hover {
          background: #f9fafb;
        }
        
        .module-nodes {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .module-nodes.collapsed {
          max-height: 0;
          overflow: hidden;
        }
        
        /* Scrollbar styling */
        #left-panel::-webkit-scrollbar,
        #right-panel::-webkit-scrollbar,
        .module-nodes::-webkit-scrollbar {
          width: 6px;
        }
        
        #left-panel::-webkit-scrollbar-thumb,
        #right-panel::-webkit-scrollbar-thumb,
        .module-nodes::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        #left-panel::-webkit-scrollbar-thumb:hover,
        #right-panel::-webkit-scrollbar-thumb:hover,
        .module-nodes::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      </style>
    `;
    
    document.getElementById('app').appendChild(container);
    console.log('✅ Canvas page rendered');
  },
  
  /**
   * Render node palette
   */
  renderNodePalette() {
    const modules = this.currentProject.modules || Object.keys(MODULES);
    
    return modules.map(moduleName => {
      const module = MODULES[moduleName];
      const nodes = NodeFactory.getModuleNodes(moduleName);
      
      return `
        <div class="module-category">
          <div class="module-header" data-module="${moduleName}">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">${module.icon}</span>
              <span>${module.name}</span>
              <span style="font-size: 11px; color: #9ca3af;">(${nodes.length})</span>
            </div>
            <span class="collapse-icon">▼</span>
          </div>
          <div class="module-nodes" data-module="${moduleName}">
            ${nodes.map(node => `
              <div class="node-palette-item" 
                   data-node-type="${node.type}" 
                   data-module="${moduleName}"
                   draggable="true">
                <span style="font-size: 18px;">${node.icon}</span>
                <span style="font-size: 13px; color: #374151; flex: 1;">${node.type}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Render inspector panel
   */
  renderInspector() {
    if (this.selectedNodes.length === 0) {
      return `
        <div style="padding: 40px 20px; text-align: center; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 16px;">👆</div>
          <div style="font-size: 14px; margin-bottom: 8px;">No node selected</div>
          <div style="font-size: 12px;">Select a node to edit its properties</div>
        </div>
      `;
    }
    
    if (this.selectedNodes.length > 1) {
      return `
        <div style="padding: 20px;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            ${this.selectedNodes.length} nodes selected
          </div>
          <button 
            id="delete-selected"
            style="width: 100%; padding: 10px; background: #fee2e2; color: #ef4444; 
                   border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
          >
            🗑️ Delete Selected
          </button>
        </div>
      `;
    }
    
    const node = this.selectedNodes[0];
    const module = MODULES[node.module];
    
    return `
      <div style="padding: 20px;">
        <!-- Node Header -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; background: ${module.color}15; 
                      border-radius: 12px; display: flex; align-items: center; 
                      justify-content: center; font-size: 24px;">
            ${module.icon}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 16px; color: #1f2937;">${node.type}</div>
            <div style="font-size: 12px; color: #9ca3af;">${module.name} Module</div>
          </div>
        </div>
        
        <!-- Status -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 12px; font-weight: 600; 
                        color: #6b7280; margin-bottom: 8px;">
            Status
          </label>
          <select 
            id="node-status"
            style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; 
                   border-radius: 8px; font-size: 14px; background: white;"
          >
            <option value="pending" ${node.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${node.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${node.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="error" ${node.status === 'error' ? 'selected' : ''}>Error</option>
          </select>
        </div>
        
        <!-- Progress -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 12px; font-weight: 600; 
                        color: #6b7280; margin-bottom: 8px;">
            Progress: <span id="progress-value">${node.progress}%</span>
          </label>
          <input 
            type="range" 
            id="node-progress"
            min="0" 
            max="100" 
            value="${node.progress}"
            style="width: 100%; accent-color: ${module.color};"
          />
        </div>
        
        <!-- Connections Info -->
        <div style="margin-bottom: 20px; padding: 12px; background: #f9fafb; 
                    border-radius: 8px;">
          <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">
            Connections
          </div>
          <div style="font-size: 13px; color: #374151;">
            <div>Inputs: ${node.connections.inputs.length}</div>
            <div>Outputs: ${node.connections.outputs.length}</div>
          </div>
        </div>
        
        <!-- AI Suggestions -->
        ${this.renderAISuggestions()}
        
        <!-- Actions -->
        <div style="display: flex; gap: 8px; margin-top: 24px;">
          <button 
            id="duplicate-node"
            style="flex: 1; padding: 10px; background: white; border: 1px solid #e5e7eb; 
                   border-radius: 8px; font-weight: 600; cursor: pointer; color: #6b7280;"
          >
            📋 Duplicate
          </button>
          <button 
            id="delete-node"
            style="flex: 1; padding: 10px; background: #fee2e2; color: #ef4444; 
                   border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * Render AI suggestions
   */
  renderAISuggestions() {
    if (this.aiSuggestions.length === 0) {
      return '';
    }
    
    return `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 12px;">
          🤖 AI Suggestions
        </div>
        ${this.aiSuggestions.map(suggestion => `
          <div class="ai-suggestion" 
               data-node-type="${suggestion.type}" 
               data-module="${suggestion.module}"
               style="padding: 12px; background: ${MODULES[suggestion.module].color}08; 
                      border: 1px solid ${MODULES[suggestion.module].color}20; 
                      border-radius: 8px; margin-bottom: 8px; cursor: pointer; 
                      transition: all 0.2s;"
               onmouseover="this.style.background='${MODULES[suggestion.module].color}15'"
               onmouseout="this.style.background='${MODULES[suggestion.module].color}08'">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 16px;">${MODULES[suggestion.module].icon}</span>
              <span style="font-size: 13px; font-weight: 600; color: #374151;">
                ${suggestion.type}
              </span>
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${suggestion.reason}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Continue in next part...
  initCanvas() {
    this.canvasElement = document.getElementById('main-canvas');
    if (!this.canvasElement) {
      console.error('Canvas element not found');
      return;
    }
    
    // Initialize Canvas Engine
    CanvasEngine.init(this.canvasElement);
    
    // Start auto-save
    this.startAutoSave();
    
    console.log('✅ Canvas initialized');
  },

  /**
   * Attach events
   */
  attachEvents() {
    if (window.CanvasEvents) {
      CanvasEvents.attach();
    }
  },
  
  /**
   * Render nodes (HTML overlay)
   */
  renderNodes() {
    // Nodes are rendered on canvas by CanvasEngine
    // This method can be used for HTML overlays if needed
    this.updateInspector();
  },
  
  /**
   * Render connections
   */
  renderConnections(ctx) {
    ConnectionManager.renderAll(ctx, CanvasEngine.viewport.zoom);
  },
  
  /**
   * Render selection box
   */
  renderSelectionBox() {
    if (!this.selectionBox) return;
    
    const ctx = CanvasEngine.ctx;
    const zoom = CanvasEngine.viewport.zoom;
    
    const x = Math.min(this.selectionBox.startX, this.selectionBox.endX);
    const y = Math.min(this.selectionBox.startY, this.selectionBox.endY);
    const width = Math.abs(this.selectionBox.endX - this.selectionBox.startX);
    const height = Math.abs(this.selectionBox.endY - this.selectionBox.startY);
    
    ctx.save();
    ctx.translate(CanvasEngine.viewport.x, CanvasEngine.viewport.y);
    ctx.scale(zoom, zoom);
    
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2 / zoom;
    
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    ctx.restore();
  },
  
  /**
   * Render connection preview
   */
  renderConnectionPreview() {
    if (!this.connectionStart || !this.connectionPreview) return;
    
    const ctx = CanvasEngine.ctx;
    const zoom = CanvasEngine.viewport.zoom;
    
    const startPoint = this.connectionStart.node.getConnectionPoint('output', 0);
    const endPoint = this.connectionPreview;
    
    ctx.save();
    ctx.translate(CanvasEngine.viewport.x, CanvasEngine.viewport.y);
    ctx.scale(zoom, zoom);
    
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.restore();
  },
  
  /**
   * Find node at position
   */
  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      if (this.nodes[i].containsPoint(x, y)) {
        return this.nodes[i];
      }
    }
    return null;
  },
  
  /**
   * Select node
   */
  selectNode(node) {
    if (!this.selectedNodes.includes(node)) {
      this.selectedNodes.push(node);
      node.selected = true;
    }
    this.updateInspector();
  },
  
  /**
   * Deselect node
   */
  deselectNode(node) {
    this.selectedNodes = this.selectedNodes.filter(n => n !== node);
    node.selected = false;
    this.updateInspector();
  },
  
  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedNodes.forEach(node => {
      node.selected = false;
    });
    this.selectedNodes = [];
    this.updateInspector();
  },
  
  /**
   * Select all nodes
   */
  selectAllNodes() {
    this.clearSelection();
    this.nodes.forEach(node => {
      this.selectNode(node);
    });
    CanvasEngine.requestRedraw();
    this.renderNodes();
  },
  
  /**
   * Select nodes in box
   */
  selectNodesInBox(box) {
    const x = Math.min(box.startX, box.endX);
    const y = Math.min(box.startY, box.endY);
    const width = Math.abs(box.endX - box.startX);
    const height = Math.abs(box.endY - box.startY);
    
    this.nodes.forEach(node => {
      const nodeInBox = 
        node.x + node.width > x &&
        node.x < x + width &&
        node.y + node.height > y &&
        node.y < y + height;
      
      if (nodeInBox) {
        this.selectNode(node);
      }
    });
    
    this.renderNodes();
  },
  
  /**
   * Delete selected nodes
   */
  deleteSelectedNodes() {
    if (this.selectedNodes.length === 0) return;
    
    this.selectedNodes.forEach(node => {
      // Remove connections
      ConnectionManager.removeNodeConnections(node.id);
      
      // Remove node
      this.nodes = this.nodes.filter(n => n !== node);
    });
    
    Toast.success(`Deleted ${this.selectedNodes.length} node(s)`);
    
    this.selectedNodes = [];
    this.saveProjectData();
    CanvasEngine.requestRedraw();
    this.renderNodes();
  },
  
  /**
   * Duplicate selected nodes
   */
  duplicateSelectedNodes() {
    if (this.selectedNodes.length === 0) return;
    
    const newNodes = [];
    
    this.selectedNodes.forEach(node => {
      const newNode = NodeFactory.createNode(
        node.type,
        node.module,
        node.x + 50,
        node.y + 50
      );
      newNode.status = node.status;
      newNode.progress = node.progress;
      newNode.properties = { ...node.properties };
      
      this.nodes.push(newNode);
      newNodes.push(newNode);
    });
    
    this.clearSelection();
    newNodes.forEach(node => this.selectNode(node));
    
    Toast.success(`Duplicated ${newNodes.length} node(s)`);
    
    this.saveProjectData();
    CanvasEngine.requestRedraw();
    this.renderNodes();
  },
  
  /**
   * Update inspector
   */
  updateInspector() {
    const inspectorContent = document.getElementById('inspector-content');
    if (inspectorContent) {
      inspectorContent.innerHTML = this.renderInspector();
      
      // Reattach inspector events
      if (window.CanvasEvents) {
        CanvasEvents.attachInspectorEvents();
      }
    }
  },
  
  /**
   * Update zoom display
   */
  updateZoomDisplay() {
    const display = document.getElementById('zoom-display');
    if (display) {
      const percent = Math.round(CanvasEngine.viewport.zoom * 100);
      display.textContent = `${percent}%`;
    }
  },
  
  /**
   * Generate AI suggestions
   */
  generateAISuggestions() {
    this.aiSuggestions = [];
    
    if (this.selectedNodes.length === 1) {
      const node = this.selectedNodes[0];
      const module = node.module;
      
      // Simple AI logic: suggest related nodes
      const allNodes = NodeFactory.getModuleNodes(module);
      const existingTypes = this.nodes.map(n => n.type);
      
      // Suggest nodes from same module that don't exist yet
      const suggestions = allNodes
        .filter(n => !existingTypes.includes(n.type))
        .slice(0, 3)
        .map(n => ({
          type: n.type,
          module: module,
          reason: `Commonly used with ${node.type}`
        }));
      
      // Add cross-module suggestions
      if (node.type === 'Artwork' && node.module === 'exhibition') {
        suggestions.push({
          type: 'Article',
          module: 'publication',
          reason: 'Document this artwork'
        });
      }
      
      if (node.type === 'Digital Asset' && node.module === 'archive') {
        suggestions.push({
          type: 'Metadata',
          module: 'archive',
          reason: 'Add catalog information'
        });
      }
      
      this.aiSuggestions = suggestions;
    }
  }
};

// Custom rendering in CanvasEngine render loop
CanvasEngine.render = function() {
  if (!this.ctx || !this.canvas) return;
  
  const width = this.canvas.width / (window.devicePixelRatio || 1);
  const height = this.canvas.height / (window.devicePixelRatio || 1);
  
  // Clear canvas
  this.ctx.clearRect(0, 0, width, height);
  
  // Save context state
  this.ctx.save();
  
  // Apply viewport transform
  this.ctx.translate(this.viewport.x, this.viewport.y);
  this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
  
  // Draw grid
  if (this.grid.enabled) {
    this.drawGrid(width, height);
  }
  
  // Draw connections
  if (window.Canvas) {
    Canvas.renderConnections(this.ctx);
  }
  
  // Draw nodes
  if (window.Canvas && window.Canvas.nodes) {
    Canvas.nodes.forEach(node => {
      node.render(this.ctx, this.viewport.zoom);
    });
  }
  
  // Restore context
  this.ctx.restore();
  
  // Draw selection box (in screen space)
  if (window.Canvas && Canvas.isBoxSelecting) {
    Canvas.renderSelectionBox();
  }
  
  // Draw connection preview (in screen space)
  if (window.Canvas && Canvas.isConnecting) {
    Canvas.renderConnectionPreview();
  }
};

// Expose globally
window.Canvas = Canvas;

console.log('✅ Canvas page module loaded');
