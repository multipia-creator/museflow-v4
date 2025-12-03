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
당신은 박물관/미술관 워크플로우 AI 어시스턴트입니다.
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
당신은 박물관/미술관 전문 문서 작성 AI입니다.
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

export default ai
