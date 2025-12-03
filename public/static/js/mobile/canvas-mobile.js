/**
 * Canvas Mobile Optimizations
 * Touch gestures, mobile UI, responsive controls
 */

const CanvasMobile = {
  // State
  isMobile: false,
  isTablet: false,
  leftPanelVisible: false,
  rightPanelVisible: false,
  
  // Touch gesture state
  touchStartX: 0,
  touchStartY: 0,
  touchStartTime: 0,
  isPanning: false,
  isZooming: false,
  lastTouchDistance: 0,

  /**
   * Initialize mobile optimizations
   */
  init() {
    console.log('📱 Initializing Canvas Mobile optimizations...');
    
    // Detect device type
    this.detectDevice();
    
    // Setup mobile UI
    if (this.isMobile) {
      this.setupMobileUI();
      this.setupTouchGestures();
      this.setupMobileControls();
      this.setupDrawerToggles();
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleOrientationChange(), 300);
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.detectDevice();
      if (this.isMobile) {
        this.adjustMobileLayout();
      }
    });

    console.log('✅ Canvas Mobile initialized');
  },

  /**
   * Detect device type
   */
  detectDevice() {
    const width = window.innerWidth;
    this.isMobile = width <= 768;
    this.isTablet = width > 768 && width <= 1024;
    
    // Add class to body
    document.body.classList.toggle('is-mobile', this.isMobile);
    document.body.classList.toggle('is-tablet', this.isTablet);
    
    console.log(`📱 Device: ${this.isMobile ? 'Mobile' : this.isTablet ? 'Tablet' : 'Desktop'}`);
  },

  /**
   * Setup mobile-specific UI elements
   */
  setupMobileUI() {
    // Create mobile FAB (Floating Action Button)
    this.createMobileFAB();
    
    // Create panel backdrops
    this.createPanelBackdrops();
    
    // Create zoom controls
    this.createZoomControls();
    
    // Optimize existing panels
    this.optimizePanelsForMobile();
  },

  /**
   * Create Mobile FAB
   */
  createMobileFAB() {
    const existingFAB = document.getElementById('mobile-fab-container');
    if (existingFAB) return;

    const fabHTML = `
      <div id="mobile-fab-container" class="mobile-fab-container">
        <button class="mobile-fab secondary" id="fab-run-workflow" title="Run Workflow">
          <i class="fas fa-play"></i>
        </button>
        <button class="mobile-fab secondary" id="fab-properties" title="Properties">
          <i class="fas fa-sliders-h"></i>
        </button>
        <button class="mobile-fab" id="fab-add-node" title="Add Node">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', fabHTML);

    // Attach event listeners
    document.getElementById('fab-add-node')?.addEventListener('click', () => {
      this.toggleLeftPanel();
    });

    document.getElementById('fab-properties')?.addEventListener('click', () => {
      this.toggleRightPanel();
    });

    document.getElementById('fab-run-workflow')?.addEventListener('click', () => {
      if (window.WorkflowExecutionPanel) {
        const panel = document.getElementById('workflow-execution-panel');
        if (panel) {
          panel.classList.toggle('visible');
        } else {
          window.WorkflowExecutionPanel.toggle();
        }
      } else {
        // Fallback: try to run workflow directly
        if (window.AIOrchestrator && window.CanvasV3) {
          const projectId = window.CanvasV3.currentProject?.id;
          const nodes = window.CanvasV3.nodes || [];
          const connections = window.CanvasV3.connections || [];
          if (projectId && nodes.length > 0) {
            window.AIOrchestrator.executeEntireWorkflow(projectId, nodes, connections);
          }
        }
      }
    });
  },

  /**
   * Create panel backdrops
   */
  createPanelBackdrops() {
    // Left panel backdrop
    if (!document.getElementById('left-panel-backdrop')) {
      const leftBackdrop = document.createElement('div');
      leftBackdrop.id = 'left-panel-backdrop';
      leftBackdrop.className = 'left-panel-backdrop';
      leftBackdrop.addEventListener('click', () => this.hideLeftPanel());
      document.body.appendChild(leftBackdrop);
    }

    // Right panel backdrop
    if (!document.getElementById('right-panel-backdrop')) {
      const rightBackdrop = document.createElement('div');
      rightBackdrop.id = 'right-panel-backdrop';
      rightBackdrop.className = 'right-panel-backdrop';
      rightBackdrop.addEventListener('click', () => this.hideRightPanel());
      document.body.appendChild(rightBackdrop);
    }
  },

  /**
   * Create zoom controls
   */
  createZoomControls() {
    const existingControls = document.getElementById('mobile-zoom-controls');
    if (existingControls) return;

    const controlsHTML = `
      <div id="mobile-zoom-controls" class="zoom-controls">
        <button class="zoom-btn" id="zoom-in-btn" title="Zoom In">
          <i class="fas fa-plus"></i>
        </button>
        <button class="zoom-btn" id="zoom-reset-btn" title="Reset Zoom">
          <i class="fas fa-compress"></i>
        </button>
        <button class="zoom-btn" id="zoom-out-btn" title="Zoom Out">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', controlsHTML);

    // Attach zoom event listeners
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
      if (window.CanvasV3) {
        window.CanvasV3.zoom = Math.min(window.CanvasV3.zoom * 1.2, 3);
        if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
      }
    });

    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
      if (window.CanvasV3) {
        window.CanvasV3.zoom = Math.max(window.CanvasV3.zoom / 1.2, 0.3);
        if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
      }
    });

    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => {
      if (window.CanvasV3) {
        window.CanvasV3.zoom = 1;
        window.CanvasV3.panX = 0;
        window.CanvasV3.panY = 0;
        if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
      }
    });
  },

  /**
   * Optimize panels for mobile
   */
  optimizePanelsForMobile() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');

    if (leftPanel) {
      leftPanel.classList.add('mobile-drawer');
    }

    if (rightPanel) {
      rightPanel.classList.add('mobile-drawer');
    }

    // Make workflow execution panel mobile-friendly
    const execPanel = document.getElementById('workflow-execution-panel');
    if (execPanel) {
      execPanel.classList.add('mobile-bottom-sheet');
    }
  },

  /**
   * Setup touch gestures
   */
  setupTouchGestures() {
    const canvas = document.getElementById('canvas-container');
    if (!canvas) return;

    // Touch start
    canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    
    // Touch move
    canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    
    // Touch end
    canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

    console.log('✅ Touch gestures enabled');
  },

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    this.touchStartTime = Date.now();

    if (e.touches.length === 1) {
      // Single touch - panning or tap
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isPanning = true;
    } else if (e.touches.length === 2) {
      // Two finger touch - pinch zoom
      this.isZooming = true;
      this.isPanning = false;
      
      const distance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.lastTouchDistance = distance;
      
      // Prevent default to stop page zoom
      e.preventDefault();
    }
  },

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (this.isPanning && e.touches.length === 1 && window.CanvasV3) {
      // Single finger pan
      const deltaX = e.touches[0].clientX - this.touchStartX;
      const deltaY = e.touches[0].clientY - this.touchStartY;

      // Update pan position
      window.CanvasV3.panX += deltaX;
      window.CanvasV3.panY += deltaY;

      // Update touch start for next move
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;

      // Redraw canvas
      if (window.CanvasEngine) {
        window.CanvasEngine.needsRedraw = true;
      }

      e.preventDefault();
    } else if (this.isZooming && e.touches.length === 2 && window.CanvasV3) {
      // Two finger pinch zoom
      const distance = this.getTouchDistance(e.touches[0], e.touches[1]);
      const scale = distance / this.lastTouchDistance;

      // Update zoom
      window.CanvasV3.zoom = Math.max(0.3, Math.min(3, window.CanvasV3.zoom * scale));

      this.lastTouchDistance = distance;

      // Redraw canvas
      if (window.CanvasEngine) {
        window.CanvasEngine.needsRedraw = true;
      }

      e.preventDefault();
    }
  },

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    const touchDuration = Date.now() - this.touchStartTime;

    // Check for tap (quick touch < 200ms, no movement)
    if (touchDuration < 200 && !this.isZooming) {
      const deltaX = Math.abs((e.changedTouches[0]?.clientX || this.touchStartX) - this.touchStartX);
      const deltaY = Math.abs((e.changedTouches[0]?.clientY || this.touchStartY) - this.touchStartY);

      if (deltaX < 10 && deltaY < 10) {
        // This was a tap, not a pan
        this.handleTap(this.touchStartX, this.touchStartY);
      }
    }

    this.isPanning = false;
    this.isZooming = false;
  },

  /**
   * Handle tap event
   */
  handleTap(x, y) {
    console.log('👆 Tap detected at:', x, y);
    
    // Let Canvas V3 handle node selection
    if (window.CanvasV3 && typeof window.CanvasV3.handleCanvasClick === 'function') {
      const event = { clientX: x, clientY: y };
      window.CanvasV3.handleCanvasClick(event);
    }
  },

  /**
   * Get distance between two touch points
   */
  getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Setup drawer toggles
   */
  setupDrawerToggles() {
    // Add toggle buttons to toolbar if not exists
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

    // Check if toggle buttons already exist
    if (document.getElementById('mobile-toggle-left')) return;

    const leftToggleHTML = `
      <button class="toolbar-btn mobile-only" id="mobile-toggle-left" title="Toggle Node Library">
        <i class="fas fa-bars"></i>
      </button>
    `;

    const rightToggleHTML = `
      <button class="toolbar-btn mobile-only" id="mobile-toggle-right" title="Toggle Properties">
        <i class="fas fa-info-circle"></i>
      </button>
    `;

    // Insert at beginning and end of toolbar
    toolbar.insertAdjacentHTML('afterbegin', leftToggleHTML);
    toolbar.insertAdjacentHTML('beforeend', rightToggleHTML);

    // Attach listeners
    document.getElementById('mobile-toggle-left')?.addEventListener('click', () => {
      this.toggleLeftPanel();
    });

    document.getElementById('mobile-toggle-right')?.addEventListener('click', () => {
      this.toggleRightPanel();
    });
  },

  /**
   * Toggle left panel
   */
  toggleLeftPanel() {
    if (this.leftPanelVisible) {
      this.hideLeftPanel();
    } else {
      this.showLeftPanel();
    }
  },

  /**
   * Show left panel
   */
  showLeftPanel() {
    const leftPanel = document.querySelector('.left-panel');
    const backdrop = document.getElementById('left-panel-backdrop');

    if (leftPanel) {
      leftPanel.classList.add('visible');
      this.leftPanelVisible = true;
    }

    if (backdrop) {
      backdrop.classList.add('visible');
    }

    // Hide right panel if visible
    if (this.rightPanelVisible) {
      this.hideRightPanel();
    }
  },

  /**
   * Hide left panel
   */
  hideLeftPanel() {
    const leftPanel = document.querySelector('.left-panel');
    const backdrop = document.getElementById('left-panel-backdrop');

    if (leftPanel) {
      leftPanel.classList.remove('visible');
      this.leftPanelVisible = false;
    }

    if (backdrop) {
      backdrop.classList.remove('visible');
    }
  },

  /**
   * Toggle right panel
   */
  toggleRightPanel() {
    if (this.rightPanelVisible) {
      this.hideRightPanel();
    } else {
      this.showRightPanel();
    }
  },

  /**
   * Show right panel
   */
  showRightPanel() {
    const rightPanel = document.querySelector('.right-panel');
    const backdrop = document.getElementById('right-panel-backdrop');

    if (rightPanel) {
      rightPanel.classList.add('visible');
      this.rightPanelVisible = true;
    }

    if (backdrop) {
      backdrop.classList.add('visible');
    }

    // Hide left panel if visible
    if (this.leftPanelVisible) {
      this.hideLeftPanel();
    }
  },

  /**
   * Hide right panel
   */
  hideRightPanel() {
    const rightPanel = document.querySelector('.right-panel');
    const backdrop = document.getElementById('right-panel-backdrop');

    if (rightPanel) {
      rightPanel.classList.remove('visible');
      this.rightPanelVisible = false;
    }

    if (backdrop) {
      backdrop.classList.remove('visible');
    }
  },

  /**
   * Setup mobile-specific controls
   */
  setupMobileControls() {
    // Double tap to zoom
    let lastTap = 0;
    const canvas = document.getElementById('canvas-container');
    
    if (canvas) {
      canvas.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected
          this.handleDoubleTap(e);
          e.preventDefault();
        }
        
        lastTap = currentTime;
      });
    }
  },

  /**
   * Handle double tap (zoom to fit or reset)
   */
  handleDoubleTap(e) {
    if (!window.CanvasV3) return;

    if (window.CanvasV3.zoom === 1) {
      // Zoom in to 1.5x
      window.CanvasV3.zoom = 1.5;
    } else {
      // Reset zoom
      window.CanvasV3.zoom = 1;
      window.CanvasV3.panX = 0;
      window.CanvasV3.panY = 0;
    }

    if (window.CanvasEngine) {
      window.CanvasEngine.needsRedraw = true;
    }

    console.log('👆👆 Double tap - Zoom:', window.CanvasV3.zoom);
  },

  /**
   * Handle orientation change
   */
  handleOrientationChange() {
    console.log('📱 Orientation changed');
    
    // Close all panels
    this.hideLeftPanel();
    this.hideRightPanel();
    
    // Adjust layout
    this.adjustMobileLayout();
    
    // Redraw canvas
    if (window.CanvasEngine) {
      window.CanvasEngine.needsRedraw = true;
    }
  },

  /**
   * Adjust mobile layout
   */
  adjustMobileLayout() {
    // Recalculate canvas dimensions
    if (window.CanvasV3 && typeof window.CanvasV3.initCanvas === 'function') {
      setTimeout(() => {
        window.CanvasV3.initCanvas();
      }, 100);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CanvasMobile.init();
  });
} else {
  CanvasMobile.init();
}

// Export globally
window.CanvasMobile = CanvasMobile;
