/**
 * MuseFlow Canvas V23.0 - Phase A Implementation
 * Complete Projects, Tasks, Settings Panel with Professional UX/UI
 * 
 * Features:
 * - Projects Panel: Full CRUD, Search, Filter, Sort, Thumbnails
 * - Tasks Panel: Full CRUD, Priority, Due Date, Status, Filters
 * - Settings Panel: Theme System, Grid Size, Advanced Settings
 * - Professional UX: High visibility, consistency, accessibility
 */

// ============================================
// PROJECTS PANEL - Complete Implementation
// ============================================

const ProjectsManager = {
    projects: [],
    currentProject: null,
    
    init() {
        this.loadProjects();
        this.setupEventListeners();
        this.renderProjects();
    },
    
    loadProjects() {
        const saved = StorageManager.load('projects_v23');
        if (saved && Array.isArray(saved)) {
            this.projects = saved;
        } else {
            // Create default projects with proper metadata
            this.projects = [
                {
                    id: this.generateId(),
                    name: '뮤지엄 전시 프로젝트',
                    description: '2024년 봄 특별 전시 기획',
                    createdAt: Date.now() - 7200000, // 2 hours ago
                    updatedAt: Date.now() - 3600000, // 1 hour ago
                    cards: [],
                    connections: [],
                    tags: ['전시', '기획'],
                    thumbnail: null,
                    favorite: true
                },
                {
                    id: this.generateId(),
                    name: '예술 작품 아카이브',
                    description: '소장품 디지털화 프로젝트',
                    createdAt: Date.now() - 86400000, // 1 day ago
                    updatedAt: Date.now() - 86400000,
                    cards: [],
                    connections: [],
                    tags: ['아카이브', '디지털'],
                    thumbnail: null,
                    favorite: false
                },
                {
                    id: this.generateId(),
                    name: '관람객 경험 디자인',
                    description: '방문자 여정 최적화',
                    createdAt: Date.now() - 259200000, // 3 days ago
                    updatedAt: Date.now() - 259200000,
                    cards: [],
                    connections: [],
                    tags: ['UX', '서비스디자인'],
                    thumbnail: null,
                    favorite: false
                }
            ];
            this.saveProjects();
        }
        
        // Load current project
        const currentId = StorageManager.load('current_project_id');
        if (currentId) {
            this.currentProject = this.projects.find(p => p.id === currentId);
        }
        if (!this.currentProject && this.projects.length > 0) {
            this.currentProject = this.projects[0];
        }
    },
    
    saveProjects() {
        StorageManager.save('projects_v23', this.projects);
        if (this.currentProject) {
            StorageManager.save('current_project_id', this.currentProject.id);
        }
    },
    
    generateId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    setupEventListeners() {
        // New Project button
        const newBtn = document.getElementById('newProjectBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.createProject());
        }
        
        // Search input
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProjects(e.target.value));
        }
        
        // Sort dropdown
        const sortSelect = document.getElementById('projectSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortProjects(e.target.value));
        }
    },
    
    createProject() {
        const name = prompt('새 프로젝트 이름을 입력하세요:', '새 프로젝트');
        if (!name || name.trim() === '') return;
        
        const newProject = {
            id: this.generateId(),
            name: name.trim(),
            description: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            cards: [],
            connections: [],
            tags: [],
            thumbnail: null,
            favorite: false
        };
        
        this.projects.unshift(newProject);
        this.saveProjects();
        this.renderProjects();
        showToast(`프로젝트 "${newProject.name}" 생성됨`, 'success');
    },
    
    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        this.currentProject = project;
        this.saveProjects();
        
        // Load project data to canvas
        CanvasState.cards = project.cards || [];
        CanvasState.connections = project.connections || [];
        
        // Re-render canvas
        if (typeof renderCanvas === 'function') {
            renderCanvas();
        }
        
        showToast(`프로젝트 "${project.name}" 로드됨`, 'success');
        this.renderProjects();
    },
    
    saveCurrentProject() {
        if (!this.currentProject) return;
        
        this.currentProject.cards = CanvasState.cards;
        this.currentProject.connections = CanvasState.connections;
        this.currentProject.updatedAt = Date.now();
        
        this.saveProjects();
        showToast('프로젝트 저장 완료', 'success');
    },
    
    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        if (!confirm(`프로젝트 "${project.name}"을(를) 삭제하시겠습니까?`)) return;
        
        this.projects = this.projects.filter(p => p.id !== projectId);
        
        // If deleted current project, switch to first project
        if (this.currentProject && this.currentProject.id === projectId) {
            this.currentProject = this.projects[0] || null;
        }
        
        this.saveProjects();
        this.renderProjects();
        showToast('프로젝트 삭제됨', 'success');
    },
    
    toggleFavorite(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        project.favorite = !project.favorite;
        this.saveProjects();
        this.renderProjects();
    },
    
    renameProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const newName = prompt('새 프로젝트 이름:', project.name);
        if (!newName || newName.trim() === '') return;
        
        project.name = newName.trim();
        project.updatedAt = Date.now();
        this.saveProjects();
        this.renderProjects();
        showToast('프로젝트 이름 변경됨', 'success');
    },
    
    duplicateProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const duplicated = {
            ...JSON.parse(JSON.stringify(project)),
            id: this.generateId(),
            name: project.name + ' (복사본)',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            favorite: false
        };
        
        this.projects.unshift(duplicated);
        this.saveProjects();
        this.renderProjects();
        showToast(`프로젝트 "${duplicated.name}" 복사됨`, 'success');
    },
    
    filterProjects(query) {
        this.renderProjects(query);
    },
    
    sortProjects(sortBy) {
        if (sortBy === 'recent') {
            this.projects.sort((a, b) => b.updatedAt - a.updatedAt);
        } else if (sortBy === 'name') {
            this.projects.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'created') {
            this.projects.sort((a, b) => b.createdAt - a.createdAt);
        }
        this.renderProjects();
    },
    
    formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    },
    
    renderProjects(searchQuery = '') {
        const container = document.getElementById('projectsList');
        if (!container) {
            console.warn('⚠️ projectsList container not found, will retry...');
            // Retry after a delay if container doesn't exist
            setTimeout(() => {
                const retryContainer = document.getElementById('projectsList');
                if (retryContainer) {
                    console.log('✅ projectsList found on retry, rendering now...');
                    this.renderProjects(searchQuery);
                }
            }, 1000);
            return;
        }
        
        // Filter projects
        let filtered = this.projects;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = this.projects.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(t => t.toLowerCase().includes(query))
            );
        }
        
        // Sort favorites first
        const favorites = filtered.filter(p => p.favorite);
        const normal = filtered.filter(p => !p.favorite);
        filtered = [...favorites, ...normal];
        
        container.innerHTML = filtered.map(project => {
            const isActive = this.currentProject && this.currentProject.id === project.id;
            const cardCount = (project.cards || []).length;
            const connectionCount = (project.connections || []).length;
            
            return `
                <div class="project-item ${isActive ? 'active' : ''}" 
                     data-project-id="${project.id}"
                     onclick="ProjectsManager.loadProject('${project.id}')">
                    <div class="project-header">
                        <div class="project-info">
                            <div class="project-name">
                                ${project.favorite ? '<i data-lucide="star" class="icon-xs" style="fill:#FBBF24;color:#FBBF24;"></i>' : ''}
                                ${project.name}
                                ${isActive ? '<span class="project-badge">현재</span>' : ''}
                            </div>
                            <div class="project-meta">
                                <span><i data-lucide="box" class="icon-xs"></i> ${cardCount}개 카드</span>
                                <span><i data-lucide="git-branch" class="icon-xs"></i> ${connectionCount}개 연결</span>
                            </div>
                        </div>
                        <button class="project-menu-btn" onclick="event.stopPropagation(); ProjectsManager.showMenu(event, '${project.id}')">
                            <i data-lucide="more-vertical" class="icon"></i>
                        </button>
                    </div>
                    ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                    <div class="project-footer">
                        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                        <span class="project-time">${this.formatTime(project.updatedAt)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Empty state
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder-search" style="width:48px;height:48px;color:#6B7280;"></i>
                    <p>프로젝트를 찾을 수 없습니다</p>
                    ${searchQuery ? '<button class="btn-secondary" onclick="document.getElementById(\'projectSearch\').value=\'\';ProjectsManager.filterProjects(\'\')">검색 초기화</button>' : ''}
                </div>
            `;
        }
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    },
    
    showMenu(event, projectId) {
        // Remove existing menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <button onclick="ProjectsManager.loadProject('${projectId}'); this.parentElement.remove();">
                <i data-lucide="folder-open" class="icon"></i> 열기
            </button>
            <button onclick="ProjectsManager.renameProject('${projectId}'); this.parentElement.remove();">
                <i data-lucide="edit" class="icon"></i> 이름 변경
            </button>
            <button onclick="ProjectsManager.duplicateProject('${projectId}'); this.parentElement.remove();">
                <i data-lucide="copy" class="icon"></i> 복사
            </button>
            <button onclick="ProjectsManager.toggleFavorite('${projectId}'); this.parentElement.remove();">
                <i data-lucide="star" class="icon"></i> 즐겨찾기
            </button>
            <div class="menu-divider"></div>
            <button class="danger" onclick="ProjectsManager.deleteProject('${projectId}'); this.parentElement.remove();">
                <i data-lucide="trash-2" class="icon"></i> 삭제
            </button>
        `;
        
        // Position menu
        const rect = event.target.closest('button').getBoundingClientRect();
        menu.style.top = rect.bottom + 5 + 'px';
        menu.style.left = rect.right - 200 + 'px';
        
        document.body.appendChild(menu);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    }
};

// ============================================
// TASKS PANEL - Complete Implementation
// ============================================

const TasksManager = {
    tasks: [],
    filter: 'all', // all, active, completed
    sortBy: 'dueDate', // dueDate, priority, created
    
    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    },
    
    loadTasks() {
        const saved = StorageManager.load('tasks_v23');
        if (saved && Array.isArray(saved)) {
            this.tasks = saved;
        } else {
            // Create default tasks
            this.tasks = [
                {
                    id: this.generateId(),
                    title: '홍보 영상 편집 완료',
                    description: '',
                    completed: false,
                    priority: 'high', // high, medium, low
                    dueDate: Date.now() + 86400000, // Tomorrow
                    status: 'in_progress', // pending, in_progress, completed
                    createdAt: Date.now() - 3600000,
                    tags: ['영상', '마케팅']
                },
                {
                    id: this.generateId(),
                    title: '오디오 가이드 녹음',
                    description: '전문 성우와 녹음 진행',
                    completed: true,
                    priority: 'medium',
                    dueDate: Date.now() - 86400000, // Yesterday
                    status: 'completed',
                    createdAt: Date.now() - 172800000,
                    tags: ['오디오']
                },
                {
                    id: this.generateId(),
                    title: '포스터 디자인 승인',
                    description: '',
                    completed: false,
                    priority: 'high',
                    dueDate: Date.now() + 172800000, // 2 days later
                    status: 'pending',
                    createdAt: Date.now() - 86400000,
                    tags: ['디자인']
                }
            ];
            this.saveTasks();
        }
    },
    
    saveTasks() {
        StorageManager.save('tasks_v23', this.tasks);
    },
    
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    setupEventListeners() {
        // New Task button
        const newBtn = document.getElementById('newTaskBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.createTask());
        }
        
        // Filter buttons
        const filterBtns = document.querySelectorAll('[data-task-filter]');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filter = e.target.dataset.taskFilter;
                this.renderTasks();
            });
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('taskSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.renderTasks();
            });
        }
    },
    
    createTask() {
        const title = prompt('새 작업 제목을 입력하세요:');
        if (!title || title.trim() === '') return;
        
        const newTask = {
            id: this.generateId(),
            title: title.trim(),
            description: '',
            completed: false,
            priority: 'medium',
            dueDate: Date.now() + 86400000, // Tomorrow
            status: 'pending',
            createdAt: Date.now(),
            tags: []
        };
        
        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        showToast(`작업 "${newTask.title}" 생성됨`, 'success');
    },
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'in_progress';
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        showToast(
            task.completed ? '작업 완료!' : '작업 재개됨',
            'success'
        );
    },
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Simple edit (can be expanded to modal)
        const newTitle = prompt('작업 제목:', task.title);
        if (!newTitle || newTitle.trim() === '') return;
        
        task.title = newTitle.trim();
        this.saveTasks();
        this.renderTasks();
        showToast('작업 수정됨', 'success');
    },
    
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (!confirm(`작업 "${task.title}"을(를) 삭제하시겠습니까?`)) return;
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        showToast('작업 삭제됨', 'success');
    },
    
    setPriority(taskId, priority) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.priority = priority;
        this.saveTasks();
        this.renderTasks();
    },
    
    setDueDate(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const date = prompt('기한 입력 (YYYY-MM-DD):', 
            new Date(task.dueDate).toISOString().split('T')[0]
        );
        if (!date) return;
        
        task.dueDate = new Date(date).getTime();
        this.saveTasks();
        this.renderTasks();
        showToast('기한 변경됨', 'success');
    },
    
    formatDueDate(timestamp) {
        const now = Date.now();
        const diff = timestamp - now;
        const days = Math.floor(diff / 86400000);
        
        if (diff < 0) return '지연됨';
        if (days === 0) return '오늘';
        if (days === 1) return '내일';
        return `${days}일 후`;
    },
    
    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    },
    
    getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return 'alert-circle';
            case 'medium': return 'alert-triangle';
            case 'low': return 'info';
            default: return 'circle';
        }
    },
    
    renderTasks() {
        const container = document.getElementById('tasksList');
        if (!container) {
            console.warn('⚠️ tasksList container not found, will retry...');
            // Retry after a delay if container doesn't exist
            setTimeout(() => {
                const retryContainer = document.getElementById('tasksList');
                if (retryContainer) {
                    console.log('✅ tasksList found on retry, rendering now...');
                    this.renderTasks();
                }
            }, 1000);
            return;
        }
        
        // Filter tasks
        let filtered = this.tasks;
        if (this.filter === 'active') {
            filtered = this.tasks.filter(t => !t.completed);
        } else if (this.filter === 'completed') {
            filtered = this.tasks.filter(t => t.completed);
        }
        
        // Sort tasks
        filtered.sort((a, b) => {
            if (this.sortBy === 'dueDate') {
                return a.dueDate - b.dueDate;
            } else if (this.sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (this.sortBy === 'created') {
                return b.createdAt - a.createdAt;
            }
            return 0;
        });
        
        container.innerHTML = filtered.map(task => {
            const isOverdue = task.dueDate < Date.now() && !task.completed;
            const priorityColor = this.getPriorityColor(task.priority);
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}"
                     data-task-id="${task.id}">
                    <div class="task-checkbox">
                        <input type="checkbox" 
                               ${task.completed ? 'checked' : ''}
                               onchange="TasksManager.toggleTask('${task.id}')">
                    </div>
                    <div class="task-content" onclick="TasksManager.editTask('${task.id}')">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">
                            <span class="task-priority" style="color:${priorityColor};">
                                <i data-lucide="${this.getPriorityIcon(task.priority)}" class="icon-xs"></i>
                                ${task.priority === 'high' ? '높음' : task.priority === 'medium' ? '중간' : '낮음'}
                            </span>
                            <span class="task-due ${isOverdue ? 'overdue' : ''}">
                                <i data-lucide="calendar" class="icon-xs"></i>
                                ${this.formatDueDate(task.dueDate)}
                            </span>
                        </div>
                    </div>
                    <button class="task-menu-btn" onclick="event.stopPropagation(); TasksManager.showMenu(event, '${task.id}')">
                        <i data-lucide="more-vertical" class="icon"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Empty state
        if (filtered.length === 0) {
            const emptyMessage = this.filter === 'completed' ? '완료된 작업이 없습니다' :
                                 this.filter === 'active' ? '진행 중인 작업이 없습니다' :
                                 '작업이 없습니다';
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="check-circle" style="width:48px;height:48px;color:#6B7280;"></i>
                    <p>${emptyMessage}</p>
                </div>
            `;
        }
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    },
    
    showMenu(event, taskId) {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <button onclick="TasksManager.editTask('${taskId}'); this.parentElement.remove();">
                <i data-lucide="edit" class="icon"></i> 편집
            </button>
            <button onclick="TasksManager.setDueDate('${taskId}'); this.parentElement.remove();">
                <i data-lucide="calendar" class="icon"></i> 기한 설정
            </button>
            <div class="menu-divider"></div>
            <button onclick="TasksManager.setPriority('${taskId}', 'high'); this.parentElement.remove();">
                <i data-lucide="alert-circle" class="icon" style="color:#EF4444;"></i> 높은 우선순위
            </button>
            <button onclick="TasksManager.setPriority('${taskId}', 'medium'); this.parentElement.remove();">
                <i data-lucide="alert-triangle" class="icon" style="color:#F59E0B;"></i> 중간 우선순위
            </button>
            <button onclick="TasksManager.setPriority('${taskId}', 'low'); this.parentElement.remove();">
                <i data-lucide="info" class="icon" style="color:#10B981;"></i> 낮은 우선순위
            </button>
            <div class="menu-divider"></div>
            <button class="danger" onclick="TasksManager.deleteTask('${taskId}'); this.parentElement.remove();">
                <i data-lucide="trash-2" class="icon"></i> 삭제
            </button>
        `;
        
        const rect = event.target.closest('button').getBoundingClientRect();
        menu.style.top = rect.bottom + 5 + 'px';
        menu.style.left = rect.right - 200 + 'px';
        
        document.body.appendChild(menu);
        
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
        
        if (window.lucide) lucide.createIcons();
    },
    
    updateStats() {
        // Update Stats Panel
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        // This will be used by Stats Panel
        if (typeof updateTaskStats === 'function') {
            updateTaskStats({ total, completed, active });
        }
    }
};

// ============================================
// SETTINGS PANEL - Theme System Implementation
// ============================================

const SettingsManager = {
    settings: {
        theme: 'dark', // dark, light, system
        showGrid: true,
        snapToGrid: true,
        gridSize: 20,
        autoSave: true,
        gridSizeValue: 150 // For slider display
    },
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
        this.updateUI();
    },
    
    loadSettings() {
        const saved = StorageManager.load('settings_v23');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    },
    
    saveSettings() {
        StorageManager.save('settings_v23', this.settings);
        showToast('설정 저장 완료', 'success');
    },
    
    setupEventListeners() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
                this.saveSettings();
            });
        }
        
        // Grid size slider
        const gridSizeSlider = document.getElementById('gridSizeSlider');
        const gridSizeValue = document.getElementById('gridSizeValue');
        if (gridSizeSlider) {
            gridSizeSlider.value = this.settings.gridSizeValue;
            gridSizeSlider.addEventListener('input', (e) => {
                this.settings.gridSizeValue = parseInt(e.target.value);
                if (gridSizeValue) {
                    gridSizeValue.textContent = this.settings.gridSizeValue + 'px';
                }
            });
            gridSizeSlider.addEventListener('change', () => {
                this.saveSettings();
                showToast('그리드 크기 변경됨', 'success');
            });
        }
        
        // Show grid checkbox
        const showGridCheckbox = document.getElementById('showGrid');
        if (showGridCheckbox) {
            showGridCheckbox.checked = this.settings.showGrid;
            showGridCheckbox.addEventListener('change', (e) => {
                this.settings.showGrid = e.target.checked;
                this.applyGridSettings();
                this.saveSettings();
            });
        }
        
        // Snap to grid checkbox
        const snapToGridCheckbox = document.getElementById('snapToGrid');
        if (snapToGridCheckbox) {
            snapToGridCheckbox.checked = this.settings.snapToGrid;
            snapToGridCheckbox.addEventListener('change', (e) => {
                this.settings.snapToGrid = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Auto save checkbox
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = this.settings.autoSave;
            autoSaveCheckbox.addEventListener('change', (e) => {
                this.settings.autoSave = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Save settings button
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Reset settings button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
    },
    
    applyTheme() {
        const body = document.body;
        
        if (this.settings.theme === 'light') {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
        } else if (this.settings.theme === 'dark') {
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
        } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.remove('theme-light', 'theme-dark');
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        }
        
        showToast(
            this.settings.theme === 'light' ? '라이트 모드 적용' :
            this.settings.theme === 'dark' ? '다크 모드 적용' :
            '시스템 설정 따름',
            'success'
        );
    },
    
    applyGridSettings() {
        const canvas = document.querySelector('.canvas');
        if (!canvas) return;
        
        if (this.settings.showGrid) {
            canvas.style.backgroundImage = `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `;
            canvas.style.backgroundSize = `${this.settings.gridSize}px ${this.settings.gridSize}px`;
        } else {
            canvas.style.backgroundImage = 'none';
        }
    },
    
    updateUI() {
        // Update UI elements to reflect current settings
        const gridSizeValue = document.getElementById('gridSizeValue');
        if (gridSizeValue) {
            gridSizeValue.textContent = this.settings.gridSizeValue + 'px';
        }
        
        this.applyGridSettings();
    },
    
    resetSettings() {
        if (!confirm('설정을 초기화하시겠습니까?')) return;
        
        this.settings = {
            theme: 'dark',
            showGrid: true,
            snapToGrid: true,
            gridSize: 20,
            autoSave: true,
            gridSizeValue: 150
        };
        
        this.saveSettings();
        this.applyTheme();
        this.updateUI();
        
        // Update UI elements
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = 'dark';
        
        const gridSizeSlider = document.getElementById('gridSizeSlider');
        if (gridSizeSlider) gridSizeSlider.value = 150;
        
        const showGridCheckbox = document.getElementById('showGrid');
        if (showGridCheckbox) showGridCheckbox.checked = true;
        
        const snapToGridCheckbox = document.getElementById('snapToGrid');
        if (snapToGridCheckbox) snapToGridCheckbox.checked = true;
        
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) autoSaveCheckbox.checked = true;
        
        showToast('설정이 초기화되었습니다', 'success');
    },
    
    getSettings() {
        return { ...this.settings };
    }
};

// ============================================
// Initialize Phase A on DOM Ready
// ============================================
// Use window.onload to ensure all DOM elements are fully loaded
window.addEventListener('load', function() {
    // Add small delay to ensure all deferred scripts are executed
    setTimeout(function() {
        console.log('🚀 Initializing MuseFlow Canvas V23.0 - Phase A');
        console.log('📊 DOM Ready State:', document.readyState);
        
        // Check DOM elements existence
        const projectsListElement = document.getElementById('projectsList');
        const tasksListElement = document.getElementById('tasksList');
        const projectsPanelElement = document.getElementById('projectsPanel');
        const tasksPanelElement = document.getElementById('tasksPanel');
        
        console.log('🔍 DOM Elements Check:');
        console.log('   • projectsList:', projectsListElement ? '✅ Found' : '❌ Not Found');
        console.log('   • tasksList:', tasksListElement ? '✅ Found' : '❌ Not Found');
        console.log('   • projectsPanel:', projectsPanelElement ? '✅ Found' : '❌ Not Found');
        console.log('   • tasksPanel:', tasksPanelElement ? '✅ Found' : '❌ Not Found');
        
        // Try querySelector as alternative
        const projectsListByQuery = document.querySelector('#projectsList');
        const tasksListByQuery = document.querySelector('#tasksList');
        console.log('🔍 querySelector Check:');
        console.log('   • projectsList (query):', projectsListByQuery ? '✅ Found' : '❌ Not Found');
        console.log('   • tasksList (query):', tasksListByQuery ? '✅ Found' : '❌ Not Found');
        
        // Initialize Projects Manager (Force execution)
        console.log('📦 Initializing Projects Manager...');
        try {
            ProjectsManager.init();
            console.log('✅ Projects Panel initialized successfully');
        } catch (error) {
            console.error('❌ Projects Panel initialization failed:', error);
        }
        
        // Initialize Tasks Manager (Force execution)
        console.log('📋 Initializing Tasks Manager...');
        try {
            TasksManager.init();
            console.log('✅ Tasks Panel initialized successfully');
        } catch (error) {
            console.error('❌ Tasks Panel initialization failed:', error);
        }
        
        // Initialize Settings Manager
        console.log('⚙️ Initializing Settings Manager...');
        try {
            SettingsManager.init();
            console.log('✅ Settings Panel initialized successfully');
        } catch (error) {
            console.error('❌ Settings Panel initialization failed:', error);
        }
        
        console.log('✅ MuseFlow Canvas V23.0 - Phase A Loaded');
        console.log('📊 Final Check - LocalStorage Data:');
        console.log('   • Projects:', localStorage.getItem('museflow_projects_v23') ? 'Has data' : 'No data');
        console.log('   • Tasks:', localStorage.getItem('museflow_tasks_v23') ? 'Has data' : 'No data');
        console.log('   • Settings:', localStorage.getItem('museflow_settings') ? 'Has data' : 'No data');
        
        // Additional verification - check actual data
        try {
            const projectsData = JSON.parse(localStorage.getItem('museflow_projects_v23') || '[]');
            const tasksData = JSON.parse(localStorage.getItem('museflow_tasks_v23') || '[]');
            console.log('📦 Projects Count:', projectsData.length);
            console.log('📋 Tasks Count:', tasksData.length);
            
            // Force render after delay
            setTimeout(() => {
                console.log('🔄 Forcing UI re-render...');
                if (window.ProjectsManager) ProjectsManager.renderProjects();
                if (window.TasksManager) TasksManager.renderTasks();
            }, 1500);
        } catch (e) {
            console.error('❌ LocalStorage data verification failed:', e);
        }
    }, 500); // 500ms delay to ensure DOM is fully ready
});

// Expose managers globally for debugging
window.ProjectsManager = ProjectsManager;
window.TasksManager = TasksManager;
window.SettingsManager = SettingsManager;
