/**
 * Workflow Sync Manager
 * Synchronizes Canvas V2 state with D1 Database
 */

class WorkflowSyncManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.workflowId = null;
    this.syncQueue = [];
    this.isSyncing = false;
    this.autoSaveInterval = null;
    this.lastSyncTime = null;
    this.hasUnsavedChanges = false;
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize workflow sync (create or load)
   */
  async init(projectData) {
    console.log('🔄 Initializing workflow sync...', projectData);

    // Check if workflow exists in D1
    const existingWorkflows = await this.api.listWorkflows(projectData.id, 1);

    if (existingWorkflows.success && existingWorkflows.data.length > 0) {
      // Load existing workflow
      this.workflowId = existingWorkflows.data[0].id;
      console.log('📥 Loading existing workflow:', this.workflowId);
      return await this.loadFromDatabase();
    } else {
      // Create new workflow
      console.log('📝 Creating new workflow...');
      return await this.createWorkflow(projectData);
    }
  }

  /**
   * Create new workflow in D1
   */
  async createWorkflow(projectData) {
    const response = await this.api.createWorkflow({
      project_id: projectData.id,
      name: projectData.name,
      description: projectData.description || '',
      status: 'draft',
      created_by: 'user-1',
      ai_generated: false,
      viewport_x: 0,
      viewport_y: 0,
      viewport_zoom: 1,
    });

    if (response.success) {
      this.workflowId = response.data.id;
      console.log('✅ Workflow created:', this.workflowId);
      this.startAutoSync();
      return { nodes: [], connections: [] };
    } else {
      console.error('❌ Failed to create workflow:', response.error);
      throw new Error(response.error);
    }
  }

  /**
   * Load workflow from D1
   */
  async loadFromDatabase() {
    const response = await this.api.getWorkflow(this.workflowId);

    if (response.success) {
      const { workflow, nodes, connections } = response.data;
      console.log(`✅ Loaded workflow: ${nodes.length} nodes, ${connections.length} connections`);
      
      this.lastSyncTime = new Date();
      this.startAutoSync();

      return {
        nodes: nodes.map(this.convertDBNodeToCanvas),
        connections: connections.map(this.convertDBConnectionToCanvas),
        viewport: {
          x: workflow.viewport_x,
          y: workflow.viewport_y,
          zoom: workflow.viewport_zoom,
        },
      };
    } else {
      console.error('❌ Failed to load workflow:', response.error);
      throw new Error(response.error);
    }
  }

  // ==========================================================================
  // NODE SYNC
  // ==========================================================================

  /**
   * Sync node to database (create or update)
   */
  async syncNode(node) {
    if (!this.workflowId) return;

    const dbNode = this.convertCanvasNodeToDB(node);

    if (node.dbId) {
      // Update existing node
      const response = await this.api.updateNode(node.dbId, dbNode);
      if (response.success) {
        console.log('✅ Node updated:', node.dbId);
      }
    } else {
      // Create new node
      const response = await this.api.createNode(this.workflowId, dbNode);
      if (response.success) {
        node.dbId = response.data.id;
        console.log('✅ Node created:', node.dbId);
      }
    }
  }

  /**
   * Delete node from database
   */
  async deleteNode(nodeId) {
    if (!nodeId) return;

    const response = await this.api.deleteNode(nodeId);
    if (response.success) {
      console.log('✅ Node deleted:', nodeId);
    }
  }

  // ==========================================================================
  // CONNECTION SYNC
  // ==========================================================================

  /**
   * Sync connection to database
   */
  async syncConnection(connection) {
    if (!this.workflowId) return;

    const dbConnection = this.convertCanvasConnectionToDB(connection);

    if (connection.dbId) {
      // Connections can't be updated, only deleted and recreated
      return;
    } else {
      // Create new connection
      const response = await this.api.createConnection(this.workflowId, dbConnection);
      if (response.success) {
        connection.dbId = response.data.id;
        console.log('✅ Connection created:', connection.dbId);
      }
    }
  }

  /**
   * Delete connection from database
   */
  async deleteConnection(connectionId) {
    if (!connectionId) return;

    const response = await this.api.deleteConnection(connectionId);
    if (response.success) {
      console.log('✅ Connection deleted:', connectionId);
    }
  }

  // ==========================================================================
  // BATCH SYNC
  // ==========================================================================

  /**
   * Sync all canvas data to database
   */
  async syncAll(nodes, connections, viewport) {
    if (!this.workflowId || this.isSyncing) return;

    this.isSyncing = true;
    console.log('🔄 Syncing all data to database...');

    try {
      // Update viewport
      await this.api.updateWorkflow(this.workflowId, {
        viewport_x: viewport.x,
        viewport_y: viewport.y,
        viewport_zoom: viewport.zoom,
      });

      // Sync nodes
      for (const node of nodes) {
        await this.syncNode(node);
      }

      // Sync connections
      for (const connection of connections) {
        await this.syncConnection(connection);
      }

      this.lastSyncTime = new Date();
      this.hasUnsavedChanges = false;
      console.log('✅ All data synced successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // ==========================================================================
  // AUTO SYNC
  // ==========================================================================

  /**
   * Start auto-sync (every 10 seconds)
   */
  startAutoSync() {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges) {
        console.log('⏰ Auto-sync triggered');
        // Will be called by Canvas V2
      }
    }, 10000);

    console.log('🔄 Auto-sync started (every 10s)');
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏸️ Auto-sync stopped');
    }
  }

  /**
   * Mark as having unsaved changes
   */
  markDirty() {
    this.hasUnsavedChanges = true;
  }

  // ==========================================================================
  // DATA CONVERSION
  // ==========================================================================

  /**
   * Convert Canvas node format to DB format
   */
  convertCanvasNodeToDB(node) {
    return {
      id: node.dbId,
      type: node.type,
      category: node.category || 'default',
      position_x: node.x,
      position_y: node.y,
      width: node.width || 220,
      height: node.height || 100,
      title: node.title,
      description: node.description || '',
      status: node.status || 'todo',
      color: node.color,
      icon: node.icon,
      custom_data: JSON.stringify({
        canvasId: node.id,
        ...node.data,
      }),
    };
  }

  /**
   * Convert DB node format to Canvas format
   */
  convertDBNodeToCanvas(dbNode) {
    let customData = {};
    try {
      customData = dbNode.custom_data ? JSON.parse(dbNode.custom_data) : {};
    } catch (e) {
      console.warn('Failed to parse custom_data:', e);
    }

    return {
      id: customData.canvasId || `node-${dbNode.id}`,
      dbId: dbNode.id,
      type: dbNode.type,
      category: dbNode.category,
      x: dbNode.position_x,
      y: dbNode.position_y,
      width: dbNode.width,
      height: dbNode.height,
      title: dbNode.title,
      description: dbNode.description,
      status: dbNode.status,
      color: dbNode.color,
      icon: dbNode.icon,
      data: customData,
    };
  }

  /**
   * Convert Canvas connection format to DB format
   */
  convertCanvasConnectionToDB(connection) {
    return {
      id: connection.dbId,
      from_node: connection.from.dbId,
      to_node: connection.to.dbId,
      type: connection.type || 'default',
      color: connection.color || '#94a3b8',
      style: connection.style || 'bezier',
      label: connection.label || null,
    };
  }

  /**
   * Convert DB connection format to Canvas format
   */
  convertDBConnectionToCanvas(dbConnection) {
    return {
      id: `conn-${dbConnection.id}`,
      dbId: dbConnection.id,
      from: { dbId: dbConnection.from_node },
      to: { dbId: dbConnection.to_node },
      type: dbConnection.type,
      color: dbConnection.color,
      style: dbConnection.style,
      label: dbConnection.label,
    };
  }

  // ==========================================================================
  // STATUS
  // ==========================================================================

  /**
   * Get sync status
   */
  getStatus() {
    return {
      workflowId: this.workflowId,
      isSyncing: this.isSyncing,
      hasUnsavedChanges: this.hasUnsavedChanges,
      lastSyncTime: this.lastSyncTime,
      isAutoSyncEnabled: !!this.autoSaveInterval,
    };
  }
}

// Global instance
window.WorkflowSync = null;

// Initialize sync manager
function initWorkflowSync(apiClient) {
  window.WorkflowSync = new WorkflowSyncManager(apiClient);
  return window.WorkflowSync;
}
