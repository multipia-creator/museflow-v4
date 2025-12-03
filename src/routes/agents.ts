/**
 * Agents Monitoring API
 * @version 1.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const agents = new Hono<{ Bindings: Bindings }>();

// Enable CORS
agents.use('/*', cors());

/**
 * GET /api/agents/status
 * Get all agents status and statistics
 */
agents.get('/status', async (c) => {
  try {
    const allAgents = [
      { id: 1, name: 'Research Agent', domain: 'research', status: 'active', size: '12K' },
      { id: 2, name: 'Canvas Agent', domain: 'canvas', status: 'active', size: '16K' },
      { id: 3, name: 'Document Agent', domain: 'document', status: 'active', size: '18K' },
      { id: 4, name: 'Widget Agent', domain: 'widget', status: 'active', size: '25K' },
      { id: 5, name: 'Integration Agent', domain: 'integration', status: 'active', size: '15K' },
      { id: 6, name: 'Monitor Agent', domain: 'monitor', status: 'active', size: '19K' },
      { id: 7, name: 'Exhibition Agent', domain: 'exhibition', status: 'active', size: '15K' },
      { id: 8, name: 'Budget Agent', domain: 'budget', status: 'active', size: '9.3K' },
      { id: 9, name: 'Collection Agent', domain: 'collection', status: 'active', size: '5.5K' },
      { id: 10, name: 'Education Agent', domain: 'education', status: 'active', size: '12K' },
      { id: 11, name: 'Analytics Agent', domain: 'analytics', status: 'active', size: '19K' },
      { id: 12, name: 'Chatbot Agent', domain: 'chatbot', status: 'active', size: '11K' },
      { id: 13, name: 'Digital Twin Agent', domain: 'digital-twin', status: 'active', size: '13K' },
    ];

    return c.json({
      success: true,
      data: {
        totalAgents: 13,
        activeAgents: 13,
        inactiveAgents: 0,
        agents: allAgents,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/agents/workflows
 * Get all workflow templates
 */
agents.get('/workflows', async (c) => {
  try {
    const workflows = [
      { id: 1, name: 'Exhibition Planning', agents: ['exhibition', 'research', 'canvas'], phases: 7 },
      { id: 2, name: 'Budget Approval', agents: ['budget', 'canvas', 'document'], phases: 3 },
      { id: 3, name: 'Collection Selection', agents: ['collection', 'canvas'], phases: 3 },
      { id: 4, name: 'Education Program', agents: ['education', 'canvas', 'integration'], phases: 3 },
      { id: 5, name: 'Promotion Planning', agents: ['document', 'integration'], phases: 3 },
      { id: 6, name: 'Visitor Assistance', agents: ['chatbot', 'canvas'], phases: 2 },
      { id: 7, name: 'Space Optimization', agents: ['digital-twin', 'canvas', 'monitor'], phases: 3 },
    ];

    return c.json({
      success: true,
      data: {
        totalWorkflows: 7,
        workflows,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export default agents;
