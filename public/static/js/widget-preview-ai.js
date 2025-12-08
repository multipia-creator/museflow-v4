/**
 * Widget Preview + AI Recommendation System
 * Hover preview + Smart recommendations based on usage patterns
 */

(function() {
    'use strict';
    
    // ==================== Part 1: Widget Preview ====================
    
    class WidgetPreview {
        constructor() {
            this.tooltip = null;
            this.hoverTimer = null;
            this.HOVER_DELAY = 500; // 0.5s delay before showing
            this.currentTarget = null;
        }
        
        init() {
            // Will be called after widgets are loaded
            this.attachHoverListeners();
            console.log('✅ [Widget Preview] Initialized');
        }
        
        attachHoverListeners() {
            // Attach to all widget items in Command Palette and panels
            document.addEventListener('mouseover', (e) => {
                const widgetItem = e.target.closest('[data-widget-id]');
                if (widgetItem && widgetItem !== this.currentTarget) {
                    this.onMouseEnter(widgetItem);
                }
            });
            
            document.addEventListener('mouseout', (e) => {
                const widgetItem = e.target.closest('[data-widget-id]');
                if (widgetItem) {
                    this.onMouseLeave();
                }
            });
        }
        
        onMouseEnter(targetElement) {
            this.currentTarget = targetElement;
            
            // Clear existing timer
            clearTimeout(this.hoverTimer);
            
            // Set new timer
            this.hoverTimer = setTimeout(() => {
                const widgetId = targetElement.dataset.widgetId;
                const widgetData = this.getWidgetData(widgetId);
                
                if (widgetData) {
                    this.show(targetElement, widgetData);
                }
            }, this.HOVER_DELAY);
        }
        
        onMouseLeave() {
            this.currentTarget = null;
            clearTimeout(this.hoverTimer);
            this.hide();
        }
        
        getWidgetData(widgetId) {
            // Get widget data from global widget list or predefined data
            if (window.commandPalette && window.commandPalette.allWidgets) {
                const widget = window.commandPalette.allWidgets.find(w => w.id === widgetId);
                return widget;
            }
            
            // Fallback: generate basic data
            return {
                id: widgetId,
                name: widgetId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                category: 'General',
                icon: 'package',
                premium: false,
                description: '위젯 설명이 여기에 표시됩니다.'
            };
        }
        
        show(targetElement, data) {
            // Remove existing tooltip
            this.hide();
            
            // Create tooltip
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'widget-preview-tooltip';
            this.tooltip.innerHTML = this.renderTooltip(data);
            
            document.body.appendChild(this.tooltip);
            
            // Position tooltip
            this.positionTooltip(targetElement);
            
            // Fade in
            requestAnimationFrame(() => {
                this.tooltip.style.opacity = '1';
                this.tooltip.style.transform = 'translateY(0)';
            });
            
            // Initialize lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
        
        hide() {
            if (this.tooltip && this.tooltip.parentNode) {
                this.tooltip.style.opacity = '0';
                this.tooltip.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    if (this.tooltip && this.tooltip.parentNode) {
                        this.tooltip.remove();
                    }
                    this.tooltip = null;
                }, 150);
            }
        }
        
        renderTooltip(data) {
            const premiumBadge = data.premium 
                ? '<span class="preview-premium-badge">PRO</span>' 
                : '';
            
            const features = data.features || ['대시보드', '분석', '시각화'];
            const description = data.description || `${data.name} 위젯의 상세 설명입니다.`;
            
            return `
                <div class="preview-header">
                    <div class="preview-title">
                        <i data-lucide="${data.icon || 'package'}" style="width: 16px; height: 16px;"></i>
                        <span>${data.name}</span>
                    </div>
                    ${premiumBadge}
                </div>
                <div class="preview-body">
                    <div class="preview-icon-large">
                        <i data-lucide="${data.icon || 'package'}" style="width: 48px; height: 48px; color: #3b82f6;"></i>
                    </div>
                    <div class="preview-meta">
                        <div class="preview-meta-item">
                            <span class="preview-meta-label">카테고리</span>
                            <span class="preview-meta-value">${data.category}</span>
                        </div>
                        <div class="preview-meta-item">
                            <span class="preview-meta-label">타입</span>
                            <span class="preview-meta-value">${data.premium ? 'Premium' : 'Free'}</span>
                        </div>
                    </div>
                    <div class="preview-description">
                        ${description}
                    </div>
                    <div class="preview-features">
                        ${features.map(f => `<span class="preview-feature-tag">${f}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        positionTooltip(targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            const tooltipWidth = 320;
            const tooltipHeight = this.tooltip.offsetHeight || 280;
            
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let x = targetRect.right + 12;
            let y = targetRect.top;
            
            // Check right overflow
            if (x + tooltipWidth > viewportWidth) {
                x = targetRect.left - tooltipWidth - 12;
            }
            
            // Check bottom overflow
            if (y + tooltipHeight > viewportHeight) {
                y = viewportHeight - tooltipHeight - 20;
            }
            
            // Check top overflow
            if (y < 20) {
                y = 20;
            }
            
            this.tooltip.style.left = `${x}px`;
            this.tooltip.style.top = `${y}px`;
        }
    }
    
    // ==================== Part 2: AI Recommendation ====================
    
    class AIRecommendation {
        constructor() {
            this.usageData = {
                frequency: {},
                coUsage: {},
                timePattern: { morning: [], afternoon: [], evening: [] },
                categoryPreference: {}
            };
            this.loadUsageData();
        }
        
        init() {
            console.log('✅ [AI Recommendation] Initialized');
        }
        
        // Load usage data from LocalStorage
        loadUsageData() {
            try {
                const data = localStorage.getItem('widget_usage_data');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.usageData = {
                        ...this.usageData,
                        ...parsed
                    };
                }
            } catch (e) {
                console.warn('Failed to load usage data:', e);
            }
        }
        
        // Save usage data to LocalStorage
        saveUsageData() {
            try {
                localStorage.setItem('widget_usage_data', JSON.stringify({
                    ...this.usageData,
                    lastUpdated: Date.now()
                }));
            } catch (e) {
                console.warn('Failed to save usage data:', e);
            }
        }
        
        // Track widget usage
        trackUsage(widgetId, widgetCategory) {
            // Update frequency
            this.usageData.frequency[widgetId] = (this.usageData.frequency[widgetId] || 0) + 1;
            
            // Update category preference
            this.usageData.categoryPreference[widgetCategory] = 
                (this.usageData.categoryPreference[widgetCategory] || 0) + 1;
            
            // Update time pattern
            const timeSlot = this.getCurrentTimeSlot();
            if (!this.usageData.timePattern[timeSlot].includes(widgetId)) {
                this.usageData.timePattern[timeSlot].push(widgetId);
            }
            
            // Update co-usage
            const recent = this.getRecentWidgets(3);
            recent.forEach(recentWidget => {
                if (recentWidget.id !== widgetId) {
                    if (!this.usageData.coUsage[recentWidget.id]) {
                        this.usageData.coUsage[recentWidget.id] = [];
                    }
                    if (!this.usageData.coUsage[recentWidget.id].includes(widgetId)) {
                        this.usageData.coUsage[recentWidget.id].push(widgetId);
                    }
                }
            });
            
            this.saveUsageData();
        }
        
        // Get current time slot
        getCurrentTimeSlot() {
            const hour = new Date().getHours();
            if (hour < 12) return 'morning';
            if (hour < 18) return 'afternoon';
            return 'evening';
        }
        
        // Get recent widgets from LocalStorage
        getRecentWidgets(limit = 5) {
            try {
                const data = localStorage.getItem('widget_recent');
                if (data) {
                    const recent = JSON.parse(data);
                    return recent.slice(0, limit);
                }
            } catch (e) {
                console.warn('Failed to get recent widgets:', e);
            }
            return [];
        }
        
        // Calculate recommendation score
        calculateScore(widget) {
            let score = 0;
            
            // 1. Frequency score (40%)
            const maxFrequency = Math.max(...Object.values(this.usageData.frequency), 1);
            const frequencyScore = (this.usageData.frequency[widget.id] || 0) / maxFrequency;
            score += frequencyScore * 0.4;
            
            // 2. Co-usage score (30%)
            const recentWidgets = this.getRecentWidgets(5);
            let coUsageScore = 0;
            recentWidgets.forEach(recent => {
                const coWidgets = this.usageData.coUsage[recent.id] || [];
                if (coWidgets.includes(widget.id)) {
                    coUsageScore += 1;
                }
            });
            if (recentWidgets.length > 0) {
                score += (coUsageScore / recentWidgets.length) * 0.3;
            }
            
            // 3. Category preference (20%)
            const totalCategoryUsage = Object.values(this.usageData.categoryPreference)
                .reduce((sum, count) => sum + count, 0) || 1;
            const categoryScore = (this.usageData.categoryPreference[widget.category] || 0) / totalCategoryUsage;
            score += categoryScore * 0.2;
            
            // 4. Time pattern (10%)
            const currentTimeSlot = this.getCurrentTimeSlot();
            const timeWidgets = this.usageData.timePattern[currentTimeSlot] || [];
            const timeScore = timeWidgets.includes(widget.id) ? 1 : 0;
            score += timeScore * 0.1;
            
            return score;
        }
        
        // Get recommendations
        getRecommendations(allWidgets, limit = 5) {
            if (!allWidgets || allWidgets.length === 0) return [];
            
            const recentIds = this.getRecentWidgets(5).map(w => w.id);
            const favoriteIds = this.getFavoriteIds();
            
            // Filter out recent and favorites
            const candidates = allWidgets.filter(w => 
                !recentIds.includes(w.id) && !favoriteIds.includes(w.id)
            );
            
            if (candidates.length === 0) return [];
            
            // Calculate scores
            const scored = candidates.map(widget => ({
                widget,
                score: this.calculateScore(widget),
                reason: this.getRecommendationReason(widget)
            }));
            
            // Sort by score
            scored.sort((a, b) => b.score - a.score);
            
            return scored.slice(0, limit);
        }
        
        // Get recommendation reason
        getRecommendationReason(widget) {
            const recentWidgets = this.getRecentWidgets(3);
            
            // Check co-usage
            for (const recent of recentWidgets) {
                const coWidgets = this.usageData.coUsage[recent.id] || [];
                if (coWidgets.includes(widget.id)) {
                    return `${recent.name}와 함께 자주 사용됨`;
                }
            }
            
            // Check frequency
            const frequency = this.usageData.frequency[widget.id] || 0;
            if (frequency > 5) {
                return '자주 사용하는 위젯';
            }
            
            // Check time pattern
            const timeSlot = this.getCurrentTimeSlot();
            const timeWidgets = this.usageData.timePattern[timeSlot] || [];
            if (timeWidgets.includes(widget.id)) {
                const timeLabel = { morning: '오전', afternoon: '오후', evening: '저녁' }[timeSlot];
                return `${timeLabel}에 자주 사용됨`;
            }
            
            // Check category
            const categoryUsage = this.usageData.categoryPreference[widget.category] || 0;
            if (categoryUsage > 0) {
                return `선호하는 ${widget.category} 카테고리`;
            }
            
            return '추천 위젯';
        }
        
        // Get favorite IDs
        getFavoriteIds() {
            try {
                const data = localStorage.getItem('widget_favorites');
                if (data) {
                    const favorites = JSON.parse(data);
                    return favorites.map(f => f.id);
                }
            } catch (e) {
                console.warn('Failed to get favorites:', e);
            }
            return [];
        }
    }
    
    // ==================== Global Initialization ====================
    
    const widgetPreview = new WidgetPreview();
    const aiRecommendation = new AIRecommendation();
    
    // Public API
    window.widgetPreview = widgetPreview;
    window.aiRecommendation = aiRecommendation;
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            widgetPreview.init();
            aiRecommendation.init();
        });
    } else {
        widgetPreview.init();
        aiRecommendation.init();
    }
    
    // Add CSS styles
    if (!document.getElementById('widget-preview-ai-styles')) {
        const styles = document.createElement('style');
        styles.id = 'widget-preview-ai-styles';
        styles.textContent = `
            .widget-preview-tooltip {
                position: fixed;
                width: 320px;
                background: #ffffff;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                z-index: 10001;
                opacity: 0;
                transform: translateY(-5px);
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
            }
            
            .preview-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
            
            .preview-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .preview-premium-badge {
                font-size: 9px;
                font-weight: 700;
                color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .preview-body {
                padding: 16px;
            }
            
            .preview-icon-large {
                text-align: center;
                padding: 20px 0;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
                border-radius: 6px;
                margin-bottom: 16px;
            }
            
            .preview-meta {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .preview-meta-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .preview-meta-label {
                font-size: 11px;
                font-weight: 600;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .preview-meta-value {
                font-size: 13px;
                font-weight: 500;
                color: #1f2937;
            }
            
            .preview-description {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.5;
                margin-bottom: 12px;
            }
            
            .preview-features {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .preview-feature-tag {
                font-size: 11px;
                color: #3b82f6;
                background: rgba(59, 130, 246, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            /* AI Recommendation styles */
            .ai-recommendation-section {
                margin-bottom: 12px;
            }
            
            .ai-recommendation-item {
                position: relative;
            }
            
            .ai-recommendation-item::before {
                content: '🤖';
                position: absolute;
                left: -20px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 14px;
            }
            
            .ai-recommendation-reason {
                font-size: 11px;
                color: #3b82f6;
                margin-left: 26px;
                font-weight: 500;
            }
            
            .ai-recommendation-match {
                font-size: 11px;
                color: #10b981;
                font-weight: 600;
                margin-left: 4px;
            }
        `;
        document.head.appendChild(styles);
    }
    
})();
