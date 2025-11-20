/**
 * Workflow Manager
 * High-level state management for workflow operations
 */

import type {
  Workflow,
  Node,
  Connection,
  NodeStatus,
  WorkflowStatus,
} from '../types/database.types';

import { getApiClient } from './api-client';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface WorkflowManagerConfig {
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  debounceDelay?: number; // milliseconds
}

// ============================================================================
// STATE
// ============================================================================

export interface WorkflowState {
  workflow: Workflow | null;
  nodes: Node[];
  connections: Connection[];
  
  // UI state
  selectedNodes: string[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  
  // Status
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

// ============================================================================
// WORKFLOW MANAGER
// ============================================================================

export class WorkflowManager {
  private state: WorkflowState;
  private config: WorkflowManagerConfig;
  private autoSaveTimer: number | null = null;
  private saveDebounceTimer: number | null = null;
  private listeners: Set<(state: WorkflowState) => void> = new Set();

  constructor(config: WorkflowManagerConfig = {}) {
    this.config = {
      autoSave: config.autoSave ?? true,
      autoSaveInterval: config.autoSaveInterval ?? 30000, // 30 seconds
      debounceDelay: config.debounceDelay ?? 1000, // 1 second
    };

    this.state = {
      workflow: null,
      nodes: [],
      connections: [],
      selectedNodes: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      isLoading: false,
      isSaving: false,
      error: null,
      lastSaved: null,
      hasUnsavedChanges: false,
    };
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Get current state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WorkflowState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<WorkflowState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // ==========================================================================
  // WORKFLOW OPERATIONS
  // ==========================================================================

  /**
   * Create new workflow
   */
  async createWorkflow(data: Partial<Workflow>): Promise<boolean> {
    this.setState({ isLoading: true, error: null });

    try {
      const api = getApiClient();
      const response = await api.createWorkflow(data);

      if (response.success && response.data) {
        this.setState({
          workflow: response.data,
          nodes: [],
          connections: [],
          isLoading: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        });

        this.startAutoSave();
        return true;
      } else {
        this.setState({
          isLoading: false,
          error: response.error || 'Failed to create workflow',
        });
        return false;
      }
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Load existing workflow
   */
  async loadWorkflow(id: string): Promise<boolean> {
    this.setState({ isLoading: true, error: null });

    try {
      const api = getApiClient();
      const response = await api.getWorkflow(id);

      if (response.success && response.data) {
        const { workflow, nodes, connections } = response.data;

        this.setState({
          workflow,
          nodes,
          connections,
          viewport: {
            x: workflow.viewport_x,
            y: workflow.viewport_y,
            zoom: workflow.viewport_zoom,
          },
          isLoading: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(workflow.updated_at),
        });

        this.startAutoSave();
        return true;
      } else {
        this.setState({
          isLoading: false,
          error: response.error || 'Failed to load workflow',
        });
        return false;
      }
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Generate workflow from AI
   */
  async generateWorkflow(
    prompt: string,
    context?: {
      museum?: string;
      budget?: number;
      duration?: string;
      userId?: string;
    }
  ): Promise<boolean> {
    this.setState({ isLoading: true, error: null });

    try {
      const api = getApiClient();
      const response = await api.generateWorkflow(prompt, context);

      if (response.success && response.data) {
        const { workflowId } = response.data;
        
        // Load the generated workflow
        return await this.loadWorkflow(workflowId);
      } else {
        this.setState({
          isLoading: false,
          error: response.error || 'Failed to generate workflow',
        });
        return false;
      }
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Save workflow (manual or auto-save)
   */
  async saveWorkflow(): Promise<boolean> {
    if (!this.state.workflow || !this.state.hasUnsavedChanges) {
      return true;
    }

    this.setState({ isSaving: true });

    try {
      const api = getApiClient();
      const response = await api.updateWorkflow(this.state.workflow.id, {
        viewport_x: this.state.viewport.x,
        viewport_y: this.state.viewport.y,
        viewport_zoom: this.state.viewport.zoom,
      });

      if (response.success) {
        this.setState({
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        });
        return true;
      } else {
        this.setState({
          isSaving: false,
          error: response.error || 'Failed to save workflow',
        });
        return false;
      }
    } catch (error: any) {
      this.setState({
        isSaving: false,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Update workflow status
   */
  async updateStatus(status: WorkflowStatus): Promise<boolean> {
    if (!this.state.workflow) return false;

    const api = getApiClient();
    const response = await api.updateWorkflow(this.state.workflow.id, { status });

    if (response.success) {
      this.setState({
        workflow: { ...this.state.workflow, status },
      });
      return true;
    }

    return false;
  }

  // ==========================================================================
  // NODE OPERATIONS
  // ==========================================================================

  /**
   * Add node to workflow
   */
  async addNode(data: Partial<Node>): Promise<Node | null> {
    if (!this.state.workflow) return null;

    const api = getApiClient();
    const response = await api.createNode(this.state.workflow.id, data);

    if (response.success && response.data) {
      this.setState({
        nodes: [...this.state.nodes, response.data],
        hasUnsavedChanges: true,
      });

      this.debounceSave();
      return response.data;
    }

    return null;
  }

  /**
   * Update node
   */
  async updateNode(id: string, data: Partial<Node>): Promise<boolean> {
    const api = getApiClient();
    const response = await api.updateNode(id, data);

    if (response.success) {
      this.setState({
        nodes: this.state.nodes.map((node) =>
          node.id === id ? { ...node, ...data } : node
        ),
        hasUnsavedChanges: true,
      });

      this.debounceSave();
      return true;
    }

    return false;
  }

  /**
   * Update node status
   */
  async updateNodeStatus(id: string, status: NodeStatus): Promise<boolean> {
    return this.updateNode(id, { status });
  }

  /**
   * Delete node
   */
  async deleteNode(id: string): Promise<boolean> {
    const api = getApiClient();
    const response = await api.deleteNode(id);

    if (response.success) {
      this.setState({
        nodes: this.state.nodes.filter((node) => node.id !== id),
        connections: this.state.connections.filter(
          (conn) => conn.from_node !== id && conn.to_node !== id
        ),
        hasUnsavedChanges: true,
      });

      this.debounceSave();
      return true;
    }

    return false;
  }

  // ==========================================================================
  // CONNECTION OPERATIONS
  // ==========================================================================

  /**
   * Add connection
   */
  async addConnection(data: Partial<Connection>): Promise<Connection | null> {
    if (!this.state.workflow) return null;

    const api = getApiClient();
    const response = await api.createConnection(this.state.workflow.id, data);

    if (response.success && response.data) {
      this.setState({
        connections: [...this.state.connections, response.data],
        hasUnsavedChanges: true,
      });

      this.debounceSave();
      return response.data;
    }

    return null;
  }

  /**
   * Delete connection
   */
  async deleteConnection(id: string): Promise<boolean> {
    const api = getApiClient();
    const response = await api.deleteConnection(id);

    if (response.success) {
      this.setState({
        connections: this.state.connections.filter((conn) => conn.id !== id),
        hasUnsavedChanges: true,
      });

      this.debounceSave();
      return true;
    }

    return false;
  }

  // ==========================================================================
  // UI STATE
  // ==========================================================================

  /**
   * Update viewport
   */
  updateViewport(x: number, y: number, zoom: number) {
    this.setState({
      viewport: { x, y, zoom },
      hasUnsavedChanges: true,
    });

    this.debounceSave();
  }

  /**
   * Select nodes
   */
  selectNodes(nodeIds: string[]) {
    this.setState({ selectedNodes: nodeIds });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.setState({ selectedNodes: [] });
  }

  // ==========================================================================
  // AUTO-SAVE
  // ==========================================================================

  /**
   * Start auto-save timer
   */
  private startAutoSave() {
    if (!this.config.autoSave) return;

    this.stopAutoSave();

    this.autoSaveTimer = window.setInterval(() => {
      if (this.state.hasUnsavedChanges && !this.state.isSaving) {
        this.saveWorkflow();
      }
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Debounced save
   */
  private debounceSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(() => {
      if (this.state.hasUnsavedChanges) {
        this.saveWorkflow();
      }
    }, this.config.debounceDelay);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoSave();
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.listeners.clear();
  }
}

// ============================================================================
// FACTORY
// ============================================================================

let defaultManager: WorkflowManager | null = null;

/**
 * Initialize default workflow manager
 */
export function initWorkflowManager(config?: WorkflowManagerConfig): WorkflowManager {
  if (defaultManager) {
    defaultManager.destroy();
  }
  defaultManager = new WorkflowManager(config);
  return defaultManager;
}

/**
 * Get default workflow manager
 */
export function getWorkflowManager(): WorkflowManager {
  if (!defaultManager) {
    throw new Error('Workflow manager not initialized. Call initWorkflowManager() first.');
  }
  return defaultManager;
}
