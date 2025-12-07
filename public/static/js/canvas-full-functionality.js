/**
 * MuseFlow Canvas - Complete Functionality Implementation
 * Version: 22.0.0
 * 
 * Features:
 * - Left Sidebar: History, Actions, Projects, Settings
 * - Right Sidebar: Stats, Widget, Tasks, AI, Alerts
 * - Node Connections: Create, Edit, Delete
 * - Card Actions: Copy, Notion, Figma Integration
 * - Canvas Operations: Pan, Zoom, Save, Load
 */

// ============================================
// Global State Management
// ============================================
const CanvasState = {
    cards: [],
    connections: [],
    projects: [],
    tasks: [],
    alerts: [],
    history: [],
    historyIndex: -1,
    currentProject: null,
    settings: {
        showGrid: true,
        snapToGrid: true,
        gridSize: 20,
        autoSave: true,
        theme: 'light'
    }
};

// ============================================
// Local Storage Manager
// ============================================
const StorageManager = {
    save(key, data) {
        try {
            localStorage.setItem(`museflow_${key}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },
    
    load(key) {
        try {
            const data = localStorage.getItem(`museflow_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    },
    
    remove(key) {
        localStorage.removeItem(`museflow_${key}`);
    }
};

// Expose StorageManager globally for Phase A
window.StorageManager = StorageManager;

// ============================================
// Toast Notification System
// ============================================
function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" 
               style="width:20px;height:20px;"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Recreate icons
    if (window.lucide) lucide.createIcons();
}

// Expose showToast globally for Phase A
window.showToast = showToast;

// ============================================
// ACTIONS PANEL - 4 Core Buttons
// ============================================

// 1. Create New Card
function createNewCard() {
    const canvas = document.querySelector('.canvas');
    if (!canvas) return;
    
    const cardData = {
        id: `card-${Date.now()}`,
        title: '새로운 카드',
        content: '내용을 입력하세요',
        type: 'text',
        icon: 'file-text',
        size: 'Medium',
        format: 'Document',
        x: (window.innerWidth / 2 - 100) / (window.zoom || 1),
        y: (window.innerHeight / 2 - 60) / (window.zoom || 1)
    };
    
    // Use existing createCard function if available
    if (typeof createCard === 'function') {
        const card = createCard(cardData);
        recordHistory('create', { cardId: card.id, data: cardData });
        showToast('새 카드가 생성되었습니다');
    } else {
        console.error('createCard function not found');
        showToast('카드 생성 실패', 'error');
    }
}

// 2. Upload File
function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        showToast(`${files.length}개 파일 업로드 중...`, 'info');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const cardData = {
                    id: `card-${Date.now()}-${i}`,
                    title: file.name,
                    content: file.type.startsWith('image/') ? 
                        `<img src="${event.target.result}" style="max-width:100%;border-radius:8px;" />` :
                        `파일: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    icon: file.type.startsWith('image/') ? 'image' : 'file',
                    size: 'Medium',
                    format: file.type.split('/')[1]?.toUpperCase() || 'File',
                    x: (200 + i * 50) / (window.zoom || 1),
                    y: (200 + i * 50) / (window.zoom || 1),
                    fileData: event.target.result,
                    fileName: file.name,
                    fileType: file.type
                };
                
                if (typeof createCard === 'function') {
                    createCard(cardData);
                }
            };
            
            reader.readAsDataURL(file);
        }
        
        setTimeout(() => {
            showToast(`${files.length}개 파일이 업로드되었습니다`);
        }, 500);
    };
    
    input.click();
}

// 3. Arrange Layout (Grid Layout)
function arrangeLayout() {
    const cards = Array.from(document.querySelectorAll('.card'));
    
    if (cards.length === 0) {
        showToast('정렬할 카드가 없습니다', 'info');
        return;
    }
    
    const cols = Math.ceil(Math.sqrt(cards.length));
    const cardWidth = 220;
    const cardHeight = 180;
    const gap = 40;
    const startX = 100;
    const startY = 100;
    
    cards.forEach((card, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const x = startX + (col * (cardWidth + gap));
        const y = startY + (row * (cardHeight + gap));
        
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        
        // Update card data
        if (card.dataset.cardId) {
            const cardData = CanvasState.cards.find(c => c.id === card.dataset.cardId);
            if (cardData) {
                cardData.x = x;
                cardData.y = y;
            }
        }
    });
    
    recordHistory('arrange', { cardCount: cards.length });
    showToast(`${cards.length}개 카드가 정렬되었습니다`);
    saveCanvasState();
}

// 4. Save Project
function saveProject() {
    const canvasData = {
        cards: Array.from(document.querySelectorAll('.card')).map(card => ({
            id: card.dataset.cardId || card.id,
            title: card.querySelector('.card-title')?.textContent || '',
            content: card.querySelector('.card-content')?.innerHTML || '',
            x: parseFloat(card.style.left) || 0,
            y: parseFloat(card.style.top) || 0,
            type: card.dataset.type || 'text',
            icon: card.dataset.icon || 'file-text'
        })),
        connections: Array.from(document.querySelectorAll('line[data-connection]')).map(line => ({
            from: line.dataset.from,
            to: line.dataset.to
        })),
        timestamp: new Date().toISOString(),
        projectName: CanvasState.currentProject?.name || 'Untitled Project'
    };
    
    CanvasState.cards = canvasData.cards;
    CanvasState.connections = canvasData.connections;
    
    StorageManager.save('canvas_state', canvasData);
    StorageManager.save('current_project', CanvasState.currentProject);
    
    showToast('프로젝트가 저장되었습니다');
    recordHistory('save', { cardCount: canvasData.cards.length });
    
    // Update last saved time in Stats Panel
    updateStatsPanel();
}

// ============================================
// PROJECTS PANEL - Project Management
// ============================================

function loadProject(projectId) {
    const project = CanvasState.projects.find(p => p.id === projectId);
    
    if (!project) {
        showToast('프로젝트를 찾을 수 없습니다', 'error');
        return;
    }
    
    // Clear current canvas
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    
    // Load project data
    const projectData = StorageManager.load(`project_${projectId}`);
    
    if (projectData && projectData.cards) {
        projectData.cards.forEach(cardData => {
            if (typeof createCard === 'function') {
                createCard(cardData);
            }
        });
        
        CanvasState.currentProject = project;
        showToast(`"${project.name}" 프로젝트를 불러왔습니다`);
    } else {
        showToast('프로젝트 데이터를 불러올 수 없습니다', 'error');
    }
}

function createProject(name) {
    const newProject = {
        id: `project-${Date.now()}`,
        name: name || '새 프로젝트',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    CanvasState.projects.push(newProject);
    StorageManager.save('projects', CanvasState.projects);
    
    updateProjectsPanel();
    showToast(`"${newProject.name}" 프로젝트가 생성되었습니다`);
    
    return newProject;
}

function deleteProject(projectId) {
    const index = CanvasState.projects.findIndex(p => p.id === projectId);
    
    if (index === -1) return;
    
    const project = CanvasState.projects[index];
    
    if (confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?`)) {
        CanvasState.projects.splice(index, 1);
        StorageManager.save('projects', CanvasState.projects);
        StorageManager.remove(`project_${projectId}`);
        
        updateProjectsPanel();
        showToast('프로젝트가 삭제되었습니다');
    }
}

