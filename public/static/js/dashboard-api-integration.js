/**
 * Dashboard API Integration
 * Connects Dashboard UI with Backend APIs
 * Handles: Projects, Tasks, Analytics, User Profile
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
        
        // Localhost development
        if (host === 'localhost' && port === '8000') {
            return 'http://localhost:3000';
        }
        
        // Sandbox environment
        if (host.includes('sandbox') || host.includes('8000-')) {
            return protocol + '//' + host.replace('8000-', '3000-');
        }
        
        // Production - same origin
        return '';
    })();
    
    console.log('📡 [Dashboard API] Base URL:', API_BASE_URL || 'Same Origin');
    
    // ==========================================
    // Helper Functions
    // ==========================================
    
    function getAuthToken() {
        return localStorage.getItem('auth_token') || 
               localStorage.getItem('user_session') ||
               sessionStorage.getItem('auth_token');
    }
    
    function isAuthenticated() {
        return getAuthToken() !== null;
    }
    
    async function apiRequest(endpoint, options = {}) {
        const token = getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(API_BASE_URL + endpoint, finalOptions);
            
            // Unauthorized - redirect to login
            if (response.status === 401) {
                console.warn('🔐 [Dashboard API] Unauthorized - redirecting to login');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_session');
                window.location.href = '/login.html';
                return null;
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error(`❌ [Dashboard API] ${endpoint} failed:`, error);
            throw error;
        }
    }
    
    // ==========================================
    // Projects API
    // ==========================================
    
    async function loadProjects() {
        console.log('📂 [Dashboard] Loading projects from API...');
        
        try {
            const data = await apiRequest('/api/projects');
            
            if (data && Array.isArray(data.projects)) {
                console.log(`✅ [Dashboard] Loaded ${data.projects.length} projects`);
                renderProjects(data.projects);
                updateProjectStats(data.projects);
                return data.projects;
            } else {
                console.warn('⚠️ [Dashboard] No projects found, using sample data');
                return [];
            }
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to load projects:', error);
            showNotification('프로젝트를 불러올 수 없습니다.', 'error');
            return [];
        }
    }
    
    async function createProject(projectData) {
        console.log('➕ [Dashboard] Creating new project:', projectData);
        
        try {
            const data = await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            });
            
            console.log('✅ [Dashboard] Project created:', data);
            showNotification('프로젝트가 생성되었습니다!', 'success');
            
            // Reload projects
            await loadProjects();
            
            return data;
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to create project:', error);
            showNotification('프로젝트 생성에 실패했습니다.', 'error');
            throw error;
        }
    }
    
    async function updateProject(projectId, updates) {
        console.log(`📝 [Dashboard] Updating project ${projectId}:`, updates);
        
        try {
            const data = await apiRequest(`/api/projects/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            
            console.log('✅ [Dashboard] Project updated:', data);
            showNotification('프로젝트가 업데이트되었습니다!', 'success');
            
            return data;
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to update project:', error);
            showNotification('프로젝트 업데이트에 실패했습니다.', 'error');
            throw error;
        }
    }
    
    async function deleteProject(projectId) {
        console.log(`🗑️ [Dashboard] Deleting project ${projectId}`);
        
        try {
            await apiRequest(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            console.log('✅ [Dashboard] Project deleted');
            showNotification('프로젝트가 삭제되었습니다.', 'success');
            
            // Reload projects
            await loadProjects();
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to delete project:', error);
            showNotification('프로젝트 삭제에 실패했습니다.', 'error');
            throw error;
        }
    }
    
    // ==========================================
    // Dashboard Analytics API
    // ==========================================
    
    async function loadDashboardStats() {
        console.log('📊 [Dashboard] Loading analytics...');
        
        try {
            const data = await apiRequest('/api/dashboard/stats');
            
            if (data) {
                console.log('✅ [Dashboard] Analytics loaded:', data);
                updateDashboardStats(data);
                return data;
            }
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to load analytics:', error);
            // Don't show error notification for analytics - not critical
        }
    }
    
    // ==========================================
    // User Profile API
    // ==========================================
    
    async function loadUserProfile() {
        console.log('👤 [Dashboard] Loading user profile...');
        
        try {
            const data = await apiRequest('/api/auth/me');
            
            if (data && data.user) {
                console.log('✅ [Dashboard] User profile loaded:', data.user);
                
                // Store user info
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('user_email', data.user.email);
                localStorage.setItem('user_name', data.user.name);
                
                // Update UI
                updateUserProfile(data.user);
                
                return data.user;
            }
            
        } catch (error) {
            console.error('❌ [Dashboard] Failed to load user profile:', error);
        }
    }
    
    // ==========================================
    // UI Update Functions
    // ==========================================
    
    function renderProjects(projects) {
        const container = document.getElementById('projects-grid') || 
                         document.querySelector('.projects-grid') ||
                         document.querySelector('[data-projects-container]');
        
        if (!container) {
            console.warn('⚠️ [Dashboard] Projects container not found');
            return;
        }
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.5);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">프로젝트가 없습니다</p>
                    <p style="font-size: 0.9rem;">새로운 프로젝트를 생성해보세요!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = projects.map(project => `
            <div class="project-card" data-project-id="${project.id}" style="
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'">
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: white;">
                    ${escapeHtml(project.name || project.title)}
                </h3>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6;">
                    ${escapeHtml(project.description || '설명 없음').substring(0, 100)}${(project.description || '').length > 100 ? '...' : ''}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 0.85rem;">
                        <i class="fas fa-calendar"></i> ${formatDate(project.created_at)}
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; background: rgba(139, 92, 246, 0.2); border-radius: 12px; font-size: 0.85rem; color: #c4b5fd;">
                        ${project.status || 'active'}
                    </span>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function() {
                const projectId = this.dataset.projectId;
                window.location.href = `/canvas-ultimate-clean?project=${projectId}`;
            });
        });
    }
    
    function updateProjectStats(projects) {
        const totalElement = document.querySelector('[data-stat="total-projects"]');
        const activeElement = document.querySelector('[data-stat="active-projects"]');
        
        if (totalElement) {
            totalElement.textContent = projects.length;
        }
        
        if (activeElement) {
            const activeCount = projects.filter(p => p.status === 'active' || !p.status).length;
            activeElement.textContent = activeCount;
        }
    }
    
    function updateDashboardStats(stats) {
        // Update stat cards
        if (stats.totalProjects !== undefined) {
            const el = document.querySelector('[data-stat="total-projects"]');
            if (el) el.textContent = stats.totalProjects;
        }
        
        if (stats.totalTasks !== undefined) {
            const el = document.querySelector('[data-stat="total-tasks"]');
            if (el) el.textContent = stats.totalTasks;
        }
        
        if (stats.completedTasks !== undefined) {
            const el = document.querySelector('[data-stat="completed-tasks"]');
            if (el) el.textContent = stats.completedTasks;
        }
    }
    
    function updateUserProfile(user) {
        // Update user name displays
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = user.name;
        });
        
        // Update user email displays
        document.querySelectorAll('[data-user-email]').forEach(el => {
            el.textContent = user.email;
        });
        
        // Update user avatar
        if (user.avatar_url) {
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                el.src = user.avatar_url;
            });
        }
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-size: 0.95rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ==========================================
    // Utility Functions
    // ==========================================
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(dateString) {
        if (!dateString) return '방금 전';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 7) {
            return date.toLocaleDateString('ko-KR');
        } else if (days > 0) {
            return `${days}일 전`;
        } else if (hours > 0) {
            return `${hours}시간 전`;
        } else if (minutes > 0) {
            return `${minutes}분 전`;
        } else {
            return '방금 전';
        }
    }
    
    // ==========================================
    // Initialization
    // ==========================================
    
    function initializeDashboard() {
        console.log('🚀 [Dashboard API] Initializing...');
        
        // Check authentication
        if (!isAuthenticated()) {
            console.warn('🔐 [Dashboard API] Not authenticated - redirecting to login');
            window.location.href = '/login.html';
            return;
        }
        
        // Load data
        loadUserProfile();
        loadProjects();
        loadDashboardStats();
        
        console.log('✅ [Dashboard API] Initialized');
    }
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboard);
    } else {
        initializeDashboard();
    }
    
    // ==========================================
    // Global API Exposure
    // ==========================================
    
    window.DashboardAPI = {
        loadProjects,
        createProject,
        updateProject,
        deleteProject,
        loadDashboardStats,
        loadUserProfile,
        showNotification,
        isAuthenticated
    };
    
    console.log('✅ [Dashboard API] Module loaded');
    
})();
