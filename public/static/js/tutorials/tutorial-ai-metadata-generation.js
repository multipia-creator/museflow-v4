/**
 * Tutorial 3: AI Metadata Generation
 * 
 * AI 기반 메타데이터 생성 기능 활용 튜토리얼
 * 사용자가 AI 분석을 통해 작품 정보를 자동으로 생성하고,
 * AI 결과의 신뢰도를 이해하며, 휴먼 검증의 중요성을 학습합니다.
 * 
 * Learning Objectives:
 * - AI 메타데이터 생성 버튼 사용법 이해
 * - 이미지 업로드와 AI 분석 프로세스 학습
 * - AI 신뢰도 점수(Confidence Score) 해석
 * - AI 생성 콘텐츠의 검증 및 수정 방법
 * - AI Hallucination 위험성 인식
 * - 휴먼 전문가 검증의 필수성 이해
 * 
 * Prerequisites: artwork-registration (작품 등록 튜토리얼 완료 필요)
 * Difficulty: Intermediate
 * Estimated Time: 6분
 */

const aiMetadataGenerationTutorial = {
  id: 'ai-metadata-generation',
  title: 'AI 메타데이터 생성 활용',
  description: 'AI를 활용하여 작품의 메타데이터를 자동으로 생성하고, 신뢰도를 평가하며, 전문가 검증을 수행하는 방법을 배웁니다.',
  difficulty: 'intermediate', // beginner, intermediate, advanced
  estimatedTime: '6분',
  prerequisites: ['artwork-registration'], // 작품 등록 튜토리얼 선행 필요
  
  /**
   * Tutorial Steps
   * 각 단계는 title, content, target(spotlight), waitFor(action validation)를 포함
   */
  steps: [
    // Step 1: Welcome & Introduction
    {
      title: 'AI 메타데이터 생성 튜토리얼',
      content: `
        <div class="tutorial-welcome">
          <div class="icon-wrapper">
            <i class="fas fa-robot fa-3x" style="color: #7c3aed;"></i>
          </div>
          <h3>AI 기술로 작품 정보를 빠르게 생성하세요</h3>
          <p>이 튜토리얼에서는 <strong>AI 기반 메타데이터 생성</strong> 기능을 활용하는 방법을 배웁니다.</p>
          
          <div class="learning-objectives">
            <h4><i class="fas fa-graduation-cap"></i> 학습 목표</h4>
            <ul>
              <li><i class="fas fa-check-circle"></i> AI 메타데이터 생성 버튼 사용법</li>
              <li><i class="fas fa-check-circle"></i> AI 신뢰도 점수 해석 방법</li>
              <li><i class="fas fa-check-circle"></i> AI 결과의 검증 및 수정</li>
              <li><i class="fas fa-check-circle"></i> AI Hallucination 위험 인식</li>
            </ul>
          </div>
          
          <div class="tutorial-info">
            <span><i class="fas fa-clock"></i> 소요 시간: <strong>6분</strong></span>
            <span><i class="fas fa-signal"></i> 난이도: <strong>중급</strong></span>
          </div>
          
          <p class="tutorial-note">
            <i class="fas fa-info-circle"></i>
            <strong>참고:</strong> AI 생성 결과는 반드시 전문가가 검증해야 합니다.
          </p>
        </div>
      `,
      target: null, // No specific element to highlight
      hint: null
    },

    // Step 2: Navigate to Artwork Registration
    {
      title: '작품 등록 페이지로 이동',
      content: `
        <p>먼저 <strong>작품 등록 페이지</strong>로 이동합니다.</p>
        <p>좌측 사이드바 또는 메인 화면에서 <code>"작품 등록"</code> 버튼을 클릭하세요.</p>
        
        <div class="tutorial-tip">
          <i class="fas fa-lightbulb"></i>
          <strong>Tip:</strong> AI 메타데이터 생성은 작품 등록의 Step 4(이미지 업로드) 이후에 활성화됩니다.
        </div>
      `,
      target: 'button[data-action="register-artwork"]',
      hint: '작품 등록 버튼을 클릭하세요',
      waitFor: {
        type: 'click',
        target: 'button[data-action="register-artwork"]'
      }
    },

    // Step 3: Upload Image First
    {
      title: 'Step 4/6: 작품 이미지 업로드',
      content: `
        <p>AI 분석을 위해 먼저 <strong>작품 이미지를 업로드</strong>해야 합니다.</p>
        
        <div class="upload-requirements">
          <h4><i class="fas fa-image"></i> 이미지 요구사항</h4>
          <ul>
            <li><strong>파일 형식:</strong> JPG, PNG, WEBP</li>
            <li><strong>최소 해상도:</strong> 800x600px (권장: 1920x1080px)</li>
            <li><strong>파일 크기:</strong> 최대 10MB</li>
            <li><strong>품질:</strong> 작품 전체가 명확하게 보이는 정면 촬영</li>
          </ul>
        </div>
        
        <div class="tutorial-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>중요:</strong> 이미지 품질이 좋을수록 AI 분석 정확도가 향상됩니다.
        </div>
        
        <p><code>"이미지 업로드"</code> 버튼을 클릭하고 작품 사진을 선택하세요.</p>
      `,
      target: 'input[type="file"][name="artwork_image"]',
      hint: '파일 선택 버튼을 클릭하여 이미지를 업로드하세요',
      waitFor: {
        type: 'change',
        target: 'input[type="file"][name="artwork_image"]'
      }
    },

    // Step 4: Locate AI Metadata Button
    {
      title: 'AI 메타데이터 생성 버튼 확인',
      content: `
        <p>이미지 업로드가 완료되면 <strong>"AI 메타데이터 생성"</strong> 버튼이 활성화됩니다.</p>
        
        <div class="button-location">
          <h4><i class="fas fa-map-marker-alt"></i> 버튼 위치</h4>
          <p>이미지 미리보기 하단 또는 우측에 보라색 아이콘과 함께 표시됩니다:</p>
          <div class="button-preview">
            <button class="btn-ai-generate" disabled>
              <i class="fas fa-magic"></i> AI 메타데이터 생성
            </button>
          </div>
        </div>
        
        <div class="tutorial-info">
          <i class="fas fa-info-circle"></i>
          이 버튼은 이미지가 업로드된 경우에만 활성화됩니다.
        </div>
        
        <p>버튼을 찾았으면 하이라이트된 영역을 확인하세요.</p>
      `,
      target: 'button[data-action="generate-ai-metadata"]',
      hint: 'AI 메타데이터 생성 버튼 위치를 확인하세요'
    },

    // Step 5: Click AI Generation Button
    {
      title: 'AI 분석 시작하기',
      content: `
        <p>이제 <strong>"AI 메타데이터 생성"</strong> 버튼을 클릭하여 AI 분석을 시작합니다.</p>
        
        <div class="ai-process">
          <h4><i class="fas fa-cogs"></i> AI 분석 프로세스</h4>
          <ol>
            <li><strong>이미지 전처리:</strong> 해상도 최적화 및 노이즈 제거</li>
            <li><strong>객체 인식:</strong> 작품의 주요 요소 탐지</li>
            <li><strong>스타일 분석:</strong> 예술 사조 및 기법 판단</li>
            <li><strong>텍스트 생성:</strong> 설명문 및 메타데이터 자동 작성</li>
          </ol>
        </div>
        
        <div class="tutorial-tip">
          <i class="fas fa-lightbulb"></i>
          <strong>Tip:</strong> 분석에는 보통 5-15초가 소요됩니다. 로딩 인디케이터를 주시하세요.
        </div>
        
        <p>버튼을 클릭하세요!</p>
      `,
      target: 'button[data-action="generate-ai-metadata"]',
      hint: 'AI 메타데이터 생성 버튼을 클릭하세요',
      waitFor: {
        type: 'click',
        target: 'button[data-action="generate-ai-metadata"]'
      }
    },

    // Step 6: Review AI Results
    {
      title: 'AI 생성 결과 검토하기',
      content: `
        <p>AI 분석이 완료되면 자동으로 생성된 <strong>메타데이터</strong>가 해당 필드에 채워집니다.</p>
        
        <div class="ai-results-guide">
          <h4><i class="fas fa-list-check"></i> 검토할 항목들</h4>
          <ul>
            <li><strong>제목 (Title):</strong> AI가 제안한 작품명</li>
            <li><strong>작가명 (Artist):</strong> 서명 또는 스타일 기반 추정</li>
            <li><strong>설명 (Description):</strong> 작품의 내용과 특징</li>
            <li><strong>재료 (Medium):</strong> 재질 및 기법 분석 결과</li>
            <li><strong>스타일 (Style):</strong> 예술 사조 분류</li>
          </ul>
        </div>
        
        <div class="confidence-score-info">
          <h4><i class="fas fa-gauge-high"></i> 신뢰도 점수 (Confidence Score)</h4>
          <p>각 필드 옆에 표시되는 백분율 점수입니다:</p>
          <ul>
            <li><span class="badge-high">90-100%</span> 매우 높은 신뢰도 (거의 확실)</li>
            <li><span class="badge-medium">70-89%</span> 높은 신뢰도 (검증 권장)</li>
            <li><span class="badge-low">50-69%</span> 중간 신뢰도 (반드시 확인)</li>
            <li><span class="badge-very-low">&lt;50%</span> 낮은 신뢰도 (수정 필요)</li>
          </ul>
        </div>
        
        <p>생성된 결과를 자세히 살펴보세요.</p>
      `,
      target: '.ai-generated-content',
      hint: 'AI가 생성한 메타데이터를 검토하세요'
    },

    // Step 7: Understand AI Hallucination Risk
    {
      title: 'AI Hallucination 이해하기',
      content: `
        <p><strong>AI Hallucination</strong>은 AI가 실제로 존재하지 않는 정보를 사실처럼 생성하는 현상입니다.</p>
        
        <div class="hallucination-warning">
          <h4><i class="fas fa-exclamation-circle"></i> 주의해야 할 사례</h4>
          <ul>
            <li><strong>존재하지 않는 작가명:</strong> 실제 존재하지 않는 작가를 만들어낼 수 있음</li>
            <li><strong>잘못된 제작년도:</strong> 스타일만으로 추정하여 부정확할 수 있음</li>
            <li><strong>과도한 해석:</strong> 작품의 의도를 지나치게 추론할 수 있음</li>
            <li><strong>기술적 오류:</strong> 재료나 기법을 잘못 식별할 수 있음</li>
          </ul>
        </div>
        
        <div class="verification-checklist">
          <h4><i class="fas fa-clipboard-check"></i> 검증 체크리스트</h4>
          <ol>
            <li>작가명을 외부 데이터베이스(Getty, ULAN)에서 확인</li>
            <li>제작년도를 작가 생애 연도와 대조</li>
            <li>재료 및 기법을 육안 관찰과 비교</li>
            <li>설명의 논리성과 역사적 정확성 검토</li>
          </ol>
        </div>
        
        <div class="tutorial-critical">
          <i class="fas fa-shield-halved"></i>
          <strong>핵심 원칙:</strong> AI는 보조 도구일 뿐, 최종 책임은 전문가에게 있습니다.
        </div>
      `,
      target: '.ai-confidence-badge',
      hint: 'AI Hallucination 위험성을 숙지하세요'
    },

    // Step 8: Edit and Validate
    {
      title: '결과 수정 및 검증',
      content: `
        <p>AI 생성 결과를 <strong>반드시 수정하고 검증</strong>해야 합니다.</p>
        
        <div class="editing-guide">
          <h4><i class="fas fa-pen-to-square"></i> 수정 가이드</h4>
          <ul>
            <li><strong>낮은 신뢰도 필드:</strong> 우선적으로 수정</li>
            <li><strong>전문 지식 활용:</strong> 큐레이터/보존가의 전문성으로 보완</li>
            <li><strong>참고 자료 활용:</strong> 카탈로그, 전시 기록, 논문 참조</li>
            <li><strong>동료 검토:</strong> 필요 시 다른 전문가에게 의견 요청</li>
          </ul>
        </div>
        
        <div class="validation-workflow">
          <h4><i class="fas fa-route"></i> 검증 워크플로우</h4>
          <div class="workflow-steps">
            <div class="step">1. AI 생성</div>
            <div class="arrow">→</div>
            <div class="step">2. 신뢰도 확인</div>
            <div class="arrow">→</div>
            <div class="step">3. 전문가 검토</div>
            <div class="arrow">→</div>
            <div class="step">4. 수정 및 보완</div>
            <div class="arrow">→</div>
            <div class="step">5. 최종 승인</div>
          </div>
        </div>
        
        <p>필요한 필드를 직접 수정하고, <strong>"저장"</strong> 버튼을 클릭하세요.</p>
      `,
      target: 'input[name="title"], textarea[name="description"]',
      hint: 'AI 생성 결과를 검토하고 필요시 수정하세요',
      waitFor: {
        type: 'input',
        target: 'input[name="title"], textarea[name="description"]'
      }
    },

    // Step 9: Best Practices Summary
    {
      title: 'AI 활용 모범 사례',
      content: `
        <div class="best-practices">
          <h3><i class="fas fa-star"></i> AI 메타데이터 생성 모범 사례</h3>
          
          <div class="practice-section">
            <h4><i class="fas fa-check-double"></i> DO (권장 사항)</h4>
            <ul class="do-list">
              <li><i class="fas fa-check"></i> 고해상도 이미지 사용 (1920x1080px 이상)</li>
              <li><i class="fas fa-check"></i> 정면 촬영 및 좋은 조명 환경</li>
              <li><i class="fas fa-check"></i> 신뢰도 점수 70% 미만은 반드시 검증</li>
              <li><i class="fas fa-check"></i> AI 결과를 초안(draft)으로 활용</li>
              <li><i class="fas fa-check"></i> 전문가 검토 후 최종 승인</li>
              <li><i class="fas fa-check"></i> 참고 자료와 교차 확인</li>
            </ul>
          </div>
          
          <div class="practice-section">
            <h4><i class="fas fa-times-circle"></i> DON'T (피해야 할 사항)</h4>
            <ul class="dont-list">
              <li><i class="fas fa-times"></i> AI 결과를 무검증으로 그대로 사용</li>
              <li><i class="fas fa-times"></i> 저해상도 또는 흐릿한 이미지 사용</li>
              <li><i class="fas fa-times"></i> 신뢰도 점수 무시하고 진행</li>
              <li><i class="fas fa-times"></i> 전문 지식 없이 복잡한 작품 분석</li>
              <li><i class="fas fa-times"></i> AI를 최종 권위자로 간주</li>
            </ul>
          </div>
          
          <div class="practice-note">
            <i class="fas fa-quote-left"></i>
            <p><em>"AI는 속도를 제공하고, 인간은 정확성을 보장합니다."</em></p>
            <i class="fas fa-quote-right"></i>
          </div>
        </div>
      `,
      target: null,
      hint: null
    },

    // Step 10: Completion
    {
      title: '튜토리얼 완료!',
      content: `
        <div class="tutorial-completion">
          <div class="completion-icon">
            <i class="fas fa-trophy fa-4x" style="color: #fbbf24;"></i>
          </div>
          
          <h3>축하합니다! 🎉</h3>
          <p><strong>AI 메타데이터 생성</strong> 튜토리얼을 완료했습니다.</p>
          
          <div class="completion-summary">
            <h4><i class="fas fa-graduation-cap"></i> 학습한 내용</h4>
            <ul>
              <li><i class="fas fa-check-circle"></i> AI 메타데이터 생성 버튼 사용법</li>
              <li><i class="fas fa-check-circle"></i> 신뢰도 점수 해석 및 활용</li>
              <li><i class="fas fa-check-circle"></i> AI Hallucination 위험 인식</li>
              <li><i class="fas fa-check-circle"></i> 전문가 검증의 중요성</li>
              <li><i class="fas fa-check-circle"></i> AI 활용 모범 사례</li>
            </ul>
          </div>
          
          <div class="next-steps">
            <h4><i class="fas fa-forward"></i> 다음 단계</h4>
            <p>다음 튜토리얼들을 진행하여 MuseFlow의 더 많은 기능을 배워보세요:</p>
            <ul>
              <li><strong>보존 처리 기록 작성:</strong> 작품 보존 활동 문서화</li>
              <li><strong>전시 기획 고급 기법:</strong> 복잡한 전시 구성</li>
              <li><strong>데이터 분석 및 리포트:</strong> 통계 분석 및 인사이트 도출</li>
            </ul>
          </div>
          
          <div class="tutorial-badge">
            <i class="fas fa-award"></i>
            <span>AI Metadata Expert 배지를 획득했습니다!</span>
          </div>
          
          <div class="tutorial-cta">
            <p>이제 실제 작품에 AI 메타데이터 생성을 활용해보세요!</p>
          </div>
        </div>
      `,
      target: null,
      hint: null
    }
  ],

  /**
   * On Tutorial Complete Callback
   * 튜토리얼 완료 시 실행되는 함수
   * - 다음 튜토리얼 잠금 해제
   * - 배지 부여
   * - 분석 이벤트 전송
   */
  onComplete: function(data) {
    console.log('[Tutorial] AI Metadata Generation completed with data:', data);
    
    // Unlock next tutorials (role-based onboarding or advanced features)
    // 역할 기반 온보딩이나 고급 기능 튜토리얼 잠금 해제
    if (typeof TutorialEngine !== 'undefined' && TutorialEngine.unlockNextTutorial) {
      // 다음 튜토리얼 예시: 보존 처리 기록, 전시 기획 등
      TutorialEngine.unlockNextTutorial('conservation-treatment-recording');
      TutorialEngine.unlockNextTutorial('exhibition-planning-advanced');
    }
    
    // Award badge to user
    if (typeof window.BadgeSystem !== 'undefined') {
      window.BadgeSystem.awardBadge('ai-metadata-expert', {
        title: 'AI Metadata Expert',
        description: 'AI 메타데이터 생성 마스터',
        icon: 'fas fa-robot'
      });
    }
    
    // Track completion analytics
    if (typeof window.analytics !== 'undefined') {
      window.analytics.track('tutorial_completed', {
        tutorial_id: 'ai-metadata-generation',
        duration_seconds: data.duration || 0,
        completion_date: new Date().toISOString()
      });
    }
    
    // Show completion notification
    if (typeof window.showNotification === 'function') {
      window.showNotification('success', 'AI 메타데이터 생성 튜토리얼을 완료했습니다! 🎉');
    }
  },

  /**
   * On Tutorial Skip/Exit Callback
   * 튜토리얼 건너뛰기 또는 종료 시 실행
   */
  onSkip: function(data) {
    console.log('[Tutorial] AI Metadata Generation skipped at step:', data.currentStep);
    
    // Track skip analytics
    if (typeof window.analytics !== 'undefined') {
      window.analytics.track('tutorial_skipped', {
        tutorial_id: 'ai-metadata-generation',
        step_index: data.currentStep || 0,
        reason: data.reason || 'user_action'
      });
    }
  }
};

