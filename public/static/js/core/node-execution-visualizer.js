/**
 * Node Execution Visualizer
 * Visual feedback for workflow execution status
 */

const NodeExecutionVisualizer = {
  // Store node elements for quick access
  nodeElements: new Map(),

  /**
   * Initialize visualizer
   */
  init() {
    console.log('🎨 Initializing Node Execution Visualizer...');
    this.setupEventListeners();
    console.log('✅ Node Execution Visualizer initialized');
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for workflow execution events
    document.addEventListener('workflow-execution-start', (e) => {
      this.handleExecutionStart(e.detail);
    });

    document.addEventListener('workflow-execution-update', (e) => {
      this.handleExecutionUpdate(e.detail);
    });

    document.addEventListener('workflow-execution-complete', (e) => {
      this.handleExecutionComplete(e.detail);
    });
  },

  /**
   * Update node visual status
   */
  updateNodeStatus(nodeId, status, data = {}) {
    if (!window.CanvasV3 || !window.CanvasV3.nodes) return;

    const node = window.CanvasV3.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Update node data
    node.executionStatus = status;
    node.executionOutput = data.output;
    node.executionError = data.error;
    node.executionTime = data.execution_time_ms;

    // Find node element in DOM
    const nodeElement = this.findNodeElement(nodeId);
    if (!nodeElement) return;

    // Remove all status classes
    nodeElement.classList.remove('node-pending', 'node-running', 'node-completed', 'node-failed');

    // Add new status class
    switch (status) {
      case 'pending':
        nodeElement.classList.add('node-pending');
        this.removeSpinner(nodeElement);
        this.removeStatusBadge(nodeElement);
        break;

      case 'running':
        nodeElement.classList.add('node-running');
        this.addSpinner(nodeElement);
        this.addStatusBadge(nodeElement, '⟳');
        break;

      case 'completed':
        nodeElement.classList.add('node-completed');
        this.removeSpinner(nodeElement);
        this.addStatusBadge(nodeElement, '✓');
        if (data.execution_time_ms) {
          this.addExecutionTime(nodeElement, data.execution_time_ms);
        }
        if (data.output) {
          this.addResultPreview(nodeElement, data.output);
        }
        break;

      case 'failed':
        nodeElement.classList.add('node-failed');
        this.removeSpinner(nodeElement);
        this.addStatusBadge(nodeElement, '✗');
        if (data.error) {
          this.addResultPreview(nodeElement, `Error: ${data.error}`, true);
        }
        break;
    }

    // Trigger redraw if using canvas engine
    if (window.CanvasEngine) {
      window.CanvasEngine.needsRedraw = true;
    }
  },

  /**
   * Update connection visual status
   */
  updateConnectionStatus(fromNodeId, toNodeId, status) {
    if (!window.CanvasV3 || !window.CanvasV3.connections) return;

    const connection = window.CanvasV3.connections.find(
      c => c.from === fromNodeId && c.to === toNodeId
    );

    if (!connection) return;

    connection.executionStatus = status;

    // Find connection element (if using SVG)
    const connectionElement = this.findConnectionElement(fromNodeId, toNodeId);
    if (!connectionElement) return;

    // Remove all status classes
    connectionElement.classList.remove('connection-active', 'connection-completed', 'connection-failed');

    // Add new status class
    switch (status) {
      case 'active':
        connectionElement.classList.add('connection-active');
        break;
      case 'completed':
        connectionElement.classList.add('connection-completed');
        break;
      case 'failed':
        connectionElement.classList.add('connection-failed');
        break;
    }
  },

  /**
   * Find node element in DOM
   */
  findNodeElement(nodeId) {
    // Try cached element first
    if (this.nodeElements.has(nodeId)) {
      return this.nodeElements.get(nodeId);
    }

    // Search in DOM
    const element = document.querySelector(`[data-node-id="${nodeId}"]`) ||
                    document.querySelector(`#node-${nodeId}`);

    if (element) {
      this.nodeElements.set(nodeId, element);
    }

    return element;
  },

  /**
   * Find connection element in DOM
   */
  findConnectionElement(fromId, toId) {
    return document.querySelector(`[data-connection="${fromId}-${toId}"]`) ||
           document.querySelector(`#connection-${fromId}-${toId}`);
  },

  /**
   * Add spinner to node
   */
  addSpinner(nodeElement) {
    this.removeSpinner(nodeElement); // Remove existing first

    const spinner = document.createElement('div');
    spinner.className = 'node-spinner';
    nodeElement.appendChild(spinner);
  },

  /**
   * Remove spinner from node
   */
  removeSpinner(nodeElement) {
    const spinner = nodeElement.querySelector('.node-spinner');
    if (spinner) {
      spinner.remove();
    }
  },

  /**
   * Add status badge to node
   */
  addStatusBadge(nodeElement, icon) {
    this.removeStatusBadge(nodeElement); // Remove existing first

    const badge = document.createElement('div');
    badge.className = 'node-status-badge';
    badge.textContent = icon;
    nodeElement.appendChild(badge);
  },

  /**
   * Remove status badge from node
   */
  removeStatusBadge(nodeElement) {
    const badge = nodeElement.querySelector('.node-status-badge');
    if (badge) {
      badge.remove();
    }
  },

  /**
   * Add execution time badge
   */
  addExecutionTime(nodeElement, timeMs) {
    // Remove existing first
    const existing = nodeElement.querySelector('.node-execution-time');
    if (existing) {
      existing.remove();
    }

    const timeBadge = document.createElement('div');
    timeBadge.className = 'node-execution-time';
    timeBadge.textContent = `${timeMs}ms`;
    nodeElement.appendChild(timeBadge);
  },

  /**
   * Add result preview tooltip
   */
  addResultPreview(nodeElement, result, isError = false) {
    // Remove existing first
    const existing = nodeElement.querySelector('.node-result-preview');
    if (existing) {
      existing.remove();
    }

    const preview = document.createElement('div');
    preview.className = 'node-result-preview';
    
    if (typeof result === 'string') {
      preview.textContent = result.substring(0, 100);
    } else {
      preview.textContent = JSON.stringify(result).substring(0, 100);
    }

    if (isError) {
      preview.style.color = '#ef4444';
      preview.style.borderColor = '#ef4444';
    }

    nodeElement.appendChild(preview);
  },

  /**
   * Handle workflow execution start
   */
  handleExecutionStart(data) {
    console.log('🚀 Workflow execution started:', data);

    // Reset all nodes to pending
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach(nodeId => {
        this.updateNodeStatus(nodeId, 'pending');
      });
    }
  },

  /**
   * Handle workflow execution update
   */
  handleExecutionUpdate(data) {
    console.log('📊 Workflow execution update:', data);

    if (data.nodeId && data.status) {
      this.updateNodeStatus(data.nodeId, data.status, data);
    }

    // Update connections if provided
    if (data.fromNodeId && data.toNodeId) {
      this.updateConnectionStatus(data.fromNodeId, data.toNodeId, data.connectionStatus);
    }
  },

  /**
   * Handle workflow execution complete
   */
  handleExecutionComplete(data) {
    console.log('✅ Workflow execution completed:', data);

    // Update all nodes with final status
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach(nodeResult => {
        this.updateNodeStatus(
          nodeResult.node_id,
          nodeResult.status,
          {
            output: nodeResult.output,
            error: nodeResult.error,
            execution_time_ms: nodeResult.execution_time_ms
          }
        );
      });
    }
  },

  /**
   * Clear all execution status
   */
  clearAllStatus() {
    if (!window.CanvasV3 || !window.CanvasV3.nodes) return;

    window.CanvasV3.nodes.forEach(node => {
      const nodeElement = this.findNodeElement(node.id);
      if (nodeElement) {
        nodeElement.classList.remove('node-pending', 'node-running', 'node-completed', 'node-failed');
        this.removeSpinner(nodeElement);
        this.removeStatusBadge(nodeElement);
        
        const timeBadge = nodeElement.querySelector('.node-execution-time');
        if (timeBadge) timeBadge.remove();
        
        const preview = nodeElement.querySelector('.node-result-preview');
        if (preview) preview.remove();
      }
    });

    // Clear node data
    window.CanvasV3.nodes.forEach(node => {
      delete node.executionStatus;
      delete node.executionOutput;
      delete node.executionError;
      delete node.executionTime;
    });
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    NodeExecutionVisualizer.init();
  });
} else {
  NodeExecutionVisualizer.init();
}

// Export globally
window.NodeExecutionVisualizer = NodeExecutionVisualizer;
