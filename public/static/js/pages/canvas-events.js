/**
 * Canvas Events Handler
 * Manages all user interactions with the canvas
 */

const CanvasEvents = {
  /**
   * Attach all event listeners
   */
  attach() {
    this.attachToolbarEvents();
    this.attachCanvasEvents();
    this.attachNodePaletteEvents();
    this.attachInspectorEvents();
    this.attachKeyboardEvents();
    
    console.log('✅ Canvas events attached');
  },
  
  /**
   * Toolbar events
   */
  attachToolbarEvents() {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        Canvas.saveProjectData();
        Router.navigate('/project-manager');
      });
    }
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        Canvas.currentTool = tool;
        
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
      });
    });
    
    // Zoom controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomFit = document.getElementById('zoom-fit');
    
    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        CanvasEngine.setZoom(CanvasEngine.viewport.zoom * 1.2);
      });
    }
    
    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        CanvasEngine.setZoom(CanvasEngine.viewport.zoom / 1.2);
      });
    }
    
    if (zoomFit) {
      zoomFit.addEventListener('click', () => {
        CanvasEngine.fitToContent(Canvas.nodes);
      });
    }
    
    // Grid toggle
    const gridToggle = document.getElementById('grid-toggle');
    if (gridToggle) {
      gridToggle.addEventListener('click', () => {
        CanvasEngine.toggleGrid();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Toast.info('Export feature coming soon! 📤');
      });
    }
    
    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        Toast.info('Share feature coming soon! 👥');
      });
    }
  },
  
  /**
   * Canvas mouse/touch events
   */
  attachCanvasEvents() {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    
    // Mouse down
    canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    
    // Mouse move
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Mouse up
    canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    // Mouse wheel (zoom)
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      CanvasEngine.zoomAt(e.clientX, e.clientY, -delta);
    }, { passive: false });
    
    // Double click (reset zoom)
    canvas.addEventListener('dblclick', (e) => {
      if (Canvas.currentTool === 'hand') {
        CanvasEngine.resetView();
      }
    });
    
    // Context menu (prevent default)
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      CanvasEngine.resize();
      Canvas.renderNodes();
    });
  },
  
  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = CanvasEngine.screenToWorld(x, y);
    
    // Hand tool - start panning
    if (Canvas.currentTool === 'hand' || e.button === 1 || e.shiftKey) {
      CanvasEngine.startPan(e.clientX, e.clientY);
      e.target.style.cursor = 'grabbing';
      return;
    }
    
    // Connection tool - start connection
    if (Canvas.currentTool === 'connection') {
      const node = Canvas.findNodeAt(worldPos.x, worldPos.y);
      if (node) {
        Canvas.isConnecting = true;
        Canvas.connectionStart = { node, point: { x: worldPos.x, y: worldPos.y } };
      }
      return;
    }
    
    // Selection tool
    if (Canvas.currentTool === 'select') {
      const clickedNode = Canvas.findNodeAt(worldPos.x, worldPos.y);
      
      if (clickedNode) {
        // Select node
        if (!e.ctrlKey && !e.metaKey) {
          Canvas.clearSelection();
        }
        Canvas.selectNode(clickedNode);
        
        // Start dragging
        Canvas.isDragging = true;
        Canvas.dragStart = { x: worldPos.x, y: worldPos.y };
        Canvas.draggedNode = clickedNode;
        
        CanvasEngine.requestRedraw();
      } else {
        // Start box selection
        if (!e.ctrlKey && !e.metaKey) {
          Canvas.clearSelection();
        }
        Canvas.isBoxSelecting = true;
        Canvas.selectionBox = {
          startX: worldPos.x,
          startY: worldPos.y,
          endX: worldPos.x,
          endY: worldPos.y
        };
      }
    }
  },
  
  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = CanvasEngine.screenToWorld(x, y);
    
    // Update hovered node
    const hoveredNode = Canvas.findNodeAt(worldPos.x, worldPos.y);
    if (Canvas.hoveredNode !== hoveredNode) {
      if (Canvas.hoveredNode) {
        Canvas.hoveredNode.hovered = false;
      }
      Canvas.hoveredNode = hoveredNode;
      if (hoveredNode) {
        hoveredNode.hovered = true;
      }
      CanvasEngine.requestRedraw();
    }
    
    // Panning
    if (CanvasEngine.isPanning) {
      CanvasEngine.updatePan(e.clientX, e.clientY);
      return;
    }
    
    // Dragging nodes
    if (Canvas.isDragging && Canvas.draggedNode) {
      const dx = worldPos.x - Canvas.dragStart.x;
      const dy = worldPos.y - Canvas.dragStart.y;
      
      Canvas.selectedNodes.forEach(node => {
        node.x += dx;
        node.y += dy;
      });
      
      Canvas.dragStart = { x: worldPos.x, y: worldPos.y };
      CanvasEngine.requestRedraw();
      Canvas.renderNodes();
      return;
    }
    
    // Box selection
    if (Canvas.isBoxSelecting && Canvas.selectionBox) {
      Canvas.selectionBox.endX = worldPos.x;
      Canvas.selectionBox.endY = worldPos.y;
      CanvasEngine.requestRedraw();
      Canvas.renderSelectionBox();
      return;
    }
    
    // Connection preview
    if (Canvas.isConnecting && Canvas.connectionStart) {
      Canvas.connectionPreview = { x: worldPos.x, y: worldPos.y };
      CanvasEngine.requestRedraw();
      Canvas.renderConnectionPreview();
    }
  },
  
  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = CanvasEngine.screenToWorld(x, y);
    
    // End panning
    if (CanvasEngine.isPanning) {
      CanvasEngine.endPan();
      e.target.style.cursor = 'grab';
      return;
    }
    
    // End dragging
    if (Canvas.isDragging) {
      Canvas.isDragging = false;
      Canvas.draggedNode = null;
      Canvas.saveProjectData();
    }
    
    // End box selection
    if (Canvas.isBoxSelecting) {
      Canvas.isBoxSelecting = false;
      Canvas.selectNodesInBox(Canvas.selectionBox);
      Canvas.selectionBox = null;
      CanvasEngine.requestRedraw();
    }
    
    // End connection
    if (Canvas.isConnecting) {
      const targetNode = Canvas.findNodeAt(worldPos.x, worldPos.y);
      if (targetNode && targetNode !== Canvas.connectionStart.node) {
        // Create connection
        ConnectionManager.addConnection(
          Canvas.connectionStart.node,
          0,
          targetNode,
          0,
          'sequential'
        );
        Canvas.saveProjectData();
        CanvasEngine.requestRedraw();
      }
      
      Canvas.isConnecting = false;
      Canvas.connectionStart = null;
      Canvas.connectionPreview = null;
      CanvasEngine.requestRedraw();
    }
  },
  
  /**
   * Node palette events
   */
  attachNodePaletteEvents() {
    // Module collapse/expand
    document.querySelectorAll('.module-header').forEach(header => {
      header.addEventListener('click', () => {
        const module = header.dataset.module;
        const nodesContainer = document.querySelector(`.module-nodes[data-module="${module}"]`);
        const icon = header.querySelector('.collapse-icon');
        
        if (nodesContainer.classList.contains('collapsed')) {
          nodesContainer.classList.remove('collapsed');
          icon.textContent = '▼';
        } else {
          nodesContainer.classList.add('collapsed');
          icon.textContent = '▶';
        }
      });
    });
    
    // Node palette item drag
    document.querySelectorAll('.node-palette-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const nodeType = item.dataset.nodeType;
        const module = item.dataset.module;
        e.dataTransfer.setData('nodeType', nodeType);
        e.dataTransfer.setData('module', module);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
    
    // Canvas drop
    const canvas = document.getElementById('main-canvas');
    if (canvas) {
      canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      
      canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        
        const nodeType = e.dataTransfer.getData('nodeType');
        const module = e.dataTransfer.getData('module');
        
        if (nodeType && module) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const worldPos = CanvasEngine.screenToWorld(x, y);
          
          // Create node at drop position
          const node = NodeFactory.createNode(nodeType, module, worldPos.x - 140, worldPos.y - 90);
          Canvas.nodes.push(node);
          
          // Select new node
          Canvas.clearSelection();
          Canvas.selectNode(node);
          
          Canvas.saveProjectData();
          CanvasEngine.requestRedraw();
          Canvas.renderNodes();
          
          Toast.success(`${nodeType} added! 🎉`);
        }
      });
    }
    
    // Search
    const searchInput = document.getElementById('node-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.node-palette-item').forEach(item => {
          const nodeType = item.dataset.nodeType.toLowerCase();
          if (nodeType.includes(query)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
  },
  
  /**
   * Inspector events
   */
  attachInspectorEvents() {
    // Node status change
    const statusSelect = document.getElementById('node-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        if (Canvas.selectedNodes.length > 0) {
          Canvas.selectedNodes[0].status = e.target.value;
          Canvas.saveProjectData();
          CanvasEngine.requestRedraw();
          Canvas.renderNodes();
        }
      });
    }
    
    // Node progress change
    const progressInput = document.getElementById('node-progress');
    const progressValue = document.getElementById('progress-value');
    if (progressInput) {
      progressInput.addEventListener('input', (e) => {
        if (Canvas.selectedNodes.length > 0) {
          const progress = parseInt(e.target.value);
          Canvas.selectedNodes[0].progress = progress;
          if (progressValue) {
            progressValue.textContent = `${progress}%`;
          }
          CanvasEngine.requestRedraw();
          Canvas.renderNodes();
        }
      });
      
      progressInput.addEventListener('change', () => {
        Canvas.saveProjectData();
      });
    }
    
    // Delete node
    const deleteBtn = document.getElementById('delete-node');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        Canvas.deleteSelectedNodes();
      });
    }
    
    // Duplicate node
    const duplicateBtn = document.getElementById('duplicate-node');
    if (duplicateBtn) {
      duplicateBtn.addEventListener('click', () => {
        Canvas.duplicateSelectedNodes();
      });
    }
    
    // AI suggestions
    document.querySelectorAll('.ai-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const nodeType = item.dataset.nodeType;
        const module = item.dataset.module;
        
        if (Canvas.selectedNodes.length > 0) {
          const selectedNode = Canvas.selectedNodes[0];
          const node = NodeFactory.createNode(
            nodeType,
            module,
            selectedNode.x + 350,
            selectedNode.y
          );
          Canvas.nodes.push(node);
          
          // Auto-connect
          ConnectionManager.addConnection(selectedNode, 0, node, 0, 'sequential');
          
          // Select new node
          Canvas.clearSelection();
          Canvas.selectNode(node);
          
          Canvas.saveProjectData();
          CanvasEngine.requestRedraw();
          Canvas.renderNodes();
          
          Toast.success(`${nodeType} added and connected! 🤖`);
        }
      });
    });
  },
  
  /**
   * Keyboard events
   */
  attachKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Prevent shortcuts when typing
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') {
        document.querySelector('[data-tool="select"]')?.click();
      } else if (e.key === 'h' || e.key === 'H') {
        document.querySelector('[data-tool="hand"]')?.click();
      } else if (e.key === 'c' || e.key === 'C') {
        document.querySelector('[data-tool="connection"]')?.click();
      }
      
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        Canvas.deleteSelectedNodes();
      }
      
      // Duplicate (Cmd+D / Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        Canvas.duplicateSelectedNodes();
      }
      
      // Select all (Cmd+A / Ctrl+A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        Canvas.selectAllNodes();
      }
      
      // Deselect (Esc)
      if (e.key === 'Escape') {
        Canvas.clearSelection();
        CanvasEngine.requestRedraw();
        Canvas.renderNodes();
      }
      
      // Save (Cmd+S / Ctrl+S)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        Canvas.saveProjectData();
        Toast.success('Saved! 💾');
      }
      
      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        document.getElementById('zoom-in')?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        document.getElementById('zoom-out')?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        CanvasEngine.resetView();
      }
    });
  }
};

// Expose globally
window.CanvasEvents = CanvasEvents;

console.log('✅ Canvas events module loaded');