function updateProjectsPanel() {
    const projectsContent = document.querySelector('#projectsPanel .panel-content');
    if (!projectsContent) return;
    
    const projectsHTML = CanvasState.projects.map(project => {
        const colors = ['#8B5CF6', '#22C55E', '#F97316', '#3B82F6', '#EF4444'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return `
            <div class="project-item" data-project-id="${project.id}" 
                 style="padding: 0.75rem; background: ${color}1A; border-radius: 8px; 
                        border-left: 3px solid ${color}; cursor: pointer; 
                        transition: all 0.2s; margin-bottom: 0.75rem;"
                 onclick="loadProject('${project.id}')"
                 onmouseover="this.style.background='${color}33'"
                 onmouseout="this.style.background='${color}1A'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">${project.name}</div>
                        <div style="font-size: 0.875rem; color: #6B7280;">
                            ${new Date(project.updatedAt).toLocaleString('ko-KR')}
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); deleteProject('${project.id}')" 
                            style="background: none; border: none; cursor: pointer; color: #6B7280; 
                                   padding: 0.25rem;"
                            onmouseover="this.style.color='#EF4444'"
                            onmouseout="this.style.color='#6B7280'">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    projectsContent.innerHTML = `
        <div style="padding: 1rem;">
            <button onclick="createNewProject()" 
                    style="width: 100%; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); 
                           border: none; padding: 0.75rem; border-radius: 8px; color: white; 
                           cursor: pointer; font-weight: 600; margin-bottom: 1rem;">
                <i data-lucide="plus" style="width:16px;height:16px;display:inline-block;margin-right:8px;"></i>
                새 프로젝트
            </button>
            ${projectsHTML || '<div style="text-align:center;color:#6B7280;padding:2rem;">프로젝트가 없습니다</div>'}
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
}

function createNewProject() {
    const name = prompt('프로젝트 이름을 입력하세요:', '새 프로젝트');
    if (name) {
        createProject(name);
    }
}

// ============================================
// TASKS PANEL - Task Management
// ============================================

function toggleTaskComplete(taskId, completed) {
    const task = CanvasState.tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = completed;
        StorageManager.save('tasks', CanvasState.tasks);
        updateTasksPanel();
        
        showToast(completed ? '태스크가 완료되었습니다' : '태스크가 미완료로 변경되었습니다', 'info');
    }
}

function addTask(title, deadline = '오늘') {
    const newTask = {
        id: `task-${Date.now()}`,
        title: title,
        deadline: deadline,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    CanvasState.tasks.push(newTask);
    StorageManager.save('tasks', CanvasState.tasks);
    updateTasksPanel();
    
    showToast('새 태스크가 추가되었습니다');
}

function deleteTask(taskId) {
    const index = CanvasState.tasks.findIndex(t => t.id === taskId);
    
    if (index !== -1) {
        CanvasState.tasks.splice(index, 1);
        StorageManager.save('tasks', CanvasState.tasks);
        updateTasksPanel();
        
        showToast('태스크가 삭제되었습니다');
    }
}

function updateTasksPanel() {
    const tasksContent = document.querySelector('#tasksPanel .panel-content');
    if (!tasksContent) return;
    
    const tasksHTML = CanvasState.tasks.map(task => `
        <div class="task-item" style="padding: 0.75rem; background: rgba(139, 92, 246, 0.05); 
                                       border-radius: 8px; display: flex; align-items: center; 
                                       gap: 0.75rem; margin-bottom: 0.75rem;">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTaskComplete('${task.id}', this.checked)"
                   style="width: 18px; height: 18px; cursor: pointer;">
            <div style="flex: 1;">
                <div style="font-size: 0.9375rem; color: ${task.completed ? '#9CA3AF' : '#111827'}; 
                            ${task.completed ? 'text-decoration: line-through;' : ''}">${task.title}</div>
                <div style="font-size: 0.8125rem; color: #6B7280; margin-top: 0.25rem;">
                    ${task.completed ? '완료됨' : `기한: ${task.deadline}`}
                </div>
            </div>
            <button onclick="deleteTask('${task.id}')" 
                    style="background: none; border: none; cursor: pointer; color: #6B7280; padding: 0.25rem;"
                    onmouseover="this.style.color='#EF4444'"
                    onmouseout="this.style.color='#6B7280'">
                <i data-lucide="x" style="width:16px;height:16px;"></i>
            </button>
        </div>
    `).join('');
    
    tasksContent.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <input type="text" id="newTaskInput" placeholder="새 태스크 추가..." 
                       style="flex: 1; padding: 0.5rem; border: 1px solid #E5E7EB; border-radius: 6px; 
                              font-size: 0.875rem;"
                       onkeypress="if(event.key==='Enter') addNewTask()">
                <button onclick="addNewTask()" 
                        style="background: #8B5CF6; border: none; padding: 0.5rem 1rem; 
                               border-radius: 6px; color: white; cursor: pointer;">
                    <i data-lucide="plus" style="width:16px;height:16px;"></i>
                </button>
            </div>
            ${tasksHTML || '<div style="text-align:center;color:#6B7280;padding:2rem;">태스크가 없습니다</div>'}
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
}

function addNewTask() {
    const input = document.getElementById('newTaskInput');
    if (input && input.value.trim()) {
        addTask(input.value.trim());
        input.value = '';
    }
}

// ============================================
// ALERTS PANEL - Alert Management
// ============================================

function addAlert(type, title, message) {
    const newAlert = {
        id: `alert-${Date.now()}`,
        type: type, // 'error', 'info', 'success'
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    CanvasState.alerts.unshift(newAlert);
    StorageManager.save('alerts', CanvasState.alerts);
    updateAlertsPanel();
    
    // Show toast for new alert
    showToast(title, type);
}

function markAlertAsRead(alertId) {
    const alert = CanvasState.alerts.find(a => a.id === alertId);
    
    if (alert) {
        alert.read = true;
        StorageManager.save('alerts', CanvasState.alerts);
        updateAlertsPanel();
    }
}

function deleteAlert(alertId) {
    const index = CanvasState.alerts.findIndex(a => a.id === alertId);
    
    if (index !== -1) {
        CanvasState.alerts.splice(index, 1);
        StorageManager.save('alerts', CanvasState.alerts);
        updateAlertsPanel();
    }
}

function updateAlertsPanel() {
    const alertsContent = document.querySelector('#alertsPanel .panel-content');
    if (!alertsContent) return;
    
    const alertsHTML = CanvasState.alerts.map(alert => {
        const colorMap = {
            error: '#EF4444',
            info: '#3B82F6',
            success: '#22C55E',
            warning: '#F59E0B'
        };
        
        const iconMap = {
            error: 'alert-circle',
            info: 'info',
            success: 'check-circle',
            warning: 'alert-triangle'
        };
        
        const color = colorMap[alert.type] || '#6B7280';
        const icon = iconMap[alert.type] || 'bell';
        
        return `
            <div class="alert-item" style="padding: 0.75rem; background: ${color}1A; 
                                            border-radius: 8px; border-left: 3px solid ${color}; 
                                            margin-bottom: 0.75rem; cursor: pointer; 
                                            opacity: ${alert.read ? 0.6 : 1};"
                 onclick="markAlertAsRead('${alert.id}')">
                <div style="display: flex; align-items: start; gap: 0.5rem;">
                    <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};flex-shrink:0;margin-top:2px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">${alert.title}</div>
                        <div style="font-size: 0.875rem; color: #6B7280;">${alert.message}</div>
                    </div>
                    <button onclick="event.stopPropagation(); deleteAlert('${alert.id}')" 
                            style="background: none; border: none; cursor: pointer; color: #6B7280; padding: 0.25rem;"
                            onmouseover="this.style.color='#EF4444'"
                            onmouseout="this.style.color='#6B7280'">
                        <i data-lucide="x" style="width:14px;height:14px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    alertsContent.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <button onclick="CanvasState.alerts.forEach(a => a.read = true); updateAlertsPanel();" 
                        style="background: none; border: 1px solid #E5E7EB; padding: 0.5rem 1rem; 
                               border-radius: 6px; color: #6B7280; cursor: pointer; font-size: 0.875rem;">
                    모두 읽음
                </button>
                <button onclick="CanvasState.alerts = []; StorageManager.save('alerts', []); updateAlertsPanel();" 
                        style="background: none; border: 1px solid #E5E7EB; padding: 0.5rem 1rem; 
                               border-radius: 6px; color: #EF4444; cursor: pointer; font-size: 0.875rem;">
                    모두 삭제
                </button>
            </div>
            ${alertsHTML || '<div style="text-align:center;color:#6B7280;padding:2rem;">알림이 없습니다</div>'}
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
}

// ============================================
// HISTORY PANEL - History & Undo/Redo
// ============================================

function recordHistory(action, data) {
    const historyItem = {
        id: `history-${Date.now()}`,
        action: action,
        data: data,
        timestamp: new Date().toISOString()
    };
    
    // Remove future history if we're not at the end
    if (CanvasState.historyIndex < CanvasState.history.length - 1) {
        CanvasState.history = CanvasState.history.slice(0, CanvasState.historyIndex + 1);
    }
    
    CanvasState.history.push(historyItem);
    CanvasState.historyIndex = CanvasState.history.length - 1;
    
    // Keep only last 50 items
    if (CanvasState.history.length > 50) {
        CanvasState.history.shift();
        CanvasState.historyIndex--;
    }
    
    StorageManager.save('history', CanvasState.history);
    updateHistoryPanel();
}

function undo() {
    if (CanvasState.historyIndex <= 0) {
        showToast('더 이상 되돌릴 수 없습니다', 'info');
        return;
    }
    
    CanvasState.historyIndex--;
    const historyItem = CanvasState.history[CanvasState.historyIndex];
    
    // Apply undo logic based on action type
    // This is a simplified version - you'd need to implement specific undo logic
    showToast(`작업 취소: ${historyItem.action}`, 'info');
    updateHistoryPanel();
}

function redo() {
    if (CanvasState.historyIndex >= CanvasState.history.length - 1) {
        showToast('더 이상 다시 실행할 수 없습니다', 'info');
        return;
    }
    
    CanvasState.historyIndex++;
    const historyItem = CanvasState.history[CanvasState.historyIndex];
    
    // Apply redo logic based on action type
    showToast(`작업 다시 실행: ${historyItem.action}`, 'info');
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const historyContent = document.querySelector('#historyPanel .panel-content');
    if (!historyContent) return;
    
    const actionIcons = {
        create: 'plus-circle',
        delete: 'trash-2',
        edit: 'edit-3',
        move: 'move',
        connect: 'link',
        save: 'save',
        arrange: 'layout'
    };
    
    const actionColors = {
        create: '#22C55E',
        delete: '#EF4444',
        edit: '#3B82F6',
        move: '#F59E0B',
        connect: '#8B5CF6',
        save: '#10B981',
        arrange: '#6366F1'
    };
    
    const historyHTML = CanvasState.history.slice().reverse().map((item, index) => {
        const actualIndex = CanvasState.history.length - 1 - index;
        const isActive = actualIndex === CanvasState.historyIndex;
        const icon = actionIcons[item.action] || 'circle';
        const color = actionColors[item.action] || '#6B7280';
        
        const timeAgo = getTimeAgo(new Date(item.timestamp));
        
        return `
            <div class="history-item" style="padding: 0.75rem; background: ${isActive ? color + '1A' : 'rgba(139, 92, 246, 0.05)'}; 
                                              border-radius: 8px; border-left: 3px solid ${color}; 
                                              margin-bottom: 0.75rem; opacity: ${isActive ? 1 : 0.6};">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};"></i>
                    <div>
                        <div style="font-weight: 600; color: #111827; font-size: 0.9375rem;">
                            ${getActionName(item.action)}
                        </div>
                        <div style="font-size: 0.8125rem; color: #6B7280;">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    historyContent.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <button onclick="undo()" 
                        style="flex: 1; background: #8B5CF6; border: none; padding: 0.5rem; 
                               border-radius: 6px; color: white; cursor: pointer; font-size: 0.875rem;"
                        ${CanvasState.historyIndex <= 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                    <i data-lucide="corner-up-left" style="width:14px;height:14px;display:inline-block;margin-right:4px;"></i>
                    Undo
                </button>
                <button onclick="redo()" 
                        style="flex: 1; background: #8B5CF6; border: none; padding: 0.5rem; 
                               border-radius: 6px; color: white; cursor: pointer; font-size: 0.875rem;"
                        ${CanvasState.historyIndex >= CanvasState.history.length - 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                    <i data-lucide="corner-up-right" style="width:14px;height:14px;display:inline-block;margin-right:4px;"></i>
                    Redo
                </button>
            </div>
            ${historyHTML || '<div style="text-align:center;color:#6B7280;padding:2rem;">히스토리가 없습니다</div>'}
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
}

function getActionName(action) {
    const names = {
        create: '카드 생성',
        delete: '카드 삭제',
        edit: '카드 편집',
        move: '카드 이동',
        connect: '연결 생성',
        save: '프로젝트 저장',
        arrange: '레이아웃 정렬'
    };
    return names[action] || action;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
}

// ============================================
// SETTINGS PANEL - Settings Management
// ============================================

function saveSettings() {
    // Apply settings first (which updates CanvasState from checkboxes)
    applySettings();
    
    // Save to localStorage
    StorageManager.save('settings', CanvasState.settings);
    
    showToast('설정이 저장되었습니다');
    
    console.log('✅ Settings saved to localStorage:', CanvasState.settings);
}

function applySettings() {
    const canvas = document.querySelector('.canvas');
    
    // Read current checkbox values
    const showGridCheckbox = document.getElementById('showGrid');
    const snapToGridCheckbox = document.getElementById('snapToGrid');
    const autoSaveCheckbox = document.getElementById('autoSave');
    
    // Update state from checkboxes
    if (showGridCheckbox !== null) {
        CanvasState.settings.showGrid = showGridCheckbox.checked;
    }
    if (snapToGridCheckbox !== null) {
        CanvasState.settings.snapToGrid = snapToGridCheckbox.checked;
    }
    if (autoSaveCheckbox !== null) {
        CanvasState.settings.autoSave = autoSaveCheckbox.checked;
    }
    
    // Apply grid visibility
    if (canvas) {
        if (CanvasState.settings.showGrid) {
            canvas.style.backgroundImage = `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `;
            canvas.style.backgroundSize = `${CanvasState.settings.gridSize}px ${CanvasState.settings.gridSize}px`;
        } else {
            canvas.style.backgroundImage = 'none';
            canvas.style.backgroundColor = '#ffffff';
        }
    }
    
    // Store settings globally for other functions to use
    window.canvasSettings = CanvasState.settings;
    
    console.log('✅ Settings applied:', CanvasState.settings);
}

// ============================================
// STATS PANEL - Update Stats
// ============================================

function updateStatsPanel() {
    const statsContent = document.querySelector('#statsPanel .panel-content');
    if (!statsContent) return;
    
    const cardCount = document.querySelectorAll('.card').length;
    const connectionCount = document.querySelectorAll('line[data-connection]').length;
    const lastSaved = StorageManager.load('last_saved') || new Date().toISOString();
    
    // Find stats values
    const cardCountEl = statsContent.querySelector('[data-stat="cards"]');
    const connectionCountEl = statsContent.querySelector('[data-stat="connections"]');
    const lastSavedEl = statsContent.querySelector('[data-stat="last-saved"]');
    
    if (cardCountEl) cardCountEl.textContent = cardCount;
    if (connectionCountEl) connectionCountEl.textContent = connectionCount;
    if (lastSavedEl) lastSavedEl.textContent = getTimeAgo(new Date(lastSaved));
}

// ============================================
// NODE CONNECTIONS - Create, Edit, Delete
// ============================================

let connectionMode = false;
let connectionStart = null;

function enableConnectionMode() {
    connectionMode = true;
    document.body.style.cursor = 'crosshair';
    showToast('연결 모드 활성화 - 두 카드를 클릭하세요', 'info');
}

function disableConnectionMode() {
    connectionMode = false;
    connectionStart = null;
    document.body.style.cursor = 'default';
}

function createConnection(fromCardId, toCardId) {
    const svg = document.getElementById('connections');
    if (!svg) return;
    
    const fromCard = document.querySelector(`[data-card-id="${fromCardId}"]`);
    const toCard = document.querySelector(`[data-card-id="${toCardId}"]`);
    
    if (!fromCard || !toCard) {
        showToast('카드를 찾을 수 없습니다', 'error');
        return;
    }
    
    // Check if connection already exists
    const existingConnection = svg.querySelector(`line[data-from="${fromCardId}"][data-to="${toCardId}"]`);
    if (existingConnection) {
        showToast('이미 연결되어 있습니다', 'info');
        return;
    }
    
    const fromRect = fromCard.getBoundingClientRect();
    const toRect = toCard.getBoundingClientRect();
    const canvasRect = document.querySelector('.canvas').getBoundingClientRect();
    
    const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
    const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
    const y2 = toRect.top + toRect.height / 2 - canvasRect.top;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#8B5CF6');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('data-connection', 'true');
    line.setAttribute('data-from', fromCardId);
    line.setAttribute('data-to', toCardId);
    line.style.cursor = 'pointer';
    
    // Add click handler for deletion
    line.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('이 연결을 삭제하시겠습니까?')) {
            line.remove();
            recordHistory('delete-connection', { from: fromCardId, to: toCardId });
            showToast('연결이 삭제되었습니다');
            updateStatsPanel();
        }
    });
    
    svg.appendChild(line);
    
    recordHistory('connect', { from: fromCardId, to: toCardId });
    showToast('카드가 연결되었습니다');
    updateStatsPanel();
}

// Add connection mode to cards
function enableCardConnectionMode() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        if (!card.dataset.connectionListener) {
            card.addEventListener('click', (e) => {
                if (!connectionMode) return;
                
                e.stopPropagation();
                
                const cardId = card.dataset.cardId || card.id;
                
                if (!connectionStart) {
                    connectionStart = cardId;
                    card.style.outline = '3px solid #8B5CF6';
                    showToast('시작 카드 선택됨 - 대상 카드를 클릭하세요', 'info');
                } else {
                    if (connectionStart === cardId) {
                        showToast('같은 카드는 연결할 수 없습니다', 'error');
                        return;
                    }
                    
                    createConnection(connectionStart, cardId);
                    
                    // Reset
                    document.querySelectorAll('.card').forEach(c => c.style.outline = '');
                    disableConnectionMode();
                }
            });
            
            card.dataset.connectionListener = 'true';
        }
    });
}

// ============================================
// CARD ACTIONS - Copy, Notion, Figma
// ============================================

function copyCard(cardId) {
    const card = document.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
    
    if (!card) {
        showToast('카드를 찾을 수 없습니다', 'error');
        return;
    }
    
    const title = card.querySelector('.card-title')?.textContent || '';
    const content = card.querySelector('.card-content')?.textContent || '';
    
    const text = `${title}\n\n${content}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('카드 내용이 복사되었습니다');
    }).catch(() => {
        showToast('복사 실패', 'error');
    });
}

function exportToNotion(cardId) {
    const card = document.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
    
    if (!card) {
        showToast('카드를 찾을 수 없습니다', 'error');
        return;
    }
    
    const title = card.querySelector('.card-title')?.textContent || '';
    const content = card.querySelector('.card-content')?.textContent || '';
    
    // Create Notion-compatible Markdown
    const markdown = `# ${title}\n\n${content}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(markdown).then(() => {
        showToast('Notion 형식으로 복사되었습니다 - Notion에 붙여넣으세요');
    }).catch(() => {
        showToast('내보내기 실패', 'error');
    });
}

