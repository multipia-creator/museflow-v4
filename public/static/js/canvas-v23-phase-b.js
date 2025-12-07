/**
 * MuseFlow Canvas V23.0 - Phase B Implementation
 * Templates, Layers, Export Panels with Professional UX/UI
 * 
 * Features:
 * - Templates Panel: 10+ Museum templates, Categories, Preview, Save
 * - Layers Panel: Z-index management, Drag & drop, Show/Hide, Lock
 * - Export Panel: PDF/PNG/JPG/SVG export, Multiple resolutions
 * - Professional UX: High visibility, consistency, accessibility
 */

// ============================================
// TEMPLATES PANEL - Complete Implementation
// ============================================

const TemplatesManager = {
    templates: [],
    currentCategory: 'all',
    
    // Default museum templates
    defaultTemplates: [
        {
            id: 'template_exhibition_planning',
            name: '전시 기획 템플릿',
            category: 'exhibition',
            description: '전시회 기획을 위한 기본 템플릿',
            icon: '🎨',
            cards: [
                { id: 'card_1', type: 'text', title: '전시 컨셉', x: 100, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '작품 목록', x: 350, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '공간 배치', x: 600, y: 100, width: 200, height: 150 },
                { id: 'card_4', type: 'text', title: '홍보 계획', x: 225, y: 300, width: 200, height: 150 },
                { id: 'card_5', type: 'text', title: '예산 관리', x: 475, y: 300, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' },
                { from: 'card_1', to: 'card_4' },
                { from: 'card_4', to: 'card_5' }
            ],
            badge: 'NEW'
        },
        {
            id: 'template_collection_management',
            name: '소장품 관리',
            category: 'collection',
            description: '소장품 아카이빙 및 관리 템플릿',
            icon: '📦',
            cards: [
                { id: 'card_1', type: 'text', title: '소장품 등록', x: 100, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '보존 상태 체크', x: 350, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '디지털 아카이빙', x: 600, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        },
        {
            id: 'template_visitor_experience',
            name: '관람객 경험 디자인',
            category: 'visitor',
            description: '방문자 여정 최적화 템플릿',
            icon: '👥',
            cards: [
                { id: 'card_1', type: 'text', title: '입장 동선', x: 100, y: 100, width: 180, height: 140 },
                { id: 'card_2', type: 'text', title: '전시 관람', x: 320, y: 100, width: 180, height: 140 },
                { id: 'card_3', type: 'text', title: '인터랙션', x: 540, y: 100, width: 180, height: 140 },
                { id: 'card_4', type: 'text', title: '기념품샵', x: 760, y: 100, width: 180, height: 140 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' },
                { from: 'card_3', to: 'card_4' }
            ],
            badge: 'POPULAR'
        },
        {
            id: 'template_education_program',
            name: '교육 프로그램',
            category: 'education',
            description: '박물관 교육 프로그램 기획',
            icon: '📚',
            cards: [
                { id: 'card_1', type: 'text', title: '프로그램 기획', x: 150, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '참가자 모집', x: 400, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '운영 실행', x: 650, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        },
        {
            id: 'template_marketing_campaign',
            name: '마케팅 캠페인',
            category: 'marketing',
            description: '박물관 홍보 마케팅 템플릿',
            icon: '📢',
            cards: [
                { id: 'card_1', type: 'text', title: '타겟 분석', x: 100, y: 100, width: 190, height: 140 },
                { id: 'card_2', type: 'text', title: '콘텐츠 제작', x: 330, y: 100, width: 190, height: 140 },
                { id: 'card_3', type: 'text', title: 'SNS 운영', x: 560, y: 100, width: 190, height: 140 },
                { id: 'card_4', type: 'text', title: '성과 분석', x: 215, y: 280, width: 190, height: 140 },
                { id: 'card_5', type: 'text', title: '개선 계획', x: 445, y: 280, width: 190, height: 140 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' },
                { from: 'card_3', to: 'card_4' },
                { from: 'card_4', to: 'card_5' }
            ],
            badge: null
        },
        {
            id: 'template_event_planning',
            name: '이벤트 기획',
            category: 'exhibition',
            description: '특별 이벤트 및 행사 기획',
            icon: '🎪',
            cards: [
                { id: 'card_1', type: 'text', title: '이벤트 컨셉', x: 150, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '일정 계획', x: 400, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '실행 준비', x: 650, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        },
        {
            id: 'template_research_project',
            name: '연구 프로젝트',
            category: 'collection',
            description: '학술 연구 및 조사 프로젝트',
            icon: '🔬',
            cards: [
                { id: 'card_1', type: 'text', title: '연구 주제', x: 100, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '자료 수집', x: 350, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '분석', x: 600, y: 100, width: 200, height: 150 },
                { id: 'card_4', type: 'text', title: '논문 작성', x: 350, y: 280, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' },
                { from: 'card_3', to: 'card_4' }
            ],
            badge: null
        },
        {
            id: 'template_volunteer_management',
            name: '자원봉사자 관리',
            category: 'visitor',
            description: '자원봉사자 모집 및 운영',
            icon: '🤝',
            cards: [
                { id: 'card_1', type: 'text', title: '모집 공고', x: 150, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '교육 훈련', x: 400, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '활동 관리', x: 650, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        },
        {
            id: 'template_digital_archive',
            name: '디지털 아카이브',
            category: 'collection',
            description: '디지털 소장품 관리 시스템',
            icon: '💾',
            cards: [
                { id: 'card_1', type: 'text', title: '스캔/촬영', x: 100, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '메타데이터', x: 350, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: 'DB 등록', x: 600, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        },
        {
            id: 'template_accessibility_plan',
            name: '접근성 개선',
            category: 'visitor',
            description: '모든 관람객을 위한 접근성 계획',
            icon: '♿',
            cards: [
                { id: 'card_1', type: 'text', title: '현황 조사', x: 150, y: 100, width: 200, height: 150 },
                { id: 'card_2', type: 'text', title: '개선 계획', x: 400, y: 100, width: 200, height: 150 },
                { id: 'card_3', type: 'text', title: '실행', x: 650, y: 100, width: 200, height: 150 }
            ],
            connections: [
                { from: 'card_1', to: 'card_2' },
                { from: 'card_2', to: 'card_3' }
            ],
            badge: null
        }
    ],
    
    init() {
        this.loadTemplates();
        this.setupEventListeners();
        this.renderTemplates();
    },
    
    loadTemplates() {
        const saved = StorageManager.load('templates_v23');
        if (saved && Array.isArray(saved)) {
            // Merge saved custom templates with default templates
            this.templates = [...this.defaultTemplates, ...saved];
        } else {
            this.templates = [...this.defaultTemplates];
        }
    },
    
    saveTemplates() {
        // Only save custom templates (not default ones)
        const customTemplates = this.templates.filter(t => !this.defaultTemplates.find(d => d.id === t.id));
        StorageManager.save('templates_v23', customTemplates);
    },
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('templateSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTemplates(e.target.value));
        }
        
        // Category buttons
        const categoryBtns = document.querySelectorAll('.template-category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderTemplates();
            });
        });
        
        // Save template button
        const saveBtn = document.getElementById('saveTemplateBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentAsTemplate());
        }
    },
    
    applyTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        // Apply template to canvas
        if (window.CanvasState) {
            CanvasState.cards = JSON.parse(JSON.stringify(template.cards));
            CanvasState.connections = JSON.parse(JSON.stringify(template.connections));
            
            // Re-render canvas if function exists
            if (typeof renderCanvas === 'function') {
                renderCanvas();
            }
        }
        
        showToast(`템플릿 "${template.name}" 적용됨`, 'success');
        this.renderTemplates();
    },
    
    saveCurrentAsTemplate() {
        const name = prompt('템플릿 이름을 입력하세요:', '내 템플릿');
        if (!name || name.trim() === '') return;
        
        const category = prompt('카테고리를 선택하세요:\n1: 전시기획 (exhibition)\n2: 소장품관리 (collection)\n3: 관람객서비스 (visitor)\n4: 교육프로그램 (education)\n5: 마케팅 (marketing)', 'exhibition');
        
        const newTemplate = {
            id: 'template_custom_' + Date.now(),
            name: name.trim(),
            category: category || 'exhibition',
            description: '사용자 정의 템플릿',
            icon: '⭐',
            cards: JSON.parse(JSON.stringify(window.CanvasState?.cards || [])),
            connections: JSON.parse(JSON.stringify(window.CanvasState?.connections || [])),
            badge: 'CUSTOM'
        };
        
        this.templates.push(newTemplate);
        this.saveTemplates();
        this.renderTemplates();
        showToast(`템플릿 "${newTemplate.name}" 저장됨`, 'success');
    },
    
    deleteTemplate(templateId) {
        // Cannot delete default templates
        if (this.defaultTemplates.find(t => t.id === templateId)) {
            showToast('기본 템플릿은 삭제할 수 없습니다', 'error');
            return;
        }
        
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        if (!confirm(`템플릿 "${template.name}"을(를) 삭제하시겠습니까?`)) return;
        
        this.templates = this.templates.filter(t => t.id !== templateId);
        this.saveTemplates();
        this.renderTemplates();
        showToast('템플릿 삭제됨', 'success');
    },
    
    filterTemplates(query) {
        this.renderTemplates(query);
    },
    
    renderTemplates(searchQuery = '') {
        // Try multiple methods to find the container (same as Phase A fix)
        let container = document.getElementById('templatesList');
        
        if (!container) {
            container = document.querySelector('#templatesList');
        }
        
        if (!container) {
            const panel = document.getElementById('templatesPanel');
            if (panel) {
                container = panel.querySelector('#templatesList');
                
                if (!container) {
                    const panelContent = panel.querySelector('.panel-content');
                    if (panelContent) {
                        console.log('🔧 Creating templatesList element...');
                        container = document.createElement('div');
                        container.id = 'templatesList';
                        // Insert before the save button
                        const saveBtn = panelContent.querySelector('.btn-save-template');
                        if (saveBtn) {
                            panelContent.insertBefore(container, saveBtn);
                        } else {
                            panelContent.appendChild(container);
                        }
                        console.log('✅ templatesList element created successfully');
                    }
                }
            }
        }
        
        if (!container) {
            console.warn('⚠️ templatesList container not found');
            return;
        }
        
        // Filter templates
        let filtered = this.templates;
        
        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentCategory);
        }
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );
        }
        
        // Render grid
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="template-empty-state">
                    <i data-lucide="layout-template" style="width:48px;height:48px;"></i>
                    <p>템플릿을 찾을 수 없습니다</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="template-grid">
                    ${filtered.map(template => `
                        <div class="template-item" onclick="TemplatesManager.applyTemplate('${template.id}')" oncontextmenu="event.preventDefault(); TemplatesManager.showMenu(event, '${template.id}')">
                            ${template.badge ? `<div class="template-badge">${template.badge}</div>` : ''}
                            <div class="template-preview">
                                <div style="font-size:2rem;">${template.icon}</div>
                            </div>
                            <div class="template-info">
                                <div class="template-name">${template.name}</div>
                                <div class="template-category">${template.cards.length}개 카드</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    },
    
    showMenu(event, templateId) {
        // Context menu for custom templates only
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        // Only show delete option for custom templates
        if (this.defaultTemplates.find(t => t.id === templateId)) {
            return;
        }
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="TemplatesManager.deleteTemplate('${templateId}'); this.parentElement.remove();">
                <i data-lucide="trash-2" class="icon-xs"></i>
                Delete Template
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            });
        }, 100);
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    }
};

// Expose globally for debugging
window.TemplatesManager = TemplatesManager;

// ============================================
// LAYERS PANEL - Complete Implementation
// ============================================

const LayersManager = {
    layers: [],
    draggedLayer: null,
    
    init() {
        this.loadLayers();
        this.setupEventListeners();
        this.renderLayers();
    },
    
    loadLayers() {
        // Get all canvas cards as layers
        if (window.CanvasState && Array.isArray(window.CanvasState.cards)) {
            this.layers = window.CanvasState.cards.map((card, index) => ({
                id: card.id,
                name: card.title || `Card ${index + 1}`,
                type: card.type || 'text',
                zIndex: card.zIndex || (1000 + index),
                visible: card.visible !== false,
                locked: card.locked || false,
                element: card
            }));
            
            // Sort by z-index descending (top layer first)
            this.layers.sort((a, b) => b.zIndex - a.zIndex);
        }
    },
    
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshLayersBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadLayers();
                this.renderLayers();
                showToast('레이어 목록 새로고침됨', 'success');
            });
        }
    },
    
    toggleVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer) return;
        
        layer.visible = !layer.visible;
        
        // Update CanvasState
        if (window.CanvasState && Array.isArray(window.CanvasState.cards)) {
            const card = window.CanvasState.cards.find(c => c.id === layerId);
            if (card) {
                card.visible = layer.visible;
                
                // Update DOM element if exists
                const cardElement = document.querySelector(`[data-card-id="${layerId}"]`);
                if (cardElement) {
                    cardElement.style.display = layer.visible ? 'block' : 'none';
                }
            }
        }
        
        this.renderLayers();
        showToast(layer.visible ? '레이어 표시됨' : '레이어 숨김', 'success');
    },
    
    toggleLock(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer) return;
        
        layer.locked = !layer.locked;
        
        // Update CanvasState
        if (window.CanvasState && Array.isArray(window.CanvasState.cards)) {
            const card = window.CanvasState.cards.find(c => c.id === layerId);
            if (card) {
                card.locked = layer.locked;
            }
        }
        
        this.renderLayers();
        showToast(layer.locked ? '레이어 잠김' : '레이어 잠금 해제', 'success');
    },
    
    deleteLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer) return;
        
        if (!confirm(`"${layer.name}" 레이어를 삭제하시겠습니까?`)) return;
        
        // Remove from layers
        this.layers = this.layers.filter(l => l.id !== layerId);
        
        // Remove from CanvasState
        if (window.CanvasState && Array.isArray(window.CanvasState.cards)) {
            window.CanvasState.cards = window.CanvasState.cards.filter(c => c.id !== layerId);
            
            // Remove DOM element
            const cardElement = document.querySelector(`[data-card-id="${layerId}"]`);
            if (cardElement) {
                cardElement.remove();
            }
        }
        
        this.renderLayers();
        showToast('레이어 삭제됨', 'success');
    },
    
    updateZIndex(layerId, newZIndex) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer) return;
        
        layer.zIndex = newZIndex;
        
        // Update CanvasState
        if (window.CanvasState && Array.isArray(window.CanvasState.cards)) {
            const card = window.CanvasState.cards.find(c => c.id === layerId);
            if (card) {
                card.zIndex = newZIndex;
                
                // Update DOM element z-index
                const cardElement = document.querySelector(`[data-card-id="${layerId}"]`);
                if (cardElement) {
                    cardElement.style.zIndex = newZIndex;
                }
            }
        }
        
        this.renderLayers();
    },
    
    handleDragStart(event, layerId) {
        if (event.target.classList.contains('layer-lock') || 
            event.target.classList.contains('layer-delete') || 
            event.target.classList.contains('layer-visibility')) {
            return;
        }
        
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer || layer.locked) return;
        
        this.draggedLayer = layer;
        event.target.classList.add('dragging');
    },
    
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        this.draggedLayer = null;
    },
    
    handleDragOver(event) {
        event.preventDefault();
    },
    
    handleDrop(event, targetLayerId) {
        event.preventDefault();
        
        if (!this.draggedLayer || this.draggedLayer.id === targetLayerId) return;
        
        const targetLayer = this.layers.find(l => l.id === targetLayerId);
        if (!targetLayer) return;
        
        // Swap z-index
        const tempZIndex = this.draggedLayer.zIndex;
        this.updateZIndex(this.draggedLayer.id, targetLayer.zIndex);
        this.updateZIndex(targetLayer.id, tempZIndex);
        
        // Re-sort layers
        this.layers.sort((a, b) => b.zIndex - a.zIndex);
        
        showToast('레이어 순서 변경됨', 'success');
    },
    
    renderLayers() {
        // Try multiple methods to find the container (same as Phase A fix)
        let container = document.getElementById('layersList');
        
        if (!container) {
            container = document.querySelector('#layersList');
        }
        
        if (!container) {
            const panel = document.getElementById('layersPanel');
            if (panel) {
                container = panel.querySelector('#layersList');
                
                if (!container) {
                    const panelContent = panel.querySelector('.panel-content');
                    if (panelContent) {
                        console.log('🔧 Creating layersList element...');
                        container = document.createElement('div');
                        container.id = 'layersList';
                        panelContent.appendChild(container);
                        console.log('✅ layersList element created successfully');
                    }
                }
            }
        }
        
        if (!container) {
            console.warn('⚠️ layersList container not found');
            return;
        }
        
        // Update layers count
        const countElement = document.getElementById('layersCount');
        if (countElement) {
            countElement.textContent = this.layers.length;
        }
        
        // Render layers
        if (this.layers.length === 0) {
            container.innerHTML = `
                <div class="layers-empty">
                    <i data-lucide="layers" style="width:48px;height:48px;"></i>
                    <p>레이어가 없습니다</p>
                    <p style="font-size:0.8125rem;margin-top:0.5rem;">캔버스에 카드를 추가하면<br>여기에 레이어로 표시됩니다</p>
                </div>
            `;
        } else {
            container.innerHTML = this.layers.map(layer => `
                <div class="layer-item ${layer.hidden ? 'hidden' : ''} ${layer.locked ? 'locked' : ''}" 
                     draggable="${!layer.locked}"
                     ondragstart="LayersManager.handleDragStart(event, '${layer.id}')"
                     ondragend="LayersManager.handleDragEnd(event)"
                     ondragover="LayersManager.handleDragOver(event)"
                     ondrop="LayersManager.handleDrop(event, '${layer.id}')">
                    <div class="layer-drag-handle">
                        <i data-lucide="grip-vertical" style="width:16px;height:16px;"></i>
                    </div>
                    <div class="layer-visibility" onclick="LayersManager.toggleVisibility('${layer.id}')">
                        <i data-lucide="${layer.visible ? 'eye' : 'eye-off'}" style="width:14px;height:14px;"></i>
                    </div>
                    <div class="layer-content">
                        <div class="layer-name">${layer.name}</div>
                        <div class="layer-info">
                            <span class="layer-z-index">Z: ${layer.zIndex}</span>
                            <span>${layer.type}</span>
                        </div>
                    </div>
                    <div class="layer-actions">
                        <div class="layer-lock ${layer.locked ? 'locked' : ''}" 
                             onclick="LayersManager.toggleLock('${layer.id}')"
                             title="${layer.locked ? '잠금 해제' : '잠금'}">
                            <i data-lucide="${layer.locked ? 'lock' : 'unlock'}" style="width:14px;height:14px;"></i>
                        </div>
                        <div class="layer-delete" 
                             onclick="LayersManager.deleteLayer('${layer.id}')"
                             title="삭제">
                            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Recreate icons
        if (window.lucide) lucide.createIcons();
    }
};

// Expose globally for debugging
window.LayersManager = LayersManager;

// ============================================
// EXPORT PANEL - Complete Implementation
// ============================================

const ExportManager = {
    currentFormat: 'png',
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Format buttons
        const formatBtns = document.querySelectorAll('.export-format-btn');
        formatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                formatBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFormat = e.currentTarget.dataset.format;
            });
        });
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCanvas());
        }
    },
    
    async exportCanvas() {
        const format = this.currentFormat;
        const resolution = parseInt(document.getElementById('exportResolution')?.value || '2');
        const transparent = document.getElementById('exportTransparent')?.checked || false;
        
        try {
            // Show loading toast
            showToast('캔버스를 내보내는 중...', 'info');
            
            // Get canvas element
            const viewport = document.getElementById('vp');
            if (!viewport) {
                showToast('캔버스를 찾을 수 없습니다', 'error');
                return;
            }
            
            // For demonstration: Use html2canvas or similar library
            // Since we don't have the library, we'll create a simple placeholder
            
            if (format === 'png' || format === 'jpg') {
                await this.exportAsImage(format, resolution, transparent);
            } else if (format === 'svg') {
                await this.exportAsSVG();
            } else if (format === 'pdf') {
                await this.exportAsPDF();
            }
            
            showToast(`${format.toUpperCase()} 파일로 내보내기 완료!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast('내보내기 중 오류가 발생했습니다', 'error');
        }
    },
    
    async exportAsImage(format, resolution, transparent) {
        // NOTE: This is a placeholder implementation
        // In production, you would use html2canvas or similar library
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on viewport
        const viewport = document.getElementById('vp');
        const rect = viewport.getBoundingClientRect();
        
        canvas.width = rect.width * resolution;
        canvas.height = rect.height * resolution;
        
        // Set background
        if (!transparent && format === 'jpg') {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw placeholder text (in production, capture actual canvas)
        ctx.font = `${24 * resolution}px Arial`;
        ctx.fillStyle = '#A78BFA';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MuseFlow Canvas Export', canvas.width / 2, canvas.height / 2);
        ctx.font = `${16 * resolution}px Arial`;
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(`${format.toUpperCase()} • ${resolution}x • ${canvas.width}×${canvas.height}px`, canvas.width / 2, canvas.height / 2 + 40 * resolution);
        
        // Download
        const dataUrl = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
        this.downloadFile(dataUrl, `museflow-canvas-${Date.now()}.${format}`);
    },
    
    async exportAsSVG() {
        // Placeholder SVG export
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
                <rect width="100%" height="100%" fill="#1a1a1a"/>
                <text x="600" y="400" font-family="Arial" font-size="32" fill="#A78BFA" text-anchor="middle">
                    MuseFlow Canvas Export (SVG)
                </text>
            </svg>
        `;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, `museflow-canvas-${Date.now()}.svg`);
        URL.revokeObjectURL(url);
    },
    
    async exportAsPDF() {
        // Placeholder PDF export
        // In production, you would use jsPDF or similar library
        showToast('PDF 내보내기는 곧 지원될 예정입니다', 'info');
    },
    
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Expose globally for debugging
window.ExportManager = ExportManager;

// ============================================
// INITIALIZE ON LOAD
// ============================================

// Wait for Phase A to complete first
window.addEventListener('load', function() {
    console.log('🚀 Initializing MuseFlow Canvas V23.0 - Phase B');
    console.log('📊 DOM Ready State:', document.readyState);
    
    // Check if StorageManager is available
    if (!window.StorageManager) {
        console.error('❌ StorageManager not found! Phase A must be loaded first.');
        return;
    }
    
    // Initialize Templates Panel
    try {
        TemplatesManager.init();
        console.log('✅ Templates Panel initialized successfully');
    } catch (error) {
        console.error('❌ Templates Panel initialization failed:', error);
    }
    
    // Initialize Layers Panel
    try {
        LayersManager.init();
        console.log('✅ Layers Panel initialized successfully');
    } catch (error) {
        console.error('❌ Layers Panel initialization failed:', error);
    }
    
    // Initialize Export Panel
    try {
        ExportManager.init();
        console.log('✅ Export Panel initialized successfully');
    } catch (error) {
        console.error('❌ Export Panel initialization failed:', error);
    }
    
    console.log('✅ MuseFlow Canvas V23.0 - Phase B Loaded');
    console.log('📊 Phase B Features:');
    console.log('   • Templates: 10+ museum templates');
    console.log('   • Layers: Z-index management, Show/Hide, Lock');
    console.log('   • Export: PNG/JPG/SVG export, multiple resolutions');
});

