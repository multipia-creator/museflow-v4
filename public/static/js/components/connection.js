/**
 * Connection Component System
 * Handles connections between nodes with Bezier curves
 */

class Connection {
  constructor(sourceNode, sourceIndex, targetNode, targetIndex, type = 'sequential') {
    this.id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sourceNode = sourceNode;
    this.sourceIndex = sourceIndex;
    this.targetNode = targetNode;
    this.targetIndex = targetIndex;
    this.type = type; // sequential | dependency | reference | dataflow
    
    // Visual state
    this.selected = false;
    this.hovered = false;
    
    // Add connection references to nodes
    sourceNode.connections.outputs.push({
      connectionId: this.id,
      outputIndex: sourceIndex,
      targetNodeId: targetNode.id
    });
    
    targetNode.connections.inputs.push({
      connectionId: this.id,
      inputIndex: targetIndex,
      sourceNodeId: sourceNode.id
    });
  }
  
  /**
   * Get connection color
   */
  getColor() {
    const colors = {
      sequential: '#6366f1',
      dependency: '#10b981',
      reference: '#9ca3af',
      dataflow: '#f59e0b'
    };
    return colors[this.type] || colors.sequential;
  }
  
  /**
   * Get line style
   */
  getLineStyle() {
    return {
      width: this.selected ? 3 : 2,
      dashArray: this.type === 'reference' ? [5, 5] : []
    };
  }
  
  /**
   * Render connection
   */
  render(ctx, zoom) {
    // Get connection points
    const start = this.sourceNode.getConnectionPoint('output', this.sourceIndex);
    const end = this.targetNode.getConnectionPoint('input', this.targetIndex);
    
    // Calculate control points for Bezier curve
    const distance = Math.abs(end.x - start.x);
    const controlOffset = Math.min(distance * 0.5, 150);
    
    const cp1x = start.x + controlOffset;
    const cp1y = start.y;
    const cp2x = end.x - controlOffset;
    const cp2y = end.y;
    
    // Line style
    const style = this.getLineStyle();
    ctx.strokeStyle = this.selected ? '#3b82f6' : this.getColor();
    ctx.lineWidth = style.width / zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Dashed line for reference type
    if (style.dashArray.length > 0) {
      ctx.setLineDash(style.dashArray.map(d => d / zoom));
    } else {
      ctx.setLineDash([]);
    }
    
    // Draw shadow if selected
    if (this.selected) {
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
      ctx.shadowBlur = 8 / zoom;
    }
    
    // Draw Bezier curve
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, end.x, end.y);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw arrowhead
    this.drawArrowhead(ctx, cp2x, cp2y, end.x, end.y, zoom);
    