function exportToFigma(cardId) {
    const card = document.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
    
    if (!card) {
        showToast('카드를 찾을 수 없습니다', 'error');
        return;
    }
    
    const title = card.querySelector('.card-title')?.textContent || '';
    const content = card.querySelector('.card-content')?.textContent || '';
    
    // Create Figma plugin compatible data
    const figmaData = {
        type: 'card',
        title: title,
        content: content,
        width: parseFloat(card.style.width) || 220,
        height: parseFloat(card.style.height) || 160,
        x: parseFloat(card.style.left) || 0,
        y: parseFloat(card.style.top) || 0
    };
    
    // Copy JSON to clipboard
    navigator.clipboard.writeText(JSON.stringify(figmaData, null, 2)).then(() => {
        showToast('Figma 플러그인 데이터가 복사되었습니다');
    }).catch(() => {
        showToast('내보내기 실패', 'error');
    });
}

function duplicateCard(cardId) {
    const card = document.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
    
    if (!card) {
        showToast('카드를 찾을 수 없습니다', 'error');
        return;
    }
    
    const cardData = {
        id: `card-${Date.now()}`,
        title: card.querySelector('.card-title')?.textContent || '',
        content: card.querySelector('.card-content')?.innerHTML || '',
        type: card.dataset.type || 'text',
        icon: card.dataset.icon || 'file-text',
        x: (parseFloat(card.style.left) || 0) + 30,
        y: (parseFloat(card.style.top) || 0) + 30
    };
    
    if (typeof createCard === 'function') {
        createCard(cardData);
        recordHistory('create', { cardId: cardData.id, duplicate: true });
        showToast('카드가 복제되었습니다');
    }
}

