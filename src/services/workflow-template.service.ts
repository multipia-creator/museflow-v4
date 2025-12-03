/**
 * Workflow Template Service
 * 사전 정의된 워크플로우 템플릿 제공
 * @version 1.0.0
 */

import type { Workflow, ExecutionMode } from '../types/orchestrator.types';

export class WorkflowTemplateService {
  private templates: Map<string, Workflow>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * 템플릿 초기화
   */
  private initializeTemplates(): void {
    // 1. 전시 기획 워크플로우
    this.templates.set('exhibition_planning', {
      id: 'exhibition_planning',
      name: '전시 기획',
      description: '인상주의 전시 등 전시 기획 전 과정',
      estimatedDurationMs: 3600000, // 1시간
      requiredAgents: ['exhibition', 'research', 'canvas', 'document', 'widget', 'integration', 'monitor'],
      phases: [
        {
          id: 'phase_1_research',
          name: 'Phase 1: 리서치',
          description: '웹 검색 및 데이터 수집',
          order: 1,
          agent: 'research',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 900000, // 15분
          input: { query: '전시 기획 리서치' }
        },
        {
          id: 'phase_2_concept',
          name: 'Phase 2: 컨셉 생성',
          description: '3가지 전시 컨셉 제안',
          order: 2,
          agent: 'exhibition',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 600000, // 10분
          input: { type: 'concept_generation' }
        },
        {
          id: 'phase_3_budget',
          name: 'Phase 3: 예산 계산',
          description: '예산 항목 및 금액 계산',
          order: 3,
          agent: 'canvas',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 300000, // 5분
          input: { type: 'budget_calculation' }
        },
        {
          id: 'phase_4_promotion',
          name: 'Phase 4: 홍보 계획',
          description: 'SNS 콘텐츠 및 보도자료 생성',
          order: 4,
          agent: 'document',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 600000, // 10분
          input: { type: 'promotion_plan' }
        },
        {
          id: 'phase_5_education',
          name: 'Phase 5: 교육 프로그램',
          description: '교육 커리큘럼 생성',
          order: 5,
          agent: 'document',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 600000, // 10분
          input: { type: 'education_program' }
        },
        {
          id: 'phase_6_workflow',
          name: 'Phase 6: 워크플로우 완성',
          description: 'Canvas 노드 연결 및 검증',
          order: 6,
          agent: 'monitor',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 300000, // 5분
          input: { type: 'workflow_completion' }
        },
        {
          id: 'phase_7_integration',
          name: 'Phase 7: 외부 통합',
          description: 'Google Docs/Calendar 생성',
          order: 7,
          agent: 'integration',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 300000, // 5분
          input: { type: 'external_integration' }
        }
      ]
    });

    // 2. 예산 승인 워크플로우
    this.templates.set('budget_approval', {
      id: 'budget_approval',
      name: '예산 승인',
      description: '예산 항목 설정 및 승인',
      estimatedDurationMs: 300000, // 5분
      requiredAgents: ['budget', 'canvas', 'document', 'widget'],
      phases: [
        {
          id: 'phase_1_budget_analysis',
          name: 'Phase 1: 예산 분석',
          description: '과거 데이터 기반 예산 분석',
          order: 1,
          agent: 'budget',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 120000, // 2분
          input: { type: 'budget_analysis' }
        },
        {
          id: 'phase_2_budget_chart',
          name: 'Phase 2: 예산 차트 생성',
          description: 'Canvas에 예산 차트 노드 생성',
          order: 2,
          agent: 'canvas',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 120000, // 2분
          input: { type: 'budget_chart' }
        },
        {
          id: 'phase_3_document',
          name: 'Phase 3: 예산안 문서 작성',
          description: 'Google Docs 예산안 생성',
          order: 3,
          agent: 'document',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 60000, // 1분
          input: { type: 'budget_document' }
        }
      ]
    });

    // 3. 소장품 선정 워크플로우
    this.templates.set('collection_selection', {
      id: 'collection_selection',
      name: '소장품 선정',
      description: '전시용 소장품 검색 및 선정',
      estimatedDurationMs: 600000, // 10분
      requiredAgents: ['collection', 'canvas', 'widget'],
      phases: [
        {
          id: 'phase_1_search',
          name: 'Phase 1: 소장품 검색',
          description: 'DB에서 조건에 맞는 소장품 검색',
          order: 1,
          agent: 'collection',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 180000, // 3분
          input: { type: 'collection_search' }
        },
        {
          id: 'phase_2_conservation',
          name: 'Phase 2: 보존 상태 분석',
          description: 'AI 보존 상태 분석',
          order: 2,
          agent: 'collection',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 240000, // 4분
          input: { type: 'conservation_analysis' }
        },
        {
          id: 'phase_3_selection',
          name: 'Phase 3: 10점 자동 선정',
          description: 'Canvas에 작품 이미지 노드 생성',
          order: 3,
          agent: 'canvas',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 180000, // 3분
          input: { type: 'artwork_nodes' }
        }
      ]
    });

    // 4. 교육 프로그램 워크플로우
    this.templates.set('education_program', {
      id: 'education_program',
      name: '교육 프로그램 기획',
      description: '어린이/성인 대상 교육 프로그램 생성',
      estimatedDurationMs: 900000, // 15분
      requiredAgents: ['education', 'document', 'canvas', 'widget', 'integration'],
      phases: [
        {
          id: 'phase_1_curriculum',
          name: 'Phase 1: 커리큘럼 생성',
          description: '대상/목표/주차별 계획 생성',
          order: 1,
          agent: 'education',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 600000, // 10분
          input: { type: 'curriculum_generation' }
        },
        {
          id: 'phase_2_canvas',
          name: 'Phase 2: Canvas 노드 생성',
          description: '교육 프로그램 노드 생성',
          order: 2,
          agent: 'canvas',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 180000, // 3분
          input: { type: 'education_nodes' }
        },
        {
          id: 'phase_3_calendar',
          name: 'Phase 3: 일정 등록',
          description: 'Google Calendar 일정 등록',
          order: 3,
          agent: 'integration',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 120000, // 2분
          input: { type: 'calendar_registration' }
        }
      ]
    });

    // 5. 홍보 계획 워크플로우
    this.templates.set('promotion_planning', {
      id: 'promotion_planning',
      name: '홍보 계획',
      description: 'SNS, 보도자료, 이메일 캠페인 생성',
      estimatedDurationMs: 1200000, // 20분
      requiredAgents: ['document', 'integration', 'widget'],
      phases: [
        {
          id: 'phase_1_sns_content',
          name: 'Phase 1: SNS 콘텐츠 생성',
          description: '10개 SNS 포스트 생성',
          order: 1,
          agent: 'document',
          status: 'pending',
          requiresApproval: true,
          estimatedDurationMs: 600000, // 10분
          input: { type: 'sns_content' }
        },
        {
          id: 'phase_2_press_release',
          name: 'Phase 2: 보도자료 작성',
          description: '언론 배포용 보도자료',
          order: 2,
          agent: 'document',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 300000, // 5분
          input: { type: 'press_release' }
        },
        {
          id: 'phase_3_email',
          name: 'Phase 3: 이메일 캠페인',
          description: 'Gmail Draft 생성',
          order: 3,
          agent: 'integration',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 300000, // 5분
          input: { type: 'email_campaign' }
        }
      ]
    });
  }

