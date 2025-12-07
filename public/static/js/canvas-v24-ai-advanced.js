/**
 * MuseFlow Canvas V24.0 - AI Advanced Features
 * Smart Recommendations, Auto-tagging, Predictive Analysis
 * 
 * Features:
 * - Task Priority Recommendation
 * - Template Auto-suggestion
 * - Tag Generation
 * - Connection Suggestions
 * - Deadline Prediction
 * - Progress Analysis
 */

// ============================================
// AI ADVANCED FEATURES MANAGER
// ============================================

const AIAdvancedManager = {
    init() {
        console.log('🤖 Initializing AI Advanced Features...');
        this.enhanceAIAssistant();
        console.log('✅ AI Advanced Features initialized');
    },
    
    enhanceAIAssistant() {
        // Add advanced methods to AIAssistantManager
        if (window.AIAssistantManager) {
            window.AIAssistantManager.getSmartRecommendations = this.getSmartRecommendations.bind(this);
            window.AIAssistantManager.suggestTemplate = this.suggestTemplate.bind(this);
            window.AIAssistantManager.generateTags = this.generateTags.bind(this);
            window.AIAssistantManager.suggestConnections = this.suggestConnections.bind(this);
            window.AIAssistantManager.predictDeadline = this.predictDeadline.bind(this);
            window.AIAssistantManager.analyzeProgress = this.analyzeProgress.bind(this);
        }
    },
    
    // ============================================
    // SMART TASK RECOMMENDATIONS
    // ============================================
    
    getSmartRecommendations() {
        const tasks = this.loadTasks();
        const projects = this.loadProjects();
        
        const recommendations = [];
        
        // 1. Overdue tasks (highest priority)
        const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < Date.now());
        if (overdue.length > 0) {
            recommendations.push({
                type: 'urgent',
                icon: '🚨',
                title: '긴급 작업',
                description: `${overdue.length}개의 마감 지난 작업이 있습니다`,
                action: 'overdue_tasks',
                priority: 'high',
                tasks: overdue
            });
        }
        
        // 2. Due soon (within 3 days)
        const soon = tasks.filter(t => 
            !t.completed && 
            t.dueDate && 
            t.dueDate > Date.now() && 
            t.dueDate < Date.now() + (3 * 24 * 60 * 60 * 1000)
        );
        if (soon.length > 0) {
            recommendations.push({
                type: 'warning',
                icon: '⏰',
                title: '임박한 작업',
                description: `3일 내 마감 작업 ${soon.length}개`,
                action: 'due_soon',
                priority: 'medium',
                tasks: soon
            });
        }
        
        // 3. High priority incomplete
        const highPriority = tasks.filter(t => !t.completed && t.priority === 'high');
        if (highPriority.length > 0) {
            recommendations.push({
                type: 'priority',
                icon: '🔥',
                title: '높은 우선순위',
                description: `중요 작업 ${highPriority.length}개 대기 중`,
                action: 'high_priority',
                priority: 'medium',
                tasks: highPriority
            });
        }
        
        // 4. Projects without tasks
        const emptyProjects = projects.filter(p => {
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            return projectTasks.length === 0;
        });
        if (emptyProjects.length > 0) {
            recommendations.push({
                type: 'info',
                icon: '📋',
                title: '작업 필요',
                description: `${emptyProjects.length}개 프로젝트에 작업 추가 필요`,
                action: 'empty_projects',
                priority: 'low',
                projects: emptyProjects
            });
        }
        
        // 5. Suggest break (if high completion rate)
        const completedToday = tasks.filter(t => {
            const today = new Date().setHours(0, 0, 0, 0);
            return t.completed && t.updatedAt && t.updatedAt >= today;
        });
        if (completedToday.length >= 5) {
            recommendations.push({
                type: 'success',
                icon: '🎉',
                title: '훌륭해요!',
                description: `오늘 ${completedToday.length}개 작업 완료. 잠시 휴식하세요!`,
                action: 'take_break',
                priority: 'low'
            });
        }
        
        return recommendations;
    },
    
    // ============================================
    // TEMPLATE AUTO-SUGGESTION
    // ============================================
    
    suggestTemplate(context) {
        const { currentProject, totalTasks, canvasCards } = context;
        const suggestions = [];
        
        // Based on project name/type
        if (currentProject && currentProject.includes('전시')) {
            suggestions.push({
                name: '전시 기획 템플릿',
                category: 'exhibition',
                reason: '현재 전시 프로젝트 진행 중'
            });
        }
        
        if (currentProject && currentProject.includes('교육')) {
            suggestions.push({
                name: '교육 프로그램 템플릿',
                category: 'education',
                reason: '교육 관련 프로젝트'
            });
        }
        
        // Based on canvas complexity
        if (canvasCards === 0) {
            suggestions.push({
                name: '박물관 홍보 마케팅 템플릿',
                category: 'marketing',
                reason: '빈 캔버스 - 빠른 시작 추천'
            });
        }
        
        // Based on task count
        if (totalTasks > 10) {
            suggestions.push({
                name: '소장품 관리 템플릿',
                category: 'collection',
                reason: '복잡한 프로젝트 관리에 유용'
            });
        }
        
        return suggestions;
    },
    
    // ============================================
    // AUTO TAG GENERATION
    // ============================================
    
    generateTags(text) {
        const tags = new Set();
        const lowerText = text.toLowerCase();
        
        // Museum/Exhibition related
        const museumKeywords = {
            '전시': ['exhibition', 'display'],
            '큐레이션': ['curation'],
            '작품': ['artwork', 'piece'],
            '관람객': ['visitor', 'audience'],
            '교육': ['education', 'learning'],
            '소장품': ['collection'],
            '보존': ['conservation'],
            '연구': ['research'],
            '마케팅': ['marketing'],
            '디지털': ['digital'],
            'vr': ['virtual-reality'],
            'ar': ['augmented-reality'],
            '워크숍': ['workshop']
        };
        
        Object.entries(museumKeywords).forEach(([keyword, tagList]) => {
            if (lowerText.includes(keyword)) {
                tagList.forEach(tag => tags.add(tag));
            }
        });
        
        // Priority based
        if (lowerText.includes('긴급') || lowerText.includes('urgent')) {
            tags.add('urgent');
        }
        if (lowerText.includes('중요') || lowerText.includes('important')) {
            tags.add('important');
        }
        
        // Type based
        if (lowerText.includes('회의') || lowerText.includes('meeting')) {
            tags.add('meeting');
        }
        if (lowerText.includes('보고서') || lowerText.includes('report')) {
            tags.add('report');
        }
        if (lowerText.includes('디자인') || lowerText.includes('design')) {
            tags.add('design');
        }
        
        return Array.from(tags);
    },
    
    // ============================================
    // CONNECTION SUGGESTIONS
    // ============================================
    
    suggestConnections(canvasState) {
        const { cards = [] } = canvasState;
        const suggestions = [];
        
        // Find cards without connections
        const isolated = cards.filter(card => {
            const hasConnections = canvasState.connections?.some(
                conn => conn.from === card.id || conn.to === card.id
            );
            return !hasConnections;
        });
        
        isolated.forEach(card => {
            // Suggest connecting to related cards
            const related = cards.filter(other => {
                if (other.id === card.id) return false;
                
                // Same type cards
                if (card.type === other.type) return true;
                
                // Title similarity (simple check)
                const cardWords = card.title.toLowerCase().split(' ');
                const otherWords = other.title.toLowerCase().split(' ');
                const commonWords = cardWords.filter(w => otherWords.includes(w) && w.length > 2);
                
                return commonWords.length > 0;
            });
            
            if (related.length > 0) {
                suggestions.push({
                    from: card.id,
                    to: related[0].id,
                    reason: `"${card.title}"와 "${related[0].title}" 연결 추천`,
                    confidence: 0.7
                });
            }
        });
        
        return suggestions;
    },
    
    // ============================================
    // DEADLINE PREDICTION
    // ============================================
    
    predictDeadline(task, historicalData) {
        // Simple ML-like prediction based on:
        // 1. Task complexity (title length)
        // 2. Priority
        // 3. Historical completion times
        
        const baselineDays = {
            high: 3,
            medium: 7,
            low: 14
        };
        
        let predictedDays = baselineDays[task.priority] || 7;
        
        // Adjust based on title length (complexity proxy)
        const titleLength = task.title.length;
        if (titleLength > 50) {
            predictedDays += 3;
        } else if (titleLength > 30) {
            predictedDays += 1;
        }
        
        // Adjust based on historical data
        if (historicalData && historicalData.length > 0) {
            const avgCompletionTime = historicalData.reduce((sum, item) => {
                const duration = item.completedAt - item.createdAt;
                return sum + duration;
            }, 0) / historicalData.length;
            
            const avgDays = avgCompletionTime / (24 * 60 * 60 * 1000);
            predictedDays = Math.round((predictedDays + avgDays) / 2);
        }
        
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + predictedDays);
        
        return {
            suggestedDeadline: deadline,
            confidence: historicalData && historicalData.length > 3 ? 0.8 : 0.5,
            reason: `${predictedDays}일 예상 (우선순위: ${task.priority})`
        };
    },
    
    // ============================================
    // PROGRESS ANALYSIS
    // ============================================
    
    analyzeProgress() {
        const tasks = this.loadTasks();
        const projects = this.loadProjects();
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
        
        // Calculate velocity (tasks completed per week)
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const completedThisWeek = tasks.filter(t => 
            t.completed && t.updatedAt && t.updatedAt >= oneWeekAgo
        ).length;
        
        // Predict completion date
        let predictedCompletion = null;
        if (completedThisWeek > 0 && active > 0) {
            const weeksNeeded = Math.ceil(active / completedThisWeek);
            predictedCompletion = new Date();
            predictedCompletion.setDate(predictedCompletion.getDate() + (weeksNeeded * 7));
        }
        
        // Status assessment
        let status = 'good';
        let message = '순조롭게 진행 중입니다';
        
        if (completionRate < 30) {
            status = 'slow';
            message = '진행 속도를 높일 필요가 있습니다';
        } else if (completionRate > 70) {
            status = 'excellent';
            message = '훌륭한 진행률입니다!';
        }
        
        return {
            total,
            completed,
            active,
            completionRate,
            velocity: completedThisWeek,
            predictedCompletion,
            status,
            message,
            projects: {
                total: projects.length,
                active: projects.filter(p => p.active).length
            }
        };
    },
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    loadTasks() {
        try {
            const saved = localStorage.getItem('museflow_tasks_v23');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },
    
    loadProjects() {
        try {
            const saved = localStorage.getItem('museflow_projects_v23');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }
};

// ============================================
// INITIALIZE ON LOAD
// ============================================

window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚀 Initializing AI Advanced Features...');
        
        try {
            AIAdvancedManager.init();
            console.log('✅ AI Advanced Features Loaded');
        } catch (error) {
            console.error('❌ AI Advanced Features initialization failed:', error);
        }
    }, 1500); // Wait for AI Assistant to load first
});

// Expose globally
window.AIAdvancedManager = AIAdvancedManager;
