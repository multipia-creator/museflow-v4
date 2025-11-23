/**
 * MuseFlow V4 - Tutorial: Exhibition Creation
 * 
 * 사용자가 새로운 전시를 만드는 과정을 단계별로 안내하는
 * 인터랙티브 튜토리얼입니다.
 * 
 * Learning Objectives:
 * - 전시 생성 프로세스 이해
 * - 전시 라이프사이클 6단계 학습
 * - AI 테마 제안 기능 활용
 * - 작품 선정 및 공간 배치 경험
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

(function() {
  'use strict';

  // Tutorial definition
  const exhibitionCreationTutorial = {
    id: 'exhibition-creation',
    title: '새 전시 만들기',
    description: '첫 전시를 만드는 전체 과정을 체험해보세요. AI 테마 제안부터 작품 선정까지 모든 단계를 안내합니다.',
    category: 'exhibitions',
    difficulty: 'beginner',
    estimatedTime: '8분',
    prerequisites: [],

    // Callback when tutorial starts
    onStart: function() {
      console.log('[Tutorial] Starting Exhibition Creation tutorial');
      
      // Navigate to exhibitions page if not already there
      if (!window.location.pathname.includes('/exhibitions')) {
        // In a real app, this would navigate
        console.log('[Tutorial] Would navigate to /exhibitions');
      }
    },

    // Callback when tutorial completes
    onComplete: function(data) {
      console.log('[Tutorial] Exhibition Creation tutorial completed!', data);
      
      // Show achievement notification
      if (window.ToastSystem) {
        window.ToastSystem.success('🎉 축하합니다! "전시 만들기" 튜토리얼을 완료했습니다!');
      }

      // Unlock next tutorial
      unlockNextTutorial('artwork-registration');
    },

    // Callback when tutorial skipped
    onSkip: function(data) {
      console.log('[Tutorial] Exhibition Creation tutorial skipped', data);
    },

    // Tutorial steps
    steps: [
      // Step 1: Welcome & Introduction
      {
        title: '전시 만들기 튜토리얼에 오신 것을 환영합니다!',
        content: `
          이 튜토리얼에서는 <strong>새로운 전시를 만드는 전체 과정</strong>을 배웁니다.
          <br><br>
          MuseFlow의 전시 관리 시스템은 기획부터 종료까지 6단계 라이프사이클로 관리됩니다:
          <br><br>
          <strong>Draft → In Review → Approved → Active → Completed → Archived</strong>
          <br><br>
          준비되셨나요? 시작해봅시다! 🚀
        `,
        hint: '약 8분 소요됩니다. 언제든 건너뛰거나 중단할 수 있습니다.',
        target: null // No specific target for intro
      },

      // Step 2: Navigate to Exhibitions List
      {
        title: '전시 목록 페이지로 이동',
        content: `
          먼저 전시 관리 페이지로 이동해야 합니다.
          <br><br>
          좌측 메뉴에서 <strong>"전시"</strong> 메뉴를 클릭하세요.
        `,
        hint: '전시 메뉴는 🎪 아이콘으로 표시되어 있습니다.',
        target: 'nav a[href*="/exhibitions"]',
        waitFor: {
          type: 'click',
          target: 'nav a[href*="/exhibitions"]'
        }
      },

      // Step 3: Click "Create New Exhibition" Button
      {
        title: '새 전시 만들기 버튼 클릭',
        content: `
          전시 목록 페이지의 우측 상단에 있는 
          <strong>"새 전시 만들기"</strong> 버튼을 클릭하세요.
          <br><br>
          이 버튼을 클릭하면 전시 생성 폼이 열립니다.
        `,
        hint: 'Curator와 Admin 역할만 전시를 생성할 수 있습니다.',
        target: 'button[data-action="create-exhibition"], .btn-create-exhibition',
        waitFor: {
          type: 'click',
          target: 'button[data-action="create-exhibition"], .btn-create-exhibition'
        }
      },

      // Step 4: Enter Exhibition Title
      {
        title: '전시 제목 입력',
        content: `
          전시의 제목을 입력하세요.
          <br><br>
          좋은 전시 제목은:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>간결하고 명확해야 합니다 (5-10 단어)</li>
            <li>호기심을 자극해야 합니다</li>
            <li>전시의 주제를 암시해야 합니다</li>
          </ul>
          <br>
          예시: "빛의 여정", "침묵의 언어", "시간을 넘어"
        `,
        hint: '창의적이고 매력적인 제목을 선택하세요!',
        target: 'input[name="title"], input#exhibition-title',
        waitFor: {
          type: 'input',
          target: 'input[name="title"], input#exhibition-title'
        }
      },

      // Step 5: Set Exhibition Dates
      {
        title: '전시 기간 설정',
        content: `
          전시의 시작일과 종료일을 설정하세요.
          <br><br>
          <strong>중요:</strong> 실제 전시일 외에 설치/철거 기간도 고려해야 합니다.
          <br><br>
          권장 여유 기간:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>설치: 전시 시작 3-5일 전</li>
            <li>철거: 전시 종료 2-3일 후</li>
          </ul>
        `,
        hint: '시작일은 오늘 이후여야 합니다.',
        target: 'input[name="start_date"], input[type="date"]',
        waitFor: {
          type: 'change',
          target: 'input[name="start_date"], input[type="date"]'
        }
      },

      // Step 6: Select Exhibition Space
      {
        title: '전시 공간 선택',
        content: `
          전시가 열릴 공간을 선택하세요.
          <br><br>
          각 공간은 다음 정보를 제공합니다:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>면적 (㎡)</li>
            <li>벽면 길이</li>
            <li>최대 수용 인원</li>
            <li>환경 제어 장비</li>
          </ul>
          <br>
          전시 규모에 맞는 공간을 선택하세요.
        `,
        hint: '인기 공간은 미리 예약이 필요할 수 있습니다.',
        target: 'select[name="space"], select#exhibition-space',
        waitFor: {
          type: 'change',
          target: 'select[name="space"], select#exhibition-space'
        }
      },

      // Step 7: AI Theme Suggestion (Optional)
      {
        title: 'AI 테마 제안 활용 (선택사항)',
        content: `
          MuseFlow의 AI 에이전트가 소장품을 분석해 
          <strong>전시 테마를 자동으로 제안</strong>합니다! 🤖
          <br><br>
          "AI 테마 제안" 버튼을 클릭하면:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>소장품의 시대, 스타일, 주제 분석</li>
            <li>3-5개의 전시 테마 제안</li>
            <li>각 테마에 어울리는 작품 목록 추천</li>
          </ul>
          <br>
          이 단계는 선택사항입니다. 직접 테마를 작성할 수도 있습니다.
        `,
        hint: 'AI 제안은 참고용입니다. 최종 결정은 전문가가 합니다.',
        target: 'button[data-action="ai-theme-suggestion"]',
        waitFor: {
          type: 'click',
          target: 'button[data-action="ai-theme-suggestion"]'
        }
      },

      // Step 8: Select Artworks
      {
        title: '전시 작품 선정',
        content: `
          전시에 포함할 작품을 선정하세요.
          <br><br>
          작품 선정 방법:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li><strong>수동 선택:</strong> 소장품 목록에서 직접 선택</li>
            <li><strong>AI 추천:</strong> 테마에 어울리는 작품 자동 추천</li>
            <li><strong>필터 활용:</strong> 시대, 작가, 스타일로 필터링</li>
          </ul>
          <br>
          최소 5개 이상의 작품을 선택하세요.
        `,
        hint: '작품은 나중에도 추가/제거할 수 있습니다.',
        target: '.artwork-selector, #artwork-selection-panel',
        waitFor: {
          type: 'click',
          target: '.artwork-item, .artwork-card'
        }
      },

      // Step 9: Space Planning (Optional)
      {
        title: '공간 배치 계획 (선택사항)',
        content: `
          선택한 작품을 전시 공간에 배치할 수 있습니다.
          <br><br>
          MuseFlow는 다음 기능을 제공합니다:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li><strong>2D 평면도:</strong> 벽면에 작품 배치</li>
            <li><strong>방문자 동선 시뮬레이션:</strong> 관람 경로 예측</li>
            <li><strong>자동 배치:</strong> AI가 최적 배치 제안</li>
          </ul>
          <br>
          이 단계는 선택사항입니다.
        `,
        hint: '방문자 동선 시뮬레이션으로 병목 구간을 미리 발견할 수 있습니다.',
        target: '#space-planning-button',
        waitFor: {
          type: 'click',
          target: '#space-planning-button'
        }
      },

      // Step 10: Review & Submit
      {
        title: '검토 및 제출',
        content: `
          모든 정보를 확인하고 전시를 제출하세요.
          <br><br>
          제출하면:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>상태: Draft → <strong>In Review</strong></li>
            <li>검토자에게 알림 발송</li>
            <li>승인 전까지 수정 가능</li>
          </ul>
          <br>
          <strong>"제출" 버튼</strong>을 클릭하세요.
        `,
        hint: '제출 후에도 승인 전까지는 수정할 수 있습니다.',
        target: 'button[type="submit"], button[data-action="submit-exhibition"]',
        waitFor: {
          type: 'click',
          target: 'button[type="submit"], button[data-action="submit-exhibition"]'
        }
      },

      // Step 11: Completion
      {
        title: '축하합니다! 🎉',
        content: `
          첫 전시를 성공적으로 만들었습니다!
          <br><br>
          다음 단계:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>검토자가 전시를 승인할 때까지 대기</li>
            <li>승인 후 상태가 "Approved"로 변경됨</li>
            <li>시작일이 되면 자동으로 "Active" 상태로 전환</li>
          </ul>
          <br>
          전시 라이프사이클:
          <br>
          <strong>Draft → In Review → Approved → Active → Completed → Archived</strong>
          <br><br>
          이제 다른 튜토리얼을 진행하거나 실제 전시를 만들어보세요!
        `,
        hint: '다음 추천 튜토리얼: "작품 등록하기"',
        target: null
      }
    ]
  };

  // Helper function to unlock next tutorial
  function unlockNextTutorial(tutorialId) {
    try {
      const unlocked = JSON.parse(localStorage.getItem('unlocked_tutorials') || '[]');
      if (!unlocked.includes(tutorialId)) {
        unlocked.push(tutorialId);
        localStorage.setItem('unlocked_tutorials', JSON.stringify(unlocked));
        console.log('[Tutorial] Unlocked:', tutorialId);
      }
    } catch (error) {
      console.error('[Tutorial] Failed to unlock tutorial:', error);
    }
  }

  // Register tutorial when TutorialEngine is available
  if (typeof TutorialEngine !== 'undefined') {
    TutorialEngine.registerTutorial('exhibition-creation', exhibitionCreationTutorial);
    console.log('[Tutorial] Exhibition Creation tutorial registered');
  } else {
    // Wait for TutorialEngine to load
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof TutorialEngine !== 'undefined') {
        TutorialEngine.registerTutorial('exhibition-creation', exhibitionCreationTutorial);
        console.log('[Tutorial] Exhibition Creation tutorial registered (deferred)');
      }
    });
  }

  // Export for module usage
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exhibitionCreationTutorial;
  }
})();
