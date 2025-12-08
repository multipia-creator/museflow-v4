/**
 * Canvas AI Workflow Integration
 * Connects Canvas UI with AI Workflow Generation API
 */

(function() {
    'use strict';
    
    // ==========================================
    // Configuration
    // ==========================================
    
    const API_BASE_URL = (() => {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        
        if (host === 'localhost' && port === '8000') {
            return 'http://localhost:3000';
        }
        
        if (host.includes('sandbox') || host.includes('8000-')) {
            return protocol + '//' + host.replace('8000-', '3000-');
        }
        
        return '';
    })();
    
    console.log('🤖 [AI Workflow] Base URL:', API_BASE_URL || 'Same Origin');
    
    // ==========================================
    // Helper Functions
    // ==========================================
    
    function getAuthToken() {
        // auth-utils.js의 전역 함수 사용
        return window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
    }
    
    // ==========================================
    // AI Workflow Generation
    // ==========================================
    
    async function generateAIWorkflow(prompt, options = {}) {
        console.log('🤖 [AI Workflow] Generating workflow from prompt:', prompt);
        
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const requestBody = {
            prompt,
            projectType: options.projectType || 'museum_exhibition',
            complexity: options.complexity || 'medium',
            includeAgents: options.includeAgents !== false,
            includeWidgets: options.includeWidgets !== false,
            ...options
        };
        
        try {
            showAILoadingIndicator();
            
            const response = await fetch(API_BASE_URL + '/api/ai/generate-workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ [AI Workflow] Generated workflow:', data);
            
            hideAILoadingIndicator();
            
            // Show success notification
            showAINotification('AI 워크플로우가 생성되었습니다! 🎉', 'success');
            
            return data;
            
        } catch (error) {
            console.error('❌ [AI Workflow] Generation failed:', error);
            hideAILoadingIndicator();
            showAINotification('워크플로우 생성 실패: ' + error.message, 'error');
            throw error;
        }
    }
    
    async function generateAIWorkflowWithOrchestrator(prompt, options = {}) {
        console.log('🎭 [AI Orchestrator] Generating workflow with multi-agent system:', prompt);
        
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        try {
            showAILoadingIndicator('AI Orchestrator 작동 중... 15개 Agent 동원');
            
            const response = await fetch(API_BASE_URL + '/api/orchestrator/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt,
                    useMultiAgent: true,
                    agentCount: 15,
                    ...options
                })
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ [AI Orchestrator] Generated workflow:', data);
            
            hideAILoadingIndicator();
            showAINotification('AI Orchestrator 완료! 19개 노드 생성됨 🎯', 'success');
            
            return data;
            
        } catch (error) {
            console.error('❌ [AI Orchestrator] Generation failed:', error);
            hideAILoadingIndicator();
            showAINotification('Orchestrator 실패: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ==========================================
    // Workflow Rendering
    // ==========================================
    
    function renderGeneratedWorkflow(workflowData) {
        console.log('🎨 [AI Workflow] Rendering workflow to canvas...');
        
        if (!workflowData || !workflowData.workflow) {
            console.error('❌ [AI Workflow] Invalid workflow data');
            return;
        }
        
        const workflow = workflowData.workflow;
        
        // Clear existing canvas (if function exists)
        if (typeof clearCanvas === 'function') {
            clearCanvas();
        }
        
        // Render nodes
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
            console.log(`📍 [AI Workflow] Rendering ${workflow.nodes.length} nodes...`);
            workflow.nodes.forEach((node, index) => {
                renderNode(node, index);
            });
        }
        
        // Render connections
        if (workflow.edges && Array.isArray(workflow.edges)) {
            console.log(`🔗 [AI Workflow] Rendering ${workflow.edges.length} connections...`);
            setTimeout(() => {
                workflow.edges.forEach(edge => {
                    renderConnection(edge);
                });
            }, 500); // Delay to ensure nodes are rendered first
        }
        
        // Render agents (if available)
        if (workflow.agents && Array.isArray(workflow.agents)) {
            console.log(`🤖 [AI Workflow] Rendering ${workflow.agents.length} AI agents...`);
            workflow.agents.forEach(agent => {
                renderAgent(agent);
            });
        }
        
        // Auto-arrange and center view
        setTimeout(() => {
            if (typeof autoArrangeNodes === 'function') {
                autoArrangeNodes();
            }
            if (typeof centerView === 'function') {
                centerView();
            }
        }, 1000);
        
        console.log('✅ [AI Workflow] Rendering complete');
    }
    
    function renderNode(nodeData, index) {
        // Use existing canvas node rendering function if available
        if (typeof addNodeToCanvas === 'function') {
            addNodeToCanvas(nodeData);
        } else {
            // Fallback: Create node element
            const node = createNodeElement(nodeData, index);
            const canvas = document.querySelector('.canvas-container') || 
                          document.querySelector('#canvas') ||
                          document.querySelector('[data-canvas]');
            
            if (canvas) {
                canvas.appendChild(node);
            }
        }
    }
    
    function renderConnection(edgeData) {
        // Use existing canvas connection rendering function if available
        if (typeof createConnection === 'function') {
            createConnection(edgeData.source, edgeData.target);
        }
    }
    
    function renderAgent(agentData) {
        // Render AI agent badge/icon
        if (typeof addAgentBadge === 'function') {
            addAgentBadge(agentData);
        }
    }
    
    function createNodeElement(nodeData, index) {
        const node = document.createElement('div');
        node.className = 'canvas-node ai-generated';
        node.dataset.nodeId = nodeData.id;
        node.dataset.nodeType = nodeData.type || 'task';
        
        // Position nodes in a grid layout
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 150 + col * 250;
        const y = 100 + row * 180;
        
        node.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            padding: 1.5rem;
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            min-width: 180px;
            cursor: move;
            transition: all 0.3s ease;
        `;
        
        node.innerHTML = `
            <div style="font-weight: 600; color: #c4b5fd; margin-bottom: 0.5rem; font-size: 0.95rem;">
                ${escapeHtml(nodeData.title || nodeData.label || 'Node')}
            </div>
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; line-height: 1.4;">
                ${escapeHtml((nodeData.description || '').substring(0, 80))}
            </div>
            ${nodeData.agent ? `
                <div style="margin-top: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(236, 72, 153, 0.2); border-radius: 6px; font-size: 0.75rem; color: #fbb6ce; display: inline-block;">
                    🤖 ${nodeData.agent}
                </div>
            ` : ''}
        `;
        
        return node;
    }
    
    // ==========================================
    // UI Feedback
    // ==========================================
    
    function showAILoadingIndicator(message = 'AI 워크플로우 생성 중...') {
        const overlay = document.createElement('div');
        overlay.id = 'ai-loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 80px; height: 80px; border: 4px solid rgba(139, 92, 246, 0.2); border-top: 4px solid #8b5cf6; border-radius: 50%; margin: 0 auto 1.5rem; animation: spin 1s linear infinite;"></div>
                <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">${message}</div>
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">잠시만 기다려주세요...</div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
    }
    
    function hideAILoadingIndicator() {
        const overlay = document.getElementById('ai-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    function showAINotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `ai-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.95)' : type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(59, 130, 246, 0.95)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-size: 0.95rem;
            font-weight: 500;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // ==========================================
    // Utility Functions
    // ==========================================
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ==========================================
    // Global API Exposure
    // ==========================================
    
    window.CanvasAI = {
        generateWorkflow: generateAIWorkflow,
        generateWithOrchestrator: generateAIWorkflowWithOrchestrator,
        renderWorkflow: renderGeneratedWorkflow,
        showLoading: showAILoadingIndicator,
        hideLoading: hideAILoadingIndicator,
        showNotification: showAINotification
    };
    
    console.log('✅ [AI Workflow Integration] Module loaded');
    
})();
