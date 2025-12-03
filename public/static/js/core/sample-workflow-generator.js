/**
 * ===================================================================
 * MuseFlow Canvas - Sample Workflow Generator
 * Automatically creates sample workflows for first-time users
 * ===================================================================
 */

class SampleWorkflowGenerator {
    constructor() {
        this.storageKey = 'museflow_canvas_has_sample';
    }

    /**
     * Check if user needs sample workflow
     */
    shouldCreateSample() {
        // Check localStorage
        const hasSample = localStorage.getItem(this.storageKey);
        if (hasSample === 'true') {
            return false;
        }

        // Check if canvas is empty
        if (window.CanvasV3 && window.CanvasV3.nodes && window.CanvasV3.nodes.length > 0) {
            return false;
        }

        return true;
    }

    /**
     * Create sample workflow for first-time users
     */
    createSampleWorkflow() {
        if (!window.CanvasV3) {
            console.warn('⚠️ CanvasV3 not initialized yet');
            return;
        }

        console.log('🎨 Creating sample workflow for first-time user...');

        // Sample workflow: "전시 기획 프로세스"
        const sampleNodes = [
            {
                id: 'sample-1',
                type: 'ex-01',
                title: '전시 주제 선정',
                description: '전시의 핵심 주제를 정의합니다',
                category: 'exhibition',
                x: 100,
                y: 150,
                width: 200,
                height: 120
            },
            {
                id: 'sample-2',
                type: 'ex-02',
                title: '작품 선정',
                description: '전시 주제에 맞는 작품을 선별합니다',
                category: 'exhibition',
                x: 350,
                y: 150,
                width: 200,
                height: 120
            },
            {
                id: 'sample-3',
                type: 'ex-03',
                title: '공간 배치 계획',
                description: '전시 공간의 동선과 배치를 설계합니다',
                category: 'exhibition',
                x: 600,
                y: 150,
                width: 200,
                height: 120
            },
            {
                id: 'sample-4',
                type: 'pr-01',
                title: '마케팅 계획',
                description: '전시 홍보를 위한 마케팅 전략을 수립합니다',
                category: 'program',
                x: 225,
                y: 330,
                width: 200,
                height: 120
            },
            {
                id: 'sample-5',
                type: 'pr-02',
                title: '전시 오픈',
                description: '전시를 정식으로 오픈합니다',
                category: 'program',
                x: 475,
                y: 330,
                width: 200,
                height: 120
            }
        ];

        // Sample connections
        const sampleConnections = [
            {
                from: 'sample-1',
                to: 'sample-2',
                fromHandle: 'right',
                toHandle: 'left'
            },
            {
                from: 'sample-2',
                to: 'sample-3',
                fromHandle: 'right',
                toHandle: 'left'
            },
            {
                from: 'sample-2',
                to: 'sample-4',
                fromHandle: 'bottom',
                toHandle: 'top'
            },
            {
                from: 'sample-3',
                to: 'sample-5',
                fromHandle: 'bottom',
                toHandle: 'top'
            }
        ];

        // Add nodes to canvas
        window.CanvasV3.nodes = sampleNodes.map(node => ({
            ...node,
            selected: false,
            aiStatus: null,
            aiOutput: null
        }));

        // Add connections to canvas
        window.CanvasV3.connections = sampleConnections.map((conn, index) => ({
            id: `sample-conn-${index + 1}`,
            ...conn
        }));

        // Mark as created
        localStorage.setItem(this.storageKey, 'true');

        // Save to session storage first
        this.saveSampleToSession();

        console.log('✅ Sample workflow created:', {
            nodes: window.CanvasV3.nodes.length,
            connections: window.CanvasV3.connections.length
        });

        // Force canvas redraw - trigger multiple render methods
        setTimeout(() => {
            // Try all possible render methods
            if (window.CanvasV3) {
                if (typeof window.CanvasV3.render === 'function') {
                    window.CanvasV3.render();
                }
                if (typeof window.CanvasV3.renderNodes === 'function') {
                    window.CanvasV3.renderNodes();
                }
                if (window.CanvasEngine && typeof window.CanvasEngine.render === 'function') {
                    window.CanvasEngine.needsRedraw = true;
                }
            }
            
            // Force page refresh to ensure nodes appear
            console.log('🔄 Forcing canvas refresh...');
        }, 100);

        // Show toast
        if (typeof showToast === 'function') {
            showToast('📚 샘플 워크플로우가 생성되었습니다', 'info');
        }
    }

