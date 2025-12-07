/**
 * MuseFlow Canvas V26.0 - Museum Sample Data Generator
 * 
 * 7가지 뮤지엄 업무별 실무 기반 샘플 데이터:
 * - Exhibition (전시 기획)
 * - Education (교육 프로그램)
 * - Collection (소장품 수집)
 * - Conservation (보존 처리)
 * - Publishing (학술 출판)
 * - Research (연구)
 * - Administration (행정 관리)
 * 
 * @version 26.0.0
 * @date 2025-12-07
 */

const MuseumSampleData = {
  /**
   * 7가지 업무별 샘플 데이터
   */
  SAMPLE_DATA: {
    // 1. 전시 기획 (Exhibition)
    exhibition: {
      project: {
        id: 'sample_exhibition_001',
        title: '2024 한국 현대미술 특별전',
        type: 'exhibition',
        description: '한국 현대미술의 흐름을 조망하는 대규모 기획 전시',
        status: 'active',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 days
        tags: ['전시', '현대미술', '기획전', '특별전'],
        color: '#4f46e5'
      },
      tasks: [
        {
          id: 'task_ex_001',
          title: '전시 기획안 작성',
          description: '전시 주제, 목표, 예산, 일정 등 기획안 초안 작성',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['기획', '문서작성'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_002',
          title: '참여 작가 섭외 및 계약',
          description: '10명의 현대미술 작가 섭외, 작품 대여 계약 진행',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['작가섭외', '계약'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_003',
          title: '전시 공간 설계 및 레이아웃',
          description: '전시실 동선 계획, 작품 배치도 작성',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['공간설계', '레이아웃'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_004',
          title: '작품 운송 및 보험 처리',
          description: '작품 안전 운송 계획, 작품 보험 가입',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['운송', '보험'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_005',
          title: '조명 및 전시 설비 점검',
          description: '전시 조명 테스트, 온습도 조절 시스템 점검',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['시설', '점검'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_006',
          title: '전시 도록 제작',
          description: '작가 인터뷰, 작품 사진, 비평문 수록 도록 제작',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['도록', '출판'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_007',
          title: '홍보 자료 제작 및 배포',
          description: '포스터, 리플렛, SNS 홍보 콘텐츠 제작',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['홍보', '마케팅'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_008',
          title: '도슨트 교육 프로그램 준비',
          description: '전시 해설사 교육 자료 준비, 리허설 진행',
          priority: 'low',
          status: 'pending',
          deadline: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['교육', '도슨트'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_009',
          title: '오프닝 행사 준비',
          description: '개막식 리셉션, 작가 토크 프로그램 기획',
          priority: 'low',
          status: 'pending',
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['행사', '리셉션'],
          projectId: 'sample_exhibition_001'
        },
        {
          id: 'task_ex_010',
          title: '언론 보도자료 배포',
          description: '미술 전문지, 일간지 보도자료 작성 및 배포',
          priority: 'low',
          status: 'pending',
          deadline: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['홍보', '언론'],
          projectId: 'sample_exhibition_001'
        }
      ],
      canvasCards: [
        { id: 'card_ex_001', title: '전시 컨셉', type: 'idea', x: 100, y: 100, content: '한국 현대미술의 다양성과 실험성', color: '#eef2ff' },
        { id: 'card_ex_002', title: '작품 리스트', type: 'list', x: 350, y: 100, content: '회화 15점, 조각 8점, 설치 5점, 미디어아트 3점', color: '#fff7ed' },
        { id: 'card_ex_003', title: '참여 작가', type: 'people', x: 600, y: 100, content: '총 10명 (국내 7명, 해외 3명)', color: '#fef3c7' },
        { id: 'card_ex_004', title: '공간 설계', type: 'design', x: 100, y: 280, content: '3개 전시실, 순환 동선, 휴게 공간', color: '#dfe7fd' },
        { id: 'card_ex_005', title: '작품 운송', type: 'logistics', x: 350, y: 280, content: '전문 운송사, 포장, 보험', color: '#fce7f3' },
        { id: 'card_ex_006', title: '조명 계획', type: 'technical', x: 600, y: 280, content: 'LED 조명, 작품별 맞춤 조도', color: '#e0f2fe' },
        { id: 'card_ex_007', title: '홍보 전략', type: 'strategy', x: 100, y: 460, content: 'SNS, 언론 보도, 포스터, 온라인 광고', color: '#f0fdf4' },
        { id: 'card_ex_008', title: '전시 도록', type: 'publication', x: 350, y: 460, content: '200페이지, 작가 인터뷰, 비평문', color: '#fef3c7' },
        { id: 'card_ex_009', title: '개막식', type: 'event', x: 600, y: 460, content: '2024.04.15 오후 5시, 작가 토크', color: '#ede9fe' },
        { id: 'card_ex_010', title: '예산 계획', type: 'budget', x: 850, y: 280, content: '총 3억원 (작품대여 40%, 운영 30%, 홍보 20%, 기타 10%)', color: '#fef2f2' }
      ],
      connections: [
        { from: 'card_ex_001', to: 'card_ex_002' }, // 컨셉 → 작품 리스트
        { from: 'card_ex_001', to: 'card_ex_003' }, // 컨셉 → 참여 작가
        { from: 'card_ex_002', to: 'card_ex_004' }, // 작품 리스트 → 공간 설계
        { from: 'card_ex_003', to: 'card_ex_005' }, // 참여 작가 → 작품 운송
        { from: 'card_ex_004', to: 'card_ex_006' }, // 공간 설계 → 조명 계획
        { from: 'card_ex_004', to: 'card_ex_007' }, // 공간 설계 → 홍보 전략
        { from: 'card_ex_002', to: 'card_ex_008' }, // 작품 리스트 → 전시 도록
        { from: 'card_ex_007', to: 'card_ex_009' }, // 홍보 전략 → 개막식
        { from: 'card_ex_001', to: 'card_ex_010' }  // 컨셉 → 예산 계획
      ]
    },

    // 2. 교육 프로그램 (Education)
    education: {
      project: {
        id: 'sample_education_001',
        title: '청소년 미술 체험 프로그램',
        type: 'education',
        description: '중고등학생 대상 주말 미술 워크숍',
        status: 'active',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['교육', '청소년', '워크숍'],
        color: '#10b981'
      },
      tasks: [
        {
          id: 'task_ed_001',
          title: '교육 커리큘럼 개발',
          description: '8주 과정 커리큘럼: 회화, 조각, 미디어아트',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['커리큘럼', '기획'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_002',
          title: '학습 목표 및 성과 지표 설정',
          description: '교육 목표, 평가 기준, 성과 측정 방법 설계',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['목표설정', '평가'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_003',
          title: '교육 자료 제작',
          description: 'PPT, 워크북, 활동지, 참고 자료 제작',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['자료제작', '디자인'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_004',
          title: '외부 강사 섭외',
          description: '전문 작가 3명, 미술교육 전문가 2명',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['강사섭외', '계약'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_005',
          title: '교육 공간 및 시설 준비',
          description: '강의실 예약, 미술 재료, 장비 준비',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['시설', '준비'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_006',
          title: '참가자 모집',
          description: '온라인 신청, SNS 홍보, 학교 연계',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['모집', '홍보'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_007',
          title: '홍보 자료 제작',
          description: '포스터, SNS 콘텐츠, 학교 공문 작성',
          priority: 'low',
          status: 'pending',
          deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['홍보', '마케팅'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_008',
          title: '안전 교육 및 보험 가입',
          description: '참가자 안전 교육, 상해 보험 가입',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['안전', '보험'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_009',
          title: '오리엔테이션 준비',
          description: '첫 수업 오리엔테이션, 참가자 명단 확정',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['오리엔테이션', '준비'],
          projectId: 'sample_education_001'
        },
        {
          id: 'task_ed_010',
          title: '만족도 조사 및 피드백 시스템 구축',
          description: '참가자 만족도 조사지, 피드백 수집 방법 설계',
          priority: 'low',
          status: 'pending',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['평가', '피드백'],
          projectId: 'sample_education_001'
        }
      ],
      canvasCards: [
        { id: 'card_ed_001', title: '학습 목표', type: 'objective', x: 100, y: 100, content: '미술 이해도 향상, 창의성 개발, 표현 능력 강화', color: '#eef2ff' },
        { id: 'card_ed_002', title: '커리큘럼', type: 'curriculum', x: 350, y: 100, content: '8주 과정 (회화 3주, 조각 2주, 미디어아트 3주)', color: '#fff7ed' },
        { id: 'card_ed_003', title: '대상 참가자', type: 'audience', x: 600, y: 100, content: '중고등학생 20명 (학년 무관)', color: '#fef3c7' },
        { id: 'card_ed_004', title: '교육 자료', type: 'material', x: 100, y: 280, content: 'PPT, 워크북, 활동지, 참고 영상', color: '#dfe7fd' },
        { id: 'card_ed_005', title: '강사진', type: 'instructor', x: 350, y: 280, content: '전문 작가 3명, 교육전문가 2명', color: '#fce7f3' },
        { id: 'card_ed_006', title: '교육 공간', type: 'facility', x: 600, y: 280, content: '미술실, 미디어 랩, 전시실 견학', color: '#e0f2fe' },
        { id: 'card_ed_007', title: '홍보 전략', type: 'marketing', x: 100, y: 460, content: 'SNS, 학교 연계, 포스터, 온라인 광고', color: '#f0fdf4' },
        { id: 'card_ed_008', title: '재료 및 장비', type: 'equipment', x: 350, y: 460, content: '미술 재료, 태블릿, 카메라, 프로젝터', color: '#fef3c7' },
        { id: 'card_ed_009', title: '평가 방법', type: 'evaluation', x: 600, y: 460, content: '작품 평가, 참여도, 만족도 조사', color: '#ede9fe' },
        { id: 'card_ed_010', title: '예산 계획', type: 'budget', x: 850, y: 280, content: '총 2천만원 (강사료 40%, 재료비 30%, 홍보 20%, 기타 10%)', color: '#fef2f2' }
      ],
      connections: [
        { from: 'card_ed_001', to: 'card_ed_002' }, // 학습 목표 → 커리큘럼
        { from: 'card_ed_001', to: 'card_ed_003' }, // 학습 목표 → 대상 참가자
        { from: 'card_ed_002', to: 'card_ed_004' }, // 커리큘럼 → 교육 자료
        { from: 'card_ed_002', to: 'card_ed_005' }, // 커리큘럼 → 강사진
        { from: 'card_ed_003', to: 'card_ed_006' }, // 대상 참가자 → 교육 공간
        { from: 'card_ed_004', to: 'card_ed_007' }, // 교육 자료 → 홍보 전략
        { from: 'card_ed_005', to: 'card_ed_008' }, // 강사진 → 재료 및 장비
        { from: 'card_ed_002', to: 'card_ed_009' }, // 커리큘럼 → 평가 방법
        { from: 'card_ed_001', to: 'card_ed_010' }  // 학습 목표 → 예산 계획
      ]
    },

    // 3. 소장품 수집 (Collection)
    collection: {
      project: {
        id: 'sample_collection_001',
        title: '2024 신규 소장품 수집',
        type: 'collection',
        description: '근현대 한국 회화 작품 10점 수집',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['소장품', '수집', '한국화'],
        color: '#f59e0b'
      },
      tasks: [
        {
          id: 'task_col_001',
          title: '소장품 후보 조사',
          description: '경매, 갤러리, 개인 소장가 대상 조사',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['조사', '리서치'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_002',
          title: '작품 진위 여부 확인',
          description: '작품 출처, 진위 검증, 이력 조사',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['진위', '검증'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_003',
          title: '작품 가치 평가',
          description: '전문가 감정, 시장 가치 분석',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['감정', '평가'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_004',
          title: '예산 확보 및 승인',
          description: '구매 예산 책정, 이사회 승인',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['예산', '승인'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_005',
          title: '소장가와 협상',
          description: '구매/기증 협상, 계약서 작성',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['협상', '계약'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_006',
          title: '법률 검토 및 계약 체결',
          description: '법률 자문, 계약서 검토, 공증',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['법률', '계약'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_007',
          title: '작품 운송 및 보험',
          description: '전문 운송업체 선정, 보험 가입',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['운송', '보험'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_008',
          title: '작품 상태 조사 및 사진 촬영',
          description: '입고 시 작품 상태 기록, 고해상도 촬영',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['촬영', '기록'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_009',
          title: '소장품 등록 및 DB 입력',
          description: '등록번호 부여, 메타데이터 입력',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['등록', 'DB'],
          projectId: 'sample_collection_001'
        },
        {
          id: 'task_col_010',
          title: '수장고 보관 및 정리',
          description: '적정 환경 보관, 수장고 배치',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['보관', '수장고'],
          projectId: 'sample_collection_001'
        }
      ],
      canvasCards: [
        { id: 'card_col_001', title: '작품 조사', type: 'research', x: 100, y: 100, content: '경매, 갤러리, 개인 소장' },
        { id: 'card_col_002', title: '가치 평가', type: 'evaluation', x: 300, y: 100, content: '전문가 감정, 시장 분석' },
        { id: 'card_col_003', title: '협상', type: 'negotiation', x: 500, y: 100, content: '구매/기증 협상' },
        { id: 'card_col_004', title: '운송', type: 'logistics', x: 300, y: 300, content: '전문 운송, 보험' },
        { id: 'card_col_005', title: '등록', type: 'registration', x: 500, y: 300, content: '소장품 DB 등록' }
      ],
      connections: [
        { from: 'card_col_001', to: 'card_col_002' },
        { from: 'card_col_002', to: 'card_col_003' },
        { from: 'card_col_003', to: 'card_col_004' },
        { from: 'card_col_004', to: 'card_col_005' }
      ]
    },

    // 4. 보존 처리 (Conservation)
    conservation: {
      project: {
        id: 'sample_conservation_001',
        title: '소장품 보존 처리 2024',
        type: 'conservation',
        description: '손상된 소장품 12점 보존 처리',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['보존', '복원', '처리'],
        color: '#8b5cf6'
      },
      tasks: [
        {
          id: 'task_con_001',
          title: '작품 상태 조사',
          description: '손상 정도, 보존 처리 필요성 평가',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['조사', '평가'],
          projectId: 'sample_conservation_001'
        },
        {
          id: 'task_con_002',
          title: '보존 처리 계획 수립',
          description: '처리 방법, 소요 시간, 예산 계획',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['계획', '예산'],
          projectId: 'sample_conservation_001'
        },
        {
          id: 'task_con_003',
          title: '전문가 협업',
          description: '외부 보존 전문가 섭외 및 협업',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['협업', '전문가'],
          projectId: 'sample_conservation_001'
        },
        {
          id: 'task_con_004',
          title: '보존 처리 실행',
          description: '세척, 수리, 복원 작업 진행',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['실행', '복원'],
          projectId: 'sample_conservation_001'
        },
        {
          id: 'task_con_005',
          title: '처리 후 모니터링',
          description: '처리 효과 검증, 경과 관찰',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['모니터링', '검증'],
          projectId: 'sample_conservation_001'
        }
      ],
      canvasCards: [
        { id: 'card_con_001', title: '상태 조사', type: 'inspection', x: 100, y: 100, content: '손상 정도 평가' },
        { id: 'card_con_002', title: '처리 계획', type: 'plan', x: 300, y: 100, content: '방법, 시간, 예산' },
        { id: 'card_con_003', title: '전문가 협업', type: 'collaboration', x: 500, y: 100, content: '외부 전문가' },
        { id: 'card_con_004', title: '처리 실행', type: 'execution', x: 300, y: 300, content: '세척, 수리, 복원' },
        { id: 'card_con_005', title: '모니터링', type: 'monitoring', x: 500, y: 300, content: '경과 관찰' },
        { id: 'card_con_006', title: '보고서', type: 'report', x: 100, y: 300, content: '처리 보고서 작성' }
      ],
      connections: [
        { from: 'card_con_001', to: 'card_con_002' },
        { from: 'card_con_002', to: 'card_con_003' },
        { from: 'card_con_003', to: 'card_con_004' },
        { from: 'card_con_004', to: 'card_con_005' },
        { from: 'card_con_005', to: 'card_con_006' }
      ]
    },

    // 5. 학술 출판 (Publishing)
    publishing: {
      project: {
        id: 'sample_publishing_001',
        title: '학술지 발간 2024',
        type: 'publishing',
        description: '연 2회 학술지 발간 프로젝트',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['학술지', '출판', '논문'],
        color: '#ec4899'
      },
      tasks: [
        {
          id: 'task_pub_001',
          title: '논문 원고 모집',
          description: '학술 논문, 리뷰, 비평 원고 모집 공고',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['모집', '공고'],
          projectId: 'sample_publishing_001'
        },
        {
          id: 'task_pub_002',
          title: '원고 심사 및 편집',
          description: '전문가 심사, 편집위원회 검토',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['심사', '편집'],
          projectId: 'sample_publishing_001'
        },
        {
          id: 'task_pub_003',
          title: '디자인 및 레이아웃',
          description: '표지 디자인, 본문 레이아웃 작업',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['디자인', '레이아웃'],
          projectId: 'sample_publishing_001'
        },
        {
          id: 'task_pub_004',
          title: '인쇄 및 배포',
          description: '인쇄소 선정, 온/오프라인 배포',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['인쇄', '배포'],
          projectId: 'sample_publishing_001'
        }
      ],
      canvasCards: [
        { id: 'card_pub_001', title: '원고 모집', type: 'recruitment', x: 100, y: 100, content: '논문, 리뷰, 비평' },
        { id: 'card_pub_002', title: '심사', type: 'review', x: 300, y: 100, content: '전문가 심사' },
        { id: 'card_pub_003', title: '편집', type: 'editing', x: 500, y: 100, content: '편집위원회 검토' },
        { id: 'card_pub_004', title: '디자인', type: 'design', x: 300, y: 300, content: '표지, 레이아웃' },
        { id: 'card_pub_005', title: '인쇄', type: 'printing', x: 500, y: 300, content: '인쇄소 선정' },
        { id: 'card_pub_006', title: '배포', type: 'distribution', x: 700, y: 300, content: '온/오프라인' }
      ],
      connections: [
        { from: 'card_pub_001', to: 'card_pub_002' },
        { from: 'card_pub_002', to: 'card_pub_003' },
        { from: 'card_pub_003', to: 'card_pub_004' },
        { from: 'card_pub_004', to: 'card_pub_005' },
        { from: 'card_pub_005', to: 'card_pub_006' }
      ]
    },

    // 6. 연구 (Research)
    research: {
      project: {
        id: 'sample_research_001',
        title: '조선시대 회화 연구 프로젝트',
        type: 'research',
        description: '조선시대 산수화 양식 변천 연구',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['연구', '조선', '회화'],
        color: '#06b6d4'
      },
      tasks: [
        {
          id: 'task_res_001',
          title: '문헌 조사',
          description: '관련 고문헌, 학술 논문 수집 및 분석',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['문헌', '조사'],
          projectId: 'sample_research_001'
        },
        {
          id: 'task_res_002',
          title: '작품 현장 조사',
          description: '국내 박물관 소장 작품 실사',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['현장조사', '실사'],
          projectId: 'sample_research_001'
        },
        {
          id: 'task_res_003',
          title: '양식 분석',
          description: '시대별, 화가별 양식 비교 분석',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['분석', '비교'],
          projectId: 'sample_research_001'
        },
        {
          id: 'task_res_004',
          title: '연구 논문 집필',
          description: '연구 결과 논문 작성',
          priority: 'high',
          status: 'pending',
          deadline: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['집필', '논문'],
          projectId: 'sample_research_001'
        },
        {
          id: 'task_res_005',
          title: '학술 발표',
          description: '학회 발표, 공개 강연',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['발표', '강연'],
          projectId: 'sample_research_001'
        }
      ],
      canvasCards: [
        { id: 'card_res_001', title: '문헌 조사', type: 'literature', x: 100, y: 100, content: '고문헌, 논문' },
        { id: 'card_res_002', title: '현장 조사', type: 'fieldwork', x: 300, y: 100, content: '작품 실사' },
        { id: 'card_res_003', title: '양식 분석', type: 'analysis', x: 500, y: 100, content: '시대별 비교' },
        { id: 'card_res_004', title: '논문 집필', type: 'writing', x: 300, y: 300, content: '연구 결과' },
        { id: 'card_res_005', title: '학술 발표', type: 'presentation', x: 500, y: 300, content: '학회, 강연' }
      ],
      connections: [
        { from: 'card_res_001', to: 'card_res_002' },
        { from: 'card_res_002', to: 'card_res_003' },
        { from: 'card_res_003', to: 'card_res_004' },
        { from: 'card_res_004', to: 'card_res_005' }
      ]
    },

    // 7. 행정 관리 (Administration)
    administration: {
      project: {
        id: 'sample_admin_001',
        title: '2024년 예산 집행 관리',
        type: 'administration',
        description: '연간 운영 예산 집행 및 관리',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['행정', '예산', '관리'],
        color: '#64748b'
      },
      tasks: [
        {
          id: 'task_adm_001',
          title: '연간 예산 계획 수립',
          description: '부서별 예산 배분, 집행 계획',
          priority: 'high',
          status: 'completed',
          deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['예산', '계획'],
          projectId: 'sample_admin_001'
        },
        {
          id: 'task_adm_002',
          title: '분기별 예산 모니터링',
          description: '집행 현황 점검, 조정',
          priority: 'high',
          status: 'active',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['모니터링', '점검'],
          projectId: 'sample_admin_001'
        },
        {
          id: 'task_adm_003',
          title: '인사 및 급여 관리',
          description: '직원 근태, 급여, 복지 관리',
          priority: 'medium',
          status: 'active',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['인사', '급여'],
          projectId: 'sample_admin_001'
        },
        {
          id: 'task_adm_004',
          title: '시설 유지 보수',
          description: '건물, 장비 정기 점검 및 수리',
          priority: 'medium',
          status: 'pending',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: ['시설', '유지보수'],
          projectId: 'sample_admin_001'
        }
      ],
      canvasCards: [
        { id: 'card_adm_001', title: '예산 계획', type: 'budget', x: 100, y: 100, content: '부서별 배분' },
        { id: 'card_adm_002', title: '집행 모니터링', type: 'monitoring', x: 300, y: 100, content: '분기별 점검' },
        { id: 'card_adm_003', title: '인사 관리', type: 'hr', x: 500, y: 100, content: '근태, 급여, 복지' },
        { id: 'card_adm_004', title: '시설 관리', type: 'facility', x: 300, y: 300, content: '점검, 수리' },
        { id: 'card_adm_005', title: '보고서', type: 'report', x: 500, y: 300, content: '월간/분기 보고' }
      ],
      connections: [
        { from: 'card_adm_001', to: 'card_adm_002' },
        { from: 'card_adm_002', to: 'card_adm_003' },
        { from: 'card_adm_003', to: 'card_adm_004' },
        { from: 'card_adm_004', to: 'card_adm_005' }
      ]
    }
  },

  /**
   * 업무별 메타 정보
   */
  ROLE_METADATA: {
    exhibition: {
      icon: '🎨',
      title: '전시 기획',
      description: '전시 기획부터 개막까지 전 과정을 관리합니다',
      emoji: '📅'
    },
    education: {
      icon: '👨‍🏫',
      title: '교육 프로그램',
      description: '관람객 대상 교육 프로그램을 기획하고 운영합니다',
      emoji: '📚'
    },
    collection: {
      icon: '🏛️',
      title: '소장품 수집',
      description: '새로운 소장품을 조사하고 수집합니다',
      emoji: '🖼️'
    },
    conservation: {
      icon: '🔬',
      title: '보존 처리',
      description: '소장품의 보존 상태를 관리하고 복원합니다',
      emoji: '⚗️'
    },
    publishing: {
      icon: '📚',
      title: '학술 출판',
      description: '학술지, 도록 등 출판물을 기획하고 제작합니다',
      emoji: '📖'
    },
    research: {
      icon: '🔍',
      title: '연구',
      description: '미술사, 작품 연구를 수행합니다',
      emoji: '📝'
    },
    administration: {
      icon: '⚙️',
      title: '행정 관리',
      description: '예산, 인사, 시설 등 행정 업무를 담당합니다',
      emoji: '💼'
    }
  },

  /**
   * 선택한 역할의 샘플 데이터 생성
   * @param {string} role - 역할 (exhibition, education, ...)
   * @returns {Object} 생성된 샘플 데이터
   */
  generateSampleData(role) {
    if (!this.SAMPLE_DATA[role]) {
      console.error(`[MuseumSampleData] Invalid role: ${role}`);
      return null;
    }

    const data = this.SAMPLE_DATA[role];
    console.log(`[MuseumSampleData] Generating sample data for: ${role}`);

    return {
      project: data.project,
      tasks: data.tasks,
      canvasCards: data.canvasCards,
      connections: data.connections,
      metadata: this.ROLE_METADATA[role]
    };
  },

  /**
   * LocalStorage에 샘플 데이터 저장
   * @param {string} role - 역할
   */
  saveSampleDataToStorage(role) {
    const sampleData = this.generateSampleData(role);
    if (!sampleData) return false;

    try {
      // 1. Project 저장
      const projects = JSON.parse(localStorage.getItem('museflow_projects_v23') || '[]');
      const existingProject = projects.find(p => p.id === sampleData.project.id);
      
      if (!existingProject) {
        projects.push(sampleData.project);
        localStorage.setItem('museflow_projects_v23', JSON.stringify(projects));
        console.log('✅ Sample project saved:', sampleData.project.title);
      }

      // 2. Tasks 저장
      const tasks = JSON.parse(localStorage.getItem('museflow_tasks_v23') || '[]');
      sampleData.tasks.forEach(task => {
        const existingTask = tasks.find(t => t.id === task.id);
        if (!existingTask) {
          tasks.push(task);
        }
      });
      localStorage.setItem('museflow_tasks_v23', JSON.stringify(tasks));
      console.log(`✅ ${sampleData.tasks.length} sample tasks saved`);

      // 3. Canvas Cards 저장 (CanvasState에 추가)
      if (window.CanvasState && typeof window.CanvasState.addCard === 'function') {
        sampleData.canvasCards.forEach(card => {
          window.CanvasState.addCard(card);
        });
        console.log(`✅ ${sampleData.canvasCards.length} canvas cards added`);

        // 4. Connections 저장
        sampleData.connections.forEach(conn => {
          window.CanvasState.addConnection(conn.from, conn.to);
        });
        console.log(`✅ ${sampleData.connections.length} connections added`);
      }

      // 5. 샘플 데이터 생성 완료 플래그 저장
      localStorage.setItem('museflow_sample_data_generated', role);
      localStorage.setItem('museflow_sample_data_timestamp', new Date().toISOString());

      return true;
    } catch (error) {
      console.error('[MuseumSampleData] Failed to save sample data:', error);
      return false;
    }
  },

  /**
   * 샘플 데이터가 이미 생성되었는지 확인
   * @returns {boolean}
   */
  isSampleDataGenerated() {
    return !!localStorage.getItem('museflow_sample_data_generated');
  },

  /**
   * 샘플 데이터 초기화 (테스트용)
   */
  resetSampleData() {
    localStorage.removeItem('museflow_sample_data_generated');
    localStorage.removeItem('museflow_sample_data_timestamp');
    console.log('✅ Sample data flags reset');
  },

  /**
   * 모든 역할 목록 가져오기
   * @returns {Array}
   */
  getAllRoles() {
    return Object.keys(this.ROLE_METADATA).map(key => ({
      id: key,
      ...this.ROLE_METADATA[key]
    }));
  }
};

// Global export
window.MuseumSampleData = MuseumSampleData;

console.log('✅ MuseumSampleData V26.0 loaded - 7 museum workflows ready');
