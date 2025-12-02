/**
 * AI Orchestrator - Node-Centric AI Automation Engine
 * Integrates Gemini 2.0, Google MCP, and Custom AI Plugins
 * 
 * Features:
 * - AI Node Types (Gemini, Docs, Gmail, Calendar)
 * - Connection-based Auto-execution
 * - Plugin System for Extensibility
 * - Real-time Output Display
 */

const AIOrchestrator = {
  // Plugin registry
  plugins: new Map(),
  
  // AI execution queue
  executionQueue: [],
  
  // Execution state
  isExecuting: false,
  
  /**
   * Initialize AI Orchestrator
   */
  init() {
    console.log('🤖 Initializing AI Orchestrator...');
    
    // Register default plugins
    this.registerDefaultPlugins();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ AI Orchestrator initialized');
  },
  
  /**
   * Register default AI plugins
   */
  registerDefaultPlugins() {
    // Gemini 2.0 Plugin
    this.registerPlugin({
      id: 'gemini-2.0',
      name: 'Google Gemini 2.0',
      icon: 'sparkles',
      color: '#8b5cf6',
      actions: {
        'generate': {
          name: 'Generate Content',
          description: 'Generate content using Gemini 2.0',
          execute: async (input) => {
            return await this.executeGemini('generate', input);
          }
        },
        'improve': {
          name: 'Improve Text',
          description: 'Improve existing text',
          execute: async (input) => {
            return await this.executeGemini('improve', input);
          }
        },
        'translate': {
          name: 'Translate',
          description: 'Translate text to another language',
          execute: async (input) => {
            return await this.executeGemini('translate', input);
          }
        },
        'summarize': {
          name: 'Summarize',
          description: 'Summarize long text',
          execute: async (input) => {
            return await this.executeGemini('summarize', input);
          }
        }
      }
    });
    
    // Google Workspace Plugin
    this.registerPlugin({
      id: 'google-workspace',
      name: 'Google Workspace',
      icon: 'briefcase',
      color: '#4285f4',
      actions: {
        'createDoc': {
          name: 'Create Document',
          description: 'Create a Google Doc',
          execute: async (input) => {
            return await this.executeGoogleMCP('createDoc', input);
          }
        },
        'draftEmail': {
          name: 'Draft Email',
          description: 'Create Gmail draft',
          execute: async (input) => {
            return await this.executeGoogleMCP('draftEmail', input);
          }
        },
        'createEvent': {
          name: 'Create Event',
          description: 'Create Calendar event',
          execute: async (input) => {
            return await this.executeGoogleMCP('createEvent', input);
          }
        }
      }
    });
    
    console.log('✅ Registered 2 default plugins');
  },
  
  /**
   * Register a new AI plugin
   */
  registerPlugin(plugin) {
    if (!plugin.id || !plugin.name || !plugin.actions) {
      console.error('❌ Invalid plugin configuration');
      return false;
    }
    
    this.plugins.set(plugin.id, plugin);
    console.log('✅ Registered plugin:', plugin.name);
    return true;
  },
  
  /**
   * Get all registered plugins
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  },
  
  /**
   * Get plugin by ID
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  },
  
  /**
   * Execute AI action on a node
   */
  async executeOnNode(node, pluginId, actionId) {
    console.log('🚀 Executing AI:', pluginId, actionId, 'on node', node.id);
    
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error('❌ Plugin not found:', pluginId);
      return null;
    }
    
    const action = plugin.actions[actionId];
    if (!action) {
      console.error('❌ Action not found:', actionId);
      return null;
    }
    
    // Update node status
    node.aiStatus = 'processing';
    node.aiPlugin = pluginId;
    node.aiAction = actionId;
    
    if (window.CanvasV3) {
      window.CanvasV3.updateNodeInspector();
      if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
    }
    
    try {
      // Prepare input from node
      const input = {
        title: node.title,
        description: node.description,
        type: node.type,
        category: node.category
      };
      
      // Execute action
      const result = await action.execute(input);
      
      // Update node with result
      node.aiStatus = 'completed';
      node.aiOutput = result;
      node.aiCompletedAt = new Date().toISOString();
      
      console.log('✅ AI execution completed:', result);
      
      // Update UI
      if (window.CanvasV3) {
        window.CanvasV3.updateNodeInspector();
        if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ AI execution failed:', error);
      
      node.aiStatus = 'failed';
      node.aiError = error.message;
      
      if (window.CanvasV3) {
        window.CanvasV3.updateNodeInspector();
        if (window.CanvasEngine) window.CanvasEngine.needsRedraw = true;
      }
      
      return null;
    }
  },
  
  /**
   * Execute AI workflow based on node connections
   */
  async executeWorkflow(sourceNode, targetNode) {
    console.log('🔄 Executing AI workflow:', sourceNode.id, '→', targetNode.id);
    
    // Check if target node is an AI node
    if (!targetNode.type.startsWith('ai-')) {
      console.log('⚠️ Target node is not an AI node');
      return null;
    }
    
    // Parse AI node type
    const aiType = targetNode.type.replace('ai-', '');
    let pluginId, actionId;
    
    if (aiType === 'gemini-generate') {
      pluginId = 'gemini-2.0';
      actionId = 'generate';
    } else if (aiType === 'gemini-improve') {
      pluginId = 'gemini-2.0';
      actionId = 'improve';
    } else if (aiType === 'google-docs') {
      pluginId = 'google-workspace';
      actionId = 'createDoc';
    } else if (aiType === 'gmail-draft') {
      pluginId = 'google-workspace';
      actionId = 'draftEmail';
    } else if (aiType === 'calendar-event') {
      pluginId = 'google-workspace';
      actionId = 'createEvent';
    }
    
    if (!pluginId || !actionId) {
      console.error('❌ Unknown AI node type:', aiType);
      return null;
    }
    
    // Copy source node content to target node
    targetNode.title = sourceNode.title || '';
    targetNode.description = sourceNode.description || '';
    
    // Execute AI action
    return await this.executeOnNode(targetNode, pluginId, actionId);
  },
  
  /**
   * Execute Gemini API
   */
  async executeGemini(action, input) {
    console.log('💬 Calling Gemini:', action, input);
    
    // Check if GoogleMCP is available
    if (window.GoogleMCP && window.GoogleMCP.gemini) {
      try {
        const result = await window.GoogleMCP.gemini[action](input);
        return result;
      } catch (error) {
        console.error('❌ Gemini API error:', error);
      }
    }
    
    // Fallback to demo mode
    console.warn('⚠️ Gemini API not available, using demo mode');
    
    const prompts = {
      'generate': `Generated content for: ${input.title || input.description}`,
      'improve': `Improved text: ${input.description}`,
      'translate': `Translated (EN→KO): ${input.description}`,
      'summarize': `Summary: ${input.description?.substring(0, 100)}...`
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      content: prompts[action] || 'AI generated content',
      model: 'gemini-2.0-flash (demo)',
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Execute Google MCP API
   */
  async executeGoogleMCP(action, input) {
    console.log('📝 Calling Google MCP:', action, input);
    
    // Check if GoogleMCP is available
    if (window.GoogleMCP && window.GoogleMCP.workspace) {
      try {
        const result = await window.GoogleMCP.workspace[action](input);
        return result;
      } catch (error) {
        console.error('❌ Google MCP error:', error);
      }
    }
    
    // Fallback to demo mode
    console.warn('⚠️ Google MCP not available, using demo mode');
    
    const outputs = {
      'createDoc': {
        success: true,
        url: 'https://docs.google.com/document/d/demo-doc-id',
        title: input.title || 'Untitled Document',
        message: 'Document created (demo mode)'
      },
      'draftEmail': {
        success: true,
        draftId: 'demo-draft-id',
        subject: input.title || 'No subject',
        message: 'Email draft created (demo mode)'
      },
      'createEvent': {
        success: true,
        eventId: 'demo-event-id',
        title: input.title || 'Untitled Event',
        message: 'Calendar event created (demo mode)'
      }
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputs[action] || { success: true, message: 'Demo mode' };
  },
  
  /**
   * Execute entire workflow using Backend API
   * This is the main entry point for running Canvas workflows
   */
  async executeEntireWorkflow(projectId, nodes, connections) {
    console.log('🚀 Starting workflow execution for project:', projectId);
    console.log('📊 Nodes:', nodes.length, 'Connections:', connections?.length || 0);

    // Update UI to show execution state
    if (window.WorkflowExecutionPanel) {
      window.WorkflowExecutionPanel.show();
      window.WorkflowExecutionPanel.setStatus('running', `Executing ${nodes.length} nodes...`);
    }

    try {
      // Call Backend Workflow Execution API
      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          nodes: nodes,
          connections: connections
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Workflow execution failed');
      }

      const execution = data.execution;
      console.log('✅ Workflow execution completed:', execution.execution_id);
      console.log(`📊 Status: ${execution.status}, Completed: ${execution.completed_nodes}/${execution.total_nodes}`);

      // Update UI with results
      if (window.WorkflowExecutionPanel) {
        window.WorkflowExecutionPanel.setStatus(execution.status, 
          `Completed: ${execution.completed_nodes}/${execution.total_nodes} nodes`);
        window.WorkflowExecutionPanel.showResults(execution);
      }

      // Update nodes with execution results
      if (window.CanvasV3) {
        this.updateNodesWithResults(execution.nodes);
      }

      return execution;

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      
      // Update UI with error
      if (window.WorkflowExecutionPanel) {
        window.WorkflowExecutionPanel.setStatus('failed', error.message);
      }

      throw error;
    }
  },

  /**
   * Update Canvas nodes with execution results
   */
  updateNodesWithResults(nodeResults) {
    if (!window.CanvasV3 || !window.CanvasV3.nodes) return;

    nodeResults.forEach(result => {
      const canvasNode = window.CanvasV3.nodes.find(n => n.id === result.node_id);
      if (canvasNode) {
        canvasNode.executionStatus = result.status;
        canvasNode.executionOutput = result.output;
        canvasNode.executionError = result.error;
        canvasNode.executionTime = result.execution_time_ms;
      }
    });

    // Trigger UI update
    if (window.CanvasV3.updateNodeInspector) {
      window.CanvasV3.updateNodeInspector();
    }
    if (window.CanvasEngine) {
      window.CanvasEngine.needsRedraw = true;
    }
  },
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for connection events
    document.addEventListener('canvas:connection-created', (e) => {
      const { fromNode, toNode } = e.detail;
      
      // Auto-execute if target is AI node
      if (toNode.type.startsWith('ai-')) {
        console.log('🔗 AI connection detected, auto-executing...');
        this.executeWorkflow(fromNode, toNode);
      }
    });
    
    // Listen for node selection
    document.addEventListener('canvas:node-selected', (e) => {
      const { node } = e.detail;
      
      // Show AI actions in context menu
      if (window.CanvasV3 && window.CanvasV3.showAIContextMenu) {
        window.CanvasV3.showAIContextMenu(node);
      }
    });
  },
  
  /**
   * Get AI actions for a node type
   */
  getActionsForNodeType(nodeType) {
    const actions = [];
    
    // Add Gemini actions for all text-based nodes
    actions.push({
      pluginId: 'gemini-2.0',
      actionId: 'generate',
      label: '✨ Generate with Gemini',
      icon: 'sparkles'
    });
    
    actions.push({
      pluginId: 'gemini-2.0',
      actionId: 'improve',
      label: '🪄 Improve Text',
      icon: 'wand-2'
    });
    
    // Add Google Workspace actions
    actions.push({
      pluginId: 'google-workspace',
      actionId: 'createDoc',
      label: '📝 Create Google Doc',
      icon: 'file-text'
    });
    
    actions.push({
      pluginId: 'google-workspace',
      actionId: 'draftEmail',
      label: '📧 Draft Email',
      icon: 'mail'
    });
    
    actions.push({
      pluginId: 'google-workspace',
      actionId: 'createEvent',
      label: '📅 Create Event',
      icon: 'calendar-plus'
    });
    
    return actions;
  }
};

// Expose globally
window.AIOrchestrator = AIOrchestrator;
console.log('✅ AI Orchestrator loaded');
