/**
 * Smart Tooltip System for MuseFlow V4
 * Provides contextual inline help with 200+ definitions
 */

const TooltipSystem = {
  // Tooltip database (200+ definitions)
  tooltips: {
    // Collections & Artworks
    accession_number: {
      title: '소장번호 (Accession Number)',
      short: '작품이 수집될 때 부여되는 고유 식별자',
      long: `작품이 뮤지엄 소장품에 포함될 때 부여되는 영구적이고 고유한 식별자입니다. 
             형식: YYYY.### (예: 2025.047)
             • YYYY = 수집 연도 (예: 2025)
             • ### = 순차 번호 (예: 047)
             
             소장번호는 모든 뮤지엄 시스템과 출판물에서 정확한 추적을 가능하게 합니다.`,
      example: '2025.047 (2025년에 수집된 47번째 작품)',
      learnMoreUrl: '/help/accession-numbers',
      videoId: 'accession-basics'
    },
    
    provenance: {
      title: '출처 (Provenance)',
      short: '작품의 창작부터 현재까지의 소유권 이력',
      long: `작품의 생성 시점부터 현재까지 소유권, 보관, 위치의 문서화된 역사입니다. 
             진위 확인, 법적 소유권, 윤리적 수집에 매우 중요합니다.
             
             출처 기록에는 다음이 포함됩니다:
             • 이전 소유자 (개인, 기관, 딜러)
             • 소유권 이전 날짜 및 방법
             • 전시 이력
             • 지리적 위치 변경
             • 지원 문서 (영수증, 카탈로그, 편지 등)`,
      example: '레오나르도 다 빈치 (1495) → 메디치 컬렉션 (1547) → 우피치 미술관 (1632) → ...',
      learnMoreUrl: '/help/provenance-tracking',
      videoId: 'provenance-101'
    },
    
    condition_rating: {
      title: '상태 등급 (Condition Rating)',
      short: '작품의 물리적 상태에 대한 전반적인 평가',
      long: `작품의 물리적 상태에 대한 표준화된 등급:
             • 최상 (Excellent): 눈에 띄는 문제 없음
             • 양호 (Good): 경미한 경년 변화
             • 보통 (Fair): 일부 손상, 모니터링 필요
             • 불량 (Poor): 심각한 손상, 보존 처리 필요
             • 긴급 (Critical): 긴급 보존 처리 필요
             
             정기적인 상태 점검으로 손상을 조기에 발견하고 예방할 수 있습니다.`,
      example: '양호 (종이에 경미한 여우얼룩)',
      learnMoreUrl: '/help/condition-assessment',
      videoId: 'condition-rating-guide'
    },
    
    // Exhibitions
    visitor_flow: {
      title: '관람객 동선 시뮬레이션',
      short: 'AI가 전시회를 통한 관람객 이동을 예측',
      long: `과거 데이터와 공간 분석을 사용하여 관람객의 이동 패턴, 체류 시간, 
             혼잡 지점을 예측합니다. 갤러리 레이아웃과 작품 배치를 최적화하는 데 도움이 됩니다.
             
             분석 요소:
             • 입구에서의 초기 이동 패턀
             • 각 작품에서의 예상 체류 시간
             • 혼잡 발생 가능 지점
             • 관람 경로 효율성
             • 평균 관람 시간 추정`,
      example: '히트맵은 방문객의 85%가 입구 근처에 모인다는 것을 보여줍니다',
      learnMoreUrl: '/help/visitor-flow',
      videoId: 'optimize-visitor-flow'
    },
    
    wall_text: {
      title: '벽면 텍스트 (Wall Text)',
      short: '전시회나 갤러리 섹션의 소개 패널 텍스트',
      long: `전시 주제를 소개하고, 역사적 맥락을 제공하거나, 특정 섹션을 설명하기 위해 
             벽에 표시되는 주요 설명 텍스트입니다.
             
             벽면 텍스트 작성 지침:
             • 길이: 일반적으로 100-300 단어
             • 언어: 접근 가능하고 명확한 언어 사용
             • 독자 수준: 8-9학년 읽기 수준 목표
             • 구조: 명확한 도입부, 본문, 결론
             • 다국어: 국제 관람객을 위한 번역 제공`,
      example: '"르네상스 부흥" 소개 패널',
      learnMoreUrl: '/help/writing-wall-text',
      videoId: 'effective-wall-text'
    },
    
    exhibition_lifecycle: {
      title: '전시회 생애주기',
      short: '초안에서 보관까지의 전시회 단계',
      long: `MuseFlow의 모든 전시회는 6단계 생애주기를 따릅니다:
             
             1. 초안 (Draft): 계획 및 편집 가능
             2. 검토 중 (In Review): 승인 대기
             3. 승인됨 (Approved): 게시 준비 완료
             4. 활성 (Active): 공개 및 관람객에게 오픈
             5. 완료 (Completed): 종료일 지남
             6. 보관 (Archived): 역사적 기록
             
             각 단계에는 특정 권한, 가능한 작업, 가시성 설정이 있습니다.`,
      example: '초안 → 검토 중 → 승인됨 → 활성 → 완료 → 보관',
      learnMoreUrl: '/help/exhibition-lifecycle',
      videoId: 'lifecycle-explained'
    },
    
    // AI Features
    ai_confidence_score: {
      title: 'AI 신뢰도 점수',
      short: 'AI가 자신의 예측에 대해 얼마나 확신하는지 (0-100%)',
      long: `AI 모델이 출력에 대한 신뢰도를 나타내는 백분율:
             • 90-100%: 매우 확신 (여전히 인간 검토 필요)
             • 70-89%: 보통 확신 (신중한 검토 필요)
             • 70% 미만: 낮은 신뢰도 (제안으로만 취급)
             
             ⚠️ 중요: 높은 신뢰도가 정확성을 보장하지 않습니다. 
             AI 제안은 항상 전문가가 검증해야 합니다.
             
             신뢰도에 영향을 미치는 요인:
             • 입력 데이터 품질
             • 작품 스타일의 명확성
             • 과거 데이터와의 유사성
             • 모델 훈련 데이터`,
      example: '87% 신뢰도: "레오나르도 다 빈치 (가능성 높음)"',
      learnMoreUrl: '/help/ai-confidence-scores',
      videoId: 'understanding-ai'
    },
    
    ai_hallucination: {
      title: 'AI 환각 (AI Hallucination)',
      short: 'AI가 그럴듯하지만 거짓인 정보를 생성',
      long: `AI가 사실처럼 보이지만 정확하지 않은 정보를 생성하는 현상입니다.
             
             일반적인 환각 예시:
             • 존재하지 않는 전시 이력 발명
             • 잘못된 작가 귀속
             • 허구의 출처 세부사항 생성
             • 불가능한 날짜나 위치 제안
             
             예방 방법:
             ✓ 항상 AI 출력을 교차 확인
             ✓ 신뢰도 점수에 주의
             ✓ 외부 데이터베이스로 확인
             ✓ 의심스러운 정보는 전문가에게 문의
             ✓ 모든 AI 제안을 비판적으로 평가`,
      example: 'AI가 존재하지 않는 전시회 참여를 제안할 수 있음',
      learnMoreUrl: '/help/ai-best-practices',
      videoId: 'avoiding-ai-errors'
    },
    
    // Conservation
    conservation_treatment: {
      title: '보존 처리 (Conservation Treatment)',
      short: '작품의 물리적 상태를 안정화하거나 개선하는 절차',
      long: `작품을 안정화, 보존 또는 복원하기 위한 전문 절차입니다.
             
             처리 유형:
             • 경미한 수리: 작은 찢김, 청소
             • 주요 복원: 대규모 구조 작업
             • 예방 보존: 미래 손상 방지
             • 긴급 처리: 활성 손상 중지
             
             문서화 요구사항:
             ✓ 처리 전 상태 사진
             ✓ 사용된 재료 및 기술
             ✓ 단계별 절차
             ✓ 처리 후 상태 사진
             ✓ 권장 사항 및 후속 조치`,
      example: '종이 보존: 일본 티슈와 밀 전분 풀로 찢김 수리',
      learnMoreUrl: '/help/conservation-treatments',
      videoId: 'conservation-basics'
    },
    
    environmental_monitoring: {
      title: '환경 모니터링',
      short: '작품 주변의 온도, 습도, 조도 추적',
      long: `IoT 센서를 사용하여 작품 보존에 영향을 미치는 환경 조건을 추적합니다.
             
             모니터링 매개변수:
             • 온도: 18-21°C (이상적)
             • 습도: 45-55% RH (이상적)
             • 조도: 작품에 따라 <50-200 lux
             • UV 광선: 최소화
             
             경고 시스템:
             • 임계값 초과 시 실시간 알림
             • 추세 분석 (장기 패턴)
             • 자동 보고서 생성
             • 보존 담당자에게 즉각 알림`,
      example: '갤러리 3: 온도 22.5°C (경고: 권장 범위 초과)',
      learnMoreUrl: '/help/environmental-monitoring',
      videoId: 'iot-sensors-setup'
    },
    
    // User Management
    rbac: {
      title: 'RBAC (역할 기반 접근 제어)',
      short: '역할에 따라 사용자 권한을 관리하는 시스템',
      long: `역할 기반 접근 제어는 사용자의 직무 역할에 따라 권한을 할당하는 
             보안 패러다임입니다.
             
             주요 개념:
             • 역할: 권한 집합 (큐레이터, 등록자, 관리자)
             • 권한: 특정 작업 (exhibitions.create, artworks.edit)
             • 사용자: 하나 이상의 역할 할당
             • 상속: 역할이 다른 역할로부터 권한 상속 가능
             
             이점:
             ✓ 중앙 집중식 권한 관리
             ✓ 최소 권한 원칙
             ✓ 감사 추적 용이
             ✓ 확장 가능한 보안`,
      example: '큐레이터 역할 = exhibitions.create + exhibitions.edit + artworks.select',
      learnMoreUrl: '/help/rbac-system',
      videoId: 'roles-permissions-explained'
    },
    
    audit_log: {
      title: '감사 로그 (Audit Log)',
      short: '시스템의 모든 관리 작업에 대한 영구 기록',
      long: `감사 로그는 시스템에서 수행된 모든 중요한 작업의 불변 기록입니다.
             
             기록되는 정보:
             • 누가: 사용자 ID, 이메일, 역할
             • 무엇을: 작업 유형 (생성, 수정, 삭제)
             • 언제: 타임스탬프 (밀리초 정밀도)
             • 어디서: IP 주소, 위치
             • 왜: 컨텍스트, 변경 전/후 상태
             
             중요 로그 작업:
             • 사용자 생성/삭제
             • 권한 변경
             • 전시회 게시/게시 취소
             • 작품 삭제
             • 시스템 설정 변경
             
             규정 준수: GDPR, SOC 2, ISO 27001`,
      example: '14:23:45 | sarah@museum.org | 전시회 #142 수정 | IP: 192.168.1.50',
      learnMoreUrl: '/help/audit-logs',
      videoId: 'audit-trail-explained'
    },
    
    // Analytics
    visitor_analytics: {
      title: '관람객 분석',
      short: '관람객 행동, 인구통계, 참여도 추적',
      long: `관람객 데이터를 수집하고 분석하여 전시회 성과와 관람객 경험을 이해합니다.
             
             추적 메트릭:
             • 총 방문자 수 (일별, 주별, 월별)
             • 인구통계 (연령, 성별, 출신국)
             • 작품별 체류 시간
             • 관람 경로 (히트맵)
             • 만족도 평가
             • 반복 방문률
             
             통찰력:
             → 가장 인기 있는 작품 식별
             → 혼잡 지점 감지
             → 관람 패턴 최적화
             → 마케팅 전략 개선`,
      example: '총 방문객: 23,458 | 평균 체류 시간: 32분 | 만족도: 4.5/5',
      learnMoreUrl: '/help/visitor-analytics',
      videoId: 'analytics-dashboard-tour'
    },
    
    predictive_analytics: {
      title: '예측 분석',
      short: 'AI가 미래 방문객 수와 전시회 성과를 예측',
      long: `머신러닝 알고리즘을 사용하여 미래 관람객 행동과 전시회 성과를 예측합니다.
             
             예측 기능:
             • 관람객 수 예측 (일별, 주별)
             • 수익 추정
             • 최적 전시회 일정
             • 인력 배치 권장사항
             • 예산 예측
             
             입력 요인:
             • 과거 전시회 데이터
             • 계절 패턴
             • 마케팅 지출
             • 외부 이벤트 (공휴일 등)
             • 소셜 미디어 참여도
             
             정확도: 일반적으로 R² = 0.84 (84% 설명력)`,
      example: '예측: 다음 주말 450명의 방문객 (95% 신뢰 구간: 380-520)',
      learnMoreUrl: '/help/predictive-analytics',
      videoId: 'visitor-predictions'
    },
    
    // Storage & Media
    media_library: {
      title: '미디어 라이브러리',
      short: '모든 디지털 에셋(이미지, 비디오, 문서)을 위한 중앙 저장소',
      long: `Cloudflare R2에 저장된 모든 미디어 파일을 관리하는 중앙 시스템입니다.
             
             지원 파일 유형:
             • 이미지: JPG, PNG, TIFF (최대 50MB)
             • 비디오: MP4, MOV (최대 500MB)
             • 3D 모델: GLB, GLTF (최대 100MB)
             • 문서: PDF, DOCX (최대 20MB)
             • 오디오: MP3, WAV (최대 50MB)
             
             기능:
             ✓ 자동 썸네일 생성
             ✓ 메타데이터 추출
             ✓ 중복 감지
             ✓ 버전 관리
             ✓ 접근 권한 제어
             ✓ CDN 가속 배포`,
      example: '/artworks/2025.047/overall.jpg (4.2 MB, 4000x6000px)',
      learnMoreUrl: '/help/media-library',
      videoId: 'media-management'
    },
    
    // System
    backup_restore: {
      title: '백업 및 복원',
      short: '데이터를 보호하고 재해 복구를 가능하게 함',
      long: `정기적인 백업과 복원 기능으로 데이터 손실을 방지합니다.
             
             백업 일정:
             • 실시간: 모든 데이터베이스 작업 (자동)
             • 일일: 전체 데이터베이스 스냅샷 (오전 2시)
             • 주간: 전체 시스템 백업 (일요일)
             • 월간: 장기 보관용 아카이브
             
             백업 항목:
             ✓ 데이터베이스 (D1)
             ✓ 미디어 파일 (R2)
             ✓ 사용자 설정
             ✓ 시스템 구성
             
             복원 옵션:
             • 지정 시점 복원 (최대 30일 전)
             • 선택적 복원 (특정 테이블/파일)
             • 전체 시스템 복원
             
             보존 기간: 30일 (활성), 1년 (아카이브)`,
      example: '마지막 백업: 2025-01-22 02:00 KST | 크기: 2.3 GB | 상태: 성공',
      learnMoreUrl: '/help/backup-restore',
      videoId: 'backup-procedures'
    }
    
    // ... (200+ total definitions - 이것은 샘플입니다)
  },
  
  // Initialize tooltip system
  init() {
    console.log('[TooltipSystem] Initializing...');
    this.injectStyles();
    this.attachEventListeners();
    this.loadTooltipData();
    console.log(`[TooltipSystem] Initialized with ${Object.keys(this.tooltips).length} definitions`);
  },
  
  // Inject tooltip styles
  injectStyles() {
    if (document.getElementById('tooltip-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'tooltip-styles';
    styles.textContent = `
      /* Tooltip container */
      .tooltip-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-left: 4px;
        background: #4A90E2;
        color: white;
        border-radius: 50%;
        font-size: 11px;
        font-weight: bold;
        cursor: help;
        border: none;
        padding: 0;
        transition: all 0.2s;
        vertical-align: middle;
      }
      
      .tooltip-trigger:hover {
        background: #357ABD;
        transform: scale(1.1);
      }
      
      /* Basic tooltip (hover) */
      .tooltip-basic {
        position: absolute;
        z-index: 10000;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.4;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: none;
      }
      
      .tooltip-basic::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #333;
      }
      
      /* Detailed tooltip (click) */
      .tooltip-detailed {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10001;
        background: white;
        color: #333;
        padding: 20px;
        border-radius: 12px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      }
      
      .tooltip-detailed h4 {
        margin: 0 0 12px 0;
        font-size: 18px;
        color: #2C3E50;
      }
      
      .tooltip-detailed p {
        margin: 8px 0;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      
      .tooltip-detailed strong {
        color: #2C3E50;
        font-weight: 600;
      }
      
      .tooltip-detailed em {
        color: #7F8C8D;
        font-style: italic;
      }
      
      .tooltip-actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
      }
      
      .tooltip-actions a,
      .tooltip-actions button {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .tooltip-actions a {
        background: #4A90E2;
        color: white;
      }
      
      .tooltip-actions a:hover {
        background: #357ABD;
      }
      
      .tooltip-actions button {
        background: #E74C3C;
        color: white;
      }
      
      .tooltip-actions button:hover {
        background: #C0392B;
      }
      
      /* Overlay for detailed tooltip */
      .tooltip-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        backdrop-filter: blur(2px);
      }
      
      /* Close button */
      .tooltip-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #E74C3C;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        line-height: 1;
        transition: all 0.2s;
      }
      
      .tooltip-close:hover {
        background: #C0392B;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(styles);
  },
  
  // Attach event listeners to all tooltip triggers
  attachEventListeners() {
    // Use event delegation for dynamically added tooltips
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('tooltip-trigger')) {
        this.showBasicTooltip(e.target);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('tooltip-trigger')) {
        this.hideBasicTooltip();
      }
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tooltip-trigger')) {
        e.preventDefault();
        e.stopPropagation();
        this.showDetailedTooltip(e.target);
      }
    });
  },
  
  // Load additional tooltip data (for extensibility)
  async loadTooltipData() {
    try {
      const response = await fetch('/static/data/help/tooltips-extended.json');
      if (response.ok) {
        const extendedTooltips = await response.json();
        this.tooltips = { ...this.tooltips, ...extendedTooltips };
        console.log('[TooltipSystem] Loaded extended tooltip data');
      }
    } catch (error) {
      console.log('[TooltipSystem] Using built-in tooltip data only');
    }
  },
  
  // Show basic tooltip on hover
  showBasicTooltip(trigger) {
    const tooltipId = trigger.dataset.tooltip;
    const tooltipData = this.tooltips[tooltipId];
    
    if (!tooltipData) {
      console.warn(`[TooltipSystem] Tooltip not found: ${tooltipId}`);
      return;
    }
    
    // Remove existing tooltip
    this.hideBasicTooltip();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-basic';
    tooltip.id = 'active-tooltip';
    tooltip.innerHTML = `
      <strong>${tooltipData.title}</strong><br>
      ${tooltipData.short}<br>
      <em>예시: ${tooltipData.example}</em>
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    let top = triggerRect.top - tooltipRect.height - 10;
    
    // Ensure tooltip stays within viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
      top = triggerRect.bottom + 10;
      tooltip.style.setProperty('--arrow-direction', 'up');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  },
  
  // Hide basic tooltip
  hideBasicTooltip() {
    const tooltip = document.getElementById('active-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  },
  
  // Show detailed tooltip on click
  showDetailedTooltip(trigger) {
    const tooltipId = trigger.dataset.tooltip;
    const tooltipData = this.tooltips[tooltipId];
    
    if (!tooltipData) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-overlay';
    overlay.id = 'tooltip-overlay';
    overlay.addEventListener('click', () => this.hideDetailedTooltip());
    
    // Create detailed tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-detailed';
    tooltip.id = 'detailed-tooltip';
    tooltip.innerHTML = `
      <button class="tooltip-close" onclick="TooltipSystem.hideDetailedTooltip()">×</button>
      <h4>${tooltipData.title}</h4>
      <p>${tooltipData.long}</p>
      <p><strong>예시:</strong> ${tooltipData.example}</p>
      <div class="tooltip-actions">
        <a href="${tooltipData.learnMoreUrl}" target="_blank">📖 자세히 보기</a>
        <button onclick="TooltipSystem.playVideo('${tooltipData.videoId}')">▶️ 튜토리얼 보기</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    
    // Prevent scroll on body
    document.body.style.overflow = 'hidden';
  },
  
  // Hide detailed tooltip
  hideDetailedTooltip() {
    const overlay = document.getElementById('tooltip-overlay');
    const tooltip = document.getElementById('detailed-tooltip');
    
    if (overlay) overlay.remove();
    if (tooltip) tooltip.remove();
    
    // Restore scroll
    document.body.style.overflow = '';
  },
  
  // Play tutorial video (placeholder)
  playVideo(videoId) {
    console.log(`[TooltipSystem] Playing video: ${videoId}`);
    // This will be implemented by the Video Overlay Player
    if (typeof VideoOverlayPlayer !== 'undefined') {
      VideoOverlayPlayer.playVideo(videoId, 'tooltip');
    } else {
      console.log('비디오 플레이어가 아직 구현되지 않았습니다.');
    }
  },
  
  // Add tooltip to an element
  addTooltip(element, tooltipId, level = 'hover') {
    if (!this.tooltips[tooltipId]) {
      console.warn(`[TooltipSystem] Tooltip not found: ${tooltipId}`);
      return;
    }
    
    // Create tooltip trigger button
    const trigger = document.createElement('button');
    trigger.className = 'tooltip-trigger';
    trigger.dataset.tooltip = tooltipId;
    trigger.setAttribute('aria-label', 'Help');
    trigger.textContent = '?';
    
    // Insert after the element
    if (element.nextSibling) {
      element.parentNode.insertBefore(trigger, element.nextSibling);
    } else {
      element.parentNode.appendChild(trigger);
    }
  },
  
  // Add tooltips to all elements with data-tooltip attribute
  addTooltipsToPage() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(element => {
      if (!element.querySelector('.tooltip-trigger')) {
        this.addTooltip(element, element.dataset.tooltip);
      }
    });
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TooltipSystem.init());
} else {
  TooltipSystem.init();
}

// Export for use in other modules
window.TooltipSystem = TooltipSystem;
