/**
 * MuseFlow Canvas V3 - Enhanced Node Connection UX
 * Phase 4: Connection 인터랙션 고도화
 * 
 * Features:
 * - Enlarged connection points (hover)
 * - Connection guides (snap + alignment)
 * - Connection labels (auto-generation)
 */

const NodeConnectionEnhanced = {
  // Connection point hover radius
  HOVER_RADIUS: 12,
  NORMAL_RADIUS: 6,
  
  // Snap distance for guides
  SNAP_DISTANCE: 20,
  
  /**
   * Initialize enhanced connection system
   */
  init() {
    console.log('[NodeConnectionEnhanced] Initializing enhanced connection UX...');
    
    // Override CanvasState's connection drawing
    if (window.CanvasState) {
      this.enhanceConnectionDrawing();
    }
    
    console.log('[NodeConnectionEnhanced] Enhanced connection UX ready');
  },
  
  /**
   * Enhance connection drawing
   */
  enhanceConnectionDrawing() {
    const originalDrawConnections = window.CanvasState.drawConnections;
    
    window.CanvasState.drawConnections = function(ctx) {
      // Draw original connections
      if (originalDrawConnections) {
        originalDrawConnections.call(this, ctx);
      }
      
      // Draw enhanced connection points
      NodeConnectionEnhanced.drawEnhancedConnectionPoints(ctx, this);
      
      // Draw connection labels
      NodeConnectionEnhanced.drawConnectionLabels(ctx, this);
    };
  },
  
  /**
   * Draw enhanced connection points with hover effect
   */
  drawEnhancedConnectionPoints(ctx, canvasState) {
    if (!canvasState.nodes) return;
    
    canvasState.nodes.forEach(node => {
      const points = this.getConnectionPoints(node);
      
      points.forEach(point => {
        const isHovered = this.isPointHovered(point, canvasState.mousePos);
        const radius = isHovered ? this.HOVER_RADIUS : this.NORMAL_RADIUS;
        
        // Draw connection point
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        
        // Fill
        ctx.fillStyle = isHovered ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)';
        ctx.fill();
        
        // Stroke
        ctx.strokeStyle = isHovered ? '#6366f1' : 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();
        
        // Hover label
        if (isHovered) {
          ctx.save();
          ctx.fillStyle = '#4f46e5';
          ctx.font = '12px "Pretendard", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(point.type, point.x, point.y - 20);
          ctx.restore();
        }
      });
    });
  },
  
  /**
   * Get connection points for a node
   */
  getConnectionPoints(node) {
    const points = [];
    const padding = 8;
    
    // Top
    points.push({
      x: node.x + node.width / 2,
      y: node.y - padding,
      type: 'input',
      direction: 'top'
    });
    
    // Bottom
    points.push({
      x: node.x + node.width / 2,
      y: node.y + node.height + padding,
      type: 'output',
      direction: 'bottom'
    });
    
    // Left
    points.push({
      x: node.x - padding,
      y: node.y + node.height / 2,
      type: 'input',
      direction: 'left'
    });
    
    // Right
    points.push({
      x: node.x + node.width + padding,
      y: node.y + node.height / 2,
      type: 'output',
      direction: 'right'
    });
    
    return points;
  },
  
  /**
   * Check if point is hovered
   */
  isPointHovered(point, mousePos) {
    if (!mousePos) return false;
    
    const dx = point.x - mousePos.x;
    const dy = point.y - mousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.HOVER_RADIUS;
  },
  
  /**
   * Draw connection labels
   */
  drawConnectionLabels(ctx, canvasState) {
    if (!canvasState.connections) return;
    
    canvasState.connections.forEach(conn => {
      const fromNode = canvasState.nodes.find(n => n.id === conn.from);
      const toNode = canvasState.nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return;
      
      // Calculate midpoint
      const midX = (fromNode.x + fromNode.width / 2 + toNode.x + toNode.width / 2) / 2;
      const midY = (fromNode.y + fromNode.height / 2 + toNode.y + toNode.height / 2) / 2;
      
      // Auto-generate label
      const label = conn.label || this.generateConnectionLabel(fromNode, toNode);
      
      if (!label) return;
      
      // Draw label background
      ctx.save();
      ctx.font = '11px "Pretendard", sans-serif';
      const metrics = ctx.measureText(label);
      const padding = 6;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.fillRect(
        midX - metrics.width / 2 - padding,
        midY - 8 - padding,
        metrics.width + padding * 2,
        16 + padding * 2
      );
      
      // Draw label text
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(label, midX, midY);
      
      ctx.restore();
    });
  },
  
  /**
   * Generate connection label automatically
   */
  generateConnectionLabel(fromNode, toNode) {
    const relationMap = {
      'ex-01': { 'ex-02': '→ 예산 책정', 'ex-03': '→ 일정 수립' },
      'ex-02': { 'ex-04': '→ 작품 선택' },
      'ex-04': { 'ex-05': '→ 공간 설계' },
      'co-01': { 'co-02': '→ 보존 처리' },
      'co-02': { 'co-03': '→ 문서화' }
    };
    
    if (relationMap[fromNode.id] && relationMap[fromNode.id][toNode.id]) {
      return relationMap[fromNode.id][toNode.id];
    }
    
    return null; // No auto-label
  },
  
  /**
   * Draw snap guides
   */
  drawSnapGuides(ctx, canvasState, targetPoint) {
    if (!targetPoint) return;
    
    // Find nearby nodes for snapping
    canvasState.nodes.forEach(node => {
      const points = this.getConnectionPoints(node);
      
      points.forEach(point => {
        const dx = Math.abs(point.x - targetPoint.x);
        const dy = Math.abs(point.y - targetPoint.y);
        
        // Draw vertical guide
        if (dx < this.SNAP_DISTANCE) {
          ctx.save();
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y - 50);
          ctx.lineTo(point.x, point.y + 50);
          ctx.stroke();
          ctx.restore();
        }
        
        // Draw horizontal guide
        if (dy < this.SNAP_DISTANCE) {
          ctx.save();
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(point.x - 50, point.y);
          ctx.lineTo(point.x + 50, point.y);
          ctx.stroke();
          ctx.restore();
        }
      });
    });
  }
};

// Auto-initialize when Canvas V3 is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => NodeConnectionEnhanced.init(), 1000);
  });
} else {
  setTimeout(() => NodeConnectionEnhanced.init(), 1000);
}