    /**
     * Save sample workflow to session storage
     */
    saveSampleToSession() {
        if (!window.CanvasV3 || !window.CanvasV3.currentProject) {
            return;
        }

        const projectData = {
            ...window.CanvasV3.currentProject,
            nodes: window.CanvasV3.nodes,
            connections: window.CanvasV3.connections,
            updated_at: new Date().toISOString()
        };

        sessionStorage.setItem(
            `museflow_project_${window.CanvasV3.currentProject.id}`,
            JSON.stringify(projectData)
        );
    }

    /**
     * Create alternative sample: AI Content Generation
     */
    createAISampleWorkflow() {
        if (!window.CanvasV3) {
            console.warn('⚠️ CanvasV3 not initialized yet');
            return;
        }

        console.log('🤖 Creating AI sample workflow...');

        const sampleNodes = [
            {
                id: 'ai-sample-1',
                type: 'ai-text',
                title: 'AI 콘텐츠 생성',
                description: 'Gemini 2.0으로 블로그 글 작성',
                category: 'ai',
                x: 150,
                y: 200,
                width: 200,
                height: 120
            },
            {
                id: 'ai-sample-2',
                type: 'ai-workspace-document',
                title: 'Google Docs에 저장',
                description: '생성된 콘텐츠를 문서로 저장',
                category: 'workspace',
                x: 450,
                y: 200,
                width: 200,
                height: 120
            }
        ];

        const sampleConnections = [
            {
                from: 'ai-sample-1',
                to: 'ai-sample-2',
                fromHandle: 'right',
                toHandle: 'left'
            }
        ];

        window.CanvasV3.nodes = sampleNodes.map(node => ({
            ...node,
            selected: false,
            aiStatus: null,
            aiOutput: null
        }));

        window.CanvasV3.connections = sampleConnections.map((conn, index) => ({
            id: `ai-conn-${index + 1}`,
            ...conn
        }));

        localStorage.setItem(this.storageKey, 'true');

        if (typeof window.CanvasV3.render === 'function') {
            window.CanvasV3.render();
        }

        this.saveSampleToSession();

        console.log('✅ AI sample workflow created');

        if (typeof showToast === 'function') {
            showToast('🤖 AI 샘플 워크플로우가 생성되었습니다', 'info');
        }
    }

    /**
     * Reset sample flag (for testing)
     */
    reset() {
        localStorage.removeItem(this.storageKey);
        console.log('✅ Sample workflow flag reset. Reload page to see sample again.');
    }

