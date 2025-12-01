/**
 * MuseFlow V10.0 - Advanced Features
 * Purpose: AI similarity, Search, Collaboration, Analytics (Lightweight implementation)
 */

class AdvancedFeatures {
    constructor() {
        this.projects = [];
        this.init();
    }

    init() {
        console.log('✅ Advanced Features initialized');
    }

    // ============================================================================
    // Option 4: AI Functions
    // ============================================================================

    // Calculate project similarity using simple keyword matching
    calculateSimilarity(project1, project2) {
        const getKeywords = (p) => {
            const text = `${p.title} ${p.description || ''} ${p.type} ${p.phase}`.toLowerCase();
            return text.split(/\s+/).filter(word => word.length > 2);
        };

        const keywords1 = new Set(getKeywords(project1));
        const keywords2 = new Set(getKeywords(project2));

        const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
        const union = new Set([...keywords1, ...keywords2]);

        return intersection.size / union.size;
    }

    // Find similar projects
    findSimilarProjects(projectId, limit = 3) {
        const targetProject = this.projects.find(p => p.id === projectId);
        if (!targetProject) return [];

        const similarities = this.projects
            .filter(p => p.id !== projectId)
            .map(p => ({
                project: p,
                similarity: this.calculateSimilarity(targetProject, p)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return similarities;
    }

    // Simple Korean search (keyword-based)
    searchProjects(query) {
        if (!query || query.length < 2) return [];

        const keywords = query.toLowerCase().split(/\s+/);
        
        return this.projects.filter(project => {
            const searchText = `${project.title} ${project.description || ''} ${project.curator || ''} ${project.location || ''}`.toLowerCase();
            return keywords.some(keyword => searchText.includes(keyword));
        });
    }

    // Suggest budget optimization
    suggestBudgetOptimization() {
        const overBudget = this.projects.filter(p => p.budget_used > p.budget_total);
        const underBudget = this.projects.filter(p => {
            const usage = p.budget_total > 0 ? (p.budget_used / p.budget_total) : 0;
            return usage < 0.5 && p.status === 'active';
        });

        return {
            overBudget,
            underBudget,
            suggestion: overBudget.length > 0 && underBudget.length > 0 
                ? `${overBudget[0].title}에 예산 추가 필요. ${underBudget[0].title}의 여유 예산 활용 가능`
                : null
        };
    }

    // Analyze workload balance
    analyzeWorkload() {
        const curatorWorkload = {};

        this.projects.forEach(project => {
            const curator = project.curator || '미지정';
            if (!curatorWorkload[curator]) {
                curatorWorkload[curator] = {
                    count: 0,
                    totalBudget: 0,
                    projects: []
                };
            }

            curatorWorkload[curator].count++;
            curatorWorkload[curator].totalBudget += project.budget_total || 0;
            curatorWorkload[curator].projects.push(project.title);
        });

        return curatorWorkload;
    }

    // ============================================================================
    // Option 5: Collaboration Functions (Lightweight)
    // ============================================================================

    // Generate share link
    generateShareLink(projectId) {
        const baseUrl = window.location.origin;
        const token = btoa(`project:${projectId}:${Date.now()}`);
        return `${baseUrl}/canvas-v3?project=${projectId}&share=${token}`;
    }

    // Add comment to project (LocalStorage-based)
    addComment(projectId, comment) {
        const commentsKey = `project_comments_${projectId}`;
        const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');

        const newComment = {
            id: Date.now(),
            text: comment,
            author: '사용자',
            timestamp: new Date().toISOString()
        };

        comments.push(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(comments));

        return newComment;
    }

    // Get comments for project
    getComments(projectId) {
        const commentsKey = `project_comments_${projectId}`;
        return JSON.parse(localStorage.getItem(commentsKey) || '[]');
    }

    // ============================================================================
    // Option 6: Analytics Functions
    // ============================================================================

    // Calculate monthly budget trend
    calculateMonthlyTrend() {
        const monthlyData = {};

        this.projects.forEach(project => {
            if (project.start_date) {
                const month = project.start_date.slice(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = {
                        budget: 0,
                        spent: 0,
                        count: 0
                    };
                }

                monthlyData[month].budget += project.budget_total || 0;
                monthlyData[month].spent += project.budget_used || 0;
                monthlyData[month].count++;
            }
        });

        return monthlyData;
    }

    // Predict project success rate
    predictSuccessRate(project) {
        let score = 50; // Base score

        // Budget health
        if (project.budget_total > 0) {
            const budgetUsage = project.budget_used / project.budget_total;
            if (budgetUsage < 0.8) score += 20;
            else if (budgetUsage > 1.2) score -= 30;
        }

        // Phase progress
        const phaseScores = {
            completed: 100,
            marketing: 80,
            execution: 60,
            preparation: 40,
            planning: 20
        };
        score = (score + (phaseScores[project.phase] || 50)) / 2;

        // Time constraint
        if (project.end_date) {
            const endDate = new Date(project.end_date);
            const today = new Date();
            const daysLeft = (endDate - today) / (1000 * 60 * 60 * 24);
            
            if (daysLeft < 0) score -= 20;
            else if (daysLeft < 7) score -= 10;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Generate analytics summary
    generateAnalyticsSummary() {
        const totalBudget = this.projects.reduce((sum, p) => sum + (p.budget_total || 0), 0);
        const totalSpent = this.projects.reduce((sum, p) => sum + (p.budget_used || 0), 0);
        const activeProjects = this.projects.filter(p => p.status === 'active').length;

        const phaseDistribution = {};
        this.projects.forEach(p => {
            phaseDistribution[p.phase] = (phaseDistribution[p.phase] || 0) + 1;
        });

        return {
            totalProjects: this.projects.length,
            activeProjects,
            totalBudget,
            totalSpent,
            spentPercentage: totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : 0,
            phaseDistribution,
            avgBudget: this.projects.length > 0 ? totalBudget / this.projects.length : 0
        };
    }

    // ============================================================================
    // Utility Functions
    // ============================================================================

    // Load projects from API
    async loadProjects() {
        try {
            const response = await fetch('/api/projects?userId=2');
            const data = await response.json();
            
            if (data.success && data.projects) {
                this.projects = data.projects;
                console.log(`✅ Loaded ${this.projects.length} projects for advanced features`);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    // Export analytics report
    exportAnalyticsReport() {
        const summary = this.generateAnalyticsSummary();
        const trend = this.calculateMonthlyTrend();
        const workload = this.analyzeWorkload();

        const report = {
            generated: new Date().toISOString(),
            summary,
            monthlyTrend: trend,
            curatorWorkload: workload,
            projects: this.projects.map(p => ({
                id: p.id,
                title: p.title,
                successRate: this.predictSuccessRate(p)
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `museflow-analytics-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ Analytics report exported');
    }
}

// Initialize global advanced features
window.advancedFeatures = new AdvancedFeatures();

// Auto-load projects on page load
document.addEventListener('DOMContentLoaded', () => {
    window.advancedFeatures.loadProjects();
});

// Debug commands
console.log('%cMuseFlow V10.0 - Advanced Features', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
console.log('%cCommands:', 'color: #10b981; font-weight: bold');
console.log('  advancedFeatures.searchProjects("도자기") - Search projects');
console.log('  advancedFeatures.findSimilarProjects(1) - Find similar projects');
console.log('  advancedFeatures.suggestBudgetOptimization() - Budget suggestions');
console.log('  advancedFeatures.analyzeWorkload() - Workload analysis');
console.log('  advancedFeatures.generateShareLink(1) - Generate share link');
console.log('  advancedFeatures.exportAnalyticsReport() - Export analytics');
