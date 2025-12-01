/**
 * MuseFlow Template Library
 * Version: 8.1.0
 * 
 * 10개의 사전 정의된 프로젝트 템플릿
 * 커스텀 템플릿 생성/저장 기능
 */

class TemplateLibrary {
    constructor() {
        this.apiClient = window.apiClient;
        this.version = '8.1.0';
        this.templates = this.initializeTemplates();
        this.loadCustomTemplates();
    }

    /**
     * 사전 정의된 템플릿 초기화 (10개)
     */
    initializeTemplates() {
        return {
            // 1. 전시 관리
            exhibition: {
                id: 'exhibition',
                name: '전시 관리',
                icon: '🎨',
                color: '#8b5cf6',
                description: '전시 기획, 설치, 운영 및 평가',
                category: 'core',
                phases: ['기획', '준비', '설치', '개막', '운영', '평가'],
                defaultTasks: [
                    { title: '전시 기획안 작성', phase: 'planning', duration: 14 },
                    { title: '전시 공간 확보', phase: 'planning', duration: 7 },
                    { title: '작품 목록 확정', phase: 'preparation', duration: 10 },
                    { title: '전시 디자인 완료', phase: 'preparation', duration: 14 },
                    { title: '작품 운송 및 보험', phase: 'preparation', duration: 7 },
                    { title: '전시 설치 완료', phase: 'execution', duration: 10 },
                    { title: '개막식 준비', phase: 'execution', duration: 3 },
                    { title: '전시 운영 (60일)', phase: 'execution', duration: 60 },
                    { title: '철수 및 반환', phase: 'completed', duration: 7 },
                    { title: '전시 평가 보고서', phase: 'completed', duration: 7 }
                ],
                budget: {
                    planning: 5000000,
                    preparation: 15000000,
                    execution: 30000000,
                    marketing: 10000000,
                    total: 60000000
                }
            },

            // 2. 교육 프로그램
            education: {
                id: 'education',
                name: '교육 프로그램',
                icon: '🎓',
                color: '#06b6d4',
                description: '교육 프로그램 개발 및 실행',
                category: 'core',
                phases: ['기획', '개발', '준비', '실행', '평가'],
                defaultTasks: [
                    { title: '교육 목표 설정', phase: 'planning', duration: 5 },
                    { title: '교육 대상 분석', phase: 'planning', duration: 7 },
                    { title: '교육 커리큘럼 개발', phase: 'preparation', duration: 14 },
                    { title: '교육 자료 제작', phase: 'preparation', duration: 10 },
                    { title: '강사 섭외 및 교육', phase: 'preparation', duration: 7 },
                    { title: '교육 공간 준비', phase: 'execution', duration: 3 },
                    { title: '교육 프로그램 실행', phase: 'execution', duration: 30 },
                    { title: '참여자 만족도 조사', phase: 'completed', duration: 3 },
                    { title: '교육 효과 평가', phase: 'completed', duration: 7 }
                ],
                budget: {
                    planning: 2000000,
                    preparation: 8000000,
                    execution: 15000000,
                    total: 25000000
                }
            },

            // 3. 수집 & 보존
            archive: {
                id: 'archive',
                name: '수집 & 보존',
                icon: '📦',
                color: '#10b981',
                description: '유물 수집, 등록 및 보존',
                category: 'core',
                phases: ['조사', '협상', '수집', '등록', '보존'],
                defaultTasks: [
                    { title: '유물 조사 및 평가', phase: 'planning', duration: 14 },
                    { title: '소장자 협상', phase: 'planning', duration: 10 },
                    { title: '예산 및 계약', phase: 'preparation', duration: 7 },
                    { title: '유물 인수', phase: 'execution', duration: 3 },
                    { title: '유물 등록 (DB)', phase: 'execution', duration: 5 },
                    { title: '보존 처리', phase: 'execution', duration: 30 },
                    { title: '수장고 배치', phase: 'completed', duration: 3 }
                ],
                budget: {
                    planning: 3000000,
                    preparation: 20000000,
                    execution: 15000000,
                    total: 38000000
                }
            },

            // 4. 출판 & 콘텐츠
            publication: {
                id: 'publication',
                name: '출판 & 콘텐츠',
                icon: '📚',
                color: '#f59e0b',
                description: '도록 및 콘텐츠 제작',
                category: 'core',
                phases: ['기획', '집필', '편집', '인쇄', '배포'],
                defaultTasks: [
                    { title: '출판 기획안 작성', phase: 'planning', duration: 7 },
                    { title: '저자 섭외', phase: 'planning', duration: 10 },
                    { title: '원고 집필', phase: 'preparation', duration: 30 },
                    { title: '원고 검토 및 수정', phase: 'preparation', duration: 14 },
                    { title: '디자인 및 편집', phase: 'execution', duration: 21 },
                    { title: '교정 및 교열', phase: 'execution', duration: 7 },
                    { title: '인쇄 및 제본', phase: 'execution', duration: 14 },
                    { title: '배포 및 홍보', phase: 'marketing', duration: 10 }
                ],
                budget: {
                    planning: 2000000,
                    preparation: 5000000,
                    execution: 15000000,
                    marketing: 3000000,
                    total: 25000000
                }
            },

            // 5. 연구 & 조사
            research: {
                id: 'research',
                name: '연구 & 조사',
                icon: '🔬',
                color: '#ec4899',
                description: '학술 연구 및 조사',
                category: 'core',
                phases: ['기획', '조사', '분석', '보고서', '발표'],
                defaultTasks: [
                    { title: '연구 주제 선정', phase: 'planning', duration: 7 },
                    { title: '문헌 조사', phase: 'planning', duration: 14 },
                    { title: '현장 조사', phase: 'preparation', duration: 21 },
                    { title: '데이터 수집', phase: 'preparation', duration: 14 },
                    { title: '데이터 분석', phase: 'execution', duration: 30 },
                    { title: '연구 보고서 작성', phase: 'execution', duration: 21 },
                    { title: '학회 발표 준비', phase: 'completed', duration: 10 },
                    { title: '논문 투고', phase: 'completed', duration: 7 }
                ],
                budget: {
                    planning: 3000000,
                    preparation: 10000000,
                    execution: 12000000,
                    total: 25000000
                }
            },

            // 6. 행정 & 운영
            admin: {
                id: 'admin',
                name: '행정 & 운영',
                icon: '🏛️',
                color: '#6366f1',
                description: '예산, 인사 및 시설 관리',
                category: 'core',
                phases: ['기획', '실행', '모니터링', '평가'],
                defaultTasks: [
                    { title: '연간 예산 편성', phase: 'planning', duration: 14 },
                    { title: '인력 계획 수립', phase: 'planning', duration: 7 },
                    { title: '시설 유지보수 계획', phase: 'preparation', duration: 10 },
                    { title: '예산 집행 관리', phase: 'execution', duration: 90 },
                    { title: '인사 관리', phase: 'execution', duration: 90 },
                    { title: '시설 점검', phase: 'execution', duration: 90 },
                    { title: '분기별 보고서', phase: 'completed', duration: 7 }
                ],
                budget: {
                    planning: 5000000,
                    execution: 50000000,
                    total: 55000000
                }
            },

            // 7. 디지털 아카이브
            digital_archive: {
                id: 'digital_archive',
                name: '디지털 아카이브',
                icon: '💾',
                color: '#14b8a6',
                description: '소장품 디지털화 및 DB 구축',
                category: 'digital',
                phases: ['기획', '촬영', 'DB구축', '웹공개', '유지보수'],
                defaultTasks: [
                    { title: '디지털화 계획 수립', phase: 'planning', duration: 10 },
                    { title: '촬영 장비 준비', phase: 'preparation', duration: 7 },
                    { title: '유물 촬영 (1000점)', phase: 'execution', duration: 60 },
                    { title: '이미지 편집 및 정리', phase: 'execution', duration: 30 },
                    { title: 'DB 시스템 구축', phase: 'execution', duration: 45 },
                    { title: '메타데이터 입력', phase: 'execution', duration: 30 },
                    { title: '웹사이트 공개', phase: 'marketing', duration: 7 },
                    { title: '시스템 유지보수', phase: 'completed', duration: 90 }
                ],
                budget: {
                    planning: 5000000,
                    preparation: 15000000,
                    execution: 50000000,
                    marketing: 10000000,
                    total: 80000000
                }
            },

            // 8. 마케팅 캠페인
            marketing: {
                id: 'marketing',
                name: '마케팅 캠페인',
                icon: '📢',
                color: '#f43f5e',
                description: '전시/프로그램 홍보 및 마케팅',
                category: 'support',
                phases: ['기획', '제작', '실행', '분석'],
                defaultTasks: [
                    { title: '마케팅 전략 수립', phase: 'planning', duration: 7 },
                    { title: '타겟 분석', phase: 'planning', duration: 5 },
                    { title: '콘텐츠 제작 (포스터, 영상)', phase: 'preparation', duration: 14 },
                    { title: 'SNS 캠페인 준비', phase: 'preparation', duration: 7 },
                    { title: '온라인 광고 집행', phase: 'execution', duration: 30 },
                    { title: '오프라인 홍보', phase: 'execution', duration: 30 },
                    { title: '언론 보도자료 배포', phase: 'marketing', duration: 3 },
                    { title: '마케팅 효과 분석', phase: 'completed', duration: 7 }
                ],
                budget: {
                    planning: 2000000,
                    preparation: 8000000,
                    execution: 20000000,
                    marketing: 15000000,
                    total: 45000000
                }
            },

            // 9. 보존과학 프로젝트
            conservation: {
                id: 'conservation',
                name: '보존과학',
                icon: '🧪',
                color: '#8b5cf6',
                description: '유물 보존처리 및 과학조사',
                category: 'specialized',
                phases: ['조사', '진단', '처리', '모니터링'],
                defaultTasks: [
                    { title: '유물 상태 조사', phase: 'planning', duration: 7 },
                    { title: '과학적 분석 (X-ray, CT)', phase: 'planning', duration: 14 },
                    { title: '보존처리 계획 수립', phase: 'preparation', duration: 7 },
                    { title: '보존처리 실행', phase: 'execution', duration: 60 },
                    { title: '처리 후 상태 점검', phase: 'execution', duration: 7 },
                    { title: '보존 환경 모니터링 (90일)', phase: 'completed', duration: 90 },
                    { title: '보존처리 보고서', phase: 'completed', duration: 10 }
                ],
                budget: {
                    planning: 5000000,
                    preparation: 10000000,
                    execution: 30000000,
                    total: 45000000
                }
            },

            // 10. 커뮤니티 협력
            community: {
                id: 'community',
                name: '커뮤니티 협력',
                icon: '🤝',
                color: '#06b6d4',
                description: '지역사회 연계 프로그램',
                category: 'outreach',
                phases: ['협의', '기획', '실행', '평가'],
                defaultTasks: [
                    { title: '지역사회 수요 조사', phase: 'planning', duration: 10 },
                    { title: '협력 기관 발굴', phase: 'planning', duration: 14 },
                    { title: '협력 계약 체결', phase: 'preparation', duration: 7 },
                    { title: '프로그램 기획', phase: 'preparation', duration: 14 },
                    { title: '프로그램 실행 (60일)', phase: 'execution', duration: 60 },
                    { title: '참여자 피드백 수집', phase: 'completed', duration: 7 },
                    { title: '협력 성과 보고서', phase: 'completed', duration: 10 }
                ],
                budget: {
                    planning: 3000000,
                    preparation: 7000000,
                    execution: 20000000,
                    total: 30000000
                }
            }
        };
    }

