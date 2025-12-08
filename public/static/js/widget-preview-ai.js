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
                categoryPreference: {},
                // v2.0 새로운 데이터
                events: [],              // 시간 감쇠를 위한 이벤트 로그
                feedbackBoost: {},       // 피드백 기반 가중치
                temporaryExclude: {},    // 일시적 제외 위젯
                metrics: {               // 추천 품질 메트릭
                    impressions: 0,
                    clicks: 0,
                    ctr: 0,
                    diversity: 0,
                    coverage: 0
                }
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
        
        // Track widget usage (v2.0 enhanced)
        trackUsage(widgetId, widgetCategory) {
            const timestamp = Date.now();
            const sessionId = this.getCurrentSessionId();
            
            // v2.0: 이벤트 로그 추가 (시간 감쇠용)
            this.usageData.events.push({
                widgetId,
                category: widgetCategory,
                timestamp,
                sessionId
            });
            
            // Keep only last 500 events (메모리 관리)
            if (this.usageData.events.length > 500) {
                this.usageData.events = this.usageData.events.slice(-500);
            }
            
            // Update frequency (기존 호환성 유지)
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
            
            // Track click (메트릭)
            this.usageData.metrics.clicks++;
            
            this.saveUsageData();
        }
        
        // 세션 ID 생성/가져오기
        getCurrentSessionId() {
            let sessionId = sessionStorage.getItem('ai_session_id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('ai_session_id', sessionId);
            }
            return sessionId;
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
        
        // v2.0: Calculate recommendation score with advanced features
        calculateScore(widget) {
            // 임시 제외 체크
            if (this.isTemporarilyExcluded(widget.id)) {
                return 0;
            }
            
            let score = 0;
            const context = this.getContext();
            
            // 1. 시간 감쇠 적용 빈도 점수 (30%)
            const decayedFrequency = this.getDecayedFrequency(widget.id);
            const maxDecayedFreq = this.getMaxDecayedFrequency();
            const frequencyScore = maxDecayedFreq > 0 ? decayedFrequency / maxDecayedFreq : 0;
            score += frequencyScore * 0.3;
            
            // 2. 함께 사용 점수 (25%)
            const recentWidgets = this.getRecentWidgets(5);
            let coUsageScore = 0;
            recentWidgets.forEach(recent => {
                const coWidgets = this.usageData.coUsage[recent.id] || [];
                if (coWidgets.includes(widget.id)) {
                    coUsageScore += 1;
                }
            });
            if (recentWidgets.length > 0) {
                score += (coUsageScore / recentWidgets.length) * 0.25;
            }
            
            // 3. 컨텍스트 점수 (20%) - NEW!
            const ctxScore = this.getContextScore(widget, context);
            score += ctxScore * 0.2;
            
            // 4. 카테고리 선호도 (15%)
            const totalCategoryUsage = Object.values(this.usageData.categoryPreference)
                .reduce((sum, count) => sum + count, 0) || 1;
            const categoryScore = (this.usageData.categoryPreference[widget.category] || 0) / totalCategoryUsage;
            score += categoryScore * 0.15;
            
            // 5. 시간대 패턴 (10%)
            const currentTimeSlot = this.getCurrentTimeSlot();
            const timeWidgets = this.usageData.timePattern[currentTimeSlot] || [];
            const timeScore = timeWidgets.includes(widget.id) ? 1 : 0;
            score += timeScore * 0.1;
            
            // 6. 피드백 부스트 적용 - NEW!
            const feedbackMultiplier = this.usageData.feedbackBoost[widget.id] || 1.0;
            score *= feedbackMultiplier;
            
            return score;
        }
        
        // 시간 감쇠 함수
        timeDecay(timestamp) {
            const now = Date.now();
            const daysPassed = (now - timestamp) / (1000 * 60 * 60 * 24);
            const halfLife = 30; // 30일 반감기
            
            return Math.pow(0.5, daysPassed / halfLife);
        }
        
        // 감쇠 적용 빈도 계산
        getDecayedFrequency(widgetId) {
            const events = this.usageData.events.filter(e => e.widgetId === widgetId);
            return events.reduce((sum, event) => {
                return sum + this.timeDecay(event.timestamp);
            }, 0);
        }
        
        // 최대 감쇠 빈도
        getMaxDecayedFrequency() {
            const allWidgetIds = [...new Set(this.usageData.events.map(e => e.widgetId))];
            const frequencies = allWidgetIds.map(id => this.getDecayedFrequency(id));
            return Math.max(...frequencies, 1);
        }
        
        // 컨텍스트 정보 수집
        getContext() {
            // 최근 5분 내 세션
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const recentSession = this.usageData.events
                .filter(e => e.timestamp > fiveMinutesAgo)
                .map(e => e.widgetId);
            
            return {
                recentSession: [...new Set(recentSession)],
                timeSlot: this.getCurrentTimeSlot(),
                dayOfWeek: new Date().getDay() < 5 ? 'weekday' : 'weekend'
            };
        }
        
        // 컨텍스트 점수 계산
        getContextScore(widget, context) {
            let score = 0;
            
            // 최근 세션에서 함께 사용된 위젯
            context.recentSession.forEach(recentId => {
                const coWidgets = this.usageData.coUsage[recentId] || [];
                if (coWidgets.includes(widget.id)) {
                    score += 0.5; // 세션 내 함께 사용 = 강력한 시그널
                }
            });
            
            return Math.min(score, 1.0);
        }
        
        // 임시 제외 체크
        isTemporarilyExcluded(widgetId) {
            const excludeUntil = this.usageData.temporaryExclude[widgetId];
            if (!excludeUntil) return false;
            
            if (Date.now() > excludeUntil) {
                // 제외 기간 만료
                delete this.usageData.temporaryExclude[widgetId];
                this.saveUsageData();
                return false;
            }
            
            return true;
        }
        
        // Get recommendations (v2.0 with diversity)
        getRecommendations(allWidgets, limit = 5) {
            if (!allWidgets || allWidgets.length === 0) return [];
            
            // 콜드 스타트 처리
            if (this.getTotalUsageCount() < 3) {
                return this.getColdStartRecommendations(allWidgets, limit);
            }
            
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
            
            // v2.0: Apply diversity (MMR algorithm)
            const diversified = this.diversifyRecommendations(scored, limit);
            
            // Track impressions (메트릭)
            this.usageData.metrics.impressions += diversified.length;
            this.updateMetrics();
            
            return diversified;
        }
        
        // 콜드 스타트 추천 (신규 사용자)
        getColdStartRecommendations(allWidgets, limit) {
            // 기본 인기 위젯 (카테고리별 대표)
            const popularCategories = {
                'Analytics': ['analytics', 'dashboard', 'metrics'],
                'Museum': ['museum', 'visitor', 'exhibition'],
                'Budget': ['budget', 'financial', 'cost']
            };
            
            const popular = [];
            Object.keys(popularCategories).forEach(category => {
                const keywords = popularCategories[category];
                const categoryWidgets = allWidgets.filter(w => 
                    w.category === category || 
                    keywords.some(kw => w.id.includes(kw) || w.name.toLowerCase().includes(kw))
                );
                
                if (categoryWidgets.length > 0) {
                    popular.push({
                        widget: categoryWidgets[0],
                        score: 0.8,
                        reason: '인기 위젯'
                    });
                }
            });
            
            return popular.slice(0, limit);
        }
        
        // 다양성 보장 (MMR 알고리즘)
        diversifyRecommendations(scored, limit) {
            if (scored.length <= limit) return scored;
            
            const selected = [];
            const candidates = [...scored];
            
            // 첫 번째는 최고 점수
            selected.push(candidates.shift());
            
            // 나머지는 relevance와 diversity 균형
            while (selected.length < limit && candidates.length > 0) {
                let bestIndex = 0;
                let bestScore = -1;
                
                candidates.forEach((candidate, index) => {
                    // Relevance (70%)
                    const relevance = candidate.score * 0.7;
                    
                    // Diversity (30%)
                    const diversity = selected.reduce((minSim, sel) => {
                        const similarity = this.calculateSimilarity(candidate.widget, sel.widget);
                        return Math.min(minSim, 1 - similarity);
                    }, 1) * 0.3;
                    
                    const finalScore = relevance + diversity;
                    
                    if (finalScore > bestScore) {
                        bestScore = finalScore;
                        bestIndex = index;
                    }
                });
                
                selected.push(candidates.splice(bestIndex, 1)[0]);
            }
            
            return selected;
        }
        
        // 위젯 유사도 계산
        calculateSimilarity(widget1, widget2) {
            let similarity = 0;
            
            // 같은 카테고리 = 0.5 유사도
            if (widget1.category === widget2.category) {
                similarity += 0.5;
            }
            
            // 같은 premium 상태 = 0.2 유사도
            if (widget1.premium === widget2.premium) {
                similarity += 0.2;
            }
            
            // 이름 유사도 (간단한 단어 매칭)
            const words1 = widget1.name.toLowerCase().split(/\s+/);
            const words2 = widget2.name.toLowerCase().split(/\s+/);
            const commonWords = words1.filter(w => words2.includes(w)).length;
            const maxWords = Math.max(words1.length, words2.length);
            if (maxWords > 0) {
                similarity += (commonWords / maxWords) * 0.3;
            }
            
            return Math.min(similarity, 1.0);
        }
        
        // 총 사용 횟수
        getTotalUsageCount() {
            return Object.values(this.usageData.frequency).reduce((sum, count) => sum + count, 0);
        }
        
        // 메트릭 업데이트
        updateMetrics() {
            // CTR 계산
            if (this.usageData.metrics.impressions > 0) {
                this.usageData.metrics.ctr = this.usageData.metrics.clicks / this.usageData.metrics.impressions;
            }
            
            // Diversity 계산 (unique widgets / total events)
            if (this.usageData.events.length > 0) {
                const uniqueWidgets = new Set(this.usageData.events.map(e => e.widgetId));
                this.usageData.metrics.diversity = uniqueWidgets.size / this.usageData.events.length;
            }
            
            this.saveUsageData();
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
    
    // 피드백 처리 함수
    function handleFeedback(widgetId, isPositive) {
        if (isPositive) {
            // 긍정 피드백: 가중치 20% 증가
            aiRecommendation.usageData.feedbackBoost[widgetId] = 
                (aiRecommendation.usageData.feedbackBoost[widgetId] || 1.0) * 1.2;
            showToast('👍 피드백 감사합니다! 추천이 개선됩니다.');
        } else {
            // 부정 피드백: 가중치 50% 감소 + 24시간 제외
            aiRecommendation.usageData.feedbackBoost[widgetId] = 
                (aiRecommendation.usageData.feedbackBoost[widgetId] || 1.0) * 0.5;
            aiRecommendation.usageData.temporaryExclude[widgetId] = 
                Date.now() + (24 * 60 * 60 * 1000); // 24시간
            showToast('👎 피드백 감사합니다! 해당 위젯을 덜 추천합니다.');
        }
        
        aiRecommendation.saveUsageData();
        
        // Command Palette가 열려있으면 재렌더링
        if (window.commandPalette && window.commandPalette.isOpen) {
            // Trigger re-render (hack)
            setTimeout(() => {
                if (window.commandPalette.renderResults) {
                    window.commandPalette.renderResults();
                }
            }, 300);
        }
    }
    
    // Toast 알림
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10002;
            opacity: 0;
            transition: opacity 0.2s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, 2500);
    }
    
    // Public API
    window.widgetPreview = widgetPreview;
    window.aiRecommendation = aiRecommendation;
    window.aiHandleFeedback = handleFeedback;
    
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
            
            .ai-feedback-buttons {
                display: inline-flex;
                gap: 4px;
                margin-left: 8px;
                opacity: 0;
                transition: opacity 0.15s;
            }
            
            .command-item:hover .ai-feedback-buttons {
                opacity: 1;
            }
            
            .ai-feedback-btn {
                padding: 2px 6px;
                background: transparent;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .ai-feedback-btn:hover {
                background: rgba(59, 130, 246, 0.1);
                border-color: #3b82f6;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(styles);
    }
    
})();
