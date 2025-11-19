/**
 * Canvas Engine - Infinite Canvas System
 * Handles zoom, pan, grid, viewport transformations
 */

const CanvasEngine = {
  // Canvas state
  canvas: null,
  ctx: null,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
    minZoom: 0.25,
    maxZoom: 4
  },
  
  // Grid settings
  grid: {
    enabled: true,
    size: 20,
    color: '#e5e7eb',
    majorSize: 100,
    majorColor: '#d1d5db'
  },
  
  // Interaction state
  isPanning: false,
  panStart: { x: 0, y: 0 },
  lastMousePos: { x: 0, y: 0 },
  
  // Performance
  needsRedraw: true,
  animationFrame: null,
  
  /**
   * Initialize canvas engine
   */
  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    // Start render loop
    this.startRenderLoop();
    
    console.log('✅ Canvas Engine initialized');
  },
  
  /**
   * Resize canvas to fill container
   */
  resize() {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set canvas size (with device pixel ratio for sharp rendering)
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Scale context for high DPI
    this.ctx.scale(dpr, dpr);
    
    // Set CSS size
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.needsRedraw = true;
  },
  
  /**
   * Start render loop
   */
  startRenderLoop() {
    const render = () => {
      if (this.needsRedraw) {
        this.render();
        this.needsRedraw = false;
      }
      this.animationFrame = requestAnimationFrame(render);
    };
    render();
  },
  
  /**
   * Stop render loop
   */
  stopRenderLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  },
  
  /**
   * Main render function
   */
  render() {
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
    
    // Draw connections (will be implemented by Canvas page)
    if (window.Canvas && window.Canvas.renderConnections) {
      window.Canvas.renderConnections(this.ctx);
    }
    
    // Restore context
    this.ctx.restore();
  },
  
  /**
   * Draw grid background
   */
  drawGrid(width, height) {
    const ctx = this.ctx;
    const zoom = this.viewport.zoom;
    const offsetX = this.viewport.x / zoom;
    const offsetY = this.viewport.y / zoom;
    
    // Calculate visible area in world coordinates
    const startX = Math.floor(-offsetX / this.grid.size) * this.grid.size;
    const startY = Math.floor(-offsetY / this.grid.size) * this.grid.size;
    const endX = startX + (width / zoom) + this.grid.size;
    const endY = startY + (height / zoom) + this.grid.size;
    
    // Draw minor grid lines
    ctx.strokeStyle = this.grid.color;
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    
    for (let x = startX; x < endX; x += this.grid.size) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    
    for (let y = startY; y < endY; y += this.grid.size) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
    
    // Draw major grid lines
    ctx.strokeStyle = this.grid.majorColor;
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    
    for (let x = startX; x < endX; x += this.grid.majorSize) {
      if (x % this.grid.majorSize === 0) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
    }
    
    for (let y = startY; y < endY; y += this.grid.majorSize) {
      if (y % this.grid.majorSize === 0) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
    }
    
    ctx.stroke();
  },
  
  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.viewport.x) / this.viewport.zoom,
      y: (screenY - this.viewport.y) / this.viewport.zoom
    };
  },
  
  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.viewport.zoom + this.viewport.x,
      y: worldY * this.viewport.zoom + this.viewport.y
    };
  },
  
  /**
   * Zoom at specific point
   */
  zoomAt(clientX, clientY, delta) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate zoom factor
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newZoom = Math.max(
      this.viewport.minZoom,
      Math.min(this.viewport.maxZoom, this.viewport.zoom * zoomFactor)
    );
    
    if (newZoom === this.viewport.zoom) return;
    
    // Zoom towards cursor position
    const worldPos = this.screenToWorld(x, y);
    this.viewport.zoom = newZoom;
    const newScreenPos = this.worldToScreen(worldPos.x, worldPos.y);
    
    this.viewport.x += x - newScreenPos.x;
    this.viewport.y += y - newScreenPos.y;
    
    this.needsRedraw = true;
    
    // Update zoom display
    if (window.Canvas && window.Canvas.updateZoomDisplay) {
      window.Canvas.updateZoomDisplay();
    }
  },
  
  /**
   * Set zoom level
   */
  setZoom(zoom, centerOnViewport = true) {
    zoom = Math.max(this.viewport.minZoom, Math.min(this.viewport.maxZoom, zoom));
    
    if (centerOnViewport) {
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const worldPos = this.screenToWorld(centerX, centerY);
      this.viewport.zoom = zoom;
      const newScreenPos = this.worldToScreen(worldPos.x, worldPos.y);
      
      this.viewport.x += centerX - newScreenPos.x;
      this.viewport.y += centerY - newScreenPos.y;
    } else {
      this.viewport.zoom = zoom;
    }
    
    this.needsRedraw = true;
    
    if (window.Canvas && window.Canvas.updateZoomDisplay) {
      window.Canvas.updateZoomDisplay();
    }
  },
  
  /**
   * Pan viewport
   */
  pan(dx, dy) {
    this.viewport.x += dx;
    this.viewport.y += dy;
    this.needsRedraw = true;
  },
  
  /**
   * Reset viewport to center
   */
  resetView() {
    this.viewport.x = 0;
    this.viewport.y = 0;
    this.viewport.zoom = 1;
    this.needsRedraw = true;
    
    if (window.Canvas && window.Canvas.updateZoomDisplay) {
      window.Canvas.updateZoomDisplay();
    }
  },
  
  /**
   * Fit content to viewport
   */
  fitToContent(nodes) {
    if (!nodes || nodes.length === 0) {
      this.resetView();
      return;
    }
    
    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    
    // Add padding
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Calculate zoom to fit
    const rect = this.canvas.getBoundingClientRect();
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const zoomX = rect.width / contentWidth;
    const zoomY = rect.height / contentHeight;
    const zoom = Math.min(zoomX, zoomY, this.viewport.maxZoom);
    
    // Center content
    this.viewport.zoom = zoom;
    this.viewport.x = (rect.width - contentWidth * zoom) / 2 - minX * zoom;
    this.viewport.y = (rect.height - contentHeight * zoom) / 2 - minY * zoom;
    
    this.needsRedraw = true;
    
    if (window.Canvas && window.Canvas.updateZoomDisplay) {
      window.Canvas.updateZoomDisplay();
    }
  },
  
  /**
   * Toggle grid visibility
   */
  toggleGrid() {
    this.grid.enabled = !this.grid.enabled;
    this.needsRedraw = true;
  },
  
  /**
   * Start panning
   */
  startPan(clientX, clientY) {
    this.isPanning = true;
    this.panStart = { x: clientX, y: clientY };
  },
  
  /**
   * Update panning
   */
  updatePan(clientX, clientY) {
    if (!this.isPanning) return;
    
    const dx = clientX - this.panStart.x;
    const dy = clientY - this.panStart.y;
    
    this.pan(dx, dy);
    
    this.panStart = { x: clientX, y: clientY };
  },
  
  /**
   * End panning
   */
  endPan() {
    this.isPanning = false;
  },
  
  /**
   * Request redraw
   */
  requestRedraw() {
    this.needsRedraw = true;
  }
};

// Expose globally
window.CanvasEngine = CanvasEngine;
console.log('✅ Canvas Engine loaded');
