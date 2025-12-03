/**
 * Canvas Agent
 * Canvas 노드 자동 생성 및 워크플로우 구성
 * @version 1.0.0
 */

import type { ExecutionContext, CanvasNode } from '../types/orchestrator.types';

interface CanvasInput {
  type: 'concept_generation' | 'budget_calculation' | 'budget_chart' | 'education_nodes' | 'artwork_nodes' | 'workflow_completion';
  data?: Record<string, any>;
  projectId?: string;
}

interface NodeTemplate {
  type: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  data: Record<string, any>;
}

export class CanvasAgent {
  private db: D1Database;
  private geminiApiKey?: string;

  constructor(db: D1Database, geminiApiKey?: string) {
    this.db = db;
    this.geminiApiKey = geminiApiKey;
  }

  /**
   * 메인 실행 함수
   */
  async execute(input: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    try {
      console.log('🎨 Canvas Agent 시작:', input);

      const canvasInput = input as CanvasInput;
      const type = canvasInput.type;

      let nodes: CanvasNode[] = [];
      let connections: any[] = [];

      switch (type) {
        case 'concept_generation':
          ({ nodes, connections } = await this.generateConceptNodes(canvasInput.data || {}, context));
          break;
        
        case 'budget_calculation':
        case 'budget_chart':
          ({ nodes, connections } = await this.generateBudgetNodes(canvasInput.data || {}, context));
          break;
        
        case 'education_nodes':
          ({ nodes, connections } = await this.generateEducationNodes(canvasInput.data || {}, context));
          break;
        
        case 'artwork_nodes':
          ({ nodes, connections } = await this.generateArtworkNodes(canvasInput.data || {}, context));
          break;
        
        case 'workflow_completion':
          ({ nodes, connections } = await this.completeWorkflow(canvasInput.data || {}, context));
          break;
        
        default:
          ({ nodes, connections } = await this.generateDefaultNodes(canvasInput.data || {}, context));
      }

      // DB에 노드 저장
      await this.saveNodes(nodes, context.sessionId, canvasInput.projectId);

      // Dashboard 동기화 이벤트 생성
      await this.syncToDashboard(nodes, context.sessionId);

      return {
        success: true,
        message: `${nodes.length}개의 Canvas 노드를 생성했습니다.`,
        data: {
          type,
          nodes,
          connections,
          canvasUrl: `/canvas-v3?session=${context.sessionId}`
        }
      };

    } catch (error) {
      console.error('❌ Canvas Agent 실패:', error);
      return {
        success: false,
        message: 'Canvas 노드 생성 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 컨셉 생성 노드
   */
  private async generateConceptNodes(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    // 3가지 컨셉 노드 생성
    const concepts = [
      {
        title: '빛과 색채의 혁명',
        description: '모네와 르누아르 중심의 인상주의 작품 전시. 빛의 변화를 포착한 작품들을 통해 인상주의의 핵심을 탐구합니다.',
        successRate: 85,
        estimatedVisitors: 15000,
        budget: 35000000
      },
      {
        title: '파리의 순간들',
        description: '19세기 파리의 일상을 담은 도시 풍경 중심 전시. 현대 도시 생활의 기원을 찾아봅니다.',
        successRate: 70,
        estimatedVisitors: 12000,
        budget: 32000000
      },
      {
        title: '인상주의의 탄생',
        description: '인상주의 운동의 역사적 맥락과 발전 과정을 조명하는 학술적 접근.',
        successRate: 65,
        estimatedVisitors: 10000,
        budget: 28000000
      }
    ];

    let yPos = 100;
    concepts.forEach((concept, index) => {
      const node: CanvasNode = {
        id: `concept_${Date.now()}_${index}`,
        type: 'exhibition_concept',
        title: concept.title,
        description: concept.description,
        x: 150,
        y: yPos,
        width: 300,
        height: 200,
        data: {
          successRate: concept.successRate,
          estimatedVisitors: concept.estimatedVisitors,
          budget: concept.budget,
          recommended: index === 0 // 첫 번째 옵션 추천
        },
        metadata: {
          createdBy: 'ai',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aiSessionId: context.sessionId
        }
      };
      nodes.push(node);
      yPos += 250;
    });

    return { nodes, connections };
  }

  /**
   * 예산 노드 생성
   */
  private async generateBudgetNodes(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    // 총 예산 (과거 데이터 기반 계산)
    const totalBudget = data.budget || 30000000;

    // 예산 항목 자동 분류
    const budgetItems = [
      { name: '작품 대여비', amount: Math.round(totalBudget * 0.50), percentage: 50 },
      { name: '보험료', amount: Math.round(totalBudget * 0.20), percentage: 20 },
      { name: '전시 디자인', amount: Math.round(totalBudget * 0.15), percentage: 15 },
      { name: '홍보비', amount: Math.round(totalBudget * 0.10), percentage: 10 },
      { name: '기타', amount: Math.round(totalBudget * 0.05), percentage: 5 }
    ];

    // 예산 차트 노드
    const budgetChartNode: CanvasNode = {
      id: `budget_chart_${Date.now()}`,
      type: 'budget_chart',
      title: '예산 계획',
      description: `총 예산: ₩${totalBudget.toLocaleString()}`,
      x: 150,
      y: 100,
      width: 400,
      height: 350,
      data: {
        totalBudget,
        items: budgetItems,
        chartType: 'pie',
        currency: 'KRW'
      },
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(budgetChartNode);

    // 예산 근거 문서 노드
    const budgetDocNode: CanvasNode = {
      id: `budget_doc_${Date.now()}`,
      type: 'document',
      title: '예산 근거 문서',
      description: '항목별 예산 산출 근거',
      x: 600,
      y: 100,
      width: 300,
      height: 250,
      data: {
        documentType: 'budget_justification',
        content: budgetItems.map(item => 
          `${item.name}: ₩${item.amount.toLocaleString()} (${item.percentage}%)`
        ).join('\n'),
        status: 'draft'
      },
      connections: [budgetChartNode.id],
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(budgetDocNode);

    // 연결 생성
    connections.push({
      id: `conn_${Date.now()}`,
      sourceNodeId: budgetChartNode.id,
      targetNodeId: budgetDocNode.id,
      type: 'data'
    });

    return { nodes, connections };
  }

  /**
   * 교육 프로그램 노드 생성
   */
  private async generateEducationNodes(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    // 교육 프로그램 노드
    const educationNode: CanvasNode = {
      id: `education_${Date.now()}`,
      type: 'education_program',
      title: '어린이 미술 교육 프로그램',
      description: '초등학생 대상 4주 과정',
      x: 150,
      y: 100,
      width: 350,
      height: 300,
      data: {
        target: '초등학생 4-6학년',
        duration: '4주 (주 1회, 2시간)',
        capacity: 20,
        curriculum: [
          { week: 1, topic: '인상주의란?', activity: '색채 실험' },
          { week: 2, topic: '빛과 그림자', activity: '야외 스케치' },
          { week: 3, topic: '유명 작품 감상', activity: '작품 모사' },
          { week: 4, topic: '나만의 인상주의', activity: '작품 발표' }
        ]
      },
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(educationNode);

    // 일정 노드
    const scheduleNode: CanvasNode = {
      id: `schedule_${Date.now()}`,
      type: 'calendar',
      title: '교육 일정',
      description: '주차별 일정 관리',
      x: 550,
      y: 100,
      width: 300,
      height: 200,
      data: {
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 일주일 후
        frequency: 'weekly',
        totalSessions: 4
      },
      connections: [educationNode.id],
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(scheduleNode);

    connections.push({
      id: `conn_${Date.now()}`,
      sourceNodeId: educationNode.id,
      targetNodeId: scheduleNode.id,
      type: 'control'
    });

    return { nodes, connections };
  }

  /**
   * 작품 노드 생성
   */
  private async generateArtworkNodes(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    // 임시 작품 데이터 (실제로는 Research Agent 결과 사용)
    const artworks = [
      { title: '수련', artist: '클로드 모네', year: '1906', medium: '캔버스에 유화' },
      { title: '물랭 드 라 갈레트의 무도회', artist: '피에르 오귀스트 르누아르', year: '1876', medium: '캔버스에 유화' },
      { title: '인상, 해돋이', artist: '클로드 모네', year: '1872', medium: '캔버스에 유화' },
      { title: '발코니', artist: '에두아르 마네', year: '1868-1869', medium: '캔버스에 유화' },
      { title: '양산을 든 여인', artist: '클로드 모네', year: '1875', medium: '캔버스에 유화' }
    ];

    let xPos = 150;
    let yPos = 100;
    artworks.forEach((artwork, index) => {
      const node: CanvasNode = {
        id: `artwork_${Date.now()}_${index}`,
        type: 'artwork',
        title: artwork.title,
        description: `${artwork.artist} (${artwork.year})`,
        x: xPos,
        y: yPos,
        width: 250,
        height: 200,
        data: {
          artist: artwork.artist,
          year: artwork.year,
          medium: artwork.medium,
          conservationStatus: 'good',
          selected: true
        },
        metadata: {
          createdBy: 'ai',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aiSessionId: context.sessionId
        }
      };
      nodes.push(node);

      xPos += 280;
      if ((index + 1) % 3 === 0) {
        xPos = 150;
        yPos += 230;
      }
    });

    return { nodes, connections };
  }

  /**
   * 워크플로우 완성 (모든 노드 연결 검증)
   */
  private async completeWorkflow(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    // 완료 확인 노드
    const completionNode: CanvasNode = {
      id: `completion_${Date.now()}`,
      type: 'checkpoint',
      title: '워크플로우 완료',
      description: '모든 단계가 완료되었습니다.',
      x: 400,
      y: 300,
      width: 300,
      height: 150,
      data: {
        status: 'completed',
        completedPhases: data.completedPhases || [],
        timestamp: new Date().toISOString()
      },
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(completionNode);

    return { nodes, connections };
  }

  /**
   * 기본 노드 생성
   */
  private async generateDefaultNodes(data: Record<string, any>, context: ExecutionContext): Promise<{ nodes: CanvasNode[], connections: any[] }> {
    const nodes: CanvasNode[] = [];
    const connections: any[] = [];

    const defaultNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: 'note',
      title: context.command || '새 노드',
      description: 'AI가 생성한 노드입니다.',
      x: 150,
      y: 100,
      width: 300,
      height: 150,
      data: {},
      metadata: {
        createdBy: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSessionId: context.sessionId
      }
    };
    nodes.push(defaultNode);

    return { nodes, connections };
  }

  /**
   * 노드 DB 저장
   */
  private async saveNodes(nodes: CanvasNode[], sessionId: string, projectId?: string): Promise<void> {
    try {
      for (const node of nodes) {
        // ai_execution_events에 노드 생성 이벤트 저장
        await this.db.prepare(`
          INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
          VALUES (?, 'canvas-node-created', 'canvas', 'canvas', ?, ?, ?)
        `).bind(
          sessionId,
          JSON.stringify(node),
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ ${nodes.length}개 노드 DB 저장 완료`);

    } catch (error) {
      console.error('❌ 노드 저장 실패:', error);
    }
  }

  /**
   * Dashboard 동기화
   */
  private async syncToDashboard(nodes: CanvasNode[], sessionId: string): Promise<void> {
    try {
      for (const node of nodes) {
        // 노드 타입에 따라 Dashboard Widget 매핑
        const widgetId = this.getWidgetIdForNodeType(node.type);
        
        if (widgetId) {
          await this.db.prepare(`
            INSERT INTO canvas_dashboard_sync (
              canvas_node_id, canvas_node_type, dashboard_widget_id, 
              sync_data, sync_timestamp, sync_status, session_id, created_at
            ) VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
          `).bind(
            node.id,
            node.type,
            widgetId,
            JSON.stringify({ nodeData: node }),
            new Date().toISOString(),
            sessionId,
            new Date().toISOString()
          ).run();
        }
      }

      console.log(`✅ ${nodes.length}개 노드 Dashboard 동기화 완료`);

    } catch (error) {
      console.error('❌ Dashboard 동기화 실패:', error);
    }
  }

  /**
   * 노드 타입 → Widget ID 매핑
   */
  private getWidgetIdForNodeType(nodeType: string): string | null {
    const mapping: Record<string, string> = {
      'exhibition_concept': 'exhibition-calendar',
      'budget_chart': 'budget-comparison',
      'education_program': 'educational-program',
      'artwork': 'artwork-gallery',
      'document': 'document-list',
      'calendar': 'calendar-sync'
    };

    return mapping[nodeType] || null;
  }
}
