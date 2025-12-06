/**
 * MuseFlow V16.0 - Google Gemini API Integration
 * Server-side API endpoint for Gemini AI Research Agent
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  GEMINI_API_KEY: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/api/*', cors());

/**
 * Gemini AI Research Endpoint
 * POST /api/gemini/research
 */
app.post('/api/gemini/research', async (c) => {
  try {
    const { query, depth = 'standard' } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const apiKey = c.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not configured');
      return c.json({ 
        error: 'Gemini API not configured',
        fallback: true,
        data: getFallbackResponse(query)
      }, 200);
    }

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: buildGeminiPrompt(query, depth)
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Gemini API Error:', error);
      
      return c.json({
        error: 'Gemini API request failed',
        fallback: true,
        data: getFallbackResponse(query)
      }, 200);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      return c.json({
        error: 'No response from Gemini',
        fallback: true,
        data: getFallbackResponse(query)
      }, 200);
    }

    // Save to database (optional)
    try {
      await c.env.DB.prepare(`
        INSERT INTO learning_data (user_id, task_type, user_input, ai_decision, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(1, 'gemini-research', query, text).run();
    } catch (dbError) {
      console.warn('⚠️ Failed to save to database:', dbError);
    }

    return c.json({
      success: true,
      research: text,
      sources: ['Google Gemini AI'],
      model: 'gemini-pro',
      duration: 0,
      query: query
    });

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
      data: getFallbackResponse('general research')
    }, 200);
  }
});

/**
 * Budget Calculator Endpoint
 * POST /api/budget/calculate
 */
app.post('/api/budget/calculate', async (c) => {
  try {
    const params = await c.req.json();
    
    const {
      artworkCount = 20,
      venue = 'main-gallery',
      duration = 90,
      specialRequirements = []
    } = params;

    // Calculate budget
    const baseCostPerArtwork = 5000000; // 5M KRW per artwork
    const baseBudget = artworkCount * baseCostPerArtwork;
    
    const marketing = baseBudget * 0.15;
    const logistics = baseBudget * 0.20;
    const insurance = baseBudget * 0.10;
    const venueCost = venue === 'main-gallery' ? 30000000 : 15000000;
    const durationMultiplier = duration / 90; // base 90 days
    
    let specialCost = 0;
    if (specialRequirements.includes('climate-control')) specialCost += 10000000;
    if (specialRequirements.includes('security')) specialCost += 15000000;
    if (specialRequirements.includes('ar-vr')) specialCost += 25000000;
    
    const totalBudget = (baseBudget + marketing + logistics + insurance + venueCost + specialCost) * durationMultiplier;

    const result = {
      total: Math.round(totalBudget),
      breakdown: {
        artworkCosts: Math.round(baseBudget * durationMultiplier),
        marketing: Math.round(marketing * durationMultiplier),
        logistics: Math.round(logistics * durationMultiplier),
        insurance: Math.round(insurance * durationMultiplier),
        venue: venueCost,
        specialRequirements: specialCost
      },
      recommendation: totalBudget > 500000000 
        ? '고예산 전시 - 단계별 승인 권장' 
        : '예산 적정 - 승인 권장',
      currency: 'KRW'
    };

    // Save to database
    try {
      await c.env.DB.prepare(`
        INSERT INTO learning_data (user_id, task_type, user_input, ai_decision, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(1, 'budget-calculation', JSON.stringify(params), JSON.stringify(result)).run();
    } catch (dbError) {
      console.warn('⚠️ Failed to save to database:', dbError);
    }

    return c.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Budget Calculation Error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * Visitor Prediction Endpoint
 * POST /api/visitors/predict
 */
app.post('/api/visitors/predict', async (c) => {
  try {
    const { dateRange, exhibitionType = 'temporary' } = await c.req.json();
    
    // Parse date range
    const [startDate, endDate] = dateRange.split(' to ');
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    
    // Base daily visitors by exhibition type
    const baseVisitors: Record<string, number> = {
      'temporary': 350,
      'permanent': 200,
      'special': 500,
      'Impressionism': 450
    };
    
    const dailyAvg = baseVisitors[exhibitionType] || 300;
    const weekendMultiplier = 1.8;
    const seasonalVariation = 0.15;
    
    // Generate daily predictions
    const daily = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const seasonal = Math.sin((i / days) * Math.PI) * seasonalVariation;
      const randomVariation = (Math.random() - 0.5) * 0.2;
      
      const visitors = Math.round(
        dailyAvg * 
        (isWeekend ? weekendMultiplier : 1) * 
        (1 + seasonal + randomVariation)
      );
      
      daily.push({
        date: date.toISOString().split('T')[0],
        visitors: visitors,
        isWeekend: isWeekend
      });
    }
    
    const totalVisitors = daily.reduce((sum, day) => sum + day.visitors, 0);
    
    const result = {
      total: totalVisitors,
      daily: daily,
      confidence: 0.87,
      averageDaily: Math.round(totalVisitors / days),
      peakDay: daily.reduce((max, day) => day.visitors > max.visitors ? day : max),
      insights: [
        `주말 방문객이 평일 대비 ${Math.round((weekendMultiplier - 1) * 100)}% 증가`,
        `전시 중반부 방문객 ${Math.round(seasonalVariation * 100)}% 증가 예상`,
        `총 ${days}일 기간 예상 방문객: ${totalVisitors.toLocaleString()}명`
      ]
    };

    return c.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Visitor Prediction Error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * Health Check
 */
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '16.0.0',
    apis: {
      gemini: !!c.env.GEMINI_API_KEY,
      database: !!c.env.DB
    }
  });
});

/**
 * Helper Functions
 */

function buildGeminiPrompt(query: string, depth: string): string {
  const depthInstructions: Record<string, string> = {
    'quick': '간단하게 요약하여 답변해주세요 (200자 이내)',
    'standard': '표준적인 깊이로 답변해주세요 (500자 내외)',
    'comprehensive': '상세하고 전문적으로 답변해주세요 (1000자 이상)',
    'detailed': '매우 상세하게 모든 측면을 고려하여 답변해주세요'
  };

  const instruction = depthInstructions[depth] || depthInstructions['standard'];

  return `당신은 뮤지엄 전문가 AI 어시스턴트입니다. 다음 질문에 대해 ${instruction}

질문: ${query}

답변 형식:
1. 핵심 요약
2. 주요 발견 사항 (3-5개)
3. 실행 가능한 권장사항
4. 참고 자료 또는 추가 조사가 필요한 영역

전문적이고 실용적인 답변을 제공해주세요.`;
}

function getFallbackResponse(query: string) {
  return {
    research: `${query}에 대한 AI 리서치 결과 (Fallback Mode)\n\n핵심 요약:\nGemini API가 현재 사용 불가능하여 기본 응답을 제공합니다.\n\n주요 발견:\n1. 역사적 맥락 분석 필요\n2. 작품 선정 기준 수립\n3. 전시 구성 계획 수립\n\n권장사항:\nGemini API 키를 설정하여 실제 AI 분석을 활용하세요.`,
    sources: ['Fallback Response'],
    duration: 0
  };
}

export default app;
