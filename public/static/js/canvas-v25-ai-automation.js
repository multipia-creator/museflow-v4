/**
 * MuseFlow Canvas V25.0 - AI Automation Engine
 * Automatic Task Generation, Smart Scheduling, Auto-tagging
 * 
 * Features:
 * - Auto-generate tasks from projects
 * - Smart deadline scheduling
 * - Automatic tag assignment
 * - Task dependency detection
 * - Priority optimization
 */

// ============================================
// AI AUTOMATION ENGINE
// ============================================

const AIAutomationEngine = {
    init() {
        console.log('🤖 Initializing AI Automation Engine...');
        this.addAutomationUI();
        console.log('✅ AI Automation Engine initialized');
    },
    
    // ============================================
    // AUTO-GENERATE TASKS FROM PROJECT
    // ============================================
    
    async autoGenerateTasks(project) {
        console.log('🔄 Auto-generating tasks for project:', project.name);
        
        const projectType = this.detectProjectType(project);
        const templates = this.getTaskTemplates(projectType);
        
        const generatedTasks = templates.map((template, index) => ({
            id: `task_${Date.now()}_${index}`,
            title: template.title,
            description: template.description,
            projectId: project.id,
            priority: template.priority,
            dueDate: this.calculateSmartDeadline(template.estimatedDays),
            tags: this.autoGenerateTags(template.title + ' ' + template.description),
            completed: false,
            created: Date.now(),
            dependencies: template.dependencies || []
        }));
        
        // Save to LocalStorage
        const existingTasks = this.loadTasks();
        const allTasks = [...existingTasks, ...generatedTasks];
        this.saveTasks(allTasks);
        
        if (window.showToast) {
            showToast(`${generatedTasks.length}개 작업이 자동 생성되었습니다`, 'success');
        }
        
        // Refresh Tasks Panel
        if (window.TasksManager && window.TasksManager.renderTasks) {
            window.TasksManager.renderTasks();
        }
        
        return generatedTasks;
    },
    
    detectProjectType(project) {
        const name = project.name.toLowerCase();
        const tags = (project.tags || []).map(t => t.toLowerCase());
        
        if (name.includes('전시') || tags.includes('exhibition')) {
            return 'exhibition';
        } else if (name.includes('교육') || tags.includes('education')) {
            return 'education';
        } else if (name.includes('소장품') || name.includes('컬렉션') || tags.includes('collection')) {
            return 'collection';
        } else if (name.includes('마케팅') || tags.includes('marketing')) {
            return 'marketing';
        } else if (name.includes('연구') || tags.includes('research')) {
            return 'research';
        }
        
        return 'general';
    },
    
    getTaskTemplates(projectType) {
        const templates = {
            exhibition: [
                {
                    title: '전시 주제 및 컨셉 확정',
                    description: '전시의 핵심 메시지와 스토리라인 개발',
                    priority: 'high',
                    estimatedDays: 7,
                    dependencies: []
                },
                {
                    title: '작품 선정 및 대여 협상',
                    description: '전시 작품 리스트 작성 및 대여 계약',
                    priority: 'high',
                    estimatedDays: 14,
                    dependencies: [0]
                },
                {
                    title: '전시 공간 설계 및 레이아웃',
                    description: '공간 구성, 동선, 조명 계획',
                    priority: 'medium',
                    estimatedDays: 10,
                    dependencies: [1]
                },
                {
                    title: '홍보 자료 제작',
                    description: '포스터, SNS 콘텐츠, 보도자료',
                    priority: 'medium',
                    estimatedDays: 7,
                    dependencies: [0]
                },
                {
                    title: '오프닝 행사 기획',
                    description: '개막식, VIP 초청, 미디어 대응',
                    priority: 'low',
                    estimatedDays: 5,
                    dependencies: [3]
                }
            ],
            education: [
                {
                    title: '교육 프로그램 커리큘럼 설계',
                    description: '대상 연령별 학습 목표 및 활동 계획',
                    priority: 'high',
                    estimatedDays: 7
                },
                {
                    title: '교육 자료 및 워크시트 제작',
                    description: '교재, 활동지, 멀티미디어 콘텐츠',
                    priority: 'high',
                    estimatedDays: 10
                },
                {
                    title: '강사 섭외 및 교육',
                    description: '전문 강사 선정 및 오리엔테이션',
                    priority: 'medium',
                    estimatedDays: 5
                },
                {
                    title: '참가자 모집 및 홍보',
                    description: '학교/기관 협력, 온라인 홍보',
                    priority: 'medium',
                    estimatedDays: 14
                }
            ],
            collection: [
                {
                    title: '소장품 목록 정리',
                    description: '데이터베이스 업데이트, 분류 체계 정립',
                    priority: 'high',
                    estimatedDays: 14
                },
                {
                    title: '보존 상태 점검',
                    description: '작품 상태 조사 및 보존 처리 계획',
                    priority: 'high',
                    estimatedDays: 10
                },
                {
                    title: '디지털 아카이빙',
                    description: '고해상도 촬영, 3D 스캔, 메타데이터 입력',
                    priority: 'medium',
                    estimatedDays: 21
                }
            ],
            marketing: [
                {
                    title: '타겟 오디언스 분석',
                    description: '관람객 데이터 분석 및 페르소나 설정',
                    priority: 'high',
                    estimatedDays: 5
                },
                {
                    title: 'SNS 콘텐츠 캘린더 작성',
                    description: '월별/주별 포스팅 계획 및 소재 준비',
                    priority: 'medium',
                    estimatedDays: 3
                },
                {
                    title: '광고 캠페인 기획',
                    description: '온라인/오프라인 광고 전략 및 예산 편성',
                    priority: 'medium',
                    estimatedDays: 7
                },
                {
                    title: '파트너십 및 협업 제안',
                    description: '기업/기관 협력 방안 모색',
                    priority: 'low',
                    estimatedDays: 10
                }
            ],
            general: [
                {
                    title: '프로젝트 목표 설정',
                    description: '명확한 목표와 성공 지표 정의',
                    priority: 'high',
                    estimatedDays: 3
                },
                {
                    title: '팀원 역할 배분',
                    description: '책임 영역 및 일정 조율',
                    priority: 'high',
                    estimatedDays: 2
                },
                {
                    title: '자료 조사 및 벤치마킹',
                    description: '참고 사례 연구 및 인사이트 도출',
                    priority: 'medium',
                    estimatedDays: 5
                },
                {
                    title: '중간 점검 미팅',
                    description: '진행 상황 공유 및 문제 해결',
                    priority: 'low',
                    estimatedDays: 1
                }
            ]
        };
        
        return templates[projectType] || templates.general;
    },
    
    // ============================================
    // SMART DEADLINE SCHEDULING
    // ============================================
    
    calculateSmartDeadline(estimatedDays) {
        const now = new Date();
        
        // Add buffer (20% extra time)
        const bufferDays = Math.ceil(estimatedDays * 0.2);
        const totalDays = estimatedDays + bufferDays;
        
        // Skip weekends
        let workdays = 0;
        let currentDate = new Date(now);
        
        while (workdays < totalDays) {
            currentDate.setDate(currentDate.getDate() + 1);
            const dayOfWeek = currentDate.getDay();
            
            // Skip Saturday (6) and Sunday (0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workdays++;
            }
        }
        
        return currentDate.getTime();
    },
    
    // ============================================
    // AUTO-TAGGING
    // ============================================
    
    autoGenerateTags(text) {
        const tags = new Set();
        const lowerText = text.toLowerCase();
        
        // Museum-specific tags
        const tagMappings = {
            '전시': 'exhibition',
            '큐레이션': 'curation',
            '작품': 'artwork',
            '관람객': 'visitor',
            '교육': 'education',
            '소장품': 'collection',
            '보존': 'conservation',
            '연구': 'research',
            '마케팅': 'marketing',
            'sns': 'social-media',
            '홍보': 'promotion',
            '디지털': 'digital',
            '촬영': 'photography',
            '디자인': 'design',
            '협업': 'collaboration',
            '예산': 'budget',
            '계약': 'contract'
        };
        
        Object.entries(tagMappings).forEach(([keyword, tag]) => {
            if (lowerText.includes(keyword)) {
                tags.add(tag);
            }
        });
        
        return Array.from(tags);
    },
    
    // ============================================
    // TASK DEPENDENCY DETECTION
    // ============================================
    
    detectDependencies(tasks) {
        const dependencies = [];
        
        tasks.forEach((task, index) => {
            tasks.forEach((otherTask, otherIndex) => {
                if (index === otherIndex) return;
                
                // Keywords indicating dependency
                const dependencyKeywords = [
                    { from: '확정', to: '선정' },
                    { from: '설계', to: '제작' },
                    { from: '기획', to: '실행' },
                    { from: '분석', to: '전략' },
                    { from: '조사', to: '보고서' }
                ];
                
                dependencyKeywords.forEach(({ from, to }) => {
                    if (task.title.includes(from) && otherTask.title.includes(to)) {
                        dependencies.push({
                            from: task.id,
                            to: otherTask.id,
                            type: 'sequential'
                        });
                    }
                });
            });
        });
        
        return dependencies;
    },
    
    // ============================================
    // PRIORITY OPTIMIZATION
    // ============================================
    
    optimizePriorities(tasks) {
        // Sort by deadline and dependencies
        const scored = tasks.map(task => {
            let score = 0;
            
            // Deadline urgency
            const daysUntilDue = (task.dueDate - Date.now()) / (24 * 60 * 60 * 1000);
            if (daysUntilDue < 3) score += 50;
            else if (daysUntilDue < 7) score += 30;
            else if (daysUntilDue < 14) score += 10;
            
            // Dependencies (tasks that block others = higher priority)
            const blockingCount = tasks.filter(t => 
                (t.dependencies || []).includes(task.id)
            ).length;
            score += blockingCount * 20;
            
            // Current priority
            if (task.priority === 'high') score += 30;
            else if (task.priority === 'medium') score += 15;
            
            return { ...task, score };
        });
        
        // Re-assign priorities based on score
        scored.sort((a, b) => b.score - a.score);
        
        scored.forEach((task, index) => {
            if (index < scored.length * 0.3) {
                task.priority = 'high';
            } else if (index < scored.length * 0.7) {
                task.priority = 'medium';
            } else {
                task.priority = 'low';
            }
        });
        
        return scored;
    },
    
    // ============================================
    // UI INTEGRATION
    // ============================================
    
    addAutomationUI() {
        // Add "Auto-generate Tasks" button to Projects Panel
        setTimeout(() => {
            const projectsPanel = document.getElementById('projectsPanel');
            if (!projectsPanel) return;
            
            const header = projectsPanel.querySelector('.panel-header');
            if (!header) return;
            
            const autoBtn = document.createElement('button');
            autoBtn.innerHTML = '<i data-lucide="zap" style="width:14px;height:14px"></i>';
            autoBtn.title = 'AI 자동 작업 생성';
            autoBtn.style.cssText = `
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: linear-gradient(135deg, #F59E0B, #D97706);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: auto;
                margin-right: 0.5rem;
                transition: all 0.2s;
            `;
            
            autoBtn.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            };
            
            autoBtn.onmouseout = function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            };
            
            autoBtn.onclick = () => this.showAutomationDialog();
            
            const closeBtn = header.querySelector('.panel-close');
            if (closeBtn) {
                header.insertBefore(autoBtn, closeBtn);
            } else {
                header.appendChild(autoBtn);
            }
            
            if (window.lucide) lucide.createIcons();
        }, 2000);
    },
    
    showAutomationDialog() {
        const projects = this.loadProjects();
        
        if (projects.length === 0) {
            if (window.showToast) {
                showToast('프로젝트가 없습니다. 먼저 프로젝트를 생성하세요', 'warning');
            }
            return;
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: #1F2937; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%;">
                <h3 style="color: #e5e5e5; margin-bottom: 1rem; font-size: 1.25rem;">
                    🤖 AI 자동 작업 생성
                </h3>
                <p style="color: #9CA3AF; margin-bottom: 1.5rem; font-size: 0.875rem;">
                    프로젝트 유형을 분석하여 자동으로 작업을 생성합니다
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <label style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                        프로젝트 선택
                    </label>
                    <select id="autoProjectSelect" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; font-size: 0.875rem;">
                        ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex: 1; padding: 0.75rem; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; cursor: pointer;">
                        취소
                    </button>
                    <button id="confirmAutoGenerate" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #F59E0B, #D97706); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                        생성
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listener
        modal.querySelector('#confirmAutoGenerate').onclick = () => {
            const projectId = modal.querySelector('#autoProjectSelect').value;
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                this.autoGenerateTasks(project);
                modal.remove();
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
    
    saveTasks(tasks) {
        try {
            localStorage.setItem('museflow_tasks_v23', JSON.stringify(tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
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
        console.log('🚀 Initializing AI Automation Engine...');
        
        try {
            AIAutomationEngine.init();
            console.log('✅ AI Automation Engine Loaded');
        } catch (error) {
            console.error('❌ AI Automation Engine initialization failed:', error);
        }
    }, 2500);
});

// Expose globally
window.AIAutomationEngine = AIAutomationEngine;
