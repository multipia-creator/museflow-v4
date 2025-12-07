/**
 * MuseFlow Canvas V26.0 - Tutorial Integration
 * 
 * 기존 TutorialEngine, BehaviorDetector와 통합하여
 * 7가지 업무별 맞춤형 튜토리얼 제공
 * 
 * Features:
 * - Role-based Tutorial Scenarios
 * - TutorialEngine Integration
 * - BehaviorDetector Integration
 * - Auto Tutorial Start after Sample Data
 * 
 * @version 26.0.0
 * @date 2025-12-07
 */

const MuseumTutorialIntegration = {
  /**
   * Help Center V26 Integration
   */
  helpCenterURL: '/help-center',
  
  /**
   * 7가지 업무별 튜토리얼 시나리오
   */
  TUTORIAL_SCENARIOS: {
    // 1. 전시 기획 튜토리얼
    exhibition: {
      id: 'museum-exhibition-tutorial',
      title: '전시 기획 프로젝트 시작하기',
      description: '전시 기획 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: 'Projects 패널 확인',
          content: '왼쪽 Projects 패널에서 샘플 전시 프로젝트를 확인할 수 있습니다.',
          hint: '💡 프로젝트 카드를 클릭하면 상세 정보를 볼 수 있습니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: 'Tasks 패널 열기',
          content: 'Tasks 패널을 열어 전시 준비 작업들을 확인해보세요.',
          hint: '💡 상단 Tasks 버튼을 클릭하세요',
          target: '#tasks-panel-trigger',
          waitFor: { type: 'click', target: '#tasks-panel-trigger' }
        },
        {
          title: 'Canvas에서 워크플로우 확인',
          content: 'Canvas에 전시 기획 워크플로우가 시각화되어 있습니다. 각 카드는 드래그하여 이동할 수 있습니다.',
          hint: '💡 카드를 클릭하면 편집할 수 있습니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '새 작업 추가하기',
          content: 'Tasks 패널에서 "+ 새 작업" 버튼을 클릭하여 작업을 추가할 수 있습니다.',
          hint: '💡 실무에 맞게 작업을 자유롭게 추가하세요',
          target: null,
          waitFor: null
        }
      ]
    },

    // 2. 교육 프로그램 튜토리얼
    education: {
      id: 'museum-education-tutorial',
      title: '교육 프로그램 기획하기',
      description: '교육 프로그램 기획 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '교육 프로그램 프로젝트 확인',
          content: 'Projects 패널에서 청소년 미술 체험 프로그램 샘플을 확인할 수 있습니다.',
          hint: '💡 교육 프로그램은 커리큘럼부터 시작합니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '커리큘럼 워크플로우',
          content: 'Canvas에서 학습 목표 → 커리큘럼 → 교육 자료 → 강사진 흐름을 확인하세요.',
          hint: '💡 교육 프로그램은 체계적인 커리큘럼 설계가 중요합니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: 'Tasks로 일정 관리',
          content: 'Tasks 패널에서 교육 준비 일정을 단계별로 관리할 수 있습니다.',
          hint: '💡 마감일을 설정하여 일정을 체계적으로 관리하세요',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    },

    // 3. 소장품 수집 튜토리얼
    collection: {
      id: 'museum-collection-tutorial',
      title: '소장품 수집 프로세스',
      description: '소장품 수집 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '수집 프로젝트 확인',
          content: 'Projects 패널에서 신규 소장품 수집 프로젝트를 확인할 수 있습니다.',
          hint: '💡 소장품 수집은 조사부터 등록까지 여러 단계를 거칩니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '수집 워크플로우',
          content: 'Canvas에서 작품 조사 → 평가 → 협상 → 운송 → 등록 프로세스를 확인하세요.',
          hint: '💡 각 단계마다 전문가의 검토가 필요합니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '단계별 작업 관리',
          content: 'Tasks 패널에서 수집 단계별 작업을 관리하세요.',
          hint: '💡 우선순위를 설정하여 중요한 작업부터 처리하세요',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    },

    // 4. 보존 처리 튜토리얼
    conservation: {
      id: 'museum-conservation-tutorial',
      title: '소장품 보존 처리하기',
      description: '보존 처리 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '보존 프로젝트 확인',
          content: 'Projects 패널에서 소장품 보존 처리 프로젝트를 확인할 수 있습니다.',
          hint: '💡 보존 처리는 전문적인 지식이 필요한 작업입니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '보존 처리 프로세스',
          content: 'Canvas에서 상태 조사 → 계획 → 협업 → 실행 → 모니터링 흐름을 확인하세요.',
          hint: '💡 각 단계를 꼼꼼히 기록하는 것이 중요합니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '처리 일정 관리',
          content: 'Tasks 패널에서 보존 처리 일정을 관리하세요.',
          hint: '💡 보존 처리는 시간이 오래 걸리므로 장기 계획이 필요합니다',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    },

    // 5. 학술 출판 튜토리얼
    publishing: {
      id: 'museum-publishing-tutorial',
      title: '학술지 발간하기',
      description: '학술 출판 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '출판 프로젝트 확인',
          content: 'Projects 패널에서 학술지 발간 프로젝트를 확인할 수 있습니다.',
          hint: '💡 학술지는 연 2회 정기 발간됩니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '출판 프로세스',
          content: 'Canvas에서 원고 모집 → 심사 → 편집 → 디자인 → 인쇄 → 배포 흐름을 확인하세요.',
          hint: '💡 원고 심사가 가장 중요한 단계입니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '출판 일정 관리',
          content: 'Tasks 패널에서 발간 일정을 관리하세요.',
          hint: '💡 마감일을 엄수하는 것이 중요합니다',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    },

    // 6. 연구 튜토리얼
    research: {
      id: 'museum-research-tutorial',
      title: '학술 연구 프로젝트',
      description: '연구 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '연구 프로젝트 확인',
          content: 'Projects 패널에서 조선시대 회화 연구 프로젝트를 확인할 수 있습니다.',
          hint: '💡 연구 프로젝트는 장기간 진행됩니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '연구 프로세스',
          content: 'Canvas에서 문헌 조사 → 현장 조사 → 분석 → 집필 → 발표 흐름을 확인하세요.',
          hint: '💡 체계적인 자료 수집이 연구의 기초입니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '연구 일정 관리',
          content: 'Tasks 패널에서 연구 단계별 일정을 관리하세요.',
          hint: '💡 각 단계마다 충분한 시간을 배분하세요',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    },

    // 7. 행정 관리 튜토리얼
    administration: {
      id: 'museum-admin-tutorial',
      title: '행정 관리 업무',
      description: '행정 관리 업무의 기본 워크플로우를 학습합니다',
      category: 'museum',
      difficulty: 'beginner',
      estimatedTime: '3분',
      steps: [
        {
          title: '행정 프로젝트 확인',
          content: 'Projects 패널에서 연간 예산 집행 관리 프로젝트를 확인할 수 있습니다.',
          hint: '💡 행정 업무는 모든 부서를 지원합니다',
          target: '#projects-panel',
          waitFor: null
        },
        {
          title: '행정 프로세스',
          content: 'Canvas에서 예산 계획 → 모니터링 → 인사 관리 → 시설 관리 흐름을 확인하세요.',
          hint: '💡 예산 관리가 가장 중요한 업무입니다',
          target: '#canvas-area',
          waitFor: null
        },
        {
          title: '행정 일정 관리',
          content: 'Tasks 패널에서 행정 업무 일정을 관리하세요.',
          hint: '💡 정기적인 모니터링이 필요합니다',
          target: '#tasks-panel',
          waitFor: null
        }
      ]
    }
  },

  /**
   * Initialize tutorial integration
   */
  init() {
    console.log('[MuseumTutorialIntegration] Initializing...');

    // TutorialEngine이 없으면 skip
    if (!window.TutorialEngine) {
      console.warn('[MuseumTutorialIntegration] TutorialEngine not available');
      return;
    }

    // 모든 튜토리얼 등록
    this.registerAllTutorials();

    // 샘플 데이터 생성 후 자동 튜토리얼 시작 체크
    this.checkAutoTutorialStart();

    console.log('[MuseumTutorialIntegration] Initialized');
  },

  /**
   * 모든 튜토리얼 등록
   */
  registerAllTutorials() {
    Object.entries(this.TUTORIAL_SCENARIOS).forEach(([role, tutorial]) => {
      window.TutorialEngine.registerTutorial(tutorial.id, tutorial);
      console.log(`[MuseumTutorialIntegration] Registered tutorial: ${tutorial.id}`);
    });
  },

  /**
   * 자동 튜토리얼 시작 체크
   */
  checkAutoTutorialStart() {
    // 샘플 데이터가 방금 생성되었는지 확인
    const sampleDataRole = localStorage.getItem('museflow_sample_data_generated');
    const autoTutorialFlag = localStorage.getItem('museflow_auto_tutorial_started');

    if (sampleDataRole && !autoTutorialFlag) {
      console.log('[MuseumTutorialIntegration] Starting auto tutorial for:', sampleDataRole);
      
      // 2초 후 튜토리얼 시작 (페이지 로드 완료 대기)
      setTimeout(() => {
        this.startTutorialForRole(sampleDataRole);
        
        // 자동 시작 플래그 설정 (한 번만 실행)
        localStorage.setItem('museflow_auto_tutorial_started', 'true');
      }, 2000);
    }
  },

  /**
   * 역할별 튜토리얼 시작
   * @param {string} role - 역할 ID
   */
  startTutorialForRole(role) {
    const tutorial = this.TUTORIAL_SCENARIOS[role];
    
    if (!tutorial) {
      console.error('[MuseumTutorialIntegration] Tutorial not found for role:', role);
      return;
    }

    if (!window.TutorialEngine) {
      console.error('[MuseumTutorialIntegration] TutorialEngine not available');
      return;
    }

    console.log('[MuseumTutorialIntegration] Starting tutorial:', tutorial.id);

    window.TutorialEngine.start(tutorial.id, {
      autoAdvance: false,
      enableSkip: true,
      enableRestart: true,
      onComplete: () => {
        console.log('[MuseumTutorialIntegration] Tutorial completed:', tutorial.id);
        
        if (typeof showToast === 'function') {
          showToast('🎉 튜토리얼을 완료했습니다!', 'success');
        }

        // BehaviorDetector 활성화 (튜토리얼 완료 후 자율 학습 모드)
        this.enableBehaviorDetector();
      },
      onSkip: () => {
        console.log('[MuseumTutorialIntegration] Tutorial skipped:', tutorial.id);
        
        // BehaviorDetector 활성화
        this.enableBehaviorDetector();
      }
    });
  },

  /**
   * BehaviorDetector 활성화
   */
  enableBehaviorDetector() {
    if (!window.BehaviorDetector) {
      console.warn('[MuseumTutorialIntegration] BehaviorDetector not available');
      return;
    }

    console.log('[MuseumTutorialIntegration] Enabling BehaviorDetector...');

    // BehaviorDetector 초기화 (이미 초기화되어 있으면 skip)
    if (!window.BehaviorDetector.state?.isActive) {
      window.BehaviorDetector.init({
        idleTimeout: 30000, // 30초
        enableProactiveHelp: true,
        enableAnalytics: true,
        debugMode: false
      });
    }

    console.log('[MuseumTutorialIntegration] BehaviorDetector enabled');
  },

  /**
   * 수동으로 튜토리얼 시작
   * @param {string} role - 역할 ID
   */
  manualStartTutorial(role) {
    this.startTutorialForRole(role);
  },

  /**
   * 튜토리얼 재시작 (테스트용)
   */
  resetTutorial() {
    localStorage.removeItem('museflow_auto_tutorial_started');
    
    if (window.TutorialEngine) {
      const progress = window.TutorialEngine.getAllProgress();
      Object.keys(progress).forEach(tutorialId => {
        if (tutorialId.startsWith('museum-')) {
          delete progress[tutorialId];
        }
      });
      localStorage.setItem('tutorial_progress', JSON.stringify(progress));
    }

    console.log('✅ Tutorial reset. Reload page to see tutorial again.');
  }
};

// Global export
window.MuseumTutorialIntegration = MuseumTutorialIntegration;

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // TutorialEngine 로드 대기
    setTimeout(() => {
      window.MuseumTutorialIntegration.init();
    }, 1500);
  });
} else {
  setTimeout(() => {
    window.MuseumTutorialIntegration.init();
  }, 1500);
}

console.log('✅ MuseumTutorialIntegration V26.0 loaded');
