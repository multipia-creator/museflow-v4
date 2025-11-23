/**
 * MuseFlow V4 - AI Assistant API Route
 * 
 * Gemini Flash API를 사용해 사용자 질문에 답변하고
 * 관련 도움말 문서를 추천합니다.
 * 
 * Endpoint: POST /api/help/ai-assistant
 * 
 * Request Body:
 * {
 *   message: string,
 *   conversationId: string,
 *   context: { currentUrl, userRole, timestamp }
 * }
 * 
 * Response:
 * {
 *   answer: string,
 *   relatedArticles: Array<{ id, title, summary }>,
 *   confidence: number
 * }
 */

import type { Context } from 'hono'

// Help articles database (simplified version for semantic search)
const HELP_ARTICLES = [
  {
    id: 'artwork-registration',
    title: '작품 등록 완전 가이드',
    summary: '6단계 등록 프로세스를 처음부터 끝까지 상세히 설명합니다',
    keywords: ['작품', '등록', 'wizard', '소장품', '기본정보', '이미지', '메타데이터'],
    category: 'collections'
  },
  {
    id: 'accession-numbers',
    title: '소장번호 체계 이해하기',
    summary: 'YYYY.### 형식의 소장번호가 어떻게 생성되고 관리되는지 배웁니다',
    keywords: ['소장번호', 'accession', '식별자', '고유번호', 'YYYY'],
    category: 'collections'
  },
  {
    id: 'ai-metadata',
    title: 'AI 메타데이터 생성 원리',
    summary: 'AI가 이미지를 분석해 설명, 태그, 스타일을 자동 생성하는 방법',
    keywords: ['AI', '메타데이터', '자동생성', '이미지분석', 'Gemini'],
    category: 'collections'
  },
  {
    id: 'creating-exhibitions',
    title: '새 전시 만들기',
    summary: '전시 제목, 테마, 기간 설정부터 작품 선정까지',
    keywords: ['전시', '만들기', '생성', '기획', '테마', '작품선정'],
    category: 'exhibitions'
  },
  {
    id: 'inviting-users',
    title: '새 사용자 초대하기',
    summary: '이메일 초대, 임시 비밀번호, 역할 배정 절차',
    keywords: ['사용자', '초대', '이메일', '역할', '권한'],
    category: 'users'
  },
  {
    id: 'rbac-overview',
    title: '역할 기반 접근 제어 (RBAC) 이해',
    summary: '8개 기본 역할과 권한 계층 구조 완전 가이드',
    keywords: ['RBAC', '역할', '권한', '접근제어', '보안'],
    category: 'users'
  },
  {
    id: 'environmental-monitoring',
    title: '환경 모니터링 시스템',
    summary: '온도, 습도, 조도를 실시간으로 추적하고 관리',
    keywords: ['환경', '모니터링', '온도', '습도', '조도', '센서', 'IoT'],
    category: 'iot'
  },
  {
    id: 'ai-agents-overview',
    title: '8개 AI 에이전트 소개',
    summary: 'Exhibition, Budget, Archive, Visitor, Digital Twin, Guide, Chatbot, Notion 에이전트',
    keywords: ['AI', '에이전트', '자동화', '머신러닝'],
    category: 'ai-models'
  },
  {
    id: 'visitor-analytics',
    title: '방문자 분석 대시보드',
    summary: '실시간 방문자 수, 인구통계, 체류 시간 분석',
    keywords: ['방문자', '분석', '통계', '대시보드', '히트맵'],
    category: 'analytics'
  },
  {
    id: 'media-library',
    title: '미디어 라이브러리 사용법',
    summary: '이미지, 비디오, 문서를 업로드하고 관리하는 중앙 저장소',
    keywords: ['미디어', '파일', '업로드', '이미지', '라이브러리'],
    category: 'storage'
  }
];

// FAQ 답변 템플릿
const FAQ_TEMPLATES: Record<string, string> = {
  'artwork_registration': `작품 등록은 다음 6단계로 진행됩니다:

1️⃣ **기본 정보**: 소장번호, 제목, 작가, 제작년도 입력
2️⃣ **상세 설명**: AI 메타데이터 생성 (선택사항)
3️⃣ **이미지 업로드**: 대표 이미지 및 추가 이미지
4️⃣ **출처 & 이력**: Provenance 타임라인 기록
5️⃣ **보존 상태**: 상태 평가 및 등급 부여
6️⃣ **검토 & 제출**: 최종 확인 후 제출

💡 **팁**: 모든 입력 내용은 자동 저장되므로 언제든 중단하고 나중에 이어서 작업할 수 있습니다.`,

  'ai_metadata': `AI 메타데이터 생성은 다음과 같이 작동합니다:

1. **이미지 분석**: Gemini Vision API가 작품 이미지를 분석
2. **설명 생성**: 작품의 시각적 특징, 스타일, 주제를 자동 설명
3. **태그 추출**: 관련 키워드와 카테고리 자동 생성
4. **신뢰도 점수**: 0-100% 신뢰도 점수 표시

⚠️ **주의사항**:
- AI가 생성한 내용은 반드시 전문가가 검토해야 합니다
- 신뢰도 70% 미만은 수동 검증 필수
- 역사적 사실(연도, 인명)은 항상 확인하세요`,

  'exhibition_creation': `새 전시를 만드는 방법:

1. **전시 → 새 전시 만들기** 클릭
2. **기본 정보** 입력:
   - 전시 제목 (간결하고 흥미로운 제목)
   - 전시 기간 (설치/철거 기간 포함)
   - 전시 공간 선택
3. **작품 선정**:
   - 수동 선택 또는 AI 추천 활용
4. **공간 배치**:
   - 방문자 동선 시뮬레이션
5. **제출**:
   - 검토 단계로 전환

💡 **팁**: AI 테마 제안 기능을 사용하면 소장품 기반 전시 아이디어를 얻을 수 있습니다.`,

  'user_invitation': `사용자 초대 절차:

1. **사용자 & 역할 → 새 사용자 초대** 클릭
2. **이메일 주소** 입력
3. **역할 선택**:
   - SuperAdmin, Admin, Curator, Conservator, Educator, Analyst, Viewer, Guest 중 선택
4. **초대 전송**: 이메일로 임시 비밀번호 발송
5. **첫 로그인**: 사용자가 비밀번호 변경

🔒 **보안**: 임시 비밀번호는 24시간 후 만료됩니다.`,

  'environmental_monitoring': `환경 모니터링 설정:

1. **IoT 센서 설치**: 전시 공간에 온습도/조도 센서 배치
2. **wrangler.jsonc 설정**: IoT 바인딩 추가
3. **알림 임계값 설정**:
   - 온도: 21-24°C (권장)
   - 습도: 45-55% (권장)
   - 조도: 작품 재질에 따라 다름
4. **실시간 모니터링**: 대시보드에서 센서 데이터 확인

🚨 임계값 초과 시 즉시 알림이 발송됩니다.`
};

