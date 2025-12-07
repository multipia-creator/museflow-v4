/**
 * MuseFlow Canvas V24.0 - AI Assistant Implementation
 * Real-time AI Chat with Context-aware Responses
 * 
 * Features:
 * - OpenAI/Gemini API Integration
 * - Project context awareness
 * - Conversation history
 * - Smart suggestions
 * - Auto-tag generation
 * - Connection recommendations
 */

// ============================================
// AI ASSISTANT MANAGER
// ============================================

const AIAssistantManager = {
    conversationHistory: [],
    isProcessing: false,
    currentProject: null,
    
    init() {
        console.log('🤖 Initializing AI Assistant V24.0...');
        this.loadHistory();
        this.setupUI();
        this.setupEventListeners();
        console.log('✅ AI Assistant initialized successfully');
    },
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('museflow_ai_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load AI history:', error);
            this.conversationHistory = [];
        }
    },
    
    saveHistory() {
        try {
            // Keep only last 50 messages
            const recentHistory = this.conversationHistory.slice(-50);
            localStorage.setItem('museflow_ai_history', JSON.stringify(recentHistory));
        } catch (error) {
            console.error('Failed to save AI history:', error);
        }
    },
    
    setupUI() {
        const panel = document.getElementById('aiPanel');
        if (!panel) {
            console.warn('⚠️ AI Panel not found');
            return;
        }
        
        const panelContent = panel.querySelector('.panel-content');
        if (!panelContent) {
            console.warn('⚠️ AI Panel content not found');
            return;
        }
        
        // Replace dummy content with chat interface
        panelContent.innerHTML = `
            <div class="ai-chat-container" style="display: flex; flex-direction: column; height: 100%; min-height: 500px;">
                <!-- Chat Messages -->
                <div id="aiChatMessages" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; max-height: calc(100vh - 300px);">
                    <!-- Welcome Message -->
                    <div class="ai-message ai-assistant" style="padding: 1rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); border-radius: 12px; border: 1.5px solid rgba(139, 92, 246, 0.2);">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i data-lucide="sparkles" style="width:16px;height:16px;color:white;"></i>
                            </div>
                            <div style="font-weight: 700; color: #A78BFA; font-size: 0.9375rem;">AI 어시스턴트</div>
                        </div>
                        <div style="color: #e5e5e5; line-height: 1.6; font-size: 0.9375rem;">
                            안녕하세요! 저는 MuseFlow AI 어시스턴트입니다. 🎨<br><br>
                            프로젝트 관리, 작업 추천, 템플릿 제안 등 무엇이든 물어보세요!
                        </div>
                    </div>
                </div>
                
                <!-- Input Area -->
                <div style="padding: 1rem; border-top: 1.5px solid rgba(139, 92, 246, 0.2); background: rgba(139, 92, 246, 0.03);">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-end;">
                        <div style="flex: 1; position: relative;">
                            <textarea id="aiChatInput" 
                                      placeholder="AI에게 질문하기... (Shift+Enter로 전송)"
                                      rows="1"
                                      style="width: 100%; padding: 0.875rem 1rem; border: 1.5px solid rgba(139, 92, 246, 0.3); border-radius: 10px; background: rgba(139, 92, 246, 0.05); color: #e5e5e5; font-size: 0.9375rem; resize: none; font-family: inherit; line-height: 1.5; max-height: 120px; overflow-y: auto;"
                                      onfocus="this.style.borderColor='#8B5CF6'"
                                      onblur="this.style.borderColor='rgba(139, 92, 246, 0.3)'"></textarea>
                        </div>
                        <button id="aiSendBtn" 
                                onclick="AIAssistantManager.sendMessage()"
                                style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;"
                                onmouseover="this.style.transform='scale(1.05)'"
                                onmouseout="this.style.transform='scale(1)'">
                            <i data-lucide="send" style="width:20px;height:20px;"></i>
                        </button>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
                        <button class="ai-quick-action" onclick="AIAssistantManager.quickAction('템플릿 추천해줘')" 
                                style="padding: 0.5rem 0.875rem; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #A78BFA; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
                                onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'"
                                onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'">
                            💡 템플릿 추천
                        </button>
                        <button class="ai-quick-action" onclick="AIAssistantManager.quickAction('작업 우선순위 분석해줘')"
                                style="padding: 0.5rem 0.875rem; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #A78BFA; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
                                onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'"
                                onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'">
                            📊 작업 분석
                        </button>
                        <button class="ai-quick-action" onclick="AIAssistantManager.quickAction('프로젝트 진행 상황 요약해줘')"
                                style="padding: 0.5rem 0.875rem; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #A78BFA; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
                                onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'"
                                onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'">
                            📈 진행 요약
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
        
        // Render existing conversation
        this.renderHistory();
    },
    
    setupEventListeners() {
        const input = document.getElementById('aiChatInput');
        if (input) {
            // Enter key to send (Shift+Enter for new line)
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            input.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            });
        }
    },
    
    quickAction(message) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = message;
            input.focus();
            this.sendMessage();
        }
    },
    
    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        if (!input || this.isProcessing) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Add user message
        this.addMessage('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get context
            const context = this.getContext();
            
            // Call AI API
            const response = await this.callAI(message, context);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('AI Error:', error);
            this.removeTypingIndicator();
            this.addMessage('assistant', '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    },
    
    getContext() {
        try {
            const projects = JSON.parse(localStorage.getItem('museflow_projects_v23') || '[]');
            const tasks = JSON.parse(localStorage.getItem('museflow_tasks_v23') || '[]');
            const activeTasks = tasks.filter(t => !t.completed);
            const canvasState = window.CanvasState || {};
            
            return {
                totalProjects: projects.length,
                currentProject: this.currentProject || (projects[0]?.name || 'None'),
                totalTasks: tasks.length,
                activeTasks: activeTasks.length,
                completedTasks: tasks.filter(t => t.completed).length,
                overdueTasks: activeTasks.filter(t => t.dueDate < Date.now()).length,
                canvasCards: (canvasState.cards || []).length,
                canvasConnections: (canvasState.connections || []).length
            };
        } catch (error) {
            console.error('Context error:', error);
            return {};
        }
    },
    
    async callAI(message, context) {
        this.isProcessing = true;
        
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: context,
                    history: this.conversationHistory.slice(-10) // Last 10 messages
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'AI API failed');
            }
            
            return data.response || data.message || '응답을 생성할 수 없습니다.';
            
        } finally {
            this.isProcessing = false;
        }
    },
    
    addMessage(role, content) {
        const message = {
            role: role,
            content: content,
            timestamp: Date.now()
        };
        
        this.conversationHistory.push(message);
        this.saveHistory();
        this.renderMessage(message);
        this.scrollToBottom();
    },
    
    renderMessage(message) {
        const container = document.getElementById('aiChatMessages');
        if (!container) return;
        
        const isUser = message.role === 'user';
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'ai-user' : 'ai-assistant'}`;
        messageDiv.style.cssText = `
            padding: 1rem;
            background: ${isUser ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'};
            border-radius: 12px;
            border: 1.5px solid ${isUser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(139, 92, 246, 0.2)'};
            align-self: ${isUser ? 'flex-end' : 'flex-start'};
            max-width: 85%;
        `;
        
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: ${message.content.length > 50 ? '0.75rem' : '0.5rem'};">
                ${!isUser ? `
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i data-lucide="sparkles" style="width:14px;height:14px;color:white;"></i>
                    </div>
                ` : ''}
                <div style="font-weight: 600; color: ${isUser ? '#6366F1' : '#A78BFA'}; font-size: 0.875rem;">
                    ${isUser ? '나' : 'AI 어시스턴트'}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-left: auto;">
                    ${new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <div style="color: #e5e5e5; line-height: 1.6; font-size: 0.9375rem; white-space: pre-wrap;">
                ${this.formatMessage(message.content)}
            </div>
        `;
        
        container.appendChild(messageDiv);
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    },
    
    formatMessage(content) {
        // Convert markdown-style formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
            .replace(/`(.*?)`/g, '<code style="background: rgba(139, 92, 246, 0.2); padding: 0.125rem 0.375rem; border-radius: 4px; font-family: monospace;">$1</code>') // `code`
            .replace(/\n/g, '<br>'); // line breaks
    },
    
    renderHistory() {
        const container = document.getElementById('aiChatMessages');
        if (!container) return;
        
        // Keep welcome message, remove old messages
        const welcomeMsg = container.querySelector('.ai-message.ai-assistant');
        
        this.conversationHistory.forEach(msg => {
            this.renderMessage(msg);
        });
        
        this.scrollToBottom();
    },
    
    showTypingIndicator() {
        const container = document.getElementById('aiChatMessages');
        if (!container) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'aiTypingIndicator';
        indicator.style.cssText = `
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
            border-radius: 12px;
            border: 1.5px solid rgba(139, 92, 246, 0.2);
            align-self: flex-start;
            max-width: 85%;
        `;
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="sparkles" style="width:14px;height:14px;color:white;"></i>
                </div>
                <div style="display: flex; gap: 0.375rem; align-items: center;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #A78BFA; animation: pulse 1.5s infinite;"></div>
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #A78BFA; animation: pulse 1.5s infinite 0.2s;"></div>
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #A78BFA; animation: pulse 1.5s infinite 0.4s;"></div>
                </div>
            </div>
        `;
        
        container.appendChild(indicator);
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
        
        this.scrollToBottom();
    },
    
    removeTypingIndicator() {
        const indicator = document.getElementById('aiTypingIndicator');
        if (indicator) {
            indicator.remove();
        }
    },
    
    scrollToBottom() {
        const container = document.getElementById('aiChatMessages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    },
    
    clearHistory() {
        if (!confirm('대화 기록을 모두 삭제하시겠습니까?')) return;
        
        this.conversationHistory = [];
        this.saveHistory();
        
        const container = document.getElementById('aiChatMessages');
        if (container) {
            // Keep only welcome message
            const messages = container.querySelectorAll('.ai-message:not(:first-child)');
            messages.forEach(msg => msg.remove());
        }
        
        if (window.showToast) {
            showToast('대화 기록이 삭제되었습니다', 'success');
        }
    }
};

// ============================================
// INITIALIZE ON LOAD
// ============================================

window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚀 Initializing MuseFlow Canvas V24.0 - AI Assistant');
        
        try {
            AIAssistantManager.init();
            console.log('✅ MuseFlow Canvas V24.0 - AI Assistant Loaded');
        } catch (error) {
            console.error('❌ AI Assistant initialization failed:', error);
        }
    }, 1000); // Wait 1s for other scripts to load
});

// Expose globally
window.AIAssistantManager = AIAssistantManager;
