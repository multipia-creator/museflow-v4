/**
 * AI Workflow Generation Modal
 * Natural language input → Complete workflow generation
 */

const AIGenerationModal = {
  isOpen: false,
  isGenerating: false,
  
  /**
   * Show modal
   */
  show() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.render();
    this.attachEvents();
    
    // Focus on textarea
    setTimeout(() => {
      const textarea = document.getElementById('ai-prompt-input');
      if (textarea) textarea.focus();
    }, 100);
  },
  
  /**
   * Hide modal
   */
  hide() {
    const modal = document.getElementById('ai-generation-modal');
    if (modal) {
      modal.remove();
    }
    this.isOpen = false;
    this.isGenerating = false;
  },
  
  /**
   * Render modal
   */
  render() {
    const modalHTML = `
      <div id="ai-generation-modal" 
           style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0, 0, 0, 0.5); z-index: 10000;
                  display: flex; align-items: center; justify-content: center;
                  animation: fadeIn 0.2s ease-out;">
        
        <div style="background: white; border-radius: 16px; 
                    width: 90%; max-width: 600px; max-height: 80vh;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex; flex-direction: column;
                    animation: slideUp 0.3s ease-out;">
          
          <!-- Header -->
          <div style="padding: 24px 24px 20px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">
                  🤖 AI Workflow Generator
                </h2>
                <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">
                  Describe your museum workflow in natural language
                </p>
              </div>
              <button id="close-ai-modal" 
                      style="width: 32px; height: 32px; border: none; background: transparent;
                             border-radius: 8px; cursor: pointer; color: #6b7280;
                             font-size: 20px; display: flex; align-items: center;
                             justify-content: center;">
                ×
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px; flex: 1; overflow-y: auto;">
            
            <!-- Prompt Input -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 14px; font-weight: 600; 
                           color: #374151; margin-bottom: 8px;">
                Describe your workflow
              </label>
              <textarea id="ai-prompt-input"
                        placeholder="Example: Create a Korean traditional art exhibition for 3 months with 50 artworks and $100,000 budget..."
                        style="width: 100%; height: 120px; padding: 12px;
                               border: 2px solid #e5e7eb; border-radius: 8px;
                               font-size: 14px; line-height: 1.5; resize: vertical;
                               font-family: inherit;"
                        ${this.isGenerating ? 'disabled' : ''}></textarea>
            </div>
            
            <!-- Context Options -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              
              <div>
                <label style="display: block; font-size: 13px; font-weight: 500; 
                             color: #6b7280; margin-bottom: 6px;">
                  Budget (optional)
                </label>
                <input id="ai-budget-input" type="number" placeholder="100000"
                       style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
                              border-radius: 8px; font-size: 14px;"
                       ${this.isGenerating ? 'disabled' : ''}>
              </div>
              
              <div>
                <label style="display: block; font-size: 13px; font-weight: 500; 
                             color: #6b7280; margin-bottom: 6px;">
                  Duration (optional)
                </label>
                <input id="ai-duration-input" type="text" placeholder="P3M (3 months)"
                       style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
                              border-radius: 8px; font-size: 14px;"
                       ${this.isGenerating ? 'disabled' : ''}>
              </div>
              
            </div>
            
            <!-- Examples -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #374151;">
                💡 Example Prompts:
              </p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="example-prompt" data-prompt="Create a Korean traditional art exhibition for 3 months with 50 artworks"
                        style="text-align: left; padding: 8px 12px; background: white;
                               border: 1px solid #e5e7eb; border-radius: 6px;
                               font-size: 13px; color: #4b5563; cursor: pointer;">
                  Korean traditional art exhibition (3 months, 50 artworks)
                </button>
                <button class="example-prompt" data-prompt="Plan a contemporary sculpture exhibition with international artists, budget $200,000"
                        style="text-align: left; padding: 8px 12px; background: white;
                               border: 1px solid #e5e7eb; border-radius: 6px;
                               font-size: 13px; color: #4b5563; cursor: pointer;">
                  Contemporary sculpture exhibition ($200,000 budget)
                </button>
                <button class="example-prompt" data-prompt="Organize a children's interactive art workshop series for 6 months"
                        style="text-align: left; padding: 8px 12px; background: white;
                               border: 1px solid #e5e7eb; border-radius: 6px;
                               font-size: 13px; color: #4b5563; cursor: pointer;">
                  Children's interactive art workshop series (6 months)
                </button>
              </div>
            </div>
            
            <!-- Generation Status -->
            <div id="generation-status" style="display: none; background: #eff6ff; 
                                               border-radius: 8px; padding: 16px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="spinner" style="width: 20px; height: 20px; border: 3px solid #3b82f6;
                                           border-top-color: transparent; border-radius: 50%;
                                           animation: spin 0.8s linear infinite;"></div>
                <div>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">
                    Generating workflow...
                  </p>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #3b82f6;">
                    This may take 3-5 seconds
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb;
                      display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancel-ai-btn"
                    style="padding: 10px 20px; border: 1px solid #e5e7eb;
                           background: white; border-radius: 8px; font-size: 14px;
                           font-weight: 600; color: #374151; cursor: pointer;"
                    ${this.isGenerating ? 'disabled' : ''}>
              Cancel
            </button>
            <button id="generate-ai-btn"
                    style="padding: 10px 24px; border: none; background: #3b82f6;
                           border-radius: 8px; font-size: 14px; font-weight: 600;
                           color: white; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                    ${this.isGenerating ? 'disabled' : ''}>
              ${this.isGenerating ? '⏳ Generating...' : '✨ Generate Workflow'}
            </button>
          </div>
          
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .example-prompt:hover {
          background: #f9fafb !important;
          border-color: #d1d5db !important;
        }
        
        #generate-ai-btn:hover:not(:disabled) {
          background: #2563eb !important;
        }
        
        #cancel-ai-btn:hover:not(:disabled) {
          background: #f9fafb !important;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    // Close modal
    document.getElementById('close-ai-modal').addEventListener('click', () => {
      if (!this.isGenerating) {
        this.hide();
      }
    });
    
    document.getElementById('cancel-ai-btn').addEventListener('click', () => {
      if (!this.isGenerating) {
        this.hide();
      }
    });
    
    // Example prompts
    document.querySelectorAll('.example-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        document.getElementById('ai-prompt-input').value = prompt;
      });
    });
    
    // Generate workflow
    document.getElementById('generate-ai-btn').addEventListener('click', () => {
      this.generate();
    });
    
    // Enter key to generate
    document.getElementById('ai-prompt-input').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.generate();
      }
    });
    
    // Click outside to close (only if not generating)
    document.getElementById('ai-generation-modal').addEventListener('click', (e) => {
      if (e.target.id === 'ai-generation-modal' && !this.isGenerating) {
        this.hide();
      }
    });
  },
  
  /**
   * Generate workflow
   */
  async generate() {
    if (this.isGenerating) return;
    
    const prompt = document.getElementById('ai-prompt-input').value.trim();
    if (!prompt) {
      Toast.error('Please enter a workflow description');
      return;
    }
    
    // Get context
    const budget = document.getElementById('ai-budget-input').value;
    const duration = document.getElementById('ai-duration-input').value;
    
    const context = {
      userId: 'user-1',
    };
    
    if (budget) context.budget = parseFloat(budget);
    if (duration) context.duration = duration;
    
    // Update UI
    this.isGenerating = true;
    document.getElementById('generate-ai-btn').disabled = true;
    document.getElementById('generate-ai-btn').innerHTML = '⏳ Generating...';
    document.getElementById('generation-status').style.display = 'block';
    document.getElementById('ai-prompt-input').disabled = true;
    document.getElementById('ai-budget-input').disabled = true;
    document.getElementById('ai-duration-input').disabled = true;
    
    try {
      console.log('🤖 Starting AI generation...');
      const startTime = Date.now();
      
      // Generate workflow
      const result = await window.AIGenerator.generate(prompt, context);
      
      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Generation completed in ${durationSec}s`);
      
      if (result.success) {
        Toast.success(`Workflow generated! (${result.nodesCount} nodes, ${durationSec}s)`);
        
        // Show loading while loading generated workflow
        if (typeof LoadingOverlay !== 'undefined') {
          LoadingOverlay.show('Loading workflow...');
        }
        
        // Load the generated workflow
        if (typeof CanvasV2 !== 'undefined') {
          await CanvasV2.loadGeneratedWorkflow(result.workflowId);
        }
        
        if (typeof LoadingOverlay !== 'undefined') {
          LoadingOverlay.hide();
        }
        
        this.hide();
      } else {
        // Show error modal with retry option
        if (typeof ErrorModal !== 'undefined') {
          ErrorModal.show({
            title: 'AI Generation Failed',
            message: result.error || 'Failed to generate workflow',
            onRetry: () => this.generate(),
          });
        } else {
          Toast.error(result.error || 'Generation failed');
        }
        this.resetUI();
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      
      // Show error modal with retry option
      if (typeof ErrorModal !== 'undefined') {
        ErrorModal.showAPIError(error, () => this.generate());
      } else {
        Toast.error(error.message || 'Generation failed');
      }
      
      this.resetUI();
    }
  },
  
  /**
   * Reset UI after generation
   */
  resetUI() {
    this.isGenerating = false;
    document.getElementById('generate-ai-btn').disabled = false;
    document.getElementById('generate-ai-btn').innerHTML = '✨ Generate Workflow';
    document.getElementById('generation-status').style.display = 'none';
    document.getElementById('ai-prompt-input').disabled = false;
    document.getElementById('ai-budget-input').disabled = false;
    document.getElementById('ai-duration-input').disabled = false;
  }
};