/**
 * Generate AI response using Gemini Flash API
 */
async function generateAIResponse(userMessage: string, context: any): Promise<{ answer: string, confidence: number }> {
  // TODO: Integrate with actual Gemini API
  // For now, use template-based responses
  
  const lowerMessage = userMessage.toLowerCase();
  
  // Match intent
  if (lowerMessage.includes('작품') && (lowerMessage.includes('등록') || lowerMessage.includes('추가'))) {
    return {
      answer: FAQ_TEMPLATES.artwork_registration,
      confidence: 0.92
    };
  }
  
  if (lowerMessage.includes('ai') && (lowerMessage.includes('메타데이터') || lowerMessage.includes('생성'))) {
    return {
      answer: FAQ_TEMPLATES.ai_metadata,
      confidence: 0.88
    };
  }
  
  if (lowerMessage.includes('전시') && (lowerMessage.includes('만들') || lowerMessage.includes('생성'))) {
    return {
      answer: FAQ_TEMPLATES.exhibition_creation,
      confidence: 0.90
    };
  }
  
  if (lowerMessage.includes('사용자') && (lowerMessage.includes('초대') || lowerMessage.includes('추가'))) {
    return {
      answer: FAQ_TEMPLATES.user_invitation,
      confidence: 0.85
    };
  }
  
  if (lowerMessage.includes('환경') || lowerMessage.includes('모니터링') || lowerMessage.includes('온도') || lowerMessage.includes('습도')) {
    return {
      answer: FAQ_TEMPLATES.environmental_monitoring,
      confidence: 0.87
    };
  }
  
  // Generic response
  return {
    answer: `죄송합니다. 해당 질문에 대한 정확한 답변을 찾지 못했습니다. 😔

💡 **제안**:
- 더 구체적으로 질문해보세요 (예: "작품 등록 방법", "AI 메타데이터 생성")
- 아래 관련 문서를 확인해보세요
- Help Center에서 직접 검색해보세요

다른 질문이 있으시면 언제든 물어보세요!`,
    confidence: 0.30
  };
}

/**
 * Find related articles based on user message
 */
function findRelatedArticles(userMessage: string, topK = 3): Array<{ id: string, title: string, summary: string }> {
  const lowerMessage = userMessage.toLowerCase();
  const tokens = lowerMessage.split(/\s+/);
  
  // Score each article based on keyword match
  const scored = HELP_ARTICLES.map(article => {
    let score = 0;
    
    // Check if any token matches keywords
    tokens.forEach(token => {
      article.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(token) || token.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      // Check title and summary
      if (article.title.toLowerCase().includes(token)) {
        score += 2;
      }
      if (article.summary.toLowerCase().includes(token)) {
        score += 1;
      }
    });
    
    return { ...article, score };
  });
  
  // Sort by score and return top K
  return scored
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ id, title, summary }) => ({ id, title, summary }));
}

/**
 * AI Assistant API Handler
 */
export async function handleAIAssistant(c: Context) {
  try {
    const body = await c.req.json();
    const { message, conversationId, context } = body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Invalid message' }, 400);
    }
    
    if (message.length > 500) {
      return c.json({ error: 'Message too long (max 500 characters)' }, 400);
    }
    
    console.log('[AI Assistant] Processing message:', {
      conversationId,
      messageLength: message.length,
      userRole: context?.userRole
    });
    
    // Generate AI response
    const { answer, confidence } = await generateAIResponse(message, context);
    
    // Find related articles
    const relatedArticles = findRelatedArticles(message);
    
    // Log analytics
    console.log('[AI Assistant] Response generated:', {
      confidence,
      relatedArticlesCount: relatedArticles.length
    });
    
    return c.json({
      answer,
      relatedArticles,
      confidence,
      conversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    return c.json({ 
      error: 'Internal server error',
      message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }, 500);
  }
}
