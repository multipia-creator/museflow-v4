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
    
    console.log('✅ MuseFlow Canvas V23.0 - Phase B Loaded');
});

