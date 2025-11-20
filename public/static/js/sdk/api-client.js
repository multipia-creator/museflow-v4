/**
 * MuseFlow API Client SDK (Browser Version)
 * Type-safe JavaScript SDK for frontend-backend communication
 */

class MuseFlowApiClient {
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${this.timeout}ms`,
        };
      }

      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  // ==========================================================================
  // WORKFLOW METHODS
  // ==========================================================================

  async createWorkflow(data) {
    return this.request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkflow(id) {
    return this.request(`/api/workflows/${id}`);
  }

  async updateWorkflow(id, data) {
    return this.request(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id) {
    return this.request(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async listWorkflows(userId, limit = 50) {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    params.set('limit', limit.toString());

    return this.request(`/api/workflows?${params}`);
  }

  // ==========================================================================
  // NODE METHODS
  // ==========================================================================

  async createNode(workflowId, data) {
    return this.request(`/api/workflows/${workflowId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNode(id, data) {
    return this.request(`/api/workflows/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNode(id) {
    return this.request(`/api/workflows/nodes/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // CONNECTION METHODS
  // ==========================================================================

  async createConnection(workflowId, data) {
    return this.request(`/api/workflows/${workflowId}/connections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteConnection(id) {
    return this.request(`/api/workflows/connections/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // AI METHODS
  // ==========================================================================

  async generateWorkflow(prompt, context) {
    return this.request('/api/ai/generate-workflow', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  async recognizeIntent(query) {
    return this.request('/api/ai/recognize-intent', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async suggestNextSteps(workflowId, completedNodes = []) {
    return this.request('/api/ai/suggest-next-steps', {
      method: 'POST',
      body: JSON.stringify({ workflowId, completedNodes }),
    });
  }

  async getSuggestions(workflowId) {
    return this.request(`/api/ai/suggestions/${workflowId}`);
  }

  async testAI() {
    return this.request('/api/ai/test');
  }
}

// Global instance
window.MuseFlowAPI = null;

// Initialize API client
function initMuseFlowAPI(baseUrl) {
  window.MuseFlowAPI = new MuseFlowApiClient({
    baseUrl: baseUrl || window.location.origin,
    timeout: 60000, // 60 seconds for AI generation
  });
  return window.MuseFlowAPI;
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  initMuseFlowAPI();
}