    /**
     * Initialize and auto-create sample if needed
     */
    init() {
        // Check if we need to create sample
        const hasSample = localStorage.getItem(this.storageKey);
        
        // If no sample flag, create immediately and reload
        if (!hasSample || hasSample !== 'true') {
            console.log('🎨 First visit detected - creating sample workflow...');
            
            // Create sample data structure
            const sampleData = this.generateSampleData();
            
            // Store in sessionStorage
            const defaultProject = sessionStorage.getItem('museflow_current_project');
            if (defaultProject) {
                const project = JSON.parse(defaultProject);
                const projectData = {
                    ...project,
                    nodes: sampleData.nodes,
                    connections: sampleData.connections,
                    updated_at: new Date().toISOString()
                };
                
                sessionStorage.setItem(
                    `museflow_project_${project.id}`,
                    JSON.stringify(projectData)
                );
            }
            
            // Mark as created
            localStorage.setItem(this.storageKey, 'true');
            
            // Reload page to load sample
            console.log('🔄 Reloading page to display sample workflow...');
            setTimeout(() => {
                window.location.reload();
            }, 100);
            
            return;
        }
        
        // Sample already created, check if canvas needs it
        const checkCanvasReady = () => {
            if (window.CanvasV3 && window.CanvasV3.nodes !== undefined) {
                // If canvas is empty but we have sample in session, load it
                if (window.CanvasV3.nodes.length === 0) {
                    const defaultProject = sessionStorage.getItem('museflow_current_project');
                    if (defaultProject) {
                        const project = JSON.parse(defaultProject);
                        const projectData = sessionStorage.getItem(`museflow_project_${project.id}`);
                        
                        if (projectData) {
                            const data = JSON.parse(projectData);
                            if (data.nodes && data.nodes.length > 0) {
                                window.CanvasV3.nodes = data.nodes;
                                window.CanvasV3.connections = data.connections || [];
                                
                                if (typeof window.CanvasV3.render === 'function') {
                                    window.CanvasV3.render();
                                }
                                
                                console.log('✅ Sample workflow loaded from session:', {
                                    nodes: window.CanvasV3.nodes.length,
                                    connections: window.CanvasV3.connections.length
                                });
                            }
                        }
                    }
                }
            } else {
                setTimeout(checkCanvasReady, 100);
            }
        };

        checkCanvasReady();
    }
    
    /**
     * Generate sample data structure (without adding to canvas)
     */
    generateSampleData() {
        const sampleNodes = [
            {
                id: 'sample-1',
                type: 'ex-01',
                title: '전시 주제 선정',
                description: '전시의 핵심 주제를 정의합니다',
                category: 'exhibition',
                x: 100,
                y: 150,
                width: 200,
                height: 120,
                selected: false,
                aiStatus: null,
                aiOutput: null
            },
            {
                id: 'sample-2',
                type: 'ex-02',
                title: '작품 선정',
                description: '전시 주제에 맞는 작품을 선별합니다',
                category: 'exhibition',
                x: 350,
                y: 150,
                width: 200,
                height: 120,
                selected: false,
                aiStatus: null,
                aiOutput: null
            },
            {
                id: 'sample-3',
                type: 'ex-03',
                title: '공간 배치 계획',
                description: '전시 공간의 동선과 배치를 설계합니다',
                category: 'exhibition',
                x: 600,
                y: 150,
                width: 200,
                height: 120,
                selected: false,
                aiStatus: null,
                aiOutput: null
            },
            {
                id: 'sample-4',
                type: 'pr-01',
                title: '마케팅 계획',
                description: '전시 홍보를 위한 마케팅 전략을 수립합니다',
                category: 'program',
                x: 225,
                y: 330,
                width: 200,
                height: 120,
                selected: false,
                aiStatus: null,
                aiOutput: null
            },
            {
                id: 'sample-5',
                type: 'pr-02',
                title: '전시 오픈',
                description: '전시를 정식으로 오픈합니다',
                category: 'program',
                x: 475,
                y: 330,
                width: 200,
                height: 120,
                selected: false,
                aiStatus: null,
                aiOutput: null
            }
        ];

        const sampleConnections = [
            {
                id: 'sample-conn-1',
                from: 'sample-1',
                to: 'sample-2',
                fromHandle: 'right',
                toHandle: 'left'
            },
            {
                id: 'sample-conn-2',
                from: 'sample-2',
                to: 'sample-3',
                fromHandle: 'right',
                toHandle: 'left'
            },
            {
                id: 'sample-conn-3',
                from: 'sample-2',
                to: 'sample-4',
                fromHandle: 'bottom',
                toHandle: 'top'
            },
            {
                id: 'sample-conn-4',
                from: 'sample-3',
                to: 'sample-5',
                fromHandle: 'bottom',
                toHandle: 'top'
            }
        ];
        
        return {
            nodes: sampleNodes,
            connections: sampleConnections
        };
    }
}

// Create global instance
window.SampleWorkflowGenerator = new SampleWorkflowGenerator();

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SampleWorkflowGenerator.init();
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        window.SampleWorkflowGenerator.init();
    }, 100);
}
