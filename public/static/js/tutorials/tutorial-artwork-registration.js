/**
 * MuseFlow V4 - Tutorial: Artwork Registration
 * 
 * 사용자가 새로운 작품을 등록하는 6단계 프로세스를 
 * 단계별로 안내하는 인터랙티브 튜토리얼입니다.
 * 
 * Learning Objectives:
 * - 6단계 작품 등록 프로세스 이해
 * - 소장번호 체계 학습
 * - 필수 필드 vs 선택 필드 구분
 * - 이미지 업로드 및 메타데이터 입력
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

(function() {
  'use strict';

  // Tutorial definition
  const artworkRegistrationTutorial = {
    id: 'artwork-registration',
    title: '작품 등록하기',
    description: '소장품을 등록하는 6단계 프로세스를 배웁니다. 소장번호 부여부터 최종 제출까지 전체 과정을 체험하세요.',
    category: 'collections',
    difficulty: 'beginner',
    estimatedTime: '10분',
    prerequisites: [], // Can be accessed independently

    onStart: function() {
      console.log('[Tutorial] Starting Artwork Registration tutorial');
      
      // Navigate to collections page
      if (!window.location.pathname.includes('/collections')) {
        console.log('[Tutorial] Would navigate to /collections/register');
      }
    },

    onComplete: function(data) {
      console.log('[Tutorial] Artwork Registration tutorial completed!', data);
      
      if (window.ToastSystem) {
        window.ToastSystem.success('🎉 "작품 등록" 튜토리얼 완료! AI 메타데이터 튜토리얼이 잠금 해제되었습니다.');
      }

      // Unlock AI metadata tutorial
      unlockNextTutorial('ai-metadata-generation');
    },

    onSkip: function(data) {
      console.log('[Tutorial] Artwork Registration tutorial skipped', data);
    },

    steps: [
      // Step 1: Welcome
      {
        title: '작품 등록 튜토리얼',
        content: `
          이 튜토리얼에서는 <strong>6단계 작품 등록 프로세스</strong>를 배웁니다.
          <br><br>
          <strong>등록 단계:</strong>
          <ol style="margin: 12px 0; padding-left: 20px;">
            <li>기본 정보 (소장번호, 제목, 작가)</li>
            <li>상세 설명 & AI 생성</li>
            <li>이미지 & 미디어</li>
            <li>출처 & 이력</li>
            <li>보존 상태</li>
            <li>검토 & 제출</li>
          </ol>
          <br>
          모든 입력 내용은 자동 저장되므로 안심하세요! 💾
        `,
        hint: '약 10분 소요됩니다.',
        target: null
      },

      // Step 2: Navigate to Registration Page
      {
        title: '작품 등록 페이지로 이동',
        content: `
          좌측 메뉴에서 <strong>"소장품"</strong> 메뉴를 클릭한 후,
          <br>
          <strong>"새 작품 등록"</strong> 버튼을 클릭하세요.
        `,
        hint: '소장품 메뉴는 🖼️ 아이콘으로 표시되어 있습니다.',
        target: 'button[data-action="register-artwork"], .btn-register-artwork',
        waitFor: {
          type: 'click',
          target: 'button[data-action="register-artwork"], .btn-register-artwork'
        }
      },

      // Step 3: Accession Number
      {
        title: 'Step 1/6: 소장번호 입력',
        content: `
          작품의 고유 식별자인 <strong>소장번호(Accession Number)</strong>를 입력하세요.
          <br><br>
          <strong>형식:</strong> YYYY.### (예: 2025.047)
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li><strong>YYYY:</strong> 수집 연도 (4자리)</li>
            <li><strong>###:</strong> 해당 연도의 순번 (3자리)</li>
          </ul>
          <br>
          시스템이 자동으로 다음 번호를 제안하지만, 기존 번호 체계가 있다면 수동 입력도 가능합니다.
        `,
        hint: '소장번호는 영구적이며 변경할 수 없습니다.',
        target: 'input[name="accession_number"], input#accession-number',
        waitFor: {
          type: 'input',
          target: 'input[name="accession_number"], input#accession-number'
        }
      },

      // Step 4: Title and Artist
      {
        title: 'Step 1/6: 제목과 작가명 입력',
        content: `
          작품의 <strong>제목</strong>과 <strong>작가명</strong>을 입력하세요.
          <br><br>
          <strong>작품 제목:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>공식 제목을 정확히 입력</li>
            <li>원어 제목도 함께 기록 권장</li>
            <li>무제 작품은 "Untitled" 또는 "무제"로 표기</li>
          </ul>
          <br>
          <strong>작가명:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>형식: Last Name, First Name</li>
            <li>복수 작가는 세미콜론(;)으로 구분</li>
            <li>작가 미상은 "Unknown Artist" 또는 "미상"</li>
          </ul>
        `,
        hint: '제목과 작가명은 검색의 핵심 키워드입니다.',
        target: 'input[name="title"], input#artwork-title',
        waitFor: {
          type: 'input',
          target: 'input[name="title"], input#artwork-title'
        }
      },

      // Step 5: Date and Medium
      {
        title: 'Step 1/6: 제작년도와 재료 입력',
        content: `
          작품의 <strong>제작년도</strong>와 <strong>재료/기법</strong>을 입력하세요.
          <br><br>
          <strong>제작년도:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>정확한 연도: 1890</li>
            <li>추정: c. 1890 (circa)</li>
            <li>범위: 1890-1900</li>
          </ul>
          <br>
          <strong>재료/기법(Medium):</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>예: Oil on canvas (캔버스에 유화)</li>
            <li>예: Bronze sculpture (청동 조각)</li>
            <li>예: Ink on paper (종이에 먹)</li>
          </ul>
        `,
        hint: '영어와 한국어를 병기하면 검색에 유리합니다.',
        target: 'input[name="date_created"], input#date-created',
        waitFor: {
          type: 'input',
          target: 'input[name="date_created"], input#date-created'
        }
      },

      // Step 6: Navigate to Step 2 (AI Metadata)
      {
        title: 'Step 2/6로 이동',
        content: `
          기본 정보 입력이 완료되었습니다! ✅
          <br><br>
          이제 <strong>"다음 단계"</strong> 버튼을 클릭해 
          <strong>Step 2: 상세 설명 & AI 생성</strong>으로 이동하세요.
          <br><br>
          걱정하지 마세요. 입력한 내용은 자동으로 저장되었습니다! 💾
        `,
        hint: '빨간색 별표(*)는 필수 항목입니다.',
        target: 'button[data-action="next-step"], .btn-next-step',
        waitFor: {
          type: 'click',
          target: 'button[data-action="next-step"], .btn-next-step'
        }
      },

      // Step 7: Step 2 - AI Metadata Generation (covered in separate tutorial)
      {
        title: 'Step 2/6: 상세 설명 입력',
        content: `
          작품에 대한 <strong>상세 설명(Description)</strong>을 작성하세요.
          <br><br>
          좋은 설명은:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>일반 관람객이 이해할 수 있는 쉬운 언어</li>
            <li>작품의 시각적 특징 묘사</li>
            <li>역사적/문화적 맥락 설명</li>
            <li>3-5 문단 권장</li>
          </ul>
          <br>
          💡 <strong>팁:</strong> AI 메타데이터 생성 기능을 사용하면 
          초안을 자동으로 작성할 수 있습니다!
        `,
        hint: 'AI가 생성한 텍스트는 반드시 전문가가 검토해야 합니다.',
        target: 'textarea[name="description"], textarea#description',
        waitFor: {
          type: 'input',
          target: 'textarea[name="description"], textarea#description'
        }
      },

      // Step 8: Navigate to Step 3 (Images)
      {
        title: 'Step 3/6: 이미지 업로드',
        content: `
          작품의 <strong>대표 이미지</strong>를 업로드하세요.
          <br><br>
          <strong>이미지 요구사항:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>형식: JPEG, PNG, TIFF, WebP</li>
            <li>최대 크기: 20MB</li>
            <li>권장 해상도: 1200x1200px 이상</li>
            <li>배경: 중립 색상 (흰색/회색)</li>
          </ul>
          <br>
          <strong>"파일 선택"</strong> 또는 드래그 앤 드롭으로 업로드하세요.
        `,
        hint: '최대 50개의 이미지를 업로드할 수 있습니다.',
        target: 'input[type="file"], .upload-zone',
        waitFor: {
          type: 'change',
          target: 'input[type="file"]'
        }
      },

      // Step 9: Navigate to Step 4 (Provenance)
      {
        title: 'Step 4/6: 출처(Provenance) 기록',
        content: `
          작품의 <strong>소유권 이력(Provenance)</strong>을 시간순으로 기록하세요.
          <br><br>
          출처 정보는 작품의 진위와 가치를 증명하는 중요한 자료입니다.
          <br><br>
          각 단계마다:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>소유자 이름</li>
            <li>소유 기간</li>
            <li>획득 경위 (구매, 기증, 상속 등)</li>
          </ul>
          <br>
          불분명한 구간이 있어도 정직하게 "Unknown" 또는 "Gap"으로 표시하세요.
        `,
        hint: '출처 타임라인은 시각적으로 표시됩니다.',
        target: 'button[data-action="add-provenance"], .add-provenance-btn',
        waitFor: {
          type: 'click',
          target: 'button[data-action="add-provenance"], .add-provenance-btn'
        }
      },

      // Step 10: Navigate to Step 5 (Condition)
      {
        title: 'Step 5/6: 보존 상태 평가',
        content: `
          작품의 현재 <strong>보존 상태</strong>를 평가하세요.
          <br><br>
          <strong>상태 등급:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li><strong>Excellent:</strong> 완벽한 상태, 손상 없음</li>
            <li><strong>Good:</strong> 경미한 마모, 기능적 문제 없음</li>
            <li><strong>Fair:</strong> 눈에 띄는 손상, 보존 처리 권장</li>
            <li><strong>Poor:</strong> 심각한 손상, 보존 처리 필수</li>
            <li><strong>Critical:</strong> 긴급 보존 처리 필요</li>
          </ul>
          <br>
          💡 AI 상태 평가 기능을 사용하면 이미지 기반으로 자동 평가할 수 있습니다.
        `,
        hint: '작은 손상도 정확히 기록하세요.',
        target: 'select[name="condition"], select#condition-rating',
        waitFor: {
          type: 'change',
          target: 'select[name="condition"], select#condition-rating'
        }
      },

      // Step 11: Navigate to Step 6 (Review)
      {
        title: 'Step 6/6: 검토 및 제출',
        content: `
          마지막 단계입니다! 모든 정보를 검토하세요.
          <br><br>
          <strong>제출 전 체크리스트:</strong>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>✅ 모든 필수 필드(*)가 입력되었는지 확인</li>
            <li>✅ 소장번호가 올바른지 확인</li>
            <li>✅ 이미지가 정확한지 확인</li>
            <li>✅ 빨간색 경고가 없는지 확인</li>
          </ul>
          <br>
          <strong>"제출" 버튼</strong>을 클릭하세요!
        `,
        hint: '제출 후에도 수정할 수 있지만, 감사 로그에 기록됩니다.',
        target: 'button[type="submit"], button[data-action="submit-artwork"]',
        waitFor: {
          type: 'click',
          target: 'button[type="submit"], button[data-action="submit-artwork"]'
        }
      },

      // Step 12: Completion
      {
        title: '축하합니다! 🎉',
        content: `
          첫 작품 등록을 성공적으로 완료했습니다!
          <br><br>
          등록된 작품은 이제:
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>소장품 목록에서 검색 가능</li>
            <li>전시에 포함 가능</li>
            <li>보존 관리 대상으로 추적</li>
            <li>감사 로그로 모든 변경 추적</li>
          </ul>
          <br>
          다음 추천 튜토리얼: <strong>"AI 메타데이터 생성"</strong>
          <br>
          AI가 어떻게 작품을 분석하고 설명을 생성하는지 배워보세요!
        `,
        hint: 'AI 메타데이터 튜토리얼이 잠금 해제되었습니다!',
        target: null
      }
    ]
  };

  // Helper function
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

  // Register tutorial
  if (typeof TutorialEngine !== 'undefined') {
    TutorialEngine.registerTutorial('artwork-registration', artworkRegistrationTutorial);
    console.log('[Tutorial] Artwork Registration tutorial registered');
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof TutorialEngine !== 'undefined') {
        TutorialEngine.registerTutorial('artwork-registration', artworkRegistrationTutorial);
        console.log('[Tutorial] Artwork Registration tutorial registered (deferred)');
      }
    });
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = artworkRegistrationTutorial;
  }
})();
