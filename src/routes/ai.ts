import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const ai = new Hono<{ Bindings: Bindings }>()

// ==========================================
// AI Command Endpoint - Natural Language Processing
// ==========================================
ai.post('/command', async (c) => {
  try {
    const { command, role, currentNodes } = await c.req.json()
    
    if (!command || typeof command !== 'string') {
      return c.json({ 
        success: false, 
        error: 'Invalid command' 
      }, 400)
    }
    
    const geminiApiKey = c.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY not configured in environment')
      return c.json({ 
        success: false, 
        error: 'Gemini API key not configured',
        message: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Cloudflare Pages Secret에 API 키를 추가해주세요.'
      }, 500)
    }
    
    // Call Gemini API to parse command
    const aiResponse = await analyzeCommandWithGemini(
      command, 
      role || 'curator', 
      currentNodes || [],
      geminiApiKey
    )
    
    return c.json({
      success: true,
      ...aiResponse
    })
    
  } catch (error) {
    console.error('❌ AI Command Error:', error)
    return c.json({
      success: false,
      error: 'AI processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// Gemini API Integration
// ==========================================
async function analyzeCommandWithGemini(
  command: string, 
  role: string, 
  currentNodes: any[],
  apiKey: string
) {
  const roleContext = {
    curator: '학예사 (전시 기획, 작품 큐레이션, 관람객 경험 디자인)',
    educator: '에듀케이터 (교육 프로그램, 워크숍, 학습 콘텐츠)',
    admin: '행정관리자 (예산, 인사, 시설 관리)'
  }[role] || '학예사'
  
  const systemPrompt = `
당신은 뮤지엄/미술관 워크플로우 AI 어시스턴트입니다.
현재 사용자 역할: ${roleContext}

사용자의 자연어 명령을 분석해서 다음 JSON 형식으로 응답해주세요:

{
  "type": "workflow" | "image" | "chart" | "report",
  "message": "사용자에게 보여줄 메시지",
  "nodes": [
    {
      "title": "노드 제목",
      "type": "idea" | "image" | "chart" | "document" | "task",
      "description": "노드 설명",
      "x": 100,
      "y": 100
    }
  ],
  "connections": [
    { "from": 0, "to": 1 }
  ]
}

**명령 분석 규칙**:
1. "워크플로우" 키워드가 있으면 type: "workflow"로 여러 노드 생성
2. "이미지" 또는 "포스터" 키워드가 있으면 type: "image"로 1개 이미지 노드 생성
3. "차트" 또는 "예산" 또는 "통계" 키워드가 있으면 type: "chart"로 1개 차트 노드 생성
4. "보고서" 또는 "기획안" 키워드가 있으면 type: "report"로 1개 문서 노드 생성

**노드 배치**:
- 기존 노드 개수: ${currentNodes.length}
- 새 노드는 기존 노드와 겹치지 않게 x, y 좌표 계산
- 첫 노드는 (150, 150), 이후 노드는 가로 200px, 세로 150px 간격

**예시 1**:
명령: "현대미술 전시 기획 워크플로우 만들어줘"
응답:
{
  "type": "workflow",
  "message": "현대미술 전시 기획 워크플로우가 생성되었습니다.",
  "nodes": [
    { "title": "전시 주제 선정", "type": "idea", "description": "전시 컨셉 브레인스토밍", "x": 150, "y": 150 },
    { "title": "작품 선정", "type": "task", "description": "큐레이션 및 작가 선정", "x": 350, "y": 150 },
    { "title": "전시 공간 설계", "type": "task", "description": "공간 레이아웃 기획", "x": 550, "y": 150 },
    { "title": "예산 계획", "type": "chart", "description": "전시 예산 수립", "x": 350, "y": 300 }
  ],
  "connections": [
    { "from": 0, "to": 1 },
    { "from": 1, "to": 2 },
    { "from": 1, "to": 3 }
  ]
}

**예시 2**:
명령: "전시 포스터 이미지 생성해줘"
응답:
{
  "type": "image",
  "message": "전시 포스터 이미지 노드가 생성되었습니다.",
  "nodes": [
    { "title": "전시 포스터", "type": "image", "description": "AI 생성 포스터 디자인", "x": 150, "y": 150 }
  ],
  "connections": []
}

**중요**: 반드시 유효한 JSON만 응답하세요. 추가 설명이나 마크다운 없이 JSON만 출력하세요.
`
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\n사용자 명령: "${command}"`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  
  // Extract generated text
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!generatedText) {
    throw new Error('No response from Gemini API')
  }
  
  // Parse JSON response (remove markdown code blocks if present)
  let cleanedText = generatedText.trim()
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/```\n?/g, '')
  }
  
  try {
    const parsed = JSON.parse(cleanedText)
    return parsed
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedText)
    
    // Fallback: Create simple workflow
    return {
      type: 'workflow',
      message: '기본 워크플로우가 생성되었습니다.',
      nodes: [
        {
          title: command.slice(0, 30),
          type: 'idea',
          description: '자동 생성된 노드',
          x: 150,
          y: 150
        }
      ],
      connections: []
    }
  }
}

// ==========================================
// AI Document Generation Endpoint
// ==========================================
ai.post('/document', async (c) => {
  try {
    const { title, role } = await c.req.json()
    
    if (!title || typeof title !== 'string') {
      return c.json({ 
        success: false, 
        error: 'Invalid title' 
      }, 400)
    }
    
    const geminiApiKey = c.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY not configured for document generation')
      return c.json({ 
        success: false, 
        error: 'Gemini API key not configured',
        message: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.'
      }, 500)
    }
    
    // Generate document content with Gemini
    const content = await generateDocumentWithGemini(
      title,
      role || 'curator',
      geminiApiKey
    )
    
    return c.json({
      success: true,
      content: content
    })
    
  } catch (error) {
    console.error('❌ Document Generation Error:', error)
    return c.json({
      success: false,
      error: 'Document generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// Generate Document with Gemini
// ==========================================
async function generateDocumentWithGemini(
  title: string,
  role: string,
  apiKey: string
): Promise<string> {
  const roleContext = {
    curator: '학예사 (전시 기획, 작품 큐레이션)',
    educator: '에듀케이터 (교육 프로그램, 워크숍)',
    admin: '행정관리자 (예산, 인사, 시설)'
  }[role] || '학예사'
  
  const systemPrompt = `
당신은 뮤지엄/미술관 전문 문서 작성 AI입니다.
현재 사용자 역할: ${roleContext}

주제: "${title}"

위 주제로 전문적인 문서를 작성해주세요.

**문서 형식**:
- 간결하고 실용적인 내용
- 3-5개의 섹션으로 구성
- 각 섹션은 2-3문장으로 요약
- 총 200-300자 이내

**예시 구조**:
## 개요
(2-3문장 요약)

## 주요 내용
- 항목 1
- 항목 2
- 항목 3

## 기대 효과
(2-3문장)

**중요**: 마크다운 형식으로 작성하고, 불필요한 장식 없이 핵심 내용만 포함하세요.
`
  
  const requestBody = {
    contents: [{
      parts: [{
        text: systemPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!generatedText) {
    throw new Error('No response from Gemini API')
  }
  
  return generatedText.trim()
}

// ==========================================
// AI Chat Endpoint - General Conversation
// ==========================================
ai.post('/chat', async (c) => {
  try {
    const { message, model, context } = await c.req.json()
    
    if (!message || typeof message !== 'string') {
      return c.json({ 
        success: false, 
        error: 'Invalid message' 
      }, 400)
    }
    
    const geminiApiKey = c.env.GEMINI_API_KEY
    
    // Try real API if key exists
    if (geminiApiKey) {
      try {
        const response = await generateChatResponseWithGemini(
          message,
          model || 'GPT-4o',
          context || {},
          geminiApiKey
        )
        
        return c.json({
          success: true,
          response: response,
          model: 'Gemini 2.5 Flash'
        })
      } catch (apiError) {
        console.warn('⚠️ Gemini API failed, using mock response:', apiError)
        // Fall through to mock response
      }
    }
    
    // Mock response for development/testing
    const mockResponse = generateMockResponse(message, context)
    
    return c.json({
      success: true,
      response: mockResponse,
      model: 'Mock AI (Development)'
    })
    
  } catch (error) {
    console.error('❌ AI Chat Error:', error)
    return c.json({
      success: false,
      error: 'AI chat failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// Generate Chat Response with Gemini
// ==========================================
async function generateChatResponseWithGemini(
  message: string,
  model: string,
  context: any,
  apiKey: string
): Promise<string> {
  const systemPrompt = `
당신은 MuseFlow Canvas의 AI 어시스턴트입니다.
현재 사용자는 Canvas 페이지에서 뮤지엄/미술관 워크플로우를 작업하고 있습니다.

**현재 상태**:
- 페이지: ${context.page || 'canvas'}
- 카드 개수: ${context.cardCount || 0}개
- 연결선: ${context.connections || 0}개

**당신의 역할**:
1. Canvas 사용법 안내
2. 워크플로우 작성 도움
3. 뮤지엄/미술관 전시 기획 조언
4. 일반적인 질문 응답

**응답 스타일**:
- 친절하고 전문적인 톤
- 간결하고 명확한 답변 (100-150자)
- 필요시 구체적인 예시 제공
- 이모지 사용 가능 (적절한 경우)

**예시**:
Q: 전시 기획 어떻게 시작해?
A: 전시 기획은 주제 선정부터 시작합니다! 먼저 타겟 관람객을 정하고, 전시 컨셉을 구체화하세요. Canvas에서 '새 카드 만들기'로 아이디어를 시각화해보세요 💡

Q: 카드를 어떻게 연결하나요?
A: 카드를 드래그해서 다른 카드 위에 놓으면 자동으로 연결됩니다. 또는 카드 사이를 클릭해서 수동으로 연결할 수 있어요 🔗
`
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\n사용자 질문: "${message}"\n\n답변:`
      }]
    }],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    }
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!generatedText) {
    throw new Error('No response from Gemini API')
  }
  
  return generatedText.trim()
}

// ==========================================
// Mock Response Generator (Development/Testing)
// ==========================================
function generateMockResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()
  
  // Context-aware responses
  const { totalProjects = 0, totalTasks = 0, activeTasks = 0, canvasCards = 0 } = context
  
  // 전시 기획 관련
  if (lowerMessage.includes('전시') && lowerMessage.includes('시작')) {
    return `전시 기획은 주제 선정부터 시작하세요! 💡

현재 ${totalProjects}개의 프로젝트가 진행 중이네요. 
다음 단계를 추천드립니다:

1️⃣ 타겟 관람객 정의
2️⃣ 전시 컨셉 구체화
3️⃣ 작품 리스트 작성
4️⃣ 공간 레이아웃 기획

Canvas에서 '새 카드 만들기'로 아이디어를 시각화해보세요!`
  }
  
  // 작업 관련
  if (lowerMessage.includes('작업') || lowerMessage.includes('태스크') || lowerMessage.includes('task')) {
    return `현재 ${activeTasks}개의 활성 작업이 있습니다. 

우선순위를 다시 정렬해볼까요? 🎯
1. 마감일이 임박한 작업 먼저
2. 의존성이 있는 작업 확인
3. 팀원 업무 균형 체크

Tasks Panel에서 필터와 정렬을 활용해보세요!`
  }
  
  // 템플릿 관련
  if (lowerMessage.includes('템플릿')) {
    return `템플릿을 활용하면 시간을 크게 절약할 수 있어요! ⚡

추천 템플릿:
• 전시 기획 템플릿 (Exhibition)
• 교육 프로그램 템플릿 (Education)
• 소장품 관리 템플릿 (Collection)

Templates Panel을 열어서 카테고리별로 둘러보세요!`
  }
  
  // Canvas 사용법
  if (lowerMessage.includes('카드') || lowerMessage.includes('연결')) {
    return `카드 연결은 아주 간단해요! 🔗

방법 1: 카드를 드래그해서 다른 카드 위에 드롭
방법 2: C 키를 누르고 카드 사이 클릭

카드 메뉴(우클릭)에서 색상, 타입, 노트도 변경할 수 있어요.`
  }
  
  // 도움말
  if (lowerMessage.includes('도와') || lowerMessage.includes('help')) {
    return `무엇이든 물어보세요! 😊

제가 도와드릴 수 있는 것들:
✅ 프로젝트 관리 조언
✅ 작업 우선순위 제안
✅ Canvas 사용법 안내
✅ 템플릿 추천
✅ 뮤지엄 워크플로우 기획

구체적으로 어떤 부분이 궁금하신가요?`
  }
  
  // 진행 상황
  if (lowerMessage.includes('진행') || lowerMessage.includes('상태')) {
    return `현재 프로젝트 현황입니다 📊

• 전체 프로젝트: ${totalProjects}개
• 활성 작업: ${activeTasks}개
• Canvas 카드: ${canvasCards}개

완료율: ${totalTasks > 0 ? Math.round(((totalTasks - activeTasks) / totalTasks) * 100) : 0}%

순조롭게 진행되고 있네요! 💪`
  }
  
  // Default response
  return `좋은 질문이에요! 🤔

현재 ${totalProjects}개 프로젝트, ${activeTasks}개 활성 작업이 있습니다.

더 구체적으로 말씀해주시면 정확한 답변을 드릴 수 있어요. 
예를 들어:
• "전시 기획 어떻게 시작해?"
• "작업 우선순위 추천해줘"
• "템플릿 뭐가 좋을까?"

무엇이 궁금하신가요?`
}

export default ai
