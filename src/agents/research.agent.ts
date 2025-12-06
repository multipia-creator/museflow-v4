/**
 * Research Agent
 * 웹 리서치 및 데이터 수집
 * @version 1.0.0
 */

import type { ExecutionContext } from '../types/orchestrator.types';

interface ResearchResult {
  source: string;
  title: string;
  content: string;
  url?: string;
  relevance: number; // 0-100
}

interface ResearchInput {
  query: string;
  type?: 'exhibition' | 'artwork' | 'artist' | 'collection' | 'general';
  maxResults?: number;
}

export class ResearchAgent {
  private db: D1Database;
  private geminiApiKey?: string;

  constructor(db: D1Database, geminiApiKey?: string) {
    this.db = db;
    this.geminiApiKey = geminiApiKey;
  }

  /**
   * 메인 실행 함수
   */
  async execute(input: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    try {
      console.log('🔬 Research Agent 시작:', input);

      const researchInput = input as ResearchInput;
      const query = researchInput.query || context.command;
      const type = researchInput.type || 'general';
      const maxResults = researchInput.maxResults || 10;

      // 1. 내부 DB 검색
      const dbResults = await this.searchInternalDB(query, type);

      // 2. 과거 리서치 데이터 조회
      const historicalResults = await this.searchHistoricalResearch(query, context.userId);

      // 3. Gemini API를 통한 지능형 요약 (Optional)
      let aiSummary: string | undefined;
      if (this.geminiApiKey && dbResults.length > 0) {
        aiSummary = await this.generateAISummary(query, dbResults);
      }

      // 4. 결과 통합 및 관련성 정렬
      const allResults = [...dbResults, ...historicalResults];
      const sortedResults = this.sortByRelevance(allResults, query);
      const topResults = sortedResults.slice(0, maxResults);

      // 5. 리서치 결과 저장 (학습 데이터)
      await this.saveResearchResults(context.sessionId, query, topResults);

      return {
        success: true,
        message: `${topResults.length}개의 리서치 결과를 찾았습니다.`,
        data: {
          query,
          type,
          results: topResults,
          aiSummary,
          totalFound: allResults.length,
          sources: {
            internal: dbResults.length,
            historical: historicalResults.length
          }
        }
      };

    } catch (error) {
      console.error('❌ Research Agent 실패:', error);
      return {
        success: false,
        message: 'Research 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 내부 DB 검색
   */
  private async searchInternalDB(query: string, type: string): Promise<ResearchResult[]> {
    try {
      const results: ResearchResult[] = [];

      // 전시 관련 검색
      if (type === 'exhibition' || type === 'general') {
        const exhibitions = await this.db.prepare(`
          SELECT id, name, description, start_date, end_date, metadata
          FROM projects
          WHERE name LIKE ? OR description LIKE ?
          LIMIT 10
        `).bind(`%${query}%`, `%${query}%`).all();

        exhibitions.results?.forEach((row: any) => {
          results.push({
            source: 'internal_exhibitions',
            title: row.name,
            content: row.description || '설명 없음',
            relevance: this.calculateRelevance(query, row.name + ' ' + row.description)
          });
        });
      }

      // 소장품 검색
      if (type === 'artwork' || type === 'collection' || type === 'general') {
        // TODO: 소장품 테이블이 있다면 검색
        // 현재는 프로젝트 메타데이터에서 검색
        const collections = await this.db.prepare(`
          SELECT id, name, metadata
          FROM projects
          WHERE metadata LIKE ?
          LIMIT 10
        `).bind(`%${query}%`).all();

        collections.results?.forEach((row: any) => {
          const metadata = row.metadata ? JSON.parse(row.metadata as string) : {};
          if (metadata.artworks || metadata.collection) {
            results.push({
              source: 'internal_collections',
              title: `소장품: ${row.name}`,
              content: JSON.stringify(metadata.artworks || metadata.collection),
              relevance: this.calculateRelevance(query, row.name)
            });
          }
        });
      }

      return results;

    } catch (error) {
      console.error('❌ 내부 DB 검색 실패:', error);
      return [];
    }
  }

  /**
   * 과거 리서치 데이터 조회
   */
  private async searchHistoricalResearch(query: string, userId: number): Promise<ResearchResult[]> {
    try {
      const results: ResearchResult[] = [];

      // learning_data 테이블에서 과거 리서치 결과 조회
      const historical = await this.db.prepare(`
        SELECT ai_decision, created_at
        FROM learning_data
        WHERE user_id = ?
          AND task_type LIKE '%research%'
          AND ai_decision LIKE ?
        ORDER BY created_at DESC
        LIMIT 5
      `).bind(userId, `%${query}%`).all();

      historical.results?.forEach((row: any) => {
        try {
          const decision = JSON.parse(row.ai_decision);
          if (decision.results) {
            decision.results.forEach((res: any) => {
              results.push({
                source: 'historical_research',
                title: res.title || '과거 리서치 결과',
                content: res.content || res.summary || '',
                relevance: this.calculateRelevance(query, res.title + ' ' + res.content) * 0.8 // 과거 데이터는 가중치 감소
              });
            });
          }
        } catch (e) {
          // JSON 파싱 실패 시 무시
        }
      });

      return results;

    } catch (error) {
      console.error('❌ 과거 리서치 검색 실패:', error);
      return [];
    }
  }

  /**
   * Gemini API를 통한 AI 요약 생성
   */
  private async generateAISummary(query: string, results: ResearchResult[]): Promise<string> {
    try {
      if (!this.geminiApiKey) {
        return '';
      }

      const prompt = `
다음은 "${query}"에 대한 리서치 결과입니다.
핵심 내용을 3-5문장으로 요약해주세요.

리서치 결과:
${results.slice(0, 5).map((r, i) => `${i + 1}. ${r.title}: ${r.content.substring(0, 200)}`).join('\n')}

요약:`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.geminiApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        console.error('❌ Gemini API 오류:', await response.text());
        return '';
      }

      const data = await response.json();
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return summary.trim();

    } catch (error) {
      console.error('❌ AI 요약 생성 실패:', error);
      return '';
    }
  }

  /**
   * 관련성 계산 (간단한 키워드 매칭)
   */
  private calculateRelevance(query: string, text: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    let score = 0;
    queryTerms.forEach(term => {
      if (textLower.includes(term)) {
        score += 20; // 키워드 하나당 20점
      }
    });

    // 정확히 일치하는 경우 보너스
    if (textLower.includes(query.toLowerCase())) {
      score += 30;
    }

    return Math.min(score, 100);
  }

  /**
   * 관련성 기준 정렬
   */
  private sortByRelevance(results: ResearchResult[], query: string): ResearchResult[] {
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 리서치 결과 저장
   */
  private async saveResearchResults(sessionId: string, query: string, results: ResearchResult[]): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
        VALUES (?, 'agent-action', 'research', 'research', ?, ?, ?)
      `).bind(
        sessionId,
        JSON.stringify({ query, resultsCount: results.length, topResults: results.slice(0, 3) }),
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

    } catch (error) {
      console.error('❌ 리서치 결과 저장 실패:', error);
    }
  }

  /**
   * 웹 검색 (External API 사용 시)
   * TODO: Google Custom Search API 또는 다른 검색 API 연동
   */
  private async searchWeb(query: string, maxResults: number): Promise<ResearchResult[]> {
    // 현재는 구현하지 않음
    // 실제 구현 시 Google Custom Search API 또는 SerpAPI 사용
    return [];
  }

  /**
   * 특정 소스별 검색
   */
  async searchBySource(source: 'wikipedia' | 'museum_api' | 'google', query: string): Promise<ResearchResult[]> {
    switch (source) {
      case 'wikipedia':
        return this.searchWikipedia(query);
      case 'museum_api':
        return this.searchMuseumAPI(query);
      case 'google':
        return this.searchWeb(query, 10);
      default:
        return [];
    }
  }

  /**
   * Wikipedia 검색
   */
  private async searchWikipedia(query: string): Promise<ResearchResult[]> {
    try {
      const response = await fetch(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      return [{
        source: 'wikipedia',
        title: data.title || query,
        content: data.extract || '내용 없음',
        url: data.content_urls?.desktop?.page,
        relevance: 80
      }];

    } catch (error) {
      console.error('❌ Wikipedia 검색 실패:', error);
      return [];
    }
  }

  /**
   * 뮤지엄 API 검색 (예: MET Museum API)
   */
  private async searchMuseumAPI(query: string): Promise<ResearchResult[]> {
    try {
      // Metropolitan Museum API 예시
      const searchResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}`);
      
      if (!searchResponse.ok) {
        return [];
      }

      const searchData = await searchResponse.json();
      const objectIDs = searchData.objectIDs?.slice(0, 5) || [];

      const results: ResearchResult[] = [];

      for (const objectID of objectIDs) {
        try {
          const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
          if (objectResponse.ok) {
            const objectData = await objectResponse.json();
            results.push({
              source: 'met_museum',
              title: objectData.title || '제목 없음',
              content: `작가: ${objectData.artistDisplayName || '알 수 없음'}, 제작 연도: ${objectData.objectDate || '알 수 없음'}`,
              url: objectData.objectURL,
              relevance: 85
            });
          }
        } catch (e) {
          // 개별 작품 조회 실패 시 무시
        }
      }

      return results;

    } catch (error) {
      console.error('❌ Museum API 검색 실패:', error);
      return [];
    }
  }
}
