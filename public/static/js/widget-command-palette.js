/**
 * Widget Command Palette - Figma-style Quick Access
 * Cmd+K / Ctrl+K for instant widget search
 */

(function() {
    'use strict';
    
    // Widget Data - 87 widgets (will be populated from existing panel)
    let allWidgets = [];
    
    // State Management
    const state = {
        selectedIndex: 0,
        filteredWidgets: [],
        isOpen: false,
        recentWidgets: [],
        favoriteWidgets: []
    };
    
    // DOM Elements
    let overlay = null;
    let searchInput = null;
    let resultsList = null;
    
    // Initialize
    function init() {
        loadWidgetsData();
        loadRecentWidgets();
        loadFavorites();
        setupKeyboardShortcuts();
        console.log('✅ [Command Palette] Initialized with', allWidgets.length, 'widgets');
    }
    
    // Load widgets from existing panel
    function loadWidgetsData() {
        const widgetElements = document.querySelectorAll('[data-widget-name]');
        allWidgets = Array.from(widgetElements).map(el => ({
            id: el.dataset.widgetId || el.dataset.widgetName.toLowerCase().replace(/\s+/g, '-'),
            name: el.dataset.widgetName,
            category: el.dataset.widgetCategory || 'Other',
            icon: el.dataset.widgetIcon || 'package',
            premium: el.dataset.widgetPremium === 'true',
            element: el
        }));
    }
    
    // LocalStorage Management
    function loadRecentWidgets() {
        try {
            const data = localStorage.getItem('widget_recent');
            state.recentWidgets = data ? JSON.parse(data) : [];
        } catch (e) {
            state.recentWidgets = [];
        }
    }
    
    function saveRecentWidget(widget) {
        // Remove if exists
        state.recentWidgets = state.recentWidgets.filter(w => w.id !== widget.id);
        
        // Add to front
        state.recentWidgets.unshift({
            id: widget.id,
            name: widget.name,
            category: widget.category,
            icon: widget.icon,
            lastUsed: Date.now()
        });
        
        // Keep only 5 recent
        state.recentWidgets = state.recentWidgets.slice(0, 5);
        
        localStorage.setItem('widget_recent', JSON.stringify(state.recentWidgets));
    }
    
    function loadFavorites() {
        try {
            const data = localStorage.getItem('widget_favorites');
            state.favoriteWidgets = data ? JSON.parse(data) : [];
        } catch (e) {
            state.favoriteWidgets = [];
        }
    }
    
    function toggleFavorite(widget) {
        const index = state.favoriteWidgets.findIndex(w => w.id === widget.id);
        
        if (index === -1) {
            // Add to favorites
            state.favoriteWidgets.push({
                id: widget.id,
                name: widget.name,
                category: widget.category,
                icon: widget.icon
            });
            showToast('⭐ 즐겨찾기에 추가됨');
        } else {
            // Remove from favorites
            state.favoriteWidgets.splice(index, 1);
            showToast('즐겨찾기에서 제거됨');
        }
        
        localStorage.setItem('widget_favorites', JSON.stringify(state.favoriteWidgets));
        
        // Re-render if palette is open
        if (state.isOpen) {
            renderResults();
        }
    }
    
    function isFavorite(widgetId) {
        return state.favoriteWidgets.some(w => w.id === widgetId);
    }
    
    // Open Command Palette
    function open() {
        if (state.isOpen) return;
        
        state.isOpen = true;
        state.selectedIndex = 0;
        
        createOverlay();
        search(''); // Show all widgets initially
        
        // Auto-focus input
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 50);
    }
    
    // Close Command Palette
    function close() {
        if (!state.isOpen) return;
        
        state.isOpen = false;
        
        if (overlay && overlay.parentNode) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.remove();
                }
                overlay = null;
                searchInput = null;
                resultsList = null;
            }, 150);
        }
    }
    
    // Create Overlay UI
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'command-palette-overlay';
        overlay.innerHTML = `
            <div class="command-palette" onclick="event.stopPropagation()">
                <div class="command-palette-header">
                    <i data-lucide="search" style="width: 18px; height: 18px; color: #3b82f6;"></i>
                    <input 
                        type="text" 
                        class="command-palette-input" 
                        placeholder="위젯 검색... (이름, 카테고리, 태그)"
                        autocomplete="off"
                        spellcheck="false"
                    />
                    <button class="command-palette-close" onclick="window.commandPalette.close()">
                        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
                <div class="command-palette-results" id="commandPaletteResults">
                    <!-- Results will be rendered here -->
                </div>
                <div class="command-palette-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
                    <span><kbd>Enter</kbd> 선택</span>
                    <span><kbd>Esc</kbd> 닫기</span>
                    <span><kbd>⭐</kbd> 즐겨찾기</span>
                </div>
            </div>
        `;
        
        // Styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
            opacity: 0;
            transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(overlay);
        
        // Get references
        searchInput = overlay.querySelector('.command-palette-input');
        resultsList = overlay.querySelector('#commandPaletteResults');
        
        // Event listeners
        searchInput.addEventListener('input', handleSearch);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        
        // Initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Add styles to document
        if (!document.getElementById('command-palette-styles')) {
            const styles = document.createElement('style');
            styles.id = 'command-palette-styles';
            styles.textContent = getCommandPaletteStyles();
            document.head.appendChild(styles);
        }
    }
    
    // Handle Search Input
    function handleSearch(e) {
        const query = e.target.value.trim();
        search(query);
    }
    
    // Fuzzy Search Implementation
    function search(query) {
        state.selectedIndex = 0;
        
        if (!query) {
            // Show favorites + recent + all
            state.filteredWidgets = [...allWidgets];
        } else {
            // Fuzzy search
            const lowerQuery = query.toLowerCase();
            state.filteredWidgets = allWidgets.filter(widget => {
                const nameMatch = widget.name.toLowerCase().includes(lowerQuery);
                const categoryMatch = widget.category.toLowerCase().includes(lowerQuery);
                return nameMatch || categoryMatch;
            });
            
            // Sort by relevance
            state.filteredWidgets.sort((a, b) => {
                const aIndex = a.name.toLowerCase().indexOf(lowerQuery);
                const bIndex = b.name.toLowerCase().indexOf(lowerQuery);
                
                // Exact match first
                if (aIndex === 0 && bIndex !== 0) return -1;
                if (bIndex === 0 && aIndex !== 0) return 1;
                
                // Then by index
                if (aIndex !== bIndex) return aIndex - bIndex;
                
                // Then alphabetically
                return a.name.localeCompare(b.name);
            });
        }
        
        renderResults();
    }
    
    // Render Results
    function renderResults() {
        if (!resultsList) return;
        
        let html = '';
        
        // AI Recommendations Section (NEW!)
        if (!searchInput.value && window.aiRecommendation) {
            const recommendations = window.aiRecommendation.getRecommendations(allWidgets, 5);
            if (recommendations.length > 0) {
                html += '<div class="command-section ai-recommendation-section">';
                html += '<div class="command-section-title">✨ AI 추천</div>';
                recommendations.forEach((rec, index) => {
                    const matchPercent = Math.round(rec.score * 100);
                    html += renderWidgetItem(rec.widget, false, false, -1, {
                        isAI: true,
                        reason: rec.reason,
                        matchPercent
                    });
                });
                html += '</div>';
            }
        }
        
        // Favorites Section
        if (state.favoriteWidgets.length > 0 && !searchInput.value) {
            html += '<div class="command-section">';
            html += '<div class="command-section-title">⭐ 즐겨찾기</div>';
            state.favoriteWidgets.forEach(widget => {
                html += renderWidgetItem(widget, true);
            });
            html += '</div>';
        }
        
        // Recent Section
        if (state.recentWidgets.length > 0 && !searchInput.value) {
            html += '<div class="command-section">';
            html += '<div class="command-section-title">🕒 최근 사용</div>';
            state.recentWidgets.forEach(widget => {
                html += renderWidgetItem(widget, false);
            });
            html += '</div>';
        }
        
        // All Widgets / Search Results
        const sectionTitle = searchInput.value 
            ? `검색 결과 (${state.filteredWidgets.length})`
            : `모든 위젯 (${state.filteredWidgets.length})`;
        
        html += '<div class="command-section">';
        html += `<div class="command-section-title">📦 ${sectionTitle}</div>`;
        
        if (state.filteredWidgets.length === 0) {
            html += '<div class="command-no-results">검색 결과가 없습니다</div>';
        } else {
            state.filteredWidgets.forEach((widget, index) => {
                const isSelected = index === state.selectedIndex;
                html += renderWidgetItem(widget, false, isSelected, index);
            });
        }
        
        html += '</div>';
        
        resultsList.innerHTML = html;
        
        // Scroll selected into view
        scrollSelectedIntoView();
        
        // Re-initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    // Render Widget Item
    function renderWidgetItem(widget, isFavSection = false, isSelected = false, dataIndex = -1, aiData = null) {
        const isFav = isFavorite(widget.id);
        const premiumBadge = widget.premium ? '<span class="premium-badge">PRO</span>' : '';
        
        // AI recommendation badge
        let aiInfo = '';
        if (aiData && aiData.isAI) {
            aiInfo = `
                <div class="ai-recommendation-reason">
                    🤖 ${aiData.reason}
                    <span class="ai-recommendation-match">${aiData.matchPercent}% 매칭</span>
                </div>
            `;
        }
        
        return `
            <div class="command-item ${isSelected ? 'selected' : ''} ${aiData ? 'ai-recommendation-item' : ''}" 
                 data-widget-id="${widget.id}"
                 data-index="${dataIndex}"
                 onclick="window.commandPalette.selectWidget('${widget.id}')">
                <div class="command-item-left">
                    <i data-lucide="${widget.icon}" style="width: 16px; height: 16px; color: #6b7280;"></i>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div>
                            <span class="command-item-name">${widget.name}</span>
                            ${premiumBadge}
                        </div>
                        ${aiInfo}
                    </div>
                </div>
                <div class="command-item-right">
                    <span class="command-item-category">${widget.category}</span>
                    <button class="command-favorite-btn ${isFav ? 'active' : ''}"
                            onclick="event.stopPropagation(); window.commandPalette.toggleFavorite('${widget.id}')"
                            title="${isFav ? '즐겨찾기 제거' : '즐겨찾기 추가'}">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
        `;
    }
    
    // Navigate
    function navigate(direction) {
        if (state.filteredWidgets.length === 0) return;
        
        if (direction === 'down') {
            state.selectedIndex = Math.min(state.selectedIndex + 1, state.filteredWidgets.length - 1);
        } else if (direction === 'up') {
            state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
        }
        
        renderResults();
    }
    
    // Scroll selected into view
    function scrollSelectedIntoView() {
        if (!resultsList) return;
        
        const selectedItem = resultsList.querySelector('.command-item.selected');
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
    
    // Select Widget
    function selectWidget(widgetId) {
        const widget = allWidgets.find(w => w.id === widgetId);
        if (!widget) return;
        
        // Save to recent
        saveRecentWidget(widget);
        
        // Track usage for AI recommendations
        if (window.aiRecommendation) {
            window.aiRecommendation.trackUsage(widget.id, widget.category);
        }
        
        // Trigger widget addition to canvas
        if (widget.element) {
            widget.element.click();
        }
        
        // Close palette
        close();
        
        console.log('✅ [Command Palette] Selected widget:', widget.name);
    }
    
    // Keyboard Navigation
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Open with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                open();
                return;
            }
            
            // Only handle if palette is open
            if (!state.isOpen) return;
            
            // Close with Esc
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
                return;
            }
            
            // Navigate with arrows
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigate('down');
                return;
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigate('up');
                return;
            }
            
            // Select with Enter
            if (e.key === 'Enter') {
                e.preventDefault();
                if (state.filteredWidgets[state.selectedIndex]) {
                    selectWidget(state.filteredWidgets[state.selectedIndex].id);
                }
                return;
            }
        });
    }
    
    // Toast Notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 200);
        }, 2000);
    }
    
    // Get Styles
    function getCommandPaletteStyles() {
        return `
            .command-palette {
                width: 640px;
                max-width: 90vw;
                max-height: 70vh;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: translateY(-20px);
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .command-palette-overlay[style*="opacity: 1"] .command-palette {
                transform: translateY(0);
            }
            
            .command-palette-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
            
            .command-palette-input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 16px;
                font-weight: 500;
                color: #1f2937;
                background: transparent;
            }
            
            .command-palette-input::placeholder {
                color: #9ca3af;
            }
            
            .command-palette-close {
                padding: 6px;
                background: transparent;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.15s;
            }
            
            .command-palette-close:hover {
                background: #f3f4f6;
                color: #1f2937;
            }
            
            .command-palette-results {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }
            
            .command-section {
                margin-bottom: 16px;
            }
            
            .command-section-title {
                font-size: 11px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 8px 12px;
                margin-bottom: 4px;
            }
            
            .command-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .command-item:hover,
            .command-item.selected {
                background: #f3f4f6;
            }
            
            .command-item.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .command-item-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .command-item-name {
                font-size: 14px;
                font-weight: 500;
                color: #1f2937;
            }
            
            .premium-badge {
                font-size: 9px;
                font-weight: 700;
                color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .command-item-right {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .command-item-category {
                font-size: 12px;
                color: #9ca3af;
            }
            
            .command-favorite-btn {
                padding: 4px 8px;
                background: transparent;
                border: none;
                font-size: 14px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.15s;
                opacity: 0;
            }
            
            .command-item:hover .command-favorite-btn,
            .command-favorite-btn.active {
                opacity: 1;
            }
            
            .command-favorite-btn:hover {
                background: rgba(59, 130, 246, 0.1);
            }
            
            .command-favorite-btn.active {
                color: #f59e0b;
            }
            
            .command-no-results {
                text-align: center;
                padding: 40px 20px;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .command-palette-footer {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 12px 20px;
                border-top: 1px solid rgba(0, 0, 0, 0.06);
                background: #fafafa;
                font-size: 12px;
                color: #6b7280;
            }
            
            .command-palette-footer kbd {
                padding: 2px 6px;
                background: #ffffff;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                font-size: 11px;
                font-family: monospace;
                font-weight: 600;
                color: #1f2937;
            }
        `;
    }
    
    // Public API
    window.commandPalette = {
        open,
        close,
        selectWidget,
        toggleFavorite: (widgetId) => {
            const widget = allWidgets.find(w => w.id === widgetId);
            if (widget) toggleFavorite(widget);
        },
        allWidgets // Expose for AI recommendation system
    };
    
    // Auto-initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
