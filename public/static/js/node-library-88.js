/**
 * MuseFlow Node Library - 88 Modules
 * 8 Categories × 11 Modules each
 */

const NODE_LIBRARY_88 = {
  exhibition: {
    name: '전시 Exhibition',
    icon: '🎨',
    color: '#8b5cf6',
    nodes: [
      { id: 'ex-01', name: '기획안 작성', icon: '📝', desc: '전시 기획안 초안 작성' },
      { id: 'ex-02', name: '예산 편성', icon: '💰', desc: '전시 예산 계획 수립' },
      { id: 'ex-03', name: '일정 관리', icon: '📅', desc: '전시 일정 및 마일스톤 관리' },
      { id: 'ex-04', name: '작품 선정', icon: '🖼️', desc: '전시 작품 선정 및 검토' },
      { id: 'ex-05', name: '공간 배치', icon: '📐', desc: '전시 공간 레이아웃 설계' },
      { id: 'ex-06', name: '조명 설계', icon: '💡', desc: '전시 조명 계획' },
      { id: 'ex-07', name: '안전 점검', icon: '🛡️', desc: '전시 안전성 검토' },
      { id: 'ex-08', name: '홍보 계획', icon: '📢', desc: '전시 마케팅 전략 수립' },
      { id: 'ex-09', name: '도록 제작', icon: '📖', desc: '전시 도록 기획 및 제작' },
      { id: 'ex-10', name: '오프닝 준비', icon: '🎉', desc: '개막식 준비' },
      { id: 'ex-11', name: '평가 보고서', icon: '📊', desc: '전시 성과 평가' }
    ]
  },
  
  education: {
    name: '교육 Education',
    icon: '📚',
    color: '#06b6d4',
    nodes: [
      { id: 'ed-01', name: '프로그램 기획', icon: '🎯', desc: '교육 프로그램 설계' },
      { id: 'ed-02', name: '커리큘럼 개발', icon: '📋', desc: '교육 과정 개발' },
      { id: 'ed-03', name: '교재 제작', icon: '📚', desc: '교육 자료 제작' },
      { id: 'ed-04', name: '강사 섭외', icon: '👨‍🏫', desc: '강사진 구성' },
      { id: 'ed-05', name: '참가자 모집', icon: '📣', desc: '교육생 모집 및 선발' },
      { id: 'ed-06', name: '일정 조정', icon: '🗓️', desc: '교육 일정 관리' },
      { id: 'ed-07', name: '공간 예약', icon: '🏛️', desc: '교육 공간 확보' },
      { id: 'ed-08', name: '장비 준비', icon: '🎥', desc: '교육 장비 준비' },
      { id: 'ed-09', name: '만족도 조사', icon: '📝', desc: '교육 만족도 평가' },
      { id: 'ed-10', name: '수료증 발급', icon: '🎓', desc: '수료 관리' },
      { id: 'ed-11', name: '성과 분석', icon: '📈', desc: '교육 성과 분석' }
    ]
  },
  
  archive: {
    name: '아카이브 Archive',
    icon: '📦',
    color: '#10b981',
    nodes: [
      { id: 'ar-01', name: '자료 수집', icon: '📥', desc: '자료 수집 및 접수' },
      { id: 'ar-02', name: '등록 처리', icon: '📝', desc: '자료 등록 및 번호 부여' },
      { id: 'ar-03', name: '분류 체계', icon: '🗂️', desc: '자료 분류 및 정리' },
      { id: 'ar-04', name: '디지털화', icon: '💾', desc: '디지털 변환 작업' },
      { id: 'ar-05', name: '메타데이터', icon: '🏷️', desc: '메타데이터 작성' },
      { id: 'ar-06', name: '보존 처리', icon: '🛡️', desc: '보존 처리 및 관리' },
      { id: 'ar-07', name: '환경 모니터링', icon: '🌡️', desc: '보존 환경 관리' },
      { id: 'ar-08', name: '검색 시스템', icon: '🔍', desc: '검색 시스템 구축' },
      { id: 'ar-09', name: '열람 서비스', icon: '📖', desc: '자료 열람 서비스' },
      { id: 'ar-10', name: '대여 관리', icon: '🔄', desc: '자료 대여 관리' },
      { id: 'ar-11', name: '통계 보고', icon: '📊', desc: '아카이브 통계' }
    ]
  },
  
  publication: {
    name: '출판 Publication',
    icon: '📖',
    color: '#f59e0b',
    nodes: [
      { id: 'pb-01', name: '출판 기획', icon: '💡', desc: '출판물 기획' },
      { id: 'pb-02', name: '원고 수집', icon: '📄', desc: '원고 수집 및 검토' },
      { id: 'pb-03', name: '편집 작업', icon: '✏️', desc: '원고 편집 및 교정' },
      { id: 'pb-04', name: '디자인', icon: '🎨', desc: '북 디자인 및 레이아웃' },
      { id: 'pb-05', name: '이미지 편집', icon: '🖼️', desc: '이미지 편집 및 보정' },
      { id: 'pb-06', name: '교정 교열', icon: '🔍', desc: '최종 교정 및 검수' },
      { id: 'pb-07', name: '인쇄 발주', icon: '🖨️', desc: '인쇄 및 제작 관리' },
      { id: 'pb-08', name: 'ISBN 등록', icon: '🏷️', desc: 'ISBN 및 납본' },
      { id: 'pb-09', name: '배포 계획', icon: '📦', desc: '배포 및 유통' },
      { id: 'pb-10', name: '홍보 활동', icon: '📢', desc: '출판물 홍보' },
      { id: 'pb-11', name: '판매 관리', icon: '💳', desc: '판매 및 재고 관리' }
    ]
  },
  
  research: {
    name: '연구 Research',
    icon: '🔬',
    color: '#ec4899',
    nodes: [
      { id: 'rs-01', name: '연구 주제', icon: '🎯', desc: '연구 주제 선정' },
      { id: 'rs-02', name: '문헌 조사', icon: '📚', desc: '선행 연구 조사' },
      { id: 'rs-03', name: '연구 계획', icon: '📋', desc: '연구 계획서 작성' },
      { id: 'rs-04', name: '데이터 수집', icon: '📊', desc: '연구 데이터 수집' },
      { id: 'rs-05', name: '현장 조사', icon: '🔍', desc: '필드워크 수행' },
      { id: 'rs-06', name: '분석 작업', icon: '📈', desc: '데이터 분석' },
      { id: 'rs-07', name: '실험 설계', icon: '🧪', desc: '실험 계획 및 수행' },
      { id: 'rs-08', name: '논문 작성', icon: '📝', desc: '연구 논문 작성' },
      { id: 'rs-09', name: '동료 검토', icon: '👥', desc: '동료 심사' },
      { id: 'rs-10', name: '학회 발표', icon: '🎤', desc: '연구 발표' },
      { id: 'rs-11', name: '출판 신청', icon: '📄', desc: '학술지 출판' }
    ]
  },
  
  admin: {
    name: '관리 Admin',
    icon: '⚙️',
    color: '#6366f1',
    nodes: [
      { id: 'ad-01', name: '예산 수립', icon: '💰', desc: '연간 예산 계획' },
      { id: 'ad-02', name: '인사 관리', icon: '👥', desc: '인력 관리' },
      { id: 'ad-03', name: '시설 관리', icon: '🏢', desc: '시설 유지 보수' },
      { id: 'ad-04', name: '장비 관리', icon: '🖥️', desc: '장비 관리' },
      { id: 'ad-05', name: '구매 발주', icon: '🛒', desc: '구매 및 조달' },
      { id: 'ad-06', name: '계약 관리', icon: '📜', desc: '계약 및 협약' },
      { id: 'ad-07', name: '법무 검토', icon: '⚖️', desc: '법률 검토' },
      { id: 'ad-08', name: '보험 관리', icon: '🛡️', desc: '보험 및 리스크' },
      { id: 'ad-09', name: '보안 관리', icon: '🔒', desc: '보안 시스템' },
      { id: 'ad-10', name: '재무 보고', icon: '📊', desc: '재무 보고서' },
      { id: 'ad-11', name: '감사 대응', icon: '📋', desc: '감사 준비' }
    ]
  },
  
  engagement: {
    name: '참여 Engagement',
    icon: '👥',
    color: '#14b8a6',
    nodes: [
      { id: 'eg-01', name: '관람객 조사', icon: '📊', desc: '관람객 분석' },
      { id: 'eg-02', name: '멤버십', icon: '💳', desc: '멤버십 프로그램' },
      { id: 'eg-03', name: '이벤트 기획', icon: '🎉', desc: '특별 이벤트 기획' },
      { id: 'eg-04', name: 'SNS 운영', icon: '📱', desc: '소셜 미디어 관리' },
      { id: 'eg-05', name: '뉴스레터', icon: '📧', desc: '뉴스레터 발행' },
      { id: 'eg-06', name: '자원봉사', icon: '🤝', desc: '자원봉사 관리' },
      { id: 'eg-07', name: '후원 유치', icon: '💝', desc: '후원자 관리' },
      { id: 'eg-08', name: '커뮤니티', icon: '👨‍👩‍👧‍👦', desc: '커뮤니티 활동' },
      { id: 'eg-09', name: '피드백', icon: '💬', desc: '의견 수렴' },
      { id: 'eg-10', name: '만족도 조사', icon: '⭐', desc: '만족도 평가' },
      { id: 'eg-11', name: '리워드', icon: '🎁', desc: '리워드 프로그램' }
    ]
  },
  
  technology: {
    name: '기술 Technology',
    icon: '💻',
    color: '#8b5cf6',
    nodes: [
      { id: 'tc-01', name: '웹사이트', icon: '🌐', desc: '웹사이트 관리' },
      { id: 'tc-02', name: '모바일 앱', icon: '📱', desc: '모바일 앱 개발' },
      { id: 'tc-03', name: 'AR/VR', icon: '🥽', desc: 'AR/VR 콘텐츠' },
      { id: 'tc-04', name: '데이터베이스', icon: '💾', desc: 'DB 관리' },
      { id: 'tc-05', name: 'API 연동', icon: '🔌', desc: 'API 개발' },
      { id: 'tc-06', name: 'AI 분석', icon: '🤖', desc: 'AI 시스템' },
      { id: 'tc-07', name: '보안 시스템', icon: '🔒', desc: '정보 보안' },
      { id: 'tc-08', name: '백업 복구', icon: '💿', desc: '백업 시스템' },
      { id: 'tc-09', name: '클라우드', icon: '☁️', desc: '클라우드 관리' },
      { id: 'tc-10', name: 'IoT 센서', icon: '📡', desc: 'IoT 시스템' },
      { id: 'tc-11', name: '분석 대시보드', icon: '📊', desc: '데이터 분석' }
    ]
  }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NODE_LIBRARY_88;
}
