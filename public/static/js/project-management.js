/**
 * Project Management Integration
 * Handles Create/Edit/Delete Project functionality
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
    
    console.log('📁 [Project Management] Base URL:', API_BASE_URL || 'Same Origin');
    
    // ==========================================
    // Helper Functions
    // ==========================================
    
    function getAuthToken() {
        // auth-utils.js의 전역 함수 사용
        return window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
    }
    
    // ==========================================
    // Create New Project Modal
    // ==========================================
    
    function showCreateProjectModal() {
        // Check if modal already exists
        let modal = document.getElementById('create-project-modal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        
        // Create modal
        modal = document.createElement('div');
        modal.id = 'create-project-modal';
        modal.style.cssText = `
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
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a1a; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin: 0;">
                        <i class="fas fa-plus-circle" style="color: #8b5cf6; margin-right: 0.5rem;"></i>
                        새 프로젝트 생성
                    </h2>
                    <button onclick="document.getElementById('create-project-modal').style.display='none'" style="background: none; border: none; color: rgba(255, 255, 255, 0.5); font-size: 1.5rem; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="create-project-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- Project Name -->
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">
                            프로젝트 이름 *
                        </label>
                        <input type="text" id="project-name" name="name" required 
                            placeholder="예: 2024 봄 특별전"
                            style="width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 1rem;"
                            onfocus="this.style.borderColor='#8b5cf6'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">
                            설명
                        </label>
                        <textarea id="project-description" name="description" rows="3"
                            placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
                            style="width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; resize: vertical;"
                            onfocus="this.style.borderColor='#8b5cf6'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.1)'"></textarea>
                    </div>
                    
                    <!-- Project Type -->
                    <div>
                        <label style="display: block; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">
                            프로젝트 유형
                        </label>
                        <select id="project-type" name="type"
                            style="width: 100%; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; cursor: pointer;"
                            onfocus="this.style.borderColor='#8b5cf6'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                            <option value="exhibition">전시 기획</option>
                            <option value="collection">소장품 관리</option>
                            <option value="education">교육 프로그램</option>
                            <option value="event">이벤트 운영</option>
                            <option value="research">연구 프로젝트</option>
                            <option value="other">기타</option>
                        </select>
                    </div>
                    
                    <!-- AI Workflow Generation Option -->
                    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 1rem;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="use-ai-workflow" name="useAI" checked
                                style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                            <div>
                                <div style="color: #c4b5fd; font-weight: 500; font-size: 0.95rem; margin-bottom: 0.25rem;">
                                    🤖 AI 워크플로우 자동 생성
                                </div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.85rem; line-height: 1.4;">
                                    프로젝트에 맞는 19개 노드와 6단계 워크플로우를 AI가 자동으로 생성합니다
                                </div>
                            </div>
                        </label>
                    </div>
                    
                    <!-- Buttons -->
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                        <button type="button" onclick="document.getElementById('create-project-modal').style.display='none'"
                            style="flex: 1; padding: 0.875rem 1.5rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                            취소
                        </button>
                        <button type="submit"
                            style="flex: 2; padding: 0.875rem 1.5rem; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border: none; border-radius: 8px; color: white; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 8px 24px rgba(139, 92, 246, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fas fa-rocket" style="margin-right: 0.5rem;"></i>
                            프로젝트 생성
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add form submit handler
        document.getElementById('create-project-form').addEventListener('submit', handleCreateProject);
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('project-name').focus();
        }, 100);
    }
    
    async function handleCreateProject(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('name'),
            description: formData.get('description') || '',
            type: formData.get('type') || 'exhibition',
            status: 'active'
        };
        
        const useAI = document.getElementById('use-ai-workflow').checked;
        
        console.log('➕ [Project] Creating project:', projectData);
        
        const token = getAuthToken();
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }
        
        try {
            // Show loading
            const submitBtn = e.target.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>생성 중...';
            
            // Create project via API
            const response = await fetch(API_BASE_URL + '/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ [Project] Created:', result);
            
            // Close modal
            document.getElementById('create-project-modal').style.display = 'none';
            
            // Show success notification
            showNotification('프로젝트가 생성되었습니다! 🎉', 'success');
            
            // If AI workflow enabled, generate it
            if (useAI && window.CanvasAI) {
                setTimeout(async () => {
                    try {
                        const workflow = await window.CanvasAI.generateWorkflow(
                            `${projectData.name}: ${projectData.description}`,
                            { projectType: projectData.type }
                        );
                        
                        if (workflow && window.CanvasAI.renderWorkflow) {
                            window.CanvasAI.renderWorkflow(workflow);
                        }
                    } catch (error) {
                        console.error('❌ [Project] AI workflow generation failed:', error);
                    }
                }, 1000);
            }
            
            // Redirect to canvas or dashboard
            setTimeout(() => {
                if (result.project && result.project.id) {
                    window.location.href = `/canvas-ultimate-clean?project=${result.project.id}`;
                } else {
                    window.location.reload();
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ [Project] Creation failed:', error);
            alert('프로젝트 생성 실패: ' + error.message);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // ==========================================
    // UI Helpers
    // ==========================================
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ==========================================
    // Auto-bind to buttons
    // ==========================================
    
    function initProjectManagement() {
        console.log('📁 [Project Management] Initializing...');
        
        // Find and bind "Create New Project" buttons
        const createButtons = document.querySelectorAll('[data-action="create-project"], .create-project-btn, #create-project-btn');
        
        createButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showCreateProjectModal();
            });
        });
        
        console.log(`✅ [Project Management] Initialized (${createButtons.length} buttons bound)`);
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectManagement);
    } else {
        initProjectManagement();
    }
    
    // ==========================================
    // Global API Exposure
    // ==========================================
    
    window.ProjectManager = {
        showCreateModal: showCreateProjectModal,
        createProject: handleCreateProject
    };
    
    console.log('✅ [Project Management] Module loaded');
    
})();
