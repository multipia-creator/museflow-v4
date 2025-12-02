import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Node Execution Result Interface
 */
interface NodeExecutionResult {
  node_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  error?: string;
  started_at?: string;
  completed_at?: string;
  execution_time_ms?: number;
}

/**
 * Workflow Execution Result Interface
 */
interface WorkflowExecutionResult {
  execution_id: string;
  project_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  total_nodes: number;
  completed_nodes: number;
  failed_nodes: number;
  nodes: NodeExecutionResult[];
  started_at: string;
  completed_at?: string;
  total_execution_time_ms?: number;
}

/**
 * POST /api/workflow/execute
 * Execute a workflow from Canvas
 * 
 * Request Body:
 * {
 *   project_id: number,
 *   nodes: Array<{id, type, label, inputs, config}>,
 *   connections: Array<{from, to}>
 * }
 */
app.post('/api/workflow/execute', async (c) => {
  try {
    const { project_id, nodes, connections } = await c.req.json();
    
    if (!project_id || !nodes || !Array.isArray(nodes)) {
      return c.json({ 
        success: false, 
        error: 'Invalid request: project_id and nodes array required' 
      }, 400);
    }

    // Generate unique execution ID
    const execution_id = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const started_at = new Date().toISOString();

    console.log(`🚀 Starting workflow execution: ${execution_id}`);
    console.log(`📊 Project: ${project_id}, Nodes: ${nodes.length}, Connections: ${connections?.length || 0}`);

    // Build execution graph (topological sort for node execution order)
    const executionOrder = buildExecutionOrder(nodes, connections || []);
    console.log(`📋 Execution order:`, executionOrder.map(n => n.id));

    // Execute nodes in order
    const nodeResults: NodeExecutionResult[] = [];
    const nodeOutputs = new Map<string, any>(); // Store outputs for connected nodes

    for (const node of executionOrder) {
      const nodeStartTime = Date.now();
      const nodeResult: NodeExecutionResult = {
        node_id: node.id,
        status: 'running',
        started_at: new Date().toISOString()
      };

      try {
        console.log(`▶️  Executing node: ${node.id} (${node.type})`);

        // Get inputs from connected nodes
        const nodeInputs = getNodeInputs(node, connections || [], nodeOutputs);

        // Execute node based on type
        const output = await executeNode(c.env, node, nodeInputs);
        
        // Store output for next nodes
        nodeOutputs.set(node.id, output);

        const executionTime = Date.now() - nodeStartTime;
        nodeResult.status = 'completed';
        nodeResult.output = output;
        nodeResult.completed_at = new Date().toISOString();
        nodeResult.execution_time_ms = executionTime;

        console.log(`✅ Node ${node.id} completed in ${executionTime}ms`);

      } catch (error: any) {
        const executionTime = Date.now() - nodeStartTime;
        nodeResult.status = 'failed';
        nodeResult.error = error.message;
        nodeResult.completed_at = new Date().toISOString();
        nodeResult.execution_time_ms = executionTime;

        console.error(`❌ Node ${node.id} failed:`, error.message);
      }

      nodeResults.push(nodeResult);
    }

    // Calculate overall status
    const completedNodes = nodeResults.filter(n => n.status === 'completed').length;
    const failedNodes = nodeResults.filter(n => n.status === 'failed').length;
    const totalExecutionTime = Date.now() - new Date(started_at).getTime();

    let overallStatus: 'completed' | 'failed' | 'partial' = 'completed';
    if (failedNodes === nodes.length) {
      overallStatus = 'failed';
    } else if (failedNodes > 0) {
      overallStatus = 'partial';
    }

    const result: WorkflowExecutionResult = {
      execution_id,
      project_id,
      status: overallStatus,
      total_nodes: nodes.length,
      completed_nodes: completedNodes,
      failed_nodes: failedNodes,
      nodes: nodeResults,
      started_at,
      completed_at: new Date().toISOString(),
      total_execution_time_ms: totalExecutionTime
    };

    // Save execution result to database
    await saveExecutionResult(c.env.DB, result);

    console.log(`🏁 Workflow execution completed: ${execution_id}`);
    console.log(`📊 Status: ${overallStatus}, Completed: ${completedNodes}/${nodes.length}, Failed: ${failedNodes}`);

    return c.json({
      success: true,
      execution: result
    });

  } catch (error: any) {
    console.error('❌ Workflow execution error:', error);
    return c.json({ 
      success: false, 
      error: 'Workflow execution failed',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/workflow/executions/:project_id
 * Get execution history for a project
 */
app.get('/api/workflow/executions/:project_id', async (c) => {
  try {
    const project_id = parseInt(c.req.param('project_id'));

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM workflow_executions
      WHERE project_id = ?
      ORDER BY started_at DESC
      LIMIT 50
    `).bind(project_id).all();

    const executions = results?.map(row => ({
      ...row,
      nodes: row.nodes ? JSON.parse(row.nodes as string) : []
    })) || [];

    return c.json({
      success: true,
      executions
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch executions:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch execution history',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/workflow/execution/:execution_id
 * Get specific execution result
 */
app.get('/api/workflow/execution/:execution_id', async (c) => {
  try {
    const execution_id = c.req.param('execution_id');

    const result = await c.env.DB.prepare(`
      SELECT * FROM workflow_executions
      WHERE execution_id = ?
    `).bind(execution_id).first();

    if (!result) {
      return c.json({ 
        success: false, 
        error: 'Execution not found' 
      }, 404);
    }

    const execution = {
      ...result,
      nodes: result.nodes ? JSON.parse(result.nodes as string) : []
    };

    return c.json({
      success: true,
      execution
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch execution:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch execution result',
      message: error.message 
    }, 500);
  }
});

/**
 * Helper: Build execution order using topological sort
 */
function buildExecutionOrder(nodes: any[], connections: any[]): any[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build graph
  connections.forEach(conn => {
    if (adjacencyList.has(conn.from)) {
      adjacencyList.get(conn.from)!.push(conn.to);
      inDegree.set(conn.to, (inDegree.get(conn.to) || 0) + 1);
    }
  });

  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  const result: any[] = [];

  // Start with nodes that have no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighborId => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);
      if (newDegree === 0) {
        queue.push(neighborId);
      }
    });
  }

  // If not all nodes are processed, there might be a cycle
  // For now, just return what we have + remaining nodes
  if (result.length < nodes.length) {
    console.warn('⚠️  Possible cycle detected in workflow graph');
    nodes.forEach(node => {
      if (!result.find(n => n.id === node.id)) {
        result.push(node);
      }
    });
  }

  return result;
}

/**
 * Helper: Get inputs for a node from connected nodes
 */
function getNodeInputs(
  node: any, 
  connections: any[], 
  nodeOutputs: Map<string, any>
): any {
  const inputs: any = {};

  connections.forEach(conn => {
    if (conn.to === node.id) {
      const output = nodeOutputs.get(conn.from);
      if (output !== undefined) {
        inputs[conn.from] = output;
      }
    }
  });

  return inputs;
}

/**
 * Helper: Execute a single node based on its type
 */
async function executeNode(
  env: Bindings,
  node: any,
  inputs: any
): Promise<any> {
  const nodeType = node.type || node.category;

  console.log(`  📌 Node type: ${nodeType}, Inputs:`, Object.keys(inputs));

  switch (nodeType) {
    // AI/Gemini nodes
    case 'gemini':
    case 'gemini-generate':
    case 'ai-generate':
      return await executeGeminiNode(env, node, inputs);

    case 'gemini-improve':
    case 'ai-improve':
      return await executeGeminiImprove(env, node, inputs);

    case 'gemini-translate':
    case 'ai-translate':
      return await executeGeminiTranslate(env, node, inputs);

    case 'gemini-summarize':
    case 'ai-summarize':
      return await executeGeminiSummarize(env, node, inputs);

    // Google Workspace nodes
    case 'google-docs':
    case 'docs-create':
      return await executeGoogleDocs(env, node, inputs);

    case 'gmail-draft':
    case 'email-draft':
      return await executeGmailDraft(env, node, inputs);

    case 'calendar-event':
    case 'event-create':
      return await executeCalendarEvent(env, node, inputs);

    // Data transformation nodes
    case 'text-input':
    case 'input':
      return node.config?.text || node.inputs?.text || '';

    case 'text-combine':
    case 'combine':
      return Object.values(inputs).join(' ');

    case 'text-split':
    case 'split':
      const text = Object.values(inputs)[0] || '';
      return String(text).split('\n');

    // Output nodes
    case 'output':
    case 'display':
      return Object.values(inputs)[0] || null;

    default:
      console.warn(`⚠️  Unknown node type: ${nodeType}`);
      return { type: nodeType, inputs };
  }
}

/**
 * Execute Gemini Generate node
 */
async function executeGeminiNode(env: Bindings, node: any, inputs: any): Promise<any> {
  const prompt = node.config?.prompt || node.inputs?.prompt || Object.values(inputs).join('\n');

  if (!prompt) {
    throw new Error('No prompt provided for Gemini node');
  }

  console.log(`  🤖 Calling Gemini API with prompt: "${prompt.substring(0, 50)}..."`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  console.log(`  ✅ Gemini response: "${generatedText.substring(0, 50)}..."`);

  return generatedText;
}

/**
 * Execute Gemini Improve node
 */
async function executeGeminiImprove(env: Bindings, node: any, inputs: any): Promise<any> {
  const text = Object.values(inputs)[0] || node.config?.text || '';
  const prompt = `Improve the following text:\n\n${text}`;

  return await executeGeminiNode(env, { ...node, config: { prompt } }, {});
}

/**
 * Execute Gemini Translate node
 */
async function executeGeminiTranslate(env: Bindings, node: any, inputs: any): Promise<any> {
  const text = Object.values(inputs)[0] || node.config?.text || '';
  const targetLang = node.config?.targetLanguage || 'English';
  const prompt = `Translate the following text to ${targetLang}:\n\n${text}`;

  return await executeGeminiNode(env, { ...node, config: { prompt } }, {});
}

/**
 * Execute Gemini Summarize node
 */
async function executeGeminiSummarize(env: Bindings, node: any, inputs: any): Promise<any> {
  const text = Object.values(inputs)[0] || node.config?.text || '';
  const prompt = `Summarize the following text:\n\n${text}`;

  return await executeGeminiNode(env, { ...node, config: { prompt } }, {});
}

/**
 * Execute Google Docs node (Mock - requires OAuth)
 */
async function executeGoogleDocs(env: Bindings, node: any, inputs: any): Promise<any> {
  const content = Object.values(inputs)[0] || node.config?.content || '';
  const title = node.config?.title || 'Untitled Document';

  console.log(`  📄 Creating Google Doc: "${title}"`);

  // TODO: Implement actual Google Docs API call with OAuth
  return {
    type: 'google-doc',
    title,
    content,
    url: `https://docs.google.com/document/d/mock-${Date.now()}`,
    note: 'Mock response - OAuth integration required for real creation'
  };
}

/**
 * Execute Gmail Draft node (Mock - requires OAuth)
 */
async function executeGmailDraft(env: Bindings, node: any, inputs: any): Promise<any> {
  const body = Object.values(inputs)[0] || node.config?.body || '';
  const to = node.config?.to || '';
  const subject = node.config?.subject || 'No Subject';

  console.log(`  ✉️  Creating Gmail draft: "${subject}"`);

  // TODO: Implement actual Gmail API call with OAuth
  return {
    type: 'gmail-draft',
    to,
    subject,
    body,
    draft_id: `draft-${Date.now()}`,
    note: 'Mock response - OAuth integration required for real creation'
  };
}

/**
 * Execute Calendar Event node (Mock - requires OAuth)
 */
async function executeCalendarEvent(env: Bindings, node: any, inputs: any): Promise<any> {
  const description = Object.values(inputs)[0] || node.config?.description || '';
  const title = node.config?.title || 'Untitled Event';
  const startTime = node.config?.startTime || new Date().toISOString();

  console.log(`  📅 Creating Calendar event: "${title}"`);

  // TODO: Implement actual Google Calendar API call with OAuth
  return {
    type: 'calendar-event',
    title,
    description,
    start_time: startTime,
    event_id: `event-${Date.now()}`,
    note: 'Mock response - OAuth integration required for real creation'
  };
}

/**
 * Helper: Save execution result to database
 */
async function saveExecutionResult(db: D1Database, result: WorkflowExecutionResult): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO workflow_executions (
        execution_id,
        project_id,
        status,
        total_nodes,
        completed_nodes,
        failed_nodes,
        nodes,
        started_at,
        completed_at,
        total_execution_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      result.execution_id,
      result.project_id,
      result.status,
      result.total_nodes,
      result.completed_nodes,
      result.failed_nodes,
      JSON.stringify(result.nodes),
      result.started_at,
      result.completed_at || null,
      result.total_execution_time_ms || null
    ).run();

    console.log(`💾 Saved execution result: ${result.execution_id}`);
  } catch (error) {
    console.warn('⚠️  Failed to save execution result:', error);
    // Don't throw - execution succeeded even if save failed
  }
}

export default app;