    // Reset line dash
    ctx.setLineDash([]);
  }
  
  /**
   * Draw arrowhead at end of connection
   */
  drawArrowhead(ctx, fromX, fromY, toX, toY, zoom) {
    const headLength = 12 / zoom;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.fillStyle = this.selected ? '#3b82f6' : this.getColor();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Check if point is near connection line
   */
  containsPoint(x, y, threshold = 10) {
    const start = this.sourceNode.getConnectionPoint('output', this.sourceIndex);
    const end = this.targetNode.getConnectionPoint('input', this.targetIndex);
    
    // Calculate control points
    const distance = Math.abs(end.x - start.x);
    const controlOffset = Math.min(distance * 0.5, 150);
    
    const cp1x = start.x + controlOffset;
    const cp1y = start.y;
    const cp2x = end.x - controlOffset;
    const cp2y = end.y;
    
    // Sample points along the Bezier curve
    const samples = 20;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = this.bezierPoint(
        start.x, start.y,
        cp1x, cp1y,
        cp2x, cp2y,
        end.x, end.y,
        t
      );
      
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < threshold) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate point on Bezier curve at parameter t
   */
  bezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    return {
      x: mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3,
      y: mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3
    };
  }
  
  /**
   * Remove connection
   */
  remove() {
    // Remove from source node
    this.sourceNode.connections.outputs = this.sourceNode.connections.outputs.filter(
      c => c.connectionId !== this.id
    );
    
    // Remove from target node
    this.targetNode.connections.inputs = this.targetNode.connections.inputs.filter(
      c => c.connectionId !== this.id
    );
  }
  
  /**
   * Validate connection
   */
  static validate(sourceNode, targetNode) {
    // Prevent self-connection
    if (sourceNode.id === targetNode.id) {
      return { valid: false, error: 'Cannot connect node to itself' };
    }
    
    // Prevent duplicate connections
    const existingConnection = sourceNode.connections.outputs.find(
      c => c.targetNodeId === targetNode.id
    );
    if (existingConnection) {
      return { valid: false, error: 'Connection already exists' };
    }
    
    // Check for circular dependencies (basic check)
    if (Connection.wouldCreateCycle(sourceNode, targetNode)) {
      return { valid: false, error: 'Would create circular dependency' };
    }
    
    return { valid: true };
  }
  
  /**
   * Check if connection would create a cycle
   */
  static wouldCreateCycle(sourceNode, targetNode) {
    // Simple BFS to detect cycle
    const visited = new Set();
    const queue = [targetNode];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.id === sourceNode.id) {
        return true; // Cycle detected
      }
      
      if (visited.has(current.id)) {
        continue;
      }
      
      visited.add(current.id);
      
      // Add all outputs to queue
      current.connections.outputs.forEach(conn => {
        // This requires access to all nodes - will be handled by Canvas
        // For now, return false
      });
    }
    
    return false;
  }
  
  /**
   * Serialize connection
   */
  toJSON() {
    return {
      id: this.id,
      sourceNodeId: this.sourceNode.id,
      sourceIndex: this.sourceIndex,
      targetNodeId: this.targetNode.id,
      targetIndex: this.targetIndex,
      type: this.type
    };
  }
}

/**
 * Connection Manager
 */
const ConnectionManager = {
  connections: [],
  
  /**
   * Add connection
   */
  addConnection(sourceNode, sourceIndex, targetNode, targetIndex, type = 'sequential') {
    const validation = Connection.validate(sourceNode, targetNode);
    if (!validation.valid) {
      console.warn('Connection validation failed:', validation.error);
      if (window.Toast) {
        window.Toast.error(validation.error);
      }
      return null;
    }
    
    const connection = new Connection(sourceNode, sourceIndex, targetNode, targetIndex, type);
    this.connections.push(connection);
    
    console.log('✅ Connection created:', connection.id);
    return connection;
  },
  
  /**
   * Remove connection
   */
  removeConnection(connectionId) {
    const connection = this.connections.find(c => c.id === connectionId);
    if (connection) {
      connection.remove();
      this.connections = this.connections.filter(c => c.id !== connectionId);
      console.log('🗑️ Connection removed:', connectionId);
    }
  },
  
  /**
   * Get connections for node
   */
  getNodeConnections(nodeId) {
    return this.connections.filter(
      c => c.sourceNode.id === nodeId || c.targetNode.id === nodeId
    );
  },
  
  /**
   * Remove all connections for node
   */
  removeNodeConnections(nodeId) {
    const nodeConnections = this.getNodeConnections(nodeId);
    nodeConnections.forEach(conn => {
      this.removeConnection(conn.id);
    });
  },
  
  /**
   * Find connection at point
   */
  findConnectionAt(x, y, threshold = 10) {
    for (let i = this.connections.length - 1; i >= 0; i--) {
      if (this.connections[i].containsPoint(x, y, threshold)) {
        return this.connections[i];
      }
    }
    return null;
  },
  
  /**
   * Clear all connections
   */
  clear() {
    this.connections.forEach(conn => conn.remove());
    this.connections = [];
  },
  
  /**
   * Render all connections
   */
  renderAll(ctx, zoom) {
    this.connections.forEach(connection => {
      connection.render(ctx, zoom);
    });
  }
};

// Expose globally
window.Connection = Connection;
window.ConnectionManager = ConnectionManager;

console.log('✅ Connection system loaded');
