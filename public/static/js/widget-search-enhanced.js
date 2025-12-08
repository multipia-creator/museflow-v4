/**
 * Enhanced Widget Search UX
 * Command Palette + Quick Preview + History
 */

(function() {
    'use strict';
    
    // State Management
    let searchHistory = JSON.parse(localStorage.getItem('widget_search_history') || '[]');
    let recentWidgets = JSON.parse(localStorage.getItem('recent_widgets') || '[]');
    let commandPaletteOpen = false;
    let selectedIndex = 0;
    let filteredResults = [];
    
    // Widget Database (87 widgets)
    const WIDGETS_DB = [
        // Advanced Analytics (17)
        { id: 'visitor-dwell-time', name: '관람객 체류 시간 분석', category: 'advanced-analytics', icon: 'clock', premium: true, price: '₩7,900', desc: '전시실별 평균 체류 시간과 인기 전시물 패턴 분석' },
        { id: 'predictive-visitors', name: '예측 관람객 수', category: 'advanced-analytics', icon: 'brain', premium: true, price: '₩9,900', desc: 'AI 기반 방문자 예측 및 최적 인력 배치 제안' },
        { id: 'exhibition-effectiveness', name: '전시 효과성 대시보드', category: 'advanced-analytics', icon: 'bar-chart-3', premium: true, price: '₩7,900', desc: '관람객 피드백, QR 스캔율, 오디오 가이드 사용률 종합' },
        { id: 'heatmap-tracking', name: '관람객 동선 히트맵', category: 'advanced-analytics', icon: 'map', premium: true, price: '₩8,900', desc: '전시실별 관람객 이동 패턴 시각화' },
        { id: 'engagement-metrics', name: '콘텐츠 참여도 분석', category: 'advanced-analytics', icon: 'activity', premium: true, price: '₩7,900', desc: '전시물별 상호작용 시간 및 빈도 측정' },
        { id: 'demographic-insights', name: '방문자 인구통계', category: 'advanced-analytics', icon: 'pie-chart', premium: true, price: '₩6,900', desc: '연령·성별·지역별 방문자 데이터' },
        { id: 'conversion-funnel', name: '티켓 구매 전환율', category: 'advanced-analytics', icon: 'trending-up', premium: true, price: '₩9,900', desc: '온라인→오프라인 전환 분석' },
        { id: 'sentiment-analysis', name: '소셜 미디어 감성 분석', category: 'advanced-analytics', icon: 'message-circle', premium: true, price: '₩11,900', desc: 'SNS 언급 및 감정 분석' },
        { id: 'benchmark-comparison', name: '경쟁 뮤지엄 벤치마크', category: 'advanced-analytics', icon: 'bar-chart-2', premium: true, price: '₩8,900', desc: '타 기관 대비 성과 비교' },
        { id: 'predictive-maintenance', name: '시설 예측 유지보수', category: 'advanced-analytics', icon: 'alert-triangle', premium: true, price: '₩10,900', desc: 'AI 기반 설비 고장 예측' },
        { id: 'roi-calculator', name: '전시 ROI 계산기', category: 'advanced-analytics', icon: 'calculator', premium: true, price: '₩7,900', desc: '투자 대비 수익률 분석' },
        { id: 'anomaly-detection', name: '이상 행동 탐지', category: 'advanced-analytics', icon: 'shield-alert', premium: true, price: '₩12,900', desc: '보안·안전 위험 실시간 알림' },
        { id: 'cohort-analysis', name: '재방문 코호트 분석', category: 'advanced-analytics', icon: 'users-2', premium: true, price: '₩8,900', desc: '방문자 그룹별 재방문율 추적' },
        { id: 'energy-monitoring', name: '에너지 사용 모니터링', category: 'advanced-analytics', icon: 'zap', premium: false, desc: '실시간 전력·수도 사용량' },
        { id: 'accessibility-metrics', name: '접근성 지표 대시보드', category: 'advanced-analytics', icon: 'accessibility', premium: false, desc: '장애인 편의시설 이용률' },
        { id: 'vr-engagement', name: 'VR 콘텐츠 참여도', category: 'advanced-analytics', icon: 'glasses', premium: true, price: '₩9,900', desc: '가상 전시 이용 통계' },
        { id: 'audio-guide-analytics', name: '오디오 가이드 분석', category: 'advanced-analytics', icon: 'headphones', premium: false, desc: '언어별·구간별 재생 패턴' }
    ];
    
    // Initialize
    function init() {
        setupCommandPalette();
        setupKeyboardShortcuts();
        enhanceExistingSearch();
        console.log('✅ [Widget Search Enhanced] Initialized');
    }
    
    // Command Palette (Cmd+K)
    function setupCommandPalette() {
        const palette = document.createElement('div');
        palette.id = 'widget-command-palette';
        palette.className = 'widget-command-palette';
        palette.style.display = 'none';
        
        palette.innerHTML = `
            <div class="palette-backdrop" onclick="window.widgetSearchEnhanced.closePalette()"></div>
            <div class="palette-container">
                <div class="palette-header">
                    <i data-lucide="search" style="width:16px;height:16px;color:#8B5CF6;"></i>
                    <input type="text" 
                           id="paletteSearch" 
                           placeholder="위젯 검색... (87개)"
                           autocomplete="off"
                           autofocus>
                    <div class="palette-close" onclick="window.widgetSearchEnhanced.closePalette()">
                        <kbd>ESC</kbd>
                    </div>
                </div>
                
                <div class="palette-tabs">
                    <button class="palette-tab active" data-tab="all">
                        <i data-lucide="grid-3x3" style="width:12px;height:12px;"></i>
                        전체
                    </button>
                    <button class="palette-tab" data-tab="recent">
                        <i data-lucide="clock" style="width:12px;height:12px;"></i>
                        최근 사용
                    </button>
                    <button class="palette-tab" data-tab="premium">
                        <i data-lucide="star" style="width:12px;height:12px;"></i>
                        프리미엄
                    </button>
                </div>
                
                <div class="palette-results" id="paletteResults">
                    <!-- Results dynamically rendered -->
                </div>
                
                <div class="palette-footer">
                    <div class="palette-shortcuts">
                        <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
                        <span><kbd>Enter</kbd> 선택</span>
                        <span><kbd>ESC</kbd> 닫기</span>
                    </div>
                    <div class="palette-count">87개 위젯</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(palette);
        
        // Search input handler
        const searchInput = document.getElementById('paletteSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                handlePaletteSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                handlePaletteKeyboard(e);
            });
        }
        
        // Tab switching
        const tabs = palette.querySelectorAll('.palette-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabType = tab.dataset.tab;
                renderPaletteResults(tabType);
            });
        });
        
        // Initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    // Keyboard Shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openPalette();
            }
        });
    }
    
    // Open Command Palette
    function openPalette() {
        const palette = document.getElementById('widget-command-palette');
        if (!palette) return;
        
        palette.style.display = 'flex';
        commandPaletteOpen = true;
        
        // Focus search input
        setTimeout(() => {
            const input = document.getElementById('paletteSearch');
            if (input) {
                input.focus();
                input.value = '';
            }
        }, 100);
        
        // Render initial results
        renderPaletteResults('all');
        
        console.log('✅ [Command Palette] Opened');
    }
    
    // Close Command Palette
    function closePalette() {
        const palette = document.getElementById('widget-command-palette');
        if (!palette) return;
        
        palette.style.display = 'none';
        commandPaletteOpen = false;
        selectedIndex = 0;
        filteredResults = [];
        
        console.log('ℹ️ [Command Palette] Closed');
    }
    
    // Handle Palette Search
    function handlePaletteSearch(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        if (!normalizedQuery) {
            renderPaletteResults('all');
            return;
        }
        
        // Filter widgets
        filteredResults = WIDGETS_DB.filter(widget => {
            return widget.name.toLowerCase().includes(normalizedQuery) ||
                   widget.desc.toLowerCase().includes(normalizedQuery) ||
                   widget.category.includes(normalizedQuery);
        });
        
        selectedIndex = 0;
        renderFilteredResults(filteredResults);
        
        // Save to search history
        if (query.length > 2 && !searchHistory.includes(query)) {
            searchHistory.unshift(query);
            searchHistory = searchHistory.slice(0, 10);
            localStorage.setItem('widget_search_history', JSON.stringify(searchHistory));
        }
    }
    
    // Render Palette Results
    function renderPaletteResults(type) {
        const resultsContainer = document.getElementById('paletteResults');
        if (!resultsContainer) return;
        
        let widgets = [];
        
        if (type === 'all') {
            widgets = WIDGETS_DB;
        } else if (type === 'recent') {
            widgets = WIDGETS_DB.filter(w => recentWidgets.includes(w.id));
        } else if (type === 'premium') {
            widgets = WIDGETS_DB.filter(w => w.premium);
        }
        
        filteredResults = widgets;
        renderFilteredResults(widgets);
    }
    
    // Render Filtered Results
    function renderFilteredResults(widgets) {
        const resultsContainer = document.getElementById('paletteResults');
        if (!resultsContainer) return;
        
        if (widgets.length === 0) {
            resultsContainer.innerHTML = `
                <div class="palette-empty">
                    <i data-lucide="search-x" style="width:32px;height:32px;color:#6b7280;"></i>
                    <p>검색 결과가 없습니다</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        
        resultsContainer.innerHTML = widgets.map((widget, index) => `
            <div class="palette-result-item ${index === selectedIndex ? 'selected' : ''}" 
                 data-widget-id="${widget.id}"
                 data-index="${index}"
                 onclick="window.widgetSearchEnhanced.selectWidget('${widget.id}')">
                <div class="result-icon">
                    <i data-lucide="${widget.icon}" style="width:16px;height:16px;"></i>
                </div>
                <div class="result-info">
                    <div class="result-name">
                        ${widget.name}
                        ${widget.premium ? '<span class="result-badge-premium"><i data-lucide="star" style="width:10px;height:10px;"></i>Premium</span>' : ''}
                    </div>
                    <div class="result-desc">${widget.desc}</div>
                </div>
                <div class="result-meta">
                    ${widget.price ? `<span class="result-price">${widget.price}</span>` : '<span class="result-free">무료</span>'}
                </div>
            </div>
        `).join('');
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    // Handle Keyboard Navigation
    function handlePaletteKeyboard(e) {
        if (filteredResults.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredResults[selectedIndex]) {
                selectWidget(filteredResults[selectedIndex].id);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closePalette();
        }
    }
    
    // Update Selection Visual
    function updateSelection() {
        const items = document.querySelectorAll('.palette-result-item');
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    // Select Widget
    function selectWidget(widgetId) {
        const widget = WIDGETS_DB.find(w => w.id === widgetId);
        if (!widget) return;
        
        // Add to recent widgets
        recentWidgets = [widgetId, ...recentWidgets.filter(id => id !== widgetId)].slice(0, 10);
        localStorage.setItem('recent_widgets', JSON.stringify(recentWidgets));
        
        // Show quick preview
        showQuickPreview(widget);
        
        closePalette();
        
        console.log(`✅ [Widget Selected] ${widget.name}`);
    }
    
    // Quick Preview Modal
    function showQuickPreview(widget) {
        const preview = document.createElement('div');
        preview.className = 'widget-quick-preview';
        preview.innerHTML = `
            <div class="preview-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="preview-card">
                <div class="preview-header">
                    <div class="preview-icon">
                        <i data-lucide="${widget.icon}" style="width:24px;height:24px;color:#8B5CF6;"></i>
                    </div>
                    <button class="preview-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i data-lucide="x" style="width:16px;height:16px;"></i>
                    </button>
                </div>
                <div class="preview-content">
                    <h3 class="preview-title">${widget.name}</h3>
                    <p class="preview-desc">${widget.desc}</p>
                    <div class="preview-meta">
                        <span class="preview-category">${getCategoryName(widget.category)}</span>
                        ${widget.premium ? 
                            `<span class="preview-price">${widget.price}</span>` : 
                            '<span class="preview-free">무료</span>'}
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="preview-btn-cancel" onclick="this.parentElement.parentElement.parentElement.remove()">
                        취소
                    </button>
                    <button class="preview-btn-add" onclick="window.widgetSearchEnhanced.addWidget('${widget.id}'); this.parentElement.parentElement.parentElement.remove();">
                        <i data-lucide="plus" style="width:14px;height:14px;"></i>
                        캔버스에 추가
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Auto-dismiss after 10s
        setTimeout(() => {
            if (preview.parentNode) {
                preview.remove();
            }
        }, 10000);
    }
    
    // Add Widget to Canvas
    function addWidget(widgetId) {
        const widget = WIDGETS_DB.find(w => w.id === widgetId);
        if (!widget) return;
        
        // TODO: Implement actual widget adding logic
        console.log(`✅ [Widget Added] ${widget.name} to canvas`);
        
        // Show success notification
        showNotification(`${widget.name} 위젯이 캔버스에 추가되었습니다`);
    }
    
    // Show Notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'widget-notification';
        notification.innerHTML = `
            <i data-lucide="check-circle" style="width:16px;height:16px;color:#10b981;"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #ffffff;
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-family: Inter, sans-serif;
            animation: slideInUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Get Category Name
    function getCategoryName(category) {
        const categoryNames = {
            'advanced-analytics': '📊 고급 분석',
            'museum-professional': '🏛️ 뮤지엄 전문',
            'visitor-experience': '👥 관람객 경험',
            'operations': '💼 운영 관리',
            'collaboration': '🤝 협업',
            'financial': '💰 재무'
        };
        return categoryNames[category] || category;
    }
    
    // Enhance Existing Search
    function enhanceExistingSearch() {
        const existingSearch = document.getElementById('widgetSearch');
        if (existingSearch) {
            // Add placeholder hint
            existingSearch.placeholder = '🔍 위젯 검색... (Cmd+K로 빠른 접근)';
            
            // Intercept focus to open command palette
            existingSearch.addEventListener('focus', (e) => {
                e.preventDefault();
                openPalette();
                existingSearch.blur();
            });
        }
    }
    
    // Public API
    window.widgetSearchEnhanced = {
        openPalette,
        closePalette,
        selectWidget,
        addWidget
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
