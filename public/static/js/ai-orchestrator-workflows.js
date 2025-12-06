/**
 * MuseFlow AI Orchestrator - Predefined Workflows
 * Version: 16.0.0
 * 
 * 사전 정의된 워크플로우 템플릿
 * - 인상주의 전시 기획
 * - 예산 계산
 * - 작품 선정
 * - 관람객 예측
 * - 공간 디자인
 * - 가이드 생성
 */

const ORCHESTRATOR_WORKFLOWS = {
    
    /**
     * 인상주의 전시 기획 워크플로우
     * 6 Phases, 19 Nodes, ~3.2s completion
     */
    'exhibition-planning': {
        name: '인상주의 전시 기획',
        command: '인상주의 전시 기획해줘',
        mode: 'autonomous',
        estimatedDuration: 3200,
        phases: [
            {
                name: 'Phase 1: Research & Data Collection',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'gemini-research',
                        params: {
                            query: '인상주의 미술 운동 역사와 주요 작가',
                            depth: 'comprehensive'
                        }
                    },
                    {
                        type: 'museum-api-fetcher',
                        params: {
                            endpoint: '/artworks',
                            filters: { movement: 'Impressionism' }
                        }
                    },
                    {
                        type: 'visitor-predictor',
                        params: {
                            dateRange: '2025-03-01 to 2025-06-30',
                            exhibitionType: 'Impressionism'
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Planning & Documentation',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'artwork-selector',
                        params: {
                            theme: '인상주의',
                            count: 25,
                            criteria: ['historical-significance', 'visual-impact']
                        }
                    },
                    {
                        type: 'docs-creator',
                        params: {
                            title: '인상주의 전시 기획안',
                            template: 'exhibition-proposal',
                            sections: ['concept', 'artworks', 'timeline', 'budget']
                        }
                    },
                    {
                        type: 'budget-calculator',
                        params: {
                            artworkCount: 25,
                            venue: 'main-gallery',
                            duration: 90, // days
                            specialRequirements: ['climate-control', 'security']
                        }
                    }
                ]
            },
            {
                name: 'Phase 3: Space & Design',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'space-designer',
                        params: {
                            spaceType: 'main-gallery',
                            artworkCount: 25,
                            flowPattern: 'chronological'
                        }
                    },
                    {
                        type: 'canvas-node-creator',
                        params: {
                            nodes: [
                                { type: 'floorplan', title: '전시실 레이아웃' },
                                { type: 'lighting', title: '조명 계획' },
                                { type: 'signage', title: '안내 표지' }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Phase 4: Visitor Experience',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'guide-creator',
                        params: {
                            type: 'audio-guide',
                            language: 'ko',
                            artworkCount: 25
                        }
                    },
                    {
                        type: 'guide-creator',
                        params: {
                            type: 'brochure',
                            language: 'ko',
                            format: 'print'
                        }
                    }
                ]
            },
            {
                name: 'Phase 5: Scheduling & Integration',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'calendar-scheduler',
                        params: {
                            title: '인상주의 전시',
                            startDate: '2025-03-01',
                            endDate: '2025-06-30',
                            milestones: ['setup', 'opening', 'mid-review', 'closing']
                        }
                    },
                    {
                        type: 'widget-updater',
                        params: {
                            widgetIds: ['exhibition-calendar', 'budget-tracker', 'visitor-stats']
                        }
                    }
                ]
            },
            {
                name: 'Phase 6: Communication & Approval',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'email-sender',
                        params: {
                            recipients: ['curator@museum.com', 'director@museum.com'],
                            subject: '인상주의 전시 기획안 검토 요청',
                            template: 'proposal-review'
                        }
                    },
                    {
                        type: 'notification-sender',
                        params: {
                            recipients: ['team-members'],
                            message: '인상주의 전시 기획 완료',
                            channel: 'dashboard'
                        }
                    },
                    {
                        type: 'approval-requester',
                        params: {
                            approvalType: 'exhibition-proposal',
                            approvers: ['director', 'curator-chief'],
                            deadline: '2025-01-15'
                        }
                    }
                ]
            }
        ]
    },

    /**
     * 예산 계산 워크플로우
     */
    'budget-calculation': {
        name: '예산 계산',
        command: '전시 예산 계산해줘',
        mode: 'conversational',
        estimatedDuration: 1500,
        phases: [
            {
                name: 'Phase 1: Data Collection',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'gemini-research',
                        params: {
                            query: '전시 예산 구성 요소 및 업계 표준',
                            depth: 'standard'
                        }
                    },
                    {
                        type: 'museum-api-fetcher',
                        params: {
                            endpoint: '/budget-templates',
                            filters: { type: 'exhibition' }
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Calculation',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'budget-calculator',
                        params: {
                            artworkCount: 20,
                            venue: 'main-gallery',
                            duration: 60
                        }
                    },
                    {
                        type: 'docs-creator',
                        params: {
                            title: '전시 예산안',
                            template: 'budget-report'
                        }
                    }
                ]
            },
            {
                name: 'Phase 3: Widget Update',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'widget-updater',
                        params: {
                            widgetIds: ['budget-tracker', 'analytics-dashboard']
                        }
                    },
                    {
                        type: 'canvas-node-creator',
                        params: {
                            nodes: [
                                { type: 'budget-chart', title: '예산 분포도' }
                            ]
                        }
                    }
                ]
            }
        ]
    },

    /**
     * 작품 선정 워크플로우
     */
    'artwork-selection': {
        name: '작품 선정',
        command: '인상주의 작품 선정해줘',
        mode: 'conversational',
        estimatedDuration: 2000,
        phases: [
            {
                name: 'Phase 1: Research',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'gemini-research',
                        params: {
                            query: '인상주의 대표 작품 및 작가',
                            depth: 'detailed'
                        }
                    },
                    {
                        type: 'museum-api-fetcher',
                        params: {
                            endpoint: '/artworks',
                            filters: { movement: 'Impressionism', available: true }
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Selection',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'artwork-selector',
                        params: {
                            theme: '인상주의',
                            count: 15,
                            criteria: ['quality', 'diversity', 'availability']
                        }
                    },
                    {
                        type: 'docs-creator',
                        params: {
                            title: '선정 작품 목록',
                            template: 'artwork-list'
                        }
                    }
                ]
            },
            {
                name: 'Phase 3: Visualization',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'canvas-node-creator',
                        params: {
                            nodes: [
                                { type: 'artwork-gallery', title: '선정 작품' }
                            ]
                        }
                    }
                ]
            }
        ]
    },

    /**
     * 관람객 예측 워크플로우
     */
    'visitor-prediction': {
        name: '관람객 예측',
        command: '관람객 수 예측해줘',
        mode: 'autonomous',
        estimatedDuration: 1200,
        phases: [
            {
                name: 'Phase 1: Data Analysis',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'visitor-predictor',
                        params: {
                            dateRange: '2025-03-01 to 2025-06-30',
                            exhibitionType: 'temporary'
                        }
                    },
                    {
                        type: 'analytics-reporter',
                        params: {
                            reportType: 'visitor-trends',
                            period: 'last-12-months'
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Reporting',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'docs-creator',
                        params: {
                            title: '관람객 예측 보고서',
                            template: 'prediction-report'
                        }
                    },
                    {
                        type: 'widget-updater',
                        params: {
                            widgetIds: ['visitor-stats', 'predictive-visitors']
                        }
                    }
                ]
            }
        ]
    },

    /**
     * 공간 디자인 워크플로우
     */
    'space-design': {
        name: '공간 디자인',
        command: '전시실 디자인해줘',
        mode: 'conversational',
        estimatedDuration: 1800,
        phases: [
            {
                name: 'Phase 1: Analysis',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'gemini-research',
                        params: {
                            query: '전시 공간 디자인 원칙 및 베스트 프랙티스',
                            depth: 'standard'
                        }
                    },
                    {
                        type: 'museum-api-fetcher',
                        params: {
                            endpoint: '/spaces',
                            filters: { type: 'gallery' }
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Design',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'space-designer',
                        params: {
                            spaceType: 'main-gallery',
                            artworkCount: 20,
                            flowPattern: 'thematic'
                        }
                    },
                    {
                        type: 'canvas-node-creator',
                        params: {
                            nodes: [
                                { type: 'floorplan', title: '평면도' },
                                { type: '3d-model', title: '3D 모델' }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Phase 3: Documentation',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'docs-creator',
                        params: {
                            title: '공간 디자인 계획서',
                            template: 'design-proposal'
                        }
                    }
                ]
            }
        ]
    },

    /**
     * 가이드 생성 워크플로우
     */
    'guide-creation': {
        name: '가이드 생성',
        command: '전시 가이드 만들어줘',
        mode: 'conversational',
        estimatedDuration: 2500,
        phases: [
            {
                name: 'Phase 1: Content Research',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'gemini-research',
                        params: {
                            query: '작품 해설 작성 가이드라인',
                            depth: 'detailed'
                        }
                    },
                    {
                        type: 'museum-api-fetcher',
                        params: {
                            endpoint: '/artworks',
                            filters: { exhibition: 'current' }
                        }
                    }
                ]
            },
            {
                name: 'Phase 2: Guide Creation',
                executionMode: 'parallel',
                agents: [
                    {
                        type: 'guide-creator',
                        params: {
                            type: 'audio-guide',
                            language: 'ko',
                            artworkCount: 15
                        }
                    },
                    {
                        type: 'guide-creator',
                        params: {
                            type: 'brochure',
                            language: 'ko',
                            format: 'digital'
                        }
                    }
                ]
            },
            {
                name: 'Phase 3: Distribution',
                executionMode: 'sequential',
                agents: [
                    {
                        type: 'widget-updater',
                        params: {
                            widgetIds: ['audio-guide-stats', 'virtual-tour']
                        }
                    },
                    {
                        type: 'notification-sender',
                        params: {
                            recipients: ['all-visitors'],
                            message: '새로운 전시 가이드가 준비되었습니다',
                            channel: 'app'
                        }
                    }
                ]
            }
        ]
    }
};

