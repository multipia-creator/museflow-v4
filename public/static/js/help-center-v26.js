/**
 * MuseFlow V26.0 - Help Center System
 * Context-Aware Help & 7-Role Guides
 */

const HELP_CENTER_V26 = {
  // 7개 역할별 가이드 문서
  guides: {
    exhibition: {
      title: '전시 기획 가이드',
      icon: '🎨',
      description: '전시 기획부터 개막까지 전 과정을 단계별로 안내합니다.',
      articles: [
        {
          id: 'ex-001',
          title: '전시 컨셉 개발 방법',
          content: `
            <h3>1. 전시 주제 선정</h3>
            <p>- 박물관 비전과 연계된 주제 선택<br>
            - 관람객 관심사 조사 (설문, 트렌드 분석)<br>
            - 소장품 현황 파악 (보유 작품, 대여 가능 작품)</p>
            
            <h3>2. 컨셉 스테이트먼트 작성</h3>
            <p>- 전시 목적 (Why?): 무엇을 전달하고 싶은가?<br>
            - 전시 내용 (What?): 어떤 작품을 보여줄 것인가?<br>
            - 전시 방법 (How?): 어떻게 연출할 것인가?</p>
            
            <h3>3. 실습: MuseFlow에서 컨셉 개발</h3>
            <p><strong>Step 1:</strong> Projects → "New Project" 클릭<br>
            <strong>Step 2:</strong> Title: "인상주의 전시 2024", Description: "19세기 프랑스 인상주의 작품 30점"<br>
            <strong>Step 3:</strong> Canvas → "컨셉" Card 추가 → Content: "빛과 색채의 순간 포착"</p>
          `,
          tags: ['전시기획', '컨셉', '기초']
        },
        {
          id: 'ex-002',
          title: '작가 섭외 및 협상',
          content: `
            <h3>1. 작가 리서치</h3>
            <p>- 전시 주제에 적합한 작가 10-15명 후보 선정<br>
            - 작가 경력, 작품 스타일, 최근 활동 조사<br>
            - 대리인(갤러리, 에이전트) 정보 수집</p>
            
            <h3>2. 섭외 제안서 작성</h3>
            <p>- 전시 개요 (주제, 기간, 장소)<br>
            - 참여 조건 (작품 수, 크기, 운송, 보험)<br>
            - 보상 (전시료, 도록 수록, 홍보 지원)</p>
            
            <h3>3. 협상 체크리스트</h3>
            <p>- 작품 대여 기간 및 비용<br>
            - 운송 및 보험 책임 (박물관 vs 작가)<br>
            - 작품 설치 및 철거 일정<br>
            - 저작권 및 촬영 허가</p>
          `,
          tags: ['전시기획', '작가섭외', '협상']
        },
        {
          id: 'ex-003',
          title: '전시 공간 설계',
          content: `
            <h3>1. 공간 분석</h3>
            <p>- 전시실 크기 측정 (가로×세로×높이)<br>
            - 자연광/인공 조명 환경 파악<br>
            - 벽면 재질 및 색상 확인<br>
            - 동선 및 출입구 위치</p>
            
            <h3>2. 작품 배치 계획</h3>
            <p>- 작품 크기별 그룹핑 (대형/중형/소형)<br>
            - 시대별/테마별 섹션 구분<br>
            - 관람 동선 설계 (입구→메인→세부→출구)<br>
            - 여백 공간 확보 (작품 간 최소 50cm)</p>
            
            <h3>3. MuseFlow Canvas 활용</h3>
            <p><strong>Tip:</strong> Canvas에서 "공간 레이아웃" Card를 추가하고, 작품 배치도를 이미지로 첨부하세요.</p>
          `,
          tags: ['전시기획', '공간설계', '동선']
        }
      ]
    },
    
    education: {
      title: '교육 프로그램 가이드',
      icon: '👨‍🏫',
      description: '교육 프로그램 기획부터 평가까지 실무 가이드',
      articles: [
        {
          id: 'ed-001',
          title: '대상별 커리큘럼 개발',
          content: `
            <h3>1. 대상 분석</h3>
            <p>- 청소년 (13-18세): 학교 교과 연계, 진로 탐색<br>
            - 성인 (19-64세): 교양 함양, 취미 활동<br>
            - 시니어 (65세+): 평생 교육, 사회 참여</p>
            
            <h3>2. 학습 목표 설정 (Bloom's Taxonomy)</h3>
            <p>- 지식 (Knowledge): 미술사 개념 이해<br>
            - 기술 (Skills): 드로잉, 색채 혼합<br>
            - 태도 (Attitude): 예술 감상 태도</p>
            
            <h3>3. 8주 커리큘럼 예시</h3>
            <p>Week 1-2: 미술사 기초 (인상주의, 표현주의)<br>
            Week 3-4: 드로잉 기법 (연필, 목탄, 파스텔)<br>
            Week 5-6: 색채 이론 및 혼합<br>
            Week 7-8: 작품 제작 및 전시</p>
          `,
          tags: ['교육', '커리큘럼', '학습목표']
        },
        {
          id: 'ed-002',
          title: '교육 자료 제작 가이드',
          content: `
            <h3>1. PPT 제작 (Presentation)</h3>
            <p>- 슬라이드 구성: Title → Contents → Activity → Summary<br>
            - 이미지 사용: 고해상도 작품 이미지 (최소 1920×1080)<br>
            - 텍스트: 간결한 문장 (슬라이드당 3-5줄)</p>
            
            <h3>2. 워크북 제작 (Workbook)</h3>
            <p>- 구성: 학습 목표 → 이론 → 활동지 → 평가<br>
            - 활동지: 드로잉 공간, Q&A, 작품 분석 시트</p>
            
            <h3>3. 활동지 제작 (Activity Sheets)</h3>
            <p>- 작품 감상 시트: 제목, 작가, 연도, 느낌<br>
            - 창작 활동지: 스케치, 색칠, 콜라주<br>
            - 평가 시트: 자기 평가, 동료 평가</p>
          `,
          tags: ['교육', '자료제작', 'PPT']
        }
      ]
    },
    
    collection: {
      title: '소장품 관리 가이드',
      icon: '🏛️',
      description: '소장품 수집부터 DB 관리까지',
      articles: [
        {
          id: 'col-001',
          title: '후보 작품 조사 방법',
          content: `
            <h3>1. 작품 출처 조사</h3>
            <p>- 경매: 크리스티, 소더비, 서울옥션<br>
            - 갤러리: 국제갤러리, 아라리오, PKM<br>
            - 개인 소장: 네트워크, 소개</p>
            
            <h3>2. 작품 정보 수집</h3>
            <p>- 작가명, 작품명, 제작 연도<br>
            - 재료, 크기, 보존 상태<br>
            - 소유권 이력 (Provenance)<br>
            - 전시 이력 및 출판 기록</p>
            
            <h3>3. MuseFlow 활용</h3>
            <p>Canvas에서 "후보 작품" Card를 추가하고, 작품별로 Card를 생성하세요.<br>
            각 Card에 작가, 제작 연도, 가격, 출처를 기록합니다.</p>
          `,
          tags: ['소장품', '수집', '조사']
        },
        {
          id: 'col-002',
          title: '작품 진위 검증 절차',
          content: `
            <h3>1. 출처 검증 (Provenance)</h3>
            <p>- 소유권 이력 문서 확인 (영수증, 계약서)<br>
            - 이전 전시 기록 및 카탈로그<br>
            - 작가 인증서 (Certificate of Authenticity)</p>
            
            <h3>2. 과학적 분석</h3>
            <p>- X-ray 촬영: 숨겨진 그림, 수정 흔적<br>
            - 현미경 분석: 재료, 안료, 기법<br>
            - 연대 측정: 캔버스, 안료 연대 분석</p>
            
            <h3>3. 전문가 감정</h3>
            <p>- 한국미술품감정협회 의뢰<br>
            - 작가 연구 전문가 자문<br>
            - 복수 감정 (2-3명)</p>
          `,
          tags: ['소장품', '진위검증', '감정']
        }
      ]
    },
    
    conservation: {
      title: '보존 처리 가이드',
      icon: '🔬',
      description: '소장품 보존 및 복원 전문 가이드',
      articles: [
        {
          id: 'con-001',
          title: '작품 상태 조사',
          content: `
            <h3>1. 육안 검사</h3>
            <p>- 표면 손상: 균열, 박락, 찢어짐<br>
            - 변색: 퇴색, 얼룩, 곰팡이<br>
            - 구조적 문제: 캔버스 이완, 틀 손상</p>
            
            <h3>2. 사진 기록</h3>
            <p>- 전체 사진 (정면, 측면, 후면)<br>
            - 세부 사진 (손상 부위 클로즈업)<br>
            - 자외선 촬영 (수정 흔적 확인)</p>
            
            <h3>3. 상태 보고서 작성</h3>
            <p>- 손상 유형 및 위치<br>
            - 손상 원인 추정<br>
            - 긴급도 평가 (상/중/하)</p>
          `,
          tags: ['보존', '상태조사', '기록']
        }
      ]
    },
    
    publishing: {
      title: '학술 출판 가이드',
      icon: '📚',
      description: '학술지 발간 및 논문 출판 가이드',
      articles: [
        {
          id: 'pub-001',
          title: 'Peer Review 시스템',
          content: `
            <h3>1. 심사위원 선정</h3>
            <p>- 전문 분야 일치 (미술사, 보존과학 등)<br>
            - 경력 및 출판 실적 확인<br>
            - 이해 충돌 여부 검토</p>
            
            <h3>2. 이중 맹검 심사</h3>
            <p>- 저자와 심사위원 익명 보장<br>
            - 2명 심사위원 독립 평가<br>
            - 평가 항목: 학술 기여도, 방법론, 논리성, 문장력</p>
            
            <h3>3. 심사 결과 처리</h3>
            <p>- 채택 (Accept): 즉시 게재<br>
            - 수정 후 재심 (Revise): 저자 수정 후 재평가<br>
            - 거절 (Reject): 게재 불가</p>
          `,
          tags: ['출판', 'PeerReview', '심사']
        }
      ]
    },
    
    research: {
      title: '학술 연구 가이드',
      icon: '📖',
      description: '학술 연구 방법론 및 논문 작성 가이드',
      articles: [
        {
          id: 'res-001',
          title: '연구 방법론 설계',
          content: `
            <h3>1. 연구 주제 선정</h3>
            <p>- 연구 필요성 (Research Gap 분석)<br>
            - 선행 연구 검토 (50편 이상)<br>
            - 연구 질문 명확화</p>
            
            <h3>2. 연구 방법 선택</h3>
            <p>- 문헌 연구: 고문헌, 학술 논문 분석<br>
            - 실증 연구: 작품 실사, 현장 조사<br>
            - 비교 연구: 시대별/화가별 비교</p>
            
            <h3>3. 데이터 수집 계획</h3>
            <p>- 샘플 크기: 80-100점 작품<br>
            - 변수 설정: 20-30개 변수<br>
            - 데이터 기록 양식 준비</p>
          `,
          tags: ['연구', '방법론', '데이터']
        }
      ]
    },
    
    administration: {
      title: '행정 관리 가이드',
      icon: '💼',
      description: '예산 관리 및 행정 업무 가이드',
      articles: [
        {
          id: 'adm-001',
          title: '부서별 예산 배분',
          content: `
            <h3>1. 예산 배분 원칙</h3>
            <p>- 전시 기획: 30% (가장 큰 비중)<br>
            - 소장품 수집: 24%<br>
            - 교육 프로그램: 16%<br>
            - 보존 처리: 10%<br>
            - 학술 연구: 6%<br>
            - 행정 운영: 14%</p>
            
            <h3>2. 예산 집행 모니터링</h3>
            <p>- 월별 집행 현황 점검<br>
            - 분기별 조정 (Reallocation)<br>
            - 예비비 관리 (총 예산의 4%)</p>
            
            <h3>3. MuseFlow Budget 활용</h3>
            <p>/budget 페이지에서 실시간 예산 현황을 확인하고,<br>
            각 부서별 집행률을 시각화할 수 있습니다.</p>
          `,
          tags: ['행정', '예산', '관리']
        }
      ]
    }
  },

  // FAQ (자주 묻는 질문)
  faq: [
    {
      question: 'Welcome Modal에서 역할을 잘못 선택했어요. 어떻게 바꾸나요?',
      answer: '브라우저 Console(F12)을 열고 <code>localStorage.removeItem("canvas_onboarding_completed")</code>를 입력한 후 페이지를 새로고침하면 Welcome Modal이 다시 나타납니다.'
    },
    {
      question: '샘플 데이터를 모두 삭제하고 싶어요.',
      answer: 'Projects 패널에서 프로젝트를 우클릭하고 "Delete Project"를 선택하세요. Tasks와 Canvas Cards가 함께 삭제됩니다.'
    },
    {
      question: 'Tutorial을 건너뛰었는데 다시 볼 수 있나요?',
      answer: '네. 우측 상단 "Help" 버튼을 클릭하고 "Restart Tutorial"을 선택하면 처음부터 다시 시작할 수 있습니다.'
    },
    {
      question: 'Canvas Card를 어떻게 연결하나요?',
      answer: 'Card 우측의 Connection Point(작은 원)를 클릭하고 다른 Card의 Connection Point로 드래그하세요. 연결선이 자동으로 생성됩니다.'
    },
    {
      question: 'Behavior Detector가 너무 자주 나타나요. 끌 수 있나요?',
      answer: '우측 상단 Settings → Behavior Detector → "Disable Idle Detection"을 체크하면 유휴 감지를 끌 수 있습니다.'
    }
  ],

  // Context-Aware Help (상황별 도움말)
  contextHelp: {
    'projects-empty': {
      title: '프로젝트를 만들어보세요',
      description: '프로젝트는 전시, 교육, 소장품 수집 등 주요 업무 단위입니다.',
      actions: [
        { label: 'Welcome Modal 다시 보기', action: 'showWelcomeModal' },
        { label: '전시 기획 가이드 보기', action: 'openGuide', params: { role: 'exhibition', articleId: 'ex-001' } }
      ]
    },
    'canvas-empty': {
      title: 'Canvas에서 워크플로우를 시각화하세요',
      description: 'Canvas는 업무 흐름을 시각적으로 관리할 수 있는 공간입니다.',
      actions: [
        { label: 'Canvas 튜토리얼 보기', action: 'startTutorial', params: { type: 'canvas' } },
        { label: 'Canvas 가이드 보기', action: 'openGuide', params: { role: 'exhibition', articleId: 'ex-003' } }
      ]
    },
    'task-stuck': {
      title: '이 단계에서 막히셨나요?',
      description: '작업 중 어려움이 있으시면 AI Assistant에게 물어보세요.',
      actions: [
        { label: 'AI Assistant 열기', action: 'openAIAssistant' },
        { label: '관련 가이드 보기', action: 'openContextualGuide' }
      ]
    }
  },

  // 검색 기능
  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // 가이드 문서 검색
    for (const [roleKey, roleData] of Object.entries(this.guides)) {
      for (const article of roleData.articles) {
        if (
          article.title.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery) ||
          article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: 'guide',
            role: roleKey,
            roleTitle: roleData.title,
            article: article
          });
        }
      }
    }

    // FAQ 검색
    for (const faqItem of this.faq) {
      if (
        faqItem.question.toLowerCase().includes(lowerQuery) ||
        faqItem.answer.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'faq',
          question: faqItem.question,
          answer: faqItem.answer
        });
      }
    }

    return results;
  },

  // Context-Aware Help 표시
  showContextHelp(context) {
    const helpData = this.contextHelp[context];
    if (!helpData) return;

    // Behavior Detector Modal 사용
    if (window.behaviorDetector) {
      window.behaviorDetector.showProactiveHelp('context', {
        message: helpData.title,
        description: helpData.description,
        actions: helpData.actions
      });
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HELP_CENTER_V26;
}