  /**
   * Intent에 맞는 워크플로우 가져오기
   */
  getWorkflowByIntent(intent: string, mode: ExecutionMode): Workflow {
    const template = this.templates.get(intent);

    if (!template) {
      // 기본 워크플로우 반환
      return this.getDefaultWorkflow(intent, mode);
    }

    // Mode에 따라 승인 단계 조정
    if (mode === 'autonomous') {
      // 자율 모드에서는 모든 승인 단계 비활성화
      template.phases.forEach(phase => {
        phase.requiresApproval = false;
      });
    }

    return JSON.parse(JSON.stringify(template)); // Deep copy
  }

  /**
   * 기본 워크플로우
   */
  private getDefaultWorkflow(intent: string, mode: ExecutionMode): Workflow {
    return {
      id: 'default',
      name: '일반 작업',
      description: intent,
      estimatedDurationMs: 600000, // 10분
      requiredAgents: ['research', 'canvas', 'document'],
      phases: [
        {
          id: 'phase_1_research',
          name: 'Phase 1: 리서치',
          description: '정보 수집',
          order: 1,
          agent: 'research',
          status: 'pending',
          requiresApproval: false,
          estimatedDurationMs: 300000
        },
        {
          id: 'phase_2_execution',
          name: 'Phase 2: 실행',
          description: 'Canvas 워크플로우 생성',
          order: 2,
          agent: 'canvas',
          status: 'pending',
          requiresApproval: mode === 'conversational',
          estimatedDurationMs: 300000
        }
      ]
    };
  }

  /**
   * 모든 템플릿 목록
   */
  getAllTemplates(): Workflow[] {
    return Array.from(this.templates.values());
  }

  /**
   * 템플릿 존재 여부
   */
  hasTemplate(intent: string): boolean {
    return this.templates.has(intent);
  }
}
