/**
 * Widget Agent
 * Dashboard 위젯 자동 생성 및 업데이트
 * @version 1.0.0
 */

import type { ExecutionContext } from '../types/orchestrator.types';

interface WidgetInput {
  type: 'budget_comparison' | 'task_board' | 'exhibition_calendar' | 'artwork_gallery' | 'document_list' | 'educational_program' | 'visitor_analytics' | 'collection_status' | 'notification_center' | 'quick_actions';
  data?: Record<string, any>;
  canvasNodeId?: string;
}

interface WidgetData {
  widgetId: string;
  widgetType: string;
  title: string;
  data: Record<string, any>;
  chartConfig?: Record<string, any>;
  syncedFromCanvas: boolean;
  canvasNodeId?: string;
}

export class WidgetAgent {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 메인 실행 함수
   */
  async execute(input: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    try {
      console.log('📊 Widget Agent 시작:', input);

      const widgetInput = input as WidgetInput;
      const type = widgetInput.type;

      let widgets: WidgetData[] = [];

      switch (type) {
        case 'budget_comparison':
          widgets = await this.createBudgetComparisonWidget(widgetInput.data || {}, context);
          break;
        
        case 'task_board':
          widgets = await this.createTaskBoardWidget(widgetInput.data || {}, context);
          break;
        
        case 'exhibition_calendar':
          widgets = await this.createExhibitionCalendarWidget(widgetInput.data || {}, context);
          break;
        
        case 'artwork_gallery':
          widgets = await this.createArtworkGalleryWidget(widgetInput.data || {}, context);
          break;
        
        case 'document_list':
          widgets = await this.createDocumentListWidget(widgetInput.data || {}, context);
          break;
        
        case 'educational_program':
          widgets = await this.createEducationalProgramWidget(widgetInput.data || {}, context);
          break;
        
        case 'visitor_analytics':
          widgets = await this.createVisitorAnalyticsWidget(widgetInput.data || {}, context);
          break;
        
        case 'collection_status':
          widgets = await this.createCollectionStatusWidget(widgetInput.data || {}, context);
          break;
        
        case 'notification_center':
          widgets = await this.createNotificationCenterWidget(widgetInput.data || {}, context);
          break;
        
        case 'quick_actions':
          widgets = await this.createQuickActionsWidget(widgetInput.data || {}, context);
          break;
        
        default:
          widgets = await this.createDefaultWidget(widgetInput.data || {}, context);
      }

      // Canvas ↔ Dashboard 동기화 데이터 저장
      if (widgetInput.canvasNodeId) {
        await this.syncWithCanvas(widgets, widgetInput.canvasNodeId, context);
      }

      // DB에 위젯 정보 저장
      await this.saveWidgets(widgets, context.sessionId);

      return {
        success: true,
        message: `${widgets.length}개의 위젯을 생성/업데이트했습니다.`,
        data: {
          type,
          widgets,
          canvasNodeId: widgetInput.canvasNodeId
        }
      };

    } catch (error) {
      console.error('❌ Widget Agent 실패:', error);
      return {
        success: false,
        message: '위젯 생성 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 1. Budget Comparison Widget (예산 비교 차트)
   */
  private async createBudgetComparisonWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const totalBudget = data.budget || 30000000;
    
    const categories = [
      { name: '작품 대여비', planned: Math.round(totalBudget * 0.50), actual: Math.round(totalBudget * 0.48), color: '#3B82F6' },
      { name: '보험료', planned: Math.round(totalBudget * 0.20), actual: Math.round(totalBudget * 0.22), color: '#10B981' },
      { name: '전시 디자인', planned: Math.round(totalBudget * 0.15), actual: Math.round(totalBudget * 0.14), color: '#F59E0B' },
      { name: '홍보비', planned: Math.round(totalBudget * 0.10), actual: Math.round(totalBudget * 0.11), color: '#EF4444' },
      { name: '기타', planned: Math.round(totalBudget * 0.05), actual: Math.round(totalBudget * 0.05), color: '#8B5CF6' }
    ];

    return [{
      widgetId: 'budget-comparison',
      widgetType: 'budget_comparison',
      title: '예산 대비 실제 집행',
      data: {
        totalBudget,
        categories,
        summary: {
          totalPlanned: totalBudget,
          totalActual: categories.reduce((sum, cat) => sum + cat.actual, 0),
          variance: categories.reduce((sum, cat) => sum + cat.actual, 0) - totalBudget
        }
      },
      chartConfig: {
        type: 'bar',
        labels: categories.map(c => c.name),
        datasets: [
          {
            label: '계획',
            data: categories.map(c => c.planned),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: '실제',
            data: categories.map(c => c.actual),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '예산 대비 실제 집행' }
          }
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 2. Task Assignment Board Widget (업무 할당 보드)
   */
  private async createTaskBoardWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const tasks = [
      { id: 1, title: '작품 대여 계약 체결', assignee: '김큐레이터', status: 'completed', priority: 'high', dueDate: '2024-12-05' },
      { id: 2, title: '전시 공간 디자인', assignee: '박디자이너', status: 'in_progress', priority: 'high', dueDate: '2024-12-10' },
      { id: 3, title: '홍보 포스터 제작', assignee: '이마케터', status: 'in_progress', priority: 'medium', dueDate: '2024-12-15' },
      { id: 4, title: '도슨트 교육', assignee: '최교육팀장', status: 'pending', priority: 'medium', dueDate: '2024-12-20' },
      { id: 5, title: '보험 가입', assignee: '정관리자', status: 'pending', priority: 'high', dueDate: '2024-12-08' }
    ];

    const statusCounts = {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };

    return [{
      widgetId: 'task-assignment-board',
      widgetType: 'task_board',
      title: '업무 할당 현황',
      data: {
        tasks,
        statusCounts,
        summary: {
          total: tasks.length,
          completionRate: Math.round((statusCounts.completed / tasks.length) * 100)
        }
      },
      chartConfig: {
        type: 'doughnut',
        labels: ['대기', '진행중', '완료'],
        datasets: [{
          data: [statusCounts.pending, statusCounts.in_progress, statusCounts.completed],
          backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
          borderWidth: 2,
          borderColor: '#fff'
        }],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: '업무 상태 분포' }
          }
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 3. Exhibition Calendar Widget (전시 캘린더)
   */
  private async createExhibitionCalendarWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const events = [
      {
        id: 1,
        title: data.exhibitionName || '인상주의 특별전',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        type: 'exhibition',
        status: 'upcoming',
        color: '#3B82F6'
      },
      {
        id: 2,
        title: '큐레이터 토크',
        startDate: '2024-03-15',
        endDate: '2024-03-15',
        type: 'event',
        status: 'upcoming',
        color: '#10B981'
      },
      {
        id: 3,
        title: '어린이 교육 프로그램',
        startDate: '2024-03-10',
        endDate: '2024-05-25',
        type: 'program',
        status: 'upcoming',
        color: '#F59E0B'
      },
      {
        id: 4,
        title: '오프닝 리셉션',
        startDate: '2024-02-28',
        endDate: '2024-02-28',
        type: 'event',
        status: 'upcoming',
        color: '#EF4444'
      }
    ];

    return [{
      widgetId: 'exhibition-calendar',
      widgetType: 'exhibition_calendar',
      title: '전시 일정',
      data: {
        events,
        summary: {
          totalEvents: events.length,
          upcomingEvents: events.filter(e => e.status === 'upcoming').length,
          mainExhibition: events.find(e => e.type === 'exhibition')
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 4. Artwork Gallery Widget (작품 갤러리)
   */
  private async createArtworkGalleryWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const artworks = [
      {
        id: 1,
        title: '수련',
        artist: '클로드 모네',
        year: 1916,
        medium: '캔버스에 유채',
        dimensions: '200cm × 200cm',
        image: '/images/monet-waterlilies.jpg',
        status: 'confirmed',
        loanFee: 15000000
      },
      {
        id: 2,
        title: '무도회',
        artist: '피에르 오귀스트 르누아르',
        year: 1876,
        medium: '캔버스에 유채',
        dimensions: '131cm × 175cm',
        image: '/images/renoir-dance.jpg',
        status: 'confirmed',
        loanFee: 12000000
      },
      {
        id: 3,
        title: '인상, 해돋이',
        artist: '클로드 모네',
        year: 1872,
        medium: '캔버스에 유채',
        dimensions: '48cm × 63cm',
        image: '/images/monet-impression.jpg',
        status: 'pending',
        loanFee: 18000000
      },
      {
        id: 4,
        title: '풀밭 위의 점심식사',
        artist: '에두아르 마네',
        year: 1863,
        medium: '캔버스에 유채',
        dimensions: '208cm × 264cm',
        image: '/images/manet-lunch.jpg',
        status: 'confirmed',
        loanFee: 20000000
      },
      {
        id: 5,
        title: '발레 수업',
        artist: '에드가 드가',
        year: 1874,
        medium: '캔버스에 유채',
        dimensions: '85cm × 75cm',
        image: '/images/degas-ballet.jpg',
        status: 'confirmed',
        loanFee: 10000000
      }
    ];

    return [{
      widgetId: 'artwork-gallery',
      widgetType: 'artwork_gallery',
      title: '전시 작품 목록',
      data: {
        artworks,
        summary: {
          totalArtworks: artworks.length,
          confirmedArtworks: artworks.filter(a => a.status === 'confirmed').length,
          pendingArtworks: artworks.filter(a => a.status === 'pending').length,
          totalLoanFee: artworks.reduce((sum, a) => sum + a.loanFee, 0)
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 5. Document List Widget (문서 목록)
   */
  private async createDocumentListWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const documents = [
      {
        id: 1,
        title: '전시 기획서',
        type: 'planning',
        status: 'approved',
        author: '김큐레이터',
        createdAt: '2024-11-15',
        updatedAt: '2024-11-20',
        size: '2.5 MB',
        url: '/documents/exhibition-plan.pdf'
      },
      {
        id: 2,
        title: '예산 계획서',
        type: 'budget',
        status: 'approved',
        author: 'AI Orchestrator',
        createdAt: '2024-11-25',
        updatedAt: '2024-11-25',
        size: '1.2 MB',
        url: '/documents/budget-plan.pdf'
      },
      {
        id: 3,
        title: '홍보 계획서',
        type: 'promotion',
        status: 'in_review',
        author: '이마케터',
        createdAt: '2024-11-28',
        updatedAt: '2024-12-01',
        size: '3.8 MB',
        url: '/documents/promotion-plan.pdf'
      },
      {
        id: 4,
        title: '작품 대여 계약서',
        type: 'contract',
        status: 'signed',
        author: '박관리자',
        createdAt: '2024-11-10',
        updatedAt: '2024-11-18',
        size: '1.5 MB',
        url: '/documents/artwork-contract.pdf'
      },
      {
        id: 5,
        title: '교육 프로그램 커리큘럼',
        type: 'education',
        status: 'draft',
        author: '최교육팀장',
        createdAt: '2024-12-01',
        updatedAt: '2024-12-02',
        size: '0.8 MB',
        url: '/documents/education-curriculum.pdf'
      }
    ];

    return [{
      widgetId: 'document-list',
      widgetType: 'document_list',
      title: '문서 관리',
      data: {
        documents,
        summary: {
          totalDocuments: documents.length,
          approvedDocuments: documents.filter(d => d.status === 'approved').length,
          pendingDocuments: documents.filter(d => d.status === 'in_review').length,
          draftDocuments: documents.filter(d => d.status === 'draft').length
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 6. Educational Program Widget (교육 프로그램)
   */
  private async createEducationalProgramWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const programs = [
      {
        id: 1,
        title: '어린이 미술 체험',
        target: '초등학생 4-6학년',
        duration: '4주 (주 1회, 2시간)',
        capacity: 20,
        enrolled: 18,
        schedule: '매주 토요일 14:00-16:00',
        instructor: '최교육팀장',
        fee: 80000,
        status: 'open'
      },
      {
        id: 2,
        title: '큐레이터와 함께하는 전시 투어',
        target: '일반 성인',
        duration: '1회 (90분)',
        capacity: 30,
        enrolled: 30,
        schedule: '매주 수요일 11:00-12:30',
        instructor: '김큐레이터',
        fee: 0,
        status: 'full'
      },
      {
        id: 3,
        title: '인상주의 미술사 강좌',
        target: '미술 애호가',
        duration: '6주 (주 1회, 3시간)',
        capacity: 25,
        enrolled: 12,
        schedule: '매주 목요일 19:00-22:00',
        instructor: '외부 전문가',
        fee: 150000,
        status: 'open'
      }
    ];

    return [{
      widgetId: 'educational-program',
      widgetType: 'educational_program',
      title: '교육 프로그램',
      data: {
        programs,
        summary: {
          totalPrograms: programs.length,
          totalEnrolled: programs.reduce((sum, p) => sum + p.enrolled, 0),
          totalCapacity: programs.reduce((sum, p) => sum + p.capacity, 0),
          averageOccupancy: Math.round((programs.reduce((sum, p) => sum + p.enrolled, 0) / programs.reduce((sum, p) => sum + p.capacity, 0)) * 100)
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 7. Visitor Analytics Widget (방문자 분석)
   */
  private async createVisitorAnalyticsWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const dailyVisitors = [
      { date: '2024-12-01', visitors: 245, revenue: 3675000 },
      { date: '2024-12-02', visitors: 312, revenue: 4680000 },
      { date: '2024-12-03', visitors: 289, revenue: 4335000 },
      { date: '2024-12-04', visitors: 198, revenue: 2970000 },
      { date: '2024-12-05', visitors: 267, revenue: 4005000 },
      { date: '2024-12-06', visitors: 423, revenue: 6345000 },
      { date: '2024-12-07', visitors: 389, revenue: 5835000 }
    ];

    return [{
      widgetId: 'visitor-analytics',
      widgetType: 'visitor_analytics',
      title: '방문자 통계',
      data: {
        dailyVisitors,
        summary: {
          totalVisitors: dailyVisitors.reduce((sum, d) => sum + d.visitors, 0),
          averageDaily: Math.round(dailyVisitors.reduce((sum, d) => sum + d.visitors, 0) / dailyVisitors.length),
          totalRevenue: dailyVisitors.reduce((sum, d) => sum + d.revenue, 0),
          peakDay: dailyVisitors.reduce((max, d) => d.visitors > max.visitors ? d : max, dailyVisitors[0])
        }
      },
      chartConfig: {
        type: 'line',
        labels: dailyVisitors.map(d => d.date.substring(5)),
        datasets: [{
          label: '일일 방문자',
          data: dailyVisitors.map(d => d.visitors),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '일일 방문자 추이' }
          }
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 8. Collection Status Widget (소장품 현황)
   */
  private async createCollectionStatusWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const collections = {
      total: 1247,
      byCategory: [
        { category: '회화', count: 523, percentage: 42 },
        { category: '조각', count: 187, percentage: 15 },
        { category: '도자기', count: 312, percentage: 25 },
        { category: '서예', count: 149, percentage: 12 },
        { category: '기타', count: 76, percentage: 6 }
      ],
      byStatus: {
        onDisplay: 87,
        inStorage: 1098,
        onLoan: 45,
        underRestoration: 17
      }
    };

    return [{
      widgetId: 'collection-status',
      widgetType: 'collection_status',
      title: '소장품 현황',
      data: {
        collections,
        summary: {
          total: collections.total,
          displayRate: Math.round((collections.byStatus.onDisplay / collections.total) * 100),
          mostCategory: collections.byCategory[0].category
        }
      },
      chartConfig: {
        type: 'pie',
        labels: collections.byCategory.map(c => c.category),
        datasets: [{
          data: collections.byCategory.map(c => c.count),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderWidth: 2,
          borderColor: '#fff'
        }],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' },
            title: { display: true, text: '소장품 분류별 분포' }
          }
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 9. Notification Center Widget (알림 센터)
   */
  private async createNotificationCenterWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const notifications = [
      {
        id: 1,
        type: 'success',
        title: '예산 승인 완료',
        message: '전시 예산 30,000,000원이 승인되었습니다.',
        timestamp: '2024-12-03 10:30',
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'info',
        title: '새로운 작품 문의',
        message: '해외 미술관으로부터 작품 대여 문의가 도착했습니다.',
        timestamp: '2024-12-03 09:15',
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'warning',
        title: '교육 프로그램 마감 임박',
        message: '어린이 미술 체험 프로그램이 곧 마감됩니다. (2/20 잔여)',
        timestamp: '2024-12-02 18:45',
        read: true,
        priority: 'medium'
      },
      {
        id: 4,
        type: 'success',
        title: '문서 업로드 완료',
        message: 'AI가 홍보 계획서를 자동 생성했습니다.',
        timestamp: '2024-12-02 14:20',
        read: true,
        priority: 'low'
      },
      {
        id: 5,
        type: 'error',
        title: '작품 운송 지연',
        message: '모네 "수련" 작품 운송이 3일 지연될 예정입니다.',
        timestamp: '2024-12-01 16:00',
        read: true,
        priority: 'high'
      }
    ];

    return [{
      widgetId: 'notification-center',
      widgetType: 'notification_center',
      title: '알림',
      data: {
        notifications,
        summary: {
          total: notifications.length,
          unread: notifications.filter(n => !n.read).length,
          highPriority: notifications.filter(n => n.priority === 'high').length
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 10. Quick Actions Widget (빠른 작업)
   */
  private async createQuickActionsWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    const actions = [
      {
        id: 'create-exhibition',
        title: '전시 기획',
        icon: 'palette',
        description: 'AI가 전시를 자동 기획합니다',
        color: '#3B82F6',
        enabled: true
      },
      {
        id: 'budget-approval',
        title: '예산 승인',
        icon: 'dollar-sign',
        description: '예산 신청 및 승인 요청',
        color: '#10B981',
        enabled: true
      },
      {
        id: 'create-document',
        title: '문서 생성',
        icon: 'file-text',
        description: 'AI가 문서를 자동 작성합니다',
        color: '#F59E0B',
        enabled: true
      },
      {
        id: 'schedule-event',
        title: '일정 등록',
        icon: 'calendar',
        description: '새로운 이벤트 일정 추가',
        color: '#EF4444',
        enabled: true
      },
      {
        id: 'send-notification',
        title: '알림 발송',
        icon: 'bell',
        description: '팀원에게 알림 전송',
        color: '#8B5CF6',
        enabled: true
      },
      {
        id: 'export-report',
        title: '보고서 내보내기',
        icon: 'download',
        description: '현황 보고서 PDF 다운로드',
        color: '#6B7280',
        enabled: true
      }
    ];

    return [{
      widgetId: 'quick-actions',
      widgetType: 'quick_actions',
      title: '빠른 작업',
      data: {
        actions,
        summary: {
          totalActions: actions.length,
          enabledActions: actions.filter(a => a.enabled).length
        }
      },
      syncedFromCanvas: !!data.canvasNodeId,
      canvasNodeId: data.canvasNodeId
    }];
  }

  /**
   * 기본 위젯 생성
   */
  private async createDefaultWidget(data: Record<string, any>, context: ExecutionContext): Promise<WidgetData[]> {
    return [{
      widgetId: 'default-widget',
      widgetType: 'default',
      title: data.title || '위젯',
      data: data,
      syncedFromCanvas: false
    }];
  }

  /**
   * Canvas ↔ Dashboard 동기화 데이터 저장
   */
  private async syncWithCanvas(widgets: WidgetData[], canvasNodeId: string, context: ExecutionContext): Promise<void> {
    try {
      for (const widget of widgets) {
        await this.db.prepare(`
          INSERT INTO canvas_dashboard_sync (canvas_node_id, widget_id, sync_direction, sync_data, last_synced_at, created_at)
          VALUES (?, ?, 'canvas_to_dashboard', ?, ?, ?)
        `).bind(
          canvasNodeId,
          widget.widgetId,
          JSON.stringify(widget),
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ Canvas ↔ Dashboard 동기화 완료: ${widgets.length}개 위젯`);

    } catch (error) {
      console.error('❌ Canvas 동기화 실패:', error);
    }
  }

  /**
   * 위젯 DB 저장
   */
  private async saveWidgets(widgets: WidgetData[], sessionId: string): Promise<void> {
    try {
      for (const widget of widgets) {
        await this.db.prepare(`
          INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
          VALUES (?, 'agent-action', 'widget', 'widget', ?, ?, ?)
        `).bind(
          sessionId,
          JSON.stringify(widget),
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ ${widgets.length}개 위젯 DB 저장 완료`);

    } catch (error) {
      console.error('❌ 위젯 저장 실패:', error);
    }
  }
}