/**
 * Auto-register tutorial with TutorialEngine
 * TutorialEngine이 로드되면 자동으로 튜토리얼 등록
 */
if (typeof TutorialEngine !== 'undefined') {
  TutorialEngine.registerTutorial('ai-metadata-generation', aiMetadataGenerationTutorial);
  console.log('[Tutorial] AI Metadata Generation tutorial registered successfully');
} else {
  // TutorialEngine이 아직 로드되지 않은 경우 DOMContentLoaded에서 등록
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof TutorialEngine !== 'undefined') {
      TutorialEngine.registerTutorial('ai-metadata-generation', aiMetadataGenerationTutorial);
      console.log('[Tutorial] AI Metadata Generation tutorial registered on DOMContentLoaded');
    } else {
      console.warn('[Tutorial] TutorialEngine not found. Tutorial registration failed.');
    }
  });
}

/**
 * CSS Styles for Tutorial Content
 * 튜토리얼 콘텐츠에 사용되는 커스텀 스타일
 */
const tutorialStyles = `
<style>
.badge-high { 
  background: #10b981; 
  color: white; 
  padding: 2px 8px; 
  border-radius: 4px; 
  font-weight: bold; 
}
.badge-medium { 
  background: #3b82f6; 
  color: white; 
  padding: 2px 8px; 
  border-radius: 4px; 
  font-weight: bold; 
}
.badge-low { 
  background: #f59e0b; 
  color: white; 
  padding: 2px 8px; 
  border-radius: 4px; 
  font-weight: bold; 
}
.badge-very-low { 
  background: #ef4444; 
  color: white; 
  padding: 2px 8px; 
  border-radius: 4px; 
  font-weight: bold; 
}

.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.workflow-steps .step {
  background: #ede9fe;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  color: #7c3aed;
}
.workflow-steps .arrow {
  color: #9ca3af;
  font-weight: bold;
}

.do-list li { color: #10b981; }
.dont-list li { color: #ef4444; }
.practice-note {
  background: #f3f4f6;
  padding: 16px;
  border-left: 4px solid #7c3aed;
  margin-top: 16px;
  font-style: italic;
}

.button-preview {
  margin: 16px 0;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
}
.btn-ai-generate {
  background: #7c3aed;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-ai-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
`;

// Inject styles into document if not already present
if (typeof document !== 'undefined' && !document.getElementById('tutorial-ai-metadata-styles')) {
  const styleElement = document.createElement('div');
  styleElement.id = 'tutorial-ai-metadata-styles';
  styleElement.innerHTML = tutorialStyles;
  document.head.appendChild(styleElement);
}

/**
 * Export for module systems
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = aiMetadataGenerationTutorial;
}