// Add context menu to cards
function addCardContextMenu(card) {
    if (card.dataset.contextMenu) return;
    
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Remove existing context menu
        const existingMenu = document.querySelector('.card-context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'card-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="copyCard('${card.dataset.cardId || card.id}')">
                <i data-lucide="copy" style="width:14px;height:14px;"></i>
                <span>복사</span>
            </div>
            <div class="context-menu-item" onclick="duplicateCard('${card.dataset.cardId || card.id}')">
                <i data-lucide="layers" style="width:14px;height:14px;"></i>
                <span>복제</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" onclick="exportToNotion('${card.dataset.cardId || card.id}')">
                <i data-lucide="file-text" style="width:14px;height:14px;"></i>
                <span>Notion으로 내보내기</span>
            </div>
            <div class="context-menu-item" onclick="exportToFigma('${card.dataset.cardId || card.id}')">
                <i data-lucide="figma" style="width:14px;height:14px;"></i>
                <span>Figma로 내보내기</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" onclick="deleteCardById('${card.dataset.cardId || card.id}')" style="color: #EF4444;">
                <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                <span>삭제</span>
            </div>
        `;
        
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        
        document.body.appendChild(menu);
        
        if (window.lucide) lucide.createIcons();
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    });
    
    card.dataset.contextMenu = 'true';
}

function deleteCardById(cardId) {
    const card = document.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
    
    if (card && confirm('이 카드를 삭제하시겠습니까?')) {
        card.remove();
        recordHistory('delete', { cardId: cardId });
        showToast('카드가 삭제되었습니다');
        updateStatsPanel();
    }
}

// ============================================
// Canvas State Management
// ============================================

function saveCanvasState() {
    StorageManager.save('last_saved', new Date().toISOString());
    updateStatsPanel();
}

function loadCanvasState() {
    // Load settings
    const savedSettings = StorageManager.load('settings');
    if (savedSettings) {
        CanvasState.settings = savedSettings;
        
        // Sync checkboxes with loaded settings
        const showGridCheckbox = document.getElementById('showGrid');
        const snapToGridCheckbox = document.getElementById('snapToGrid');
        const autoSaveCheckbox = document.getElementById('autoSave');
        
        if (showGridCheckbox) showGridCheckbox.checked = savedSettings.showGrid !== false;
        if (snapToGridCheckbox) snapToGridCheckbox.checked = savedSettings.snapToGrid !== false;
        if (autoSaveCheckbox) autoSaveCheckbox.checked = savedSettings.autoSave !== false;
        
        applySettings();
    }
    
    // Load projects
    const savedProjects = StorageManager.load('projects');
    if (savedProjects) {
        CanvasState.projects = savedProjects;
        updateProjectsPanel();
    }
    
    // Load tasks
    const savedTasks = StorageManager.load('tasks');
    if (savedTasks) {
        CanvasState.tasks = savedTasks;
        updateTasksPanel();
    }
    
    // Load alerts
    const savedAlerts = StorageManager.load('alerts');
    if (savedAlerts) {
        CanvasState.alerts = savedAlerts;
        updateAlertsPanel();
    }
    
    // Load history
    const savedHistory = StorageManager.load('history');
    if (savedHistory) {
        CanvasState.history = savedHistory;
        CanvasState.historyIndex = savedHistory.length - 1;
        updateHistoryPanel();
    }
    
    // Load current project
    const currentProject = StorageManager.load('current_project');
    if (currentProject) {
        CanvasState.currentProject = currentProject;
    }
}

// ============================================
// Initialize - Auto-attach to existing cards
// ============================================

function initializeFullFunctionality() {
    console.log('🚀 Initializing MuseFlow Canvas Full Functionality v22.0.0');
    
    // Load saved state
    loadCanvasState();
    
    // Initialize demo data if first time
    if (CanvasState.projects.length === 0) {
        CanvasState.projects = [
            { id: 'project-1', name: '뮤지엄 전시 프로젝트', createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
            { id: 'project-2', name: '예술 작품 아카이브', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'project-3', name: '관람객 경험 디자인', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString() }
        ];
        updateProjectsPanel();
    }
    
    if (CanvasState.tasks.length === 0) {
        CanvasState.tasks = [
            { id: 'task-1', title: '홍보 영상 편집 완료', deadline: '오늘', completed: false, createdAt: new Date().toISOString() },
            { id: 'task-2', title: '오디오 가이드 녹음', deadline: '완료됨', completed: true, createdAt: new Date().toISOString() },
            { id: 'task-3', title: '포스터 디자인 승인', deadline: '내일', completed: false, createdAt: new Date().toISOString() }
        ];
        updateTasksPanel();
    }
    
    if (CanvasState.alerts.length === 0) {
        CanvasState.alerts = [
            { id: 'alert-1', type: 'error', title: '프로젝트 마감일 임박', message: '뮤지엄 전시 - 2일 남음', timestamp: new Date().toISOString(), read: false },
            { id: 'alert-2', type: 'info', title: '새로운 업데이트', message: 'Canvas v22 기능 추가됨', timestamp: new Date().toISOString(), read: false },
            { id: 'alert-3', type: 'success', title: '작업 완료', message: '오디오 가이드 녹음 완료됨', timestamp: new Date().toISOString(), read: false }
        ];
        updateAlertsPanel();
    }
    
    // Attach context menu to existing cards
    const existingCards = document.querySelectorAll('.card');
    existingCards.forEach(card => addCardContextMenu(card));
    
    // Enable connection mode for cards
    enableCardConnectionMode();
    
    // Update stats panel
    updateStatsPanel();
    
    // Auto-save every 30 seconds if enabled
    if (CanvasState.settings.autoSave) {
        setInterval(() => {
            saveProject();
        }, 30000);
    }
    
    // Observer for new cards
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('card')) {
                    addCardContextMenu(node);
                }
            });
        });
        
        // Update connection listeners
        enableCardConnectionMode();
    });
    
    const canvas = document.querySelector('.canvas');
    if (canvas) {
        observer.observe(canvas, { childList: true, subtree: true });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        
        // Ctrl/Cmd + Shift + Z = Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            redo();
        }
        
        // Ctrl/Cmd + S = Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
        }
        
        // Ctrl/Cmd + N = New Card
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewCard();
        }
        
        // Ctrl/Cmd + L = Arrange Layout
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            arrangeLayout();
        }
        
        // C key = Enable connection mode
        if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
            if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                enableConnectionMode();
            }
        }
        
        // Escape = Disable connection mode
        if (e.key === 'Escape' && connectionMode) {
            disableConnectionMode();
            showToast('연결 모드 해제', 'info');
        }
    });
    
    console.log('✅ Canvas Full Functionality Initialized');
    console.log('   • Left Sidebar: History, Actions, Projects, Settings');
    console.log('   • Right Sidebar: Stats, Widget, Tasks, AI, Alerts');
    console.log('   • Node Connections: Enabled (Press C key)');
    console.log('   • Card Actions: Copy, Notion, Figma (Right-click card)');
    console.log('   • Keyboard Shortcuts: Ctrl+Z/Shift+Z, Ctrl+S, Ctrl+N, Ctrl+L');
}

// ============================================
// Inject CSS Styles
// ============================================

const fullFunctionalityStyles = `
<style>
/* Toast Notification */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
}

.toast-notification.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 4px solid #22C55E;
}

