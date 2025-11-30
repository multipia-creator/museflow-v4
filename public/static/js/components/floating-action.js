// Floating Action Button Component
(function() {
    'use strict';
    
    // Check if already initialized
    if (window.FloatingAction) return;
    
    class FloatingAction {
        constructor() {
            this.isOpen = false;
            this.init();
        }
        
        init() {
            // Add CSS if not already present
            if (!document.getElementById('fab-styles')) {
                const link = document.createElement('link');
                link.id = 'fab-styles';
                link.rel = 'stylesheet';
                link.href = '/static/css/floating-action.css';
                document.head.appendChild(link);
            }
            
            // Create FAB HTML
            this.createHTML();
            
            // Attach event listeners
            this.attachEvents();
        }
        
        createHTML() {
            const fabContainer = document.createElement('div');
            fabContainer.className = 'fab-container';
            fabContainer.innerHTML = `
                <div class="fab-menu" id="fab-menu">
                    <a href="/projects" class="fab-item">
                        <i class="fas fa-th-large"></i>
                        <span class="fab-label">전시 관리</span>
                    </a>
                    <a href="/dashboard" class="fab-item">
                        <i class="fas fa-home"></i>
                        <span class="fab-label">대시보드</span>
                    </a>
                    <button class="fab-item" onclick="window.createNewProject && window.createNewProject()">
                        <i class="fas fa-plus-circle"></i>
                        <span class="fab-label">새 전시</span>
                    </button>
                    ${this.isCanvasPage() ? `
                        <button class="fab-item" onclick="window.addTask && window.addTask()">
                            <i class="fas fa-tasks"></i>
                            <span class="fab-label">작업 추가</span>
                        </button>
                    ` : ''}
                </div>
                <button class="fab-main" id="fab-main">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            
            document.body.appendChild(fabContainer);
        }
        
        isCanvasPage() {
            return window.location.pathname.includes('/canvas');
        }
        
        attachEvents() {
            const fabMain = document.getElementById('fab-main');
            const fabMenu = document.getElementById('fab-menu');
            
            fabMain.addEventListener('click', () => {
                this.toggle();
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.fab-container')) {
                    this.close();
                }
            });
        }
        
        toggle() {
            this.isOpen = !this.isOpen;
            const fabMain = document.getElementById('fab-main');
            const fabMenu = document.getElementById('fab-menu');
            
            if (this.isOpen) {
                fabMain.classList.add('active');
                fabMenu.classList.add('active');
            } else {
                fabMain.classList.remove('active');
                fabMenu.classList.remove('active');
            }
        }
        
        close() {
            this.isOpen = false;
            const fabMain = document.getElementById('fab-main');
            const fabMenu = document.getElementById('fab-menu');
            
            if (fabMain && fabMenu) {
                fabMain.classList.remove('active');
                fabMenu.classList.remove('active');
            }
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.FloatingAction = new FloatingAction();
        });
    } else {
        window.FloatingAction = new FloatingAction();
    }
    
    // Helper function for creating new project
    window.createNewProject = function() {
        if (typeof openCreateModal === 'function') {
            openCreateModal();
        } else {
            window.location.href = '/projects';
        }
    };
})();
