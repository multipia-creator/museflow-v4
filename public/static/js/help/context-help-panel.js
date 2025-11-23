/**
 * MuseFlow V4 - Context-Aware Help Panel
 * 
 * 사용자의 현재 컨텍스트(페이지, 작업, 역할)에 따라 동적으로 변하는
 * 도움말 패널을 제공합니다.
 * 
 * Features:
 * - Context detection (module, page, step, action, role, skill level)
 * - Dynamic help content based on user state
 * - Quick actions and shortcuts
 * - Contextual tips and best practices
 * - Related articles and tutorials
 * - Behavior tracking for analytics
 * - Integration with TooltipSystem
 * 
 * Usage:
 *   <script src="/static/js/help/context-help-panel.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', () => {
 *       ContextHelpPanel.init({
 *         position: 'right',  // 'right' or 'left'
 *         defaultOpen: false,
 *         userRole: 'curator',
 *         userSkillLevel: 'intermediate'
 *       });
 *     });
 *   </script>
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

const ContextHelpPanel = {
  // Configuration
  config: {
    position: 'right',
    defaultOpen: false,
    userRole: 'curator',
    userSkillLevel: 'intermediate',
    animationDuration: 300,
    autoDetectContext: true,
    trackBehavior: true
  },

  // Current context state
  context: {
    module: null,
    page: null,
    step: null,
    action: null,
    formFields: [],
    errors: [],
    lastActivity: Date.now()
  },

  // Panel state
  state: {
    isOpen: false,
    isPinned: false,
    currentContent: null,
    history: []
  },

  // Help content database organized by context
  helpContent: {
    // Collections Module
    'collections.list': {
      title: '소장품 목록 관리',
      icon: '🖼️',
      quickActions: [
        { label: '새 작품 등록', action: 'openArtworkWizard', icon: '➕' },
        { label: '일괄 가져오기', action: 'openBulkImport', icon: '📥' },
        { label: '검색 필터 사용법', action: 'showSearchTutorial', icon: '🔍' }
      ],
      tips: [
        '소장번호는 YYYY.### 형식으로 자동 생성됩니다',
        '필터를 저장하면 자주 사용하는 검색을 빠르게 재사용할 수 있습니다',
        '엑셀 내보내기는 최대 10,000개 행까지 지원합니다'
      ],
      commonQuestions: [
        {
          q: '작품을 삭제할 수 있나요?',
          a: '아니요. 데이터 무결성을 위해 작품은 삭제 대신 "보관처리"됩니다. 보관처리된 작품은 목록에 표시되지 않지만 감사 로그에는 남습니다.'
        },
        {
          q: '대량 작품을 한 번에 등록하려면?',
          a: '"일괄 가져오기" 기능을 사용하세요. CSV/엑셀 템플릿을 다운로드하고, 데이터를 입력한 후 업로드하면 검증 후 일괄 등록됩니다.'
        }
      ],
      relatedArticles: [
        { title: '소장품 등록 완전 가이드', url: '/help/artwork-registration' },
        { title: '소장번호 체계 이해하기', url: '/help/accession-numbers' },
        { title: '검색 필터 고급 활용법', url: '/help/advanced-search' }
      ],
      tutorials: [
        { title: '첫 작품 등록하기', videoId: 'first-artwork', duration: '3분' },
        { title: '일괄 가져오기 마스터', videoId: 'bulk-import', duration: '5분' }
      ]
    },

    'collections.register': {
      title: '작품 등록 Wizard',
      icon: '✍️',
      quickActions: [
        { label: '진행상황 저장', action: 'saveDraft', icon: '💾' },
        { label: '템플릿 불러오기', action: 'loadTemplate', icon: '📋' },
        { label: '이전 작품 복사', action: 'copyFromPrevious', icon: '📑' }
      ],
      tips: [
        '모든 필드는 자동 저장됩니다. 브라우저를 닫아도 작업 내용이 유지됩니다',
        '빨간색 별표(*)는 필수 항목입니다. 다음 단계로 진행하려면 반드시 입력해야 합니다',
        'AI 메타데이터 생성은 3-5초 소요됩니다. 생성 중에도 다른 필드를 편집할 수 있습니다'
      ],
      commonQuestions: [
        {
          q: '등록 중 오류가 발생하면 어떻게 하나요?',
          a: '걱정하지 마세요. 모든 입력 내용은 "임시저장"에 자동 보관됩니다. 페이지를 새로고침하면 "임시저장 불러오기" 버튼이 표시됩니다.'
        },
        {
          q: 'AI가 생성한 메타데이터를 수정할 수 있나요?',
          a: '네, 언제든지 수정 가능합니다. AI는 초안을 제공하는 도구일 뿐이며, 최종 승인은 전문가가 합니다.'
        }
      ],
      relatedArticles: [
        { title: '6단계 등록 프로세스 이해', url: '/help/registration-workflow' },
        { title: 'AI 메타데이터 생성 원리', url: '/help/ai-metadata' },
        { title: '필수 필드 vs 선택 필드', url: '/help/required-fields' }
      ],
      tutorials: [
        { title: '작품 등록 전체 과정', videoId: 'full-registration', duration: '8분' },
        { title: 'AI 기능 100% 활용법', videoId: 'ai-features', duration: '4분' }
      ]
    },

    'collections.register.step1': {
      title: 'Step 1: 기본 정보',
      icon: '1️⃣',
      quickActions: [
        { label: '소장번호 규칙 보기', action: 'showAccessionRules', icon: '📖' },
        { label: '작가 빠른 검색', action: 'searchArtist', icon: '🎨' }
      ],
      tips: [
        '소장번호는 시스템이 자동 생성하지만, 기존 번호 체계가 있다면 수동 입력도 가능합니다',
        '작가명은 "Last Name, First Name" 형식으로 입력하면 자동 정렬에 유리합니다',
        '제작년도가 불확실하면 "c. 1890" (circa) 또는 "1890-1900" (범위)로 입력하세요'
      ],
      fieldHelp: {
        accession_number: '작품의 영구 고유 식별자 (YYYY.###)',
        title: '작품의 공식 제목 (원어 제목도 함께 기록 권장)',
        artist: '제작자 이름 (복수 작가는 ; 로 구분)',
        date_created: '제작 연도 또는 추정 범위',
        medium: '재료 및 기법 (예: Oil on canvas, Bronze)',
        dimensions: '크기 (H x W x D cm)'
      }
    },

    'collections.register.step2': {
      title: 'Step 2: 상세 설명 & AI 생성',
      icon: '2️⃣',
      quickActions: [
        { label: 'AI 메타데이터 생성', action: 'generateAI', icon: '🤖' },
        { label: '예시 보기', action: 'showExamples', icon: '👁️' }
      ],
      tips: [
        'AI 생성 전 이미지를 먼저 업로드하면 더 정확한 설명을 얻을 수 있습니다',
        'AI가 생성한 내용은 반드시 검토하세요. 환각(hallucination) 가능성이 있습니다',
        '설명은 일반 관람객이 이해할 수 있는 쉬운 언어로 작성하세요'
      ],
      aiWarnings: [
        '⚠️ AI 신뢰도 점수가 70% 미만이면 수동 검증이 필요합니다',
        '⚠️ AI는 역사적 사실을 정확히 확인할 수 없습니다. 연도, 인명은 반드시 확인하세요',
        '⚠️ 생성된 텍스트는 법적 책임을 지지 않습니다. 최종 승인은 전문가의 몫입니다'
      ]
    },

    'collections.register.step3': {
      title: 'Step 3: 이미지 & 미디어',
      icon: '3️⃣',
      quickActions: [
        { label: '일괄 업로드', action: 'bulkUpload', icon: '📤' },
        { label: '이미지 편집', action: 'editImage', icon: '✂️' }
      ],
      tips: [
        '대표 이미지는 정면, 고해상도, 중립 배경이 이상적입니다',
        '최대 파일 크기: 20MB (초과 시 자동 압축)',
        '권장 형식: JPEG (사진), PNG (투명 배경), TIFF (원본 보관)'
      ],
      fileRequirements: {
        formats: ['JPEG', 'PNG', 'TIFF', 'WebP'],
        maxSize: '20MB',
        minResolution: '1200x1200px',
        maxFiles: 50
      }
    },

    'collections.register.step4': {
      title: 'Step 4: 출처 & 이력',
      icon: '4️⃣',
      quickActions: [
        { label: '타임라인 보기', action: 'viewTimeline', icon: '📅' },
        { label: '이력 템플릿', action: 'loadProvenanceTemplate', icon: '📋' }
      ],
      tips: [
        '출처(Provenance)는 작품의 소유권 이력을 연대순으로 기록합니다',
        '불분명한 구간이 있어도 정직하게 "Unknown" 또는 "Gap"으로 표시하세요',
        '전시 이력, 출판 이력도 함께 기록하면 작품 가치 증명에 유리합니다'
      ]
    },

    'collections.register.step5': {
      title: 'Step 5: 보존 상태',
      icon: '5️⃣',
      quickActions: [
        { label: 'AI 상태 평가', action: 'aiConditionAssessment', icon: '🔬' },
        { label: '상태 등급 가이드', action: 'conditionGuide', icon: '📊' }
      ],
      tips: [
        '상태 등급: Excellent > Good > Fair > Poor > Critical',
        '작은 손상도 정확히 기록하세요. 나중에 보존 계획 수립에 필수 자료입니다',
        'AI 상태 평가는 이미지 기반이므로 내부 손상은 감지하지 못합니다'
      ]
    },

    'collections.register.step6': {
      title: 'Step 6: 검토 & 제출',
      icon: '6️⃣',
      quickActions: [
        { label: '전체 미리보기', action: 'previewAll', icon: '👁️' },
        { label: '유효성 검사', action: 'validate', icon: '✔️' }
      ],
      tips: [
        '제출 전 모든 빨간색 경고를 해결하세요',
        '제출 후에도 수정 가능하지만, 승인 후에는 감사 로그가 남습니다',
        '"임시 제출"하면 동료 검토를 요청할 수 있습니다'
      ]
    },

    // Exhibitions Module
    'exhibitions.list': {
      title: '전시 관리',
      icon: '🎪',
      quickActions: [
        { label: '새 전시 만들기', action: 'createExhibition', icon: '➕' },
        { label: '전시 달력 보기', action: 'viewCalendar', icon: '📆' },
        { label: '예산 분석', action: 'viewBudgetAnalysis', icon: '💰' }
      ],
      tips: [
        '전시는 6단계 라이프사이클을 따릅니다: Draft → Review → Approved → Active → Completed → Archived',
        'AI 전시 기획 에이전트가 테마 제안, 작품 선정, 공간 배치를 도와줍니다',
        '방문자 동선 시뮬레이션으로 병목 구간을 사전에 발견할 수 있습니다'
      ],
      commonQuestions: [
        {
          q: '전시 종료 후 데이터는 어떻게 되나요?',
          a: 'Completed 상태로 전환되어 분석 데이터가 보관됩니다. 6개월 후 자동으로 Archived 상태로 전환됩니다.'
        }
      ]
    },

    'exhibitions.create': {
      title: '새 전시 만들기',
      icon: '✨',
      quickActions: [
        { label: 'AI 테마 제안', action: 'aiThemeSuggestion', icon: '💡' },
        { label: '과거 전시 복사', action: 'copyPastExhibition', icon: '📑' }
      ],
      tips: [
        '전시 제목은 간결하고 호기심을 자극해야 합니다 (예: "빛의 여정", "침묵의 언어")',
        '시작일/종료일은 설치·철거 기간을 고려해 여유 있게 설정하세요',
        'AI가 제안한 테마도 도메인 전문가의 검토가 필수입니다'
      ]
    },

    // User Management Module
    'users.list': {
      title: '사용자 관리',
      icon: '👥',
      quickActions: [
        { label: '새 사용자 초대', action: 'inviteUser', icon: '✉️' },
        { label: '역할 배정', action: 'assignRoles', icon: '🎭' },
        { label: '감사 로그 보기', action: 'viewAuditLog', icon: '📜' }
      ],
      tips: [
        'MuseFlow는 8개 기본 역할을 제공합니다: SuperAdmin, Admin, Curator, Conservator, Educator, Analyst, Viewer, Guest',
        '역할 권한은 계층적입니다. Admin은 Curator 권한도 자동 포함합니다',
        '사용자 초대 시 임시 비밀번호는 이메일로 전송되며 최초 로그인 시 변경됩니다'
      ]
    },

    // AI Models Module
    'ai.models': {
      title: 'AI 모델 관리',
      icon: '🤖',
      quickActions: [
        { label: '모델 재학습', action: 'retrainModel', icon: '🔄' },
        { label: '성능 벤치마크', action: 'runBenchmark', icon: '📊' },
        { label: '에러 로그', action: 'viewErrorLog', icon: '⚠️' }
      ],
      tips: [
        'MuseFlow는 8개 AI 에이전트를 사용합니다: Exhibition, Budget, Archive, Visitor, Digital Twin, Guide, Chatbot, Notion',
        '모델 성능이 떨어지면 (정확도 <85%) 재학습이 필요합니다',
        'AI 환각(hallucination) 방지를 위해 모든 출력에는 신뢰도 점수가 표시됩니다'
      ]
    },

    // Analytics Module
    'analytics.dashboard': {
      title: '분석 대시보드',
      icon: '📊',
      quickActions: [
        { label: '보고서 생성', action: 'generateReport', icon: '📄' },
        { label: '데이터 내보내기', action: 'exportData', icon: '📥' },
        { label: '실시간 모니터링', action: 'realtimeMonitor', icon: '📡' }
      ],
      tips: [
        '방문자 히트맵은 가장 인기 있는 전시 구역을 시각화합니다',
        '예측 분석은 과거 3년 데이터를 기반으로 다음 분기 방문자 수를 예측합니다',
        'A/B 테스트로 벽면 텍스트, 조명, 배치를 최적화할 수 있습니다'
      ]
    },

    // IoT Monitoring Module
    'iot.monitoring': {
      title: '환경 모니터링',
      icon: '🌡️',
      quickActions: [
        { label: '알림 설정', action: 'setAlerts', icon: '🔔' },
        { label: '센서 상태', action: 'sensorStatus', icon: '📡' },
        { label: '이상 탐지', action: 'anomalyDetection', icon: '🚨' }
      ],
      tips: [
        '온도 21-24°C, 습도 45-55%가 대부분 작품의 이상적 범위입니다',
        '조도는 작품 재질에 따라 다릅니다: 유화 150-300 lux, 종이 50 lux',
        '센서 데이터는 5분 간격으로 수집되며, 임계값 초과 시 즉시 알림이 발송됩니다'
      ]
    },

    // Storage & Media Module
    'storage.media': {
      title: '미디어 라이브러리',
      icon: '🗂️',
      quickActions: [
        { label: '일괄 업로드', action: 'bulkUpload', icon: '📤' },
        { label: '중복 파일 찾기', action: 'findDuplicates', icon: '🔍' },
        { label: '용량 분석', action: 'storageAnalysis', icon: '💾' }
      ],
      tips: [
        '파일은 Cloudflare R2에 안전하게 저장되며 CDN을 통해 빠르게 제공됩니다',
        '중복 제거 기능은 파일 해시(SHA-256)로 동일 파일을 감지합니다',
        '자동 백업은 매일 오전 2시(UTC)에 실행되며, 30일간 보관됩니다'
      ]
    },

    // Education Module
    'education.programs': {
      title: '교육 프로그램',
      icon: '🎓',
      quickActions: [
        { label: '새 프로그램 만들기', action: 'createProgram', icon: '➕' },
        { label: '참가자 관리', action: 'manageParticipants', icon: '👥' },
        { label: '설문조사', action: 'surveys', icon: '📋' }
      ],
      tips: [
        '교육 프로그램은 대상별로 세분화하세요: 초등학생, 중고생, 성인, 시니어',
        '사전/사후 퀴즈로 학습 효과를 측정할 수 있습니다',
        'VR/AR 디지털 트윈을 활용한 몰입형 교육이 가능합니다'
      ]
    },

    // Conservation Module
    'conservation.treatments': {
      title: '보존 처리',
      icon: '🔬',
      quickActions: [
        { label: '새 처리 기록', action: 'newTreatment', icon: '➕' },
        { label: 'AI 상태 평가', action: 'aiAssessment', icon: '🤖' },
        { label: '처리 이력', action: 'treatmentHistory', icon: '📜' }
      ],
      tips: [
        '보존 처리는 가역성(reversibility) 원칙을 따라야 합니다',
        '모든 처리는 사진, 비디오로 상세히 기록하세요',
        'AI 상태 평가는 참고용이며, 최종 판단은 보존 전문가가 합니다'
      ]
    },

    // System Settings Module
    'settings.system': {
      title: '시스템 설정',
      icon: '⚙️',
      quickActions: [
        { label: '백업 실행', action: 'runBackup', icon: '💾' },
        { label: '로그 보기', action: 'viewLogs', icon: '📜' },
        { label: '성능 진단', action: 'diagnostics', icon: '🔧' }
      ],
      tips: [
        '시스템 설정 변경은 감사 로그에 기록됩니다',
        '백업은 D1 데이터베이스, R2 파일, KV 설정을 모두 포함합니다',
        '성능 이슈 발생 시 Cloudflare Analytics에서 실시간 모니터링이 가능합니다'
      ]
    }
  },

  /**
   * Initialize the Context Help Panel
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    console.log('[ContextHelpPanel] Initializing...');
    
    // Merge config
    this.config = { ...this.config, ...options };
    
    // Inject styles
    this.injectStyles();
    
    // Create panel DOM
    this.createPanel();
    
    // Start context detection
    if (this.config.autoDetectContext) {
      this.startContextDetection();
    }
    
    // Set initial state
    if (this.config.defaultOpen) {
      this.open();
    }
    
    // Track behavior if enabled
    if (this.config.trackBehavior) {
      this.startBehaviorTracking();
    }
    
    console.log('[ContextHelpPanel] Initialized successfully');
  },

  /**
   * Inject CSS styles for the help panel
   */
  injectStyles() {
    if (document.getElementById('context-help-panel-styles')) return;

    const style = document.createElement('style');
    style.id = 'context-help-panel-styles';
    style.textContent = `
      /* Help Panel Container */
      .help-panel {
        position: fixed;
        top: 60px;
        ${this.config.position}: 0;
        width: 380px;
        height: calc(100vh - 60px);
        background: #ffffff;
        border-${this.config.position === 'right' ? 'left' : 'right'}: 1px solid #e5e7eb;
        box-shadow: ${this.config.position === 'right' ? '-4px' : '4px'} 0 16px rgba(0,0,0,0.1);
        transform: translateX(${this.config.position === 'right' ? '100%' : '-100%'});
        transition: transform ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .help-panel.open {
        transform: translateX(0);
      }

      .help-panel.pinned {
        position: relative;
        top: 0;
        height: 100%;
        transform: translateX(0);
      }

      /* Toggle Button */
      .help-panel-toggle {
        position: fixed;
        top: 50%;
        ${this.config.position}: 0;
        transform: translateY(-50%) translateX(${this.config.position === 'right' ? '100%' : '-100%'});
        transition: transform ${this.config.animationDuration}ms ease;
        z-index: 999;
        background: #4f46e5;
        color: white;
        border: none;
        padding: 16px 12px;
        border-radius: ${this.config.position === 'right' ? '8px 0 0 8px' : '0 8px 8px 0'};
        cursor: pointer;
        font-size: 20px;
        box-shadow: ${this.config.position === 'right' ? '-2px' : '2px'} 0 8px rgba(0,0,0,0.15);
        writing-mode: vertical-rl;
        text-orientation: mixed;
      }

      .help-panel-toggle:hover {
        background: #4338ca;
        box-shadow: ${this.config.position === 'right' ? '-4px' : '4px'} 0 12px rgba(0,0,0,0.2);
      }

      .help-panel.open + .help-panel-toggle {
        transform: translateY(-50%) translateX(0);
      }

      /* Header */
      .help-panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f9fafb;
        flex-shrink: 0;
      }

      .help-panel-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }

      .help-panel-actions {
        display: flex;
        gap: 8px;
      }

      .help-panel-action-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .help-panel-action-btn:hover {
        opacity: 1;
      }

      /* Content Area */
      .help-panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .help-panel-content::-webkit-scrollbar {
        width: 6px;
      }

      .help-panel-content::-webkit-scrollbar-track {
        background: #f3f4f6;
      }

      .help-panel-content::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      /* Section Styles */
      .help-section {
        margin-bottom: 24px;
      }

      .help-section-title {
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }

      /* Quick Actions */
      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .quick-action-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        color: #374151;
        text-align: left;
      }

      .quick-action-btn:hover {
        background: #f9fafb;
        border-color: #4f46e5;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
      }

      .quick-action-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      /* Tips */
      .help-tips {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .help-tip {
        display: flex;
        gap: 10px;
        padding: 12px;
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.5;
        color: #78350f;
      }

      .help-tip-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }

      /* Common Questions */
      .help-questions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .help-question {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
      }

      .help-question-header {
        padding: 12px;
        background: #f9fafb;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        color: #111827;
        font-size: 14px;
      }

      .help-question-header:hover {
        background: #f3f4f6;
      }

      .help-question-toggle {
        font-size: 12px;
        transition: transform 0.2s;
      }

      .help-question.open .help-question-toggle {
        transform: rotate(90deg);
      }

      .help-question-answer {
        padding: 12px;
        background: #ffffff;
        border-top: 1px solid #e5e7eb;
        font-size: 13px;
        line-height: 1.6;
        color: #4b5563;
        display: none;
      }

      .help-question.open .help-question-answer {
        display: block;
      }

      /* Related Articles */
      .help-articles {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .help-article-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        text-decoration: none;
        color: #4f46e5;
        font-size: 13px;
        transition: all 0.2s;
      }

      .help-article-link:hover {
        background: #eef2ff;
        border-color: #4f46e5;
      }

      .help-article-icon {
        flex-shrink: 0;
      }

      /* Tutorials */
      .help-tutorials {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .help-tutorial {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #dbeafe;
        border-left: 3px solid #3b82f6;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .help-tutorial:hover {
        background: #bfdbfe;
        transform: translateX(4px);
      }

      .help-tutorial-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .help-tutorial-info {
        flex: 1;
      }

      .help-tutorial-title {
        font-size: 14px;
        font-weight: 500;
        color: #1e40af;
        margin-bottom: 2px;
      }

      .help-tutorial-duration {
        font-size: 12px;
        color: #3b82f6;
      }

      /* AI Warnings */
      .help-warnings {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .help-warning {
        display: flex;
        gap: 10px;
        padding: 12px;
        background: #fee2e2;
        border-left: 3px solid #ef4444;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.5;
        color: #7f1d1d;
      }

      /* Empty State */
      .help-empty {
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
      }

      .help-empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .help-empty-text {
        font-size: 14px;
        line-height: 1.6;
      }

      /* Loading State */
      .help-loading {
        text-align: center;
        padding: 40px 20px;
      }

      .help-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .help-panel {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Create the help panel DOM structure
   */
  createPanel() {
    // Remove existing panel if any
    const existing = document.getElementById('context-help-panel');
    if (existing) existing.remove();

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'context-help-panel';
    panel.className = 'help-panel';
    panel.innerHTML = `
      <div class="help-panel-header">
        <div class="help-panel-title">
          <span class="help-panel-icon">❓</span>
          <span>도움말</span>
        </div>
        <div class="help-panel-actions">
          <button class="help-panel-action-btn" data-action="pin" title="패널 고정">📌</button>
          <button class="help-panel-action-btn" data-action="close" title="닫기">✖️</button>
        </div>
      </div>
      <div class="help-panel-content" id="help-panel-content">
        <div class="help-loading">
          <div class="help-loading-spinner"></div>
          <p>컨텍스트 감지 중...</p>
        </div>
      </div>
    `;

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'help-panel-toggle';
    toggleBtn.innerHTML = '도움말';
    toggleBtn.title = '도움말 패널 열기';

    // Attach event listeners
    toggleBtn.addEventListener('click', () => this.toggle());
    
    panel.querySelector('[data-action="close"]').addEventListener('click', () => this.close());
    panel.querySelector('[data-action="pin"]').addEventListener('click', () => this.togglePin());

    // Append to body
    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    this.panel = panel;
    this.toggleBtn = toggleBtn;
  },

  /**
   * Start automatic context detection
   */
  startContextDetection() {
    console.log('[ContextHelpPanel] Starting context detection...');

    // Initial detection
    this.detectContext();

    // Re-detect on route change
    const detectOnChange = () => {
      setTimeout(() => this.detectContext(), 100);
    };

    // Listen to URL changes (for SPAs)
    window.addEventListener('popstate', detectOnChange);
    
    // MutationObserver for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check if significant changes occurred
      const significantChange = mutations.some(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      );

      if (significantChange) {
        detectOnChange();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store for cleanup
    this.contextObserver = observer;
  },

  /**
   * Detect current context from page state
   */
  detectContext() {
    const context = {
      module: null,
      page: null,
      step: null,
      action: null,
      formFields: [],
      errors: [],
      lastActivity: Date.now()
    };

    // Detect from URL pathname
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s);

    if (segments.length > 0) {
      context.module = segments[0]; // e.g., 'collections', 'exhibitions'
      
      if (segments.length > 1) {
        context.page = segments[1]; // e.g., 'list', 'register', 'edit'
      }

      if (segments.length > 2) {
        context.action = segments[2]; // e.g., 'step1', 'step2'
      }
    }

    // Detect wizard step
    const stepIndicator = document.querySelector('[data-step]');
    if (stepIndicator) {
      context.step = stepIndicator.dataset.step;
    }

    // Detect form fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        if (field.name || field.id) {
          context.formFields.push(field.name || field.id);
        }
      });
    });

    // Detect errors
    const errorElements = document.querySelectorAll('.error, [data-error], .invalid');
    context.errors = Array.from(errorElements).map(el => el.textContent || el.dataset.error);

    // Update context
    this.context = context;

    console.log('[ContextHelpPanel] Context detected:', context);

    // Update panel content
    this.updateContent();
  },

  /**
   * Update panel content based on current context
   */
  updateContent() {
    const contentDiv = document.getElementById('help-panel-content');
    if (!contentDiv) return;

    // Build context key
    let contextKey = this.context.module;
    if (this.context.page) {
      contextKey += `.${this.context.page}`;
    }
    if (this.context.step) {
      contextKey += `.${this.context.step}`;
    }

    console.log('[ContextHelpPanel] Looking up content for:', contextKey);

    // Get help content
    const content = this.helpContent[contextKey];

    if (!content) {
      contentDiv.innerHTML = `
        <div class="help-empty">
          <div class="help-empty-icon">🤷</div>
          <div class="help-empty-text">
            현재 페이지에 대한 도움말이 준비되지 않았습니다.<br>
            일반 도움말은 <a href="/help" style="color: #4f46e5;">Help Center</a>를 참조하세요.
          </div>
        </div>
      `;
      return;
    }

    // Build content HTML
    let html = '';

    // Quick Actions
    if (content.quickActions && content.quickActions.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">빠른 작업</div>
          <div class="quick-actions">
            ${content.quickActions.map(action => `
              <button class="quick-action-btn" data-action="${action.action}">
                <span class="quick-action-icon">${action.icon}</span>
                <span>${action.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Tips
    if (content.tips && content.tips.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">💡 팁</div>
          <div class="help-tips">
            ${content.tips.map(tip => `
              <div class="help-tip">
                <span class="help-tip-icon">💡</span>
                <span>${tip}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // AI Warnings (if in AI-related context)
    if (content.aiWarnings && content.aiWarnings.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">⚠️ AI 주의사항</div>
          <div class="help-warnings">
            ${content.aiWarnings.map(warning => `
              <div class="help-warning">
                <span>${warning}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Common Questions
    if (content.commonQuestions && content.commonQuestions.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">자주 묻는 질문</div>
          <div class="help-questions">
            ${content.commonQuestions.map((qa, index) => `
              <div class="help-question" data-index="${index}">
                <div class="help-question-header">
                  <span class="help-question-toggle">▶</span>
                  <span>${qa.q}</span>
                </div>
                <div class="help-question-answer">${qa.a}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Related Articles
    if (content.relatedArticles && content.relatedArticles.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">관련 자료</div>
          <div class="help-articles">
            ${content.relatedArticles.map(article => `
              <a href="${article.url}" class="help-article-link">
                <span class="help-article-icon">📄</span>
                <span>${article.title}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Tutorials
    if (content.tutorials && content.tutorials.length > 0) {
      html += `
        <div class="help-section">
          <div class="help-section-title">튜토리얼 영상</div>
          <div class="help-tutorials">
            ${content.tutorials.map(tutorial => `
              <div class="help-tutorial" data-video-id="${tutorial.videoId}">
                <span class="help-tutorial-icon">🎥</span>
                <div class="help-tutorial-info">
                  <div class="help-tutorial-title">${tutorial.title}</div>
                  <div class="help-tutorial-duration">${tutorial.duration}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    contentDiv.innerHTML = html;

    // Attach event listeners
    this.attachContentListeners();

    // Store current content reference
    this.state.currentContent = content;
  },

  /**
   * Attach event listeners to dynamic content
   */
  attachContentListeners() {
    const contentDiv = document.getElementById('help-panel-content');
    if (!contentDiv) return;

    // Quick action buttons
    contentDiv.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Question toggles
    contentDiv.querySelectorAll('.help-question-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const question = e.currentTarget.closest('.help-question');
        question.classList.toggle('open');
        
        // Track interaction
        if (this.config.trackBehavior) {
          this.trackEvent('question_expanded', {
            question: question.querySelector('.help-question-header span:last-child').textContent
          });
        }
      });
    });

    // Tutorial clicks
    contentDiv.querySelectorAll('.help-tutorial').forEach(tutorial => {
      tutorial.addEventListener('click', (e) => {
        const videoId = e.currentTarget.dataset.videoId;
        this.playTutorial(videoId);
      });
    });

    // Article clicks tracking
    contentDiv.querySelectorAll('.help-article-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (this.config.trackBehavior) {
          this.trackEvent('article_clicked', {
            title: e.currentTarget.textContent.trim(),
            url: e.currentTarget.href
          });
        }
      });
    });
  },

  /**
   * Handle quick action button clicks
   * @param {string} action - Action identifier
   */
  handleQuickAction(action) {
    console.log('[ContextHelpPanel] Quick action:', action);

    // Track action
    if (this.config.trackBehavior) {
      this.trackEvent('quick_action', { action });
    }

    // Dispatch custom event for the main app to handle
    window.dispatchEvent(new CustomEvent('help:quickAction', {
      detail: { action, context: this.context }
    }));

    // You can also implement direct actions here
    // For example:
    // if (action === 'openArtworkWizard') {
    //   window.location.href = '/collections/register';
    // }
  },

  /**
   * Play tutorial video
   * @param {string} videoId - Video identifier
   */
  playTutorial(videoId) {
    console.log('[ContextHelpPanel] Playing tutorial:', videoId);

    // Track tutorial play
    if (this.config.trackBehavior) {
      this.trackEvent('tutorial_started', { videoId });
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('help:playTutorial', {
      detail: { videoId, context: this.context }
    }));

    // TODO: Implement video overlay player (Phase 3)
    alert(`튜토리얼 영상 재생: ${videoId}\n\n(Video Overlay Player는 Phase 3에서 구현 예정)`);
  },

  /**
   * Open the help panel
   */
  open() {
    this.panel.classList.add('open');
    this.state.isOpen = true;
    
    if (this.config.trackBehavior) {
      this.trackEvent('panel_opened', { context: this.context });
    }
  },

  /**
   * Close the help panel
   */
  close() {
    this.panel.classList.remove('open');
    this.state.isOpen = false;
    
    if (this.config.trackBehavior) {
      this.trackEvent('panel_closed', { context: this.context });
    }
  },

  /**
   * Toggle panel open/closed
   */
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Toggle pin state
   */
  togglePin() {
    this.state.isPinned = !this.state.isPinned;
    this.panel.classList.toggle('pinned');
    
    const pinBtn = this.panel.querySelector('[data-action="pin"]');
    pinBtn.innerHTML = this.state.isPinned ? '📍' : '📌';
    pinBtn.title = this.state.isPinned ? '고정 해제' : '패널 고정';
    
    if (this.config.trackBehavior) {
      this.trackEvent('panel_pinned', { pinned: this.state.isPinned });
    }
  },

  /**
   * Start behavior tracking
   */
  startBehaviorTracking() {
    console.log('[ContextHelpPanel] Starting behavior tracking...');

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { context: this.context });
      } else {
        this.trackEvent('page_visible', { context: this.context });
      }
    });

    // Track idle time
    let idleTimer;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.trackEvent('user_idle', { 
          context: this.context,
          idleTime: 30000 // 30 seconds
        });
      }, 30000);
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();
  },

  /**
   * Track behavior event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      context: this.context,
      userRole: this.config.userRole,
      userSkillLevel: this.config.userSkillLevel,
      ...data
    };

    console.log('[ContextHelpPanel] Tracking event:', event);

    // Send to analytics (implement your analytics endpoint)
    // fetch('/api/analytics/help-events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // });

    // For now, store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('help_events') || '[]');
    events.push(event);
    localStorage.setItem('help_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
  },

  /**
   * Get help content for specific context
   * @param {string} contextKey - Context key (e.g., 'collections.register.step2')
   * @returns {Object|null} Help content object
   */
  getContentForContext(contextKey) {
    return this.helpContent[contextKey] || null;
  },

  /**
   * Add custom help content
   * @param {string} contextKey - Context key
   * @param {Object} content - Help content object
   */
  addContent(contextKey, content) {
    this.helpContent[contextKey] = content;
    console.log(`[ContextHelpPanel] Added content for: ${contextKey}`);
  },

  /**
   * Update context manually (for programmatic control)
   * @param {Object} newContext - New context object
   */
  updateContext(newContext) {
    this.context = { ...this.context, ...newContext };
    this.updateContent();
  },

  /**
   * Destroy the help panel
   */
  destroy() {
    if (this.contextObserver) {
      this.contextObserver.disconnect();
    }
    
    if (this.panel) {
      this.panel.remove();
    }
    
    if (this.toggleBtn) {
      this.toggleBtn.remove();
    }

    const styles = document.getElementById('context-help-panel-styles');
    if (styles) {
      styles.remove();
    }

    console.log('[ContextHelpPanel] Destroyed');
  }
};

// Auto-initialize if data-auto-init attribute is present
if (document.querySelector('[data-context-help-auto-init]')) {
  document.addEventListener('DOMContentLoaded', () => {
    const config = document.querySelector('[data-context-help-auto-init]').dataset;
    ContextHelpPanel.init({
      position: config.position || 'right',
      defaultOpen: config.defaultOpen === 'true',
      userRole: config.userRole || 'curator',
      userSkillLevel: config.userSkillLevel || 'intermediate'
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextHelpPanel;
}
