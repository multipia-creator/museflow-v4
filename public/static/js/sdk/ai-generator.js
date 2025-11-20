/**
 * AI Workflow Generator
 * Natural language to complete workflow generation
 */

class AIWorkflowGenerator {
  constructor(apiClient) {
    this.api = apiClient;
    this.isGenerating = false;
  }

  /**
   * Generate workflow from natural language prompt
   * Returns: { success, workflowId, nodes, connections, metadata }
   */
  async generate(prompt, context = {}) {
    if (this.isGenerating) {
      return {
        success: false,
        error: 'Generation already in progress',
      };
    }

    this.isGenerating = true;
    console.log('🤖 Generating workflow from prompt:', prompt);

    try {
      const response = await this.api.generateWorkflow(prompt, context);

      if (response.success) {
        console.log('✅ Workflow generated:', response.data);
        return {
          success: true,
          ...response.data,
        };
      } else {
        console.error('❌ Generation failed:', response.error);
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Recognize intent from natural language
   */
  async recognizeIntent(query) {
    const response = await this.api.recognizeIntent(query);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  }

  /**
   * Get AI suggestions for next steps
   */
  async suggestNextSteps(workflowId, completedNodes = []) {
    const response = await this.api.suggestNextSteps(workflowId, completedNodes);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  }

  /**
   * Test AI connection
   */
  async testConnection() {
    const response = await this.api.testAI();
    return response.success;
  }

  /**
   * Check if generation is in progress
   */
  get isInProgress() {
    return this.isGenerating;
  }
}

// Global instance
window.AIGenerator = null;

// Initialize AI generator
function initAIGenerator(apiClient) {
  window.AIGenerator = new AIWorkflowGenerator(apiClient);
  return window.AIGenerator;
}
