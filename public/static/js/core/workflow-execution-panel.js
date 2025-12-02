/**
 * Workflow Execution Results Panel
 * Displays real-time execution status and results
 */

const WorkflowExecutionPanel = {
  // State
  isVisible: false,
  currentExecution: null,

  /**
   * Initialize the panel
   */
  init() {
    console.log('🎯 Initializing Workflow Execution Panel...');
    this.createPanelHTML();
    this.attachEventListeners();
    console.log('✅ Workflow Execution Panel initialized');
  },

  /**
   * Create panel HTML
   */
  createPanelHTML() {
    const existingPanel = document.getElementById('workflow-execution-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panelHTML = `
      <div id="workflow-execution-panel" class="workflow-execution-panel" style="display: none;">
        <div class="panel-header">
          <div class="panel-title">
            <i data-lucide="play-circle"></i>
            <span>Workflow Execution</span>
          </div>
          <button class="panel-close-btn" onclick="WorkflowExecutionPanel.hide()">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="panel-body">
          <!-- Status Section -->
          <div class="execution-status">
            <div class="status-indicator" id="exec-status-indicator">
              <div class="status-icon">
                <i data-lucide="loader" class="spinning"></i>
              </div>
              <div class="status-text">
                <div class="status-label" id="exec-status-label">Ready</div>
                <div class="status-message" id="exec-status-message">Waiting to execute workflow...</div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="execution-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="exec-progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text" id="exec-progress-text">0 / 0 nodes</div>
          </div>

          <!-- Results List -->
          <div class="execution-results" id="exec-results-list">
            <!-- Node results will be inserted here -->
          </div>

          <!-- Execution Info -->
          <div class="execution-info" id="exec-info" style="display: none;">
            <div class="info-row">
              <span class="info-label">Execution ID:</span>
              <span class="info-value" id="exec-id">-</span>
            </div>
            <div class="info-row">
              <span class="info-label">Started:</span>
              <span class="info-value" id="exec-started">-</span>
            </div>
            <div class="info-row">
              <span class="info-label">Duration:</span>
              <span class="info-value" id="exec-duration">-</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value" id="exec-final-status">-</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn-secondary" onclick="WorkflowExecutionPanel.clearResults()">
            <i data-lucide="trash-2"></i>
            Clear Results
          </button>
          <button class="btn-primary" onclick="WorkflowExecutionPanel.runWorkflow()">
            <i data-lucide="play"></i>
            Run Workflow
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + R = Run Workflow
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.runWorkflow();
      }
      // Ctrl/Cmd + Shift + E = Toggle Execution Panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  /**
   * Show the panel
   */
  show() {
    const panel = document.getElementById('workflow-execution-panel');
    if (panel) {
      panel.style.display = 'flex';
      this.isVisible = true;
    }
  },

  /**
   * Hide the panel
   */
  hide() {
    const panel = document.getElementById('workflow-execution-panel');
    if (panel) {
      panel.style.display = 'none';
      this.isVisible = false;
    }
  },

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  },

  /**
   * Set execution status
   */
  setStatus(status, message) {
    const indicator = document.getElementById('exec-status-indicator');
    const label = document.getElementById('exec-status-label');
    const messageEl = document.getElementById('exec-status-message');
    const iconEl = indicator?.querySelector('.status-icon i');

    if (!indicator || !label || !messageEl) return;

    // Remove all status classes
    indicator.classList.remove('status-pending', 'status-running', 'status-completed', 'status-failed', 'status-partial');

    // Update status
    let icon = 'loader';
    let statusText = status.charAt(0).toUpperCase() + status.slice(1);

    switch (status) {
      case 'pending':
        icon = 'clock';
        indicator.classList.add('status-pending');
        break;
      case 'running':
        icon = 'loader';
        indicator.classList.add('status-running');
        break;
      case 'completed':
        icon = 'check-circle';
        indicator.classList.add('status-completed');
        statusText = 'Completed';
        break;
      case 'failed':
        icon = 'x-circle';
        indicator.classList.add('status-failed');
        statusText = 'Failed';
        break;
      case 'partial':
        icon = 'alert-circle';
        indicator.classList.add('status-partial');
        statusText = 'Partially Completed';
        break;
    }

    // Update icon
    if (iconEl) {
      iconEl.setAttribute('data-lucide', icon);
      if (status === 'running') {
        iconEl.classList.add('spinning');
      } else {
        iconEl.classList.remove('spinning');
      }
    }

    label.textContent = statusText;
    messageEl.textContent = message;

    // Refresh Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  /**
   * Update progress bar
   */
  updateProgress(completed, total) {
    const progressFill = document.getElementById('exec-progress-fill');
    const progressText = document.getElementById('exec-progress-text');

    if (progressFill && progressText) {
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${completed} / ${total} nodes`;
    }
  },

  /**
   * Show execution results
   */
  showResults(execution) {
    this.currentExecution = execution;

    // Update progress
    this.updateProgress(execution.completed_nodes, execution.total_nodes);

    // Update execution info
    const execInfo = document.getElementById('exec-info');
    const execId = document.getElementById('exec-id');
    const execStarted = document.getElementById('exec-started');
    const execDuration = document.getElementById('exec-duration');
    const execFinalStatus = document.getElementById('exec-final-status');

    if (execInfo && execId && execStarted && execDuration && execFinalStatus) {
      execInfo.style.display = 'block';
      execId.textContent = execution.execution_id;
      execStarted.textContent = new Date(execution.started_at).toLocaleString();
      execDuration.textContent = execution.total_execution_time_ms 
        ? `${execution.total_execution_time_ms}ms`
        : '-';
      execFinalStatus.textContent = execution.status;
    }

    // Display node results
    this.displayNodeResults(execution.nodes);
  },

  /**
   * Display individual node results
   */
  displayNodeResults(nodeResults) {
    const resultsList = document.getElementById('exec-results-list');
    if (!resultsList) return;

    resultsList.innerHTML = '';

    if (!nodeResults || nodeResults.length === 0) {
      resultsList.innerHTML = '<div class="no-results">No execution results yet.</div>';
      return;
    }

    nodeResults.forEach(result => {
      const resultCard = this.createNodeResultCard(result);
      resultsList.appendChild(resultCard);
    });
  },

  /**
   * Create node result card
   */
  createNodeResultCard(result) {
    const card = document.createElement('div');
    card.className = `node-result-card status-${result.status}`;

    let statusIcon = 'circle';
    let statusColor = '#gray';

    switch (result.status) {
      case 'completed':
        statusIcon = 'check-circle';
        statusColor = '#10b981';
        break;
      case 'failed':
        statusIcon = 'x-circle';
        statusColor = '#ef4444';
        break;
      case 'running':
        statusIcon = 'loader';
        statusColor = '#3b82f6';
        break;
      case 'pending':
        statusIcon = 'clock';
        statusColor = '#6b7280';
        break;
    }

    // Format output
    let outputHTML = '';
    if (result.status === 'completed' && result.output) {
      if (typeof result.output === 'string') {
        outputHTML = `<div class="node-output">${this.escapeHtml(result.output)}</div>`;
      } else {
        outputHTML = `<div class="node-output"><pre>${JSON.stringify(result.output, null, 2)}</pre></div>`;
      }
    } else if (result.status === 'failed' && result.error) {
      outputHTML = `<div class="node-error">Error: ${this.escapeHtml(result.error)}</div>`;
    }

    card.innerHTML = `
      <div class="result-header">
        <i data-lucide="${statusIcon}" style="color: ${statusColor}"></i>
        <span class="node-id">${this.escapeHtml(result.node_id)}</span>
        ${result.execution_time_ms ? `<span class="execution-time">${result.execution_time_ms}ms</span>` : ''}
      </div>
      ${outputHTML}
    `;

    // Refresh Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }

    return card;
  },

  /**
   * Clear all results
   */
  clearResults() {
    this.currentExecution = null;
    this.setStatus('pending', 'Waiting to execute workflow...');
    this.updateProgress(0, 0);
    
    const resultsList = document.getElementById('exec-results-list');
    if (resultsList) {
      resultsList.innerHTML = '';
    }

    const execInfo = document.getElementById('exec-info');
    if (execInfo) {
      execInfo.style.display = 'none';
    }
  },

  /**
   * Run workflow (trigger execution)
   */
  async runWorkflow() {
    console.log('▶️  Run Workflow button clicked');

    if (!window.CanvasV3 || !window.CanvasV3.currentProject) {
      alert('No project loaded. Please load a project first.');
      return;
    }

    if (!window.AIOrchestrator) {
      alert('AI Orchestrator not available.');
      return;
    }

    const projectId = window.CanvasV3.currentProject.id;
    const nodes = window.CanvasV3.nodes || [];
    const connections = window.CanvasV3.connections || [];

    if (nodes.length === 0) {
      alert('No nodes in workflow. Please add some nodes first.');
      return;
    }

    this.show();
    this.clearResults();
    this.setStatus('running', `Executing ${nodes.length} nodes...`);

    try {
      await window.AIOrchestrator.executeEntireWorkflow(projectId, nodes, connections);
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      alert(`Workflow execution failed: ${error.message}`);
    }
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    WorkflowExecutionPanel.init();
  });
} else {
  WorkflowExecutionPanel.init();
}

// Expose globally
window.WorkflowExecutionPanel = WorkflowExecutionPanel;