    /**
     * 커스텀 템플릿 로드 (localStorage)
     */
    loadCustomTemplates() {
        try {
            const customTemplatesJson = localStorage.getItem('museflow_custom_templates');
            this.customTemplates = customTemplatesJson ? JSON.parse(customTemplatesJson) : {};
        } catch (error) {
            console.error('Custom templates load error:', error);
            this.customTemplates = {};
        }
    }

    /**
     * 커스텀 템플릿 저장
     */
    saveCustomTemplates() {
        try {
            localStorage.setItem('museflow_custom_templates', JSON.stringify(this.customTemplates));
        } catch (error) {
            console.error('Custom templates save error:', error);
        }
    }

    /**
     * 모든 템플릿 가져오기 (사전 정의 + 커스텀)
     */
    getAllTemplates() {
        return { ...this.templates, ...this.customTemplates };
    }

    /**
     * 템플릿으로 프로젝트 생성
     */
    async createFromTemplate(templateId, customData = {}) {
        try {
            const template = this.templates[templateId] || this.customTemplates[templateId];
            
            if (!template) {
                throw new Error('템플릿을 찾을 수 없습니다.');
            }

            // 프로젝트 데이터 생성
            const projectData = {
                title: customData.title || `${template.name} - ${this.getDateString()}`,
                description: customData.description || template.description,
                type: template.id,
                phase: 'planning',
                start_date: customData.start_date || new Date().toISOString().split('T')[0],
                end_date: customData.end_date || this.calculateEndDate(template),
                metadata: {
                    template_id: templateId,
                    template_version: this.version,
                    phases: template.phases,
                    budget: template.budget,
                    created_from_template: true
                }
            };

            // 프로젝트 생성
            const project = await this.apiClient.projects.create(projectData);

            // 기본 작업 생성
            if (template.defaultTasks && template.defaultTasks.length > 0) {
                for (const task of template.defaultTasks) {
                    await this.apiClient.tasks.create({
                        project_id: project.id,
                        title: task.title,
                        phase: task.phase,
                        duration: task.duration,
                        status: 'pending'
                    });
                }
            }

            // 성공 알림
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ "${template.name}" 템플릿으로 프로젝트를 생성했습니다!`,
                    'success'
                );
            }

            return { success: true, project };
        } catch (error) {
            console.error('Template creation error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 프로젝트 생성 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 현재 프로젝트를 템플릿으로 저장
     */
    async saveAsTemplate(project, templateData) {
        try {
            const templateId = `custom_${Date.now()}`;
            
            this.customTemplates[templateId] = {
                id: templateId,
                name: templateData.name,
                icon: templateData.icon || '📋',
                color: templateData.color || '#6366f1',
                description: templateData.description,
                category: 'custom',
                phases: project.metadata?.phases || ['기획', '준비', '실행', '완료'],
                defaultTasks: templateData.tasks || [],
                budget: project.metadata?.budget || {},
                created_at: new Date().toISOString(),
                source_project_id: project.id
            };

            this.saveCustomTemplates();

            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ "${templateData.name}" 템플릿을 저장했습니다!`,
                    'success'
                );
            }

            return { success: true, templateId };
        } catch (error) {
            console.error('Save template error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 템플릿 저장 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 커스텀 템플릿 삭제
     */
    deleteCustomTemplate(templateId) {
        if (this.customTemplates[templateId]) {
            delete this.customTemplates[templateId];
            this.saveCustomTemplates();
            
            if (window.showInAppNotification) {
                window.showInAppNotification('✅ 템플릿을 삭제했습니다.', 'success');
            }
            
            return { success: true };
        }
        return { success: false, error: '템플릿을 찾을 수 없습니다.' };
    }

    /**
     * 종료일 자동 계산
     */
    calculateEndDate(template) {
        const startDate = new Date();
        const totalDays = template.defaultTasks
            ? template.defaultTasks.reduce((sum, task) => sum + task.duration, 0)
            : 90;
        
        startDate.setDate(startDate.getDate() + totalDays);
        return startDate.toISOString().split('T')[0];
    }

    /**
     * 날짜 문자열 생성
     */
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }
}

// 전역 인스턴스 생성
window.templateLibrary = new TemplateLibrary();

console.log('✅ Template Library V8.1.0 initialized with 10 templates');