/**
 * 사용자 명령어를 워크플로우로 매핑
 */
function parseCommandToWorkflow(command) {
    const lowerCommand = command.toLowerCase();
    
    // 전시 기획 관련
    if (lowerCommand.includes('전시') && (lowerCommand.includes('기획') || lowerCommand.includes('계획'))) {
        return ORCHESTRATOR_WORKFLOWS['exhibition-planning'];
    }
    
    // 예산 관련
    if (lowerCommand.includes('예산')) {
        return ORCHESTRATOR_WORKFLOWS['budget-calculation'];
    }
    
    // 작품 선정
    if (lowerCommand.includes('작품') && lowerCommand.includes('선정')) {
        return ORCHESTRATOR_WORKFLOWS['artwork-selection'];
    }
    
    // 관람객 예측
    if (lowerCommand.includes('관람객') && (lowerCommand.includes('예측') || lowerCommand.includes('수'))) {
        return ORCHESTRATOR_WORKFLOWS['visitor-prediction'];
    }
    
    // 공간 디자인
    if (lowerCommand.includes('공간') || lowerCommand.includes('디자인')) {
        return ORCHESTRATOR_WORKFLOWS['space-design'];
    }
    
    // 가이드 생성
    if (lowerCommand.includes('가이드')) {
        return ORCHESTRATOR_WORKFLOWS['guide-creation'];
    }
    
    // 기본값: 전시 기획
    return ORCHESTRATOR_WORKFLOWS['exhibition-planning'];
}

/**
 * 워크플로우 실행
 */
async function executeWorkflowByCommand(command) {
    if (!window.orchestrator) {
        console.error('❌ AI Orchestrator not initialized');
        return null;
    }
    
    const workflow = parseCommandToWorkflow(command);
    
    console.log(`🎯 Matched workflow: "${workflow.name}"`);
    console.log(`   Estimated duration: ${workflow.estimatedDuration}ms`);
    
    try {
        const session = await window.orchestrator.executeWorkflow(workflow);
        
        console.log(`✅ Workflow completed successfully`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Actual duration: ${session.totalDuration}ms`);
        
        return session;
        
    } catch (error) {
        console.error(`❌ Workflow execution failed:`, error);
        return null;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ORCHESTRATOR_WORKFLOWS = ORCHESTRATOR_WORKFLOWS;
    window.parseCommandToWorkflow = parseCommandToWorkflow;
    window.executeWorkflowByCommand = executeWorkflowByCommand;
}