.toast-error {
    border-left: 4px solid #EF4444;
}

.toast-info {
    border-left: 4px solid #3B82F6;
}

/* Card Context Menu */
.card-context-menu {
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    padding: 0.5rem 0;
    z-index: 10000;
    min-width: 200px;
}

.context-menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    color: #374151;
    font-size: 0.875rem;
}

.context-menu-item:hover {
    background: #F3F4F6;
}

.context-menu-divider {
    height: 1px;
    background: #E5E7EB;
    margin: 0.5rem 0;
}

/* Connection Mode */
body.connection-mode {
    cursor: crosshair !important;
}

body.connection-mode .card:hover {
    outline: 2px solid #8B5CF6;
    outline-offset: 2px;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', fullFunctionalityStyles);

// ============================================
// Auto-initialize when DOM is ready
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFullFunctionality);
} else {
    initializeFullFunctionality();
}

// Make functions globally available
window.createNewCard = createNewCard;
window.uploadFile = uploadFile;
window.arrangeLayout = arrangeLayout;
window.saveProject = saveProject;
window.loadProject = loadProject;
window.createNewProject = createNewProject;
window.deleteProject = deleteProject;
window.toggleTaskComplete = toggleTaskComplete;
window.addNewTask = addNewTask;
window.deleteTask = deleteTask;
window.addAlert = addAlert;
window.markAlertAsRead = markAlertAsRead;
window.deleteAlert = deleteAlert;
window.undo = undo;
window.redo = redo;
window.saveSettings = saveSettings;
window.copyCard = copyCard;
window.exportToNotion = exportToNotion;
window.exportToFigma = exportToFigma;
window.duplicateCard = duplicateCard;
window.deleteCardById = deleteCardById;
window.enableConnectionMode = enableConnectionMode;
window.disableConnectionMode = disableConnectionMode;
window.createConnection = createConnection;
window.updateStatsPanel = updateStatsPanel;

console.log('✅ MuseFlow Canvas - Full Functionality v22.0.0 Loaded');
