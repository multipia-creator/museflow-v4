/**
 * Integration Agent
 * 외부 API 연동 (Wikipedia, MET Museum, Google Search, Notion 등)
 * @version 1.0.0
 */

import type { ExecutionContext } from '../types/orchestrator.types';

interface IntegrationInput {
  type: 'wikipedia' | 'met_museum' | 'google_search' | 'notion' | 'weather' | 'currency' | 'stock' | 'news';
  query: string;
  params?: Record<string, any>;
}

interface IntegrationResult {
  source: string;
  query: string;
  data: any;
  success: boolean;
  error?: string;
  timestamp: string;
}

export class IntegrationAgent {
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
      console.log('🔗 Integration Agent 시작:', input);

      const integrationInput = input as IntegrationInput;
      const type = integrationInput.type;
      const query = integrationInput.query;

      let results: IntegrationResult[] = [];

      switch (type) {
        case 'wikipedia':
          results.push(await this.searchWikipedia(query));
          break;
        
        case 'met_museum':
          results.push(await this.searchMETMuseum(query));
          break;
        
        case 'google_search':
          results.push(await this.searchGoogle(query));
          break;
        
        case 'notion':
          results.push(await this.searchNotion(query, integrationInput.params));
          break;
        
        case 'weather':
          results.push(await this.getWeather(query));
          break;
        
        case 'currency':
          results.push(await this.getCurrencyRate(query));
          break;
        
        case 'stock':
          results.push(await this.getStockPrice(query));
          break;
        
        case 'news':
          results.push(await this.getNews(query));
          break;
        
        default:
          results.push(await this.defaultIntegration(query));
      }

      // DB에 통합 결과 저장
      await this.saveResults(results, context.sessionId);

      return {
        success: true,
        message: `${results.length}개의 외부 API 연동 완료`,
        data: {
          type,
          query,
          results
        }
      };

    } catch (error) {
      console.error('❌ Integration Agent 실패:', error);
      return {
        success: false,
        message: '외부 API 연동 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Wikipedia API 검색
   */
  private async searchWikipedia(query: string): Promise<IntegrationResult> {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MuseFlow/4.0 (AI Orchestrator)'
        }
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results = data.query?.search || [];
      const topResults = results.slice(0, 3).map((item: any) => ({
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        pageId: item.pageid,
        url: `https://en.wikipedia.org/?curid=${item.pageid}`
      }));

      return {
        source: 'wikipedia',
        query,
        data: {
          totalResults: results.length,
          results: topResults
        },
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Wikipedia 검색 실패:', error);
      return {
        source: 'wikipedia',
        query,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * MET Museum API 검색
   */
  private async searchMETMuseum(query: string): Promise<IntegrationResult> {
    try {
      // Step 1: 작품 검색
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}`;
      
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`MET API search error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const objectIDs = searchData.objectIDs?.slice(0, 3) || [];

      // Step 2: 작품 상세 정보 가져오기
      const artworks = [];
      for (const objectID of objectIDs) {
        try {
          const objectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`;
          const objectResponse = await fetch(objectUrl);
          
          if (objectResponse.ok) {
            const objectData = await objectResponse.json();
            artworks.push({
              objectID: objectData.objectID,
              title: objectData.title,
              artist: objectData.artistDisplayName || 'Unknown',
              date: objectData.objectDate,
              medium: objectData.medium,
              dimensions: objectData.dimensions,
              department: objectData.department,
              culture: objectData.culture,
              imageUrl: objectData.primaryImageSmall,
              metUrl: objectData.objectURL
            });
          }
        } catch (err) {
          console.error(`객체 ${objectID} 로딩 실패:`, err);
        }
      }

      return {
        source: 'met_museum',
        query,
        data: {
          totalResults: searchData.total || 0,
          artworks
        },
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ MET Museum 검색 실패:', error);
      return {
        source: 'met_museum',
        query,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Google Search (Mock - 실제 구현 시 Google Custom Search API 필요)
   */
  private async searchGoogle(query: string): Promise<IntegrationResult> {
    try {
      // Mock data (실제 구현 시 Google Custom Search API 사용)
      const mockResults = [
        {
          title: `${query} - Google Search Result 1`,
          snippet: `This is a mock search result for ${query}. In production, use Google Custom Search API.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
        },
        {
          title: `${query} - Wikipedia`,
          snippet: `Wikipedia article about ${query}`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`
        },
        {
          title: `${query} - Latest News`,
          snippet: `Latest news and updates about ${query}`,
          url: `https://news.google.com/search?q=${encodeURIComponent(query)}`
        }
      ];

      return {
        source: 'google_search',
        query,
        data: {
          results: mockResults,
          note: 'Mock data - implement Google Custom Search API for production'
        },
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Google Search 실패:', error);
      return {
        source: 'google_search',
        query,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Notion API 검색 (Mock - 실제 구현 시 Notion API 키 필요)
   */
  private async searchNotion(query: string, params?: Record<string, any>): Promise<IntegrationResult> {
    try {
      // Mock data (실제 구현 시 Notion API 사용)
      const mockPages = [
        {
          id: 'page-1',
          title: `${query} - Notion Page 1`,
          url: 'https://www.notion.so/mock-page-1',
          lastEdited: new Date().toISOString(),
          properties: {
            status: 'In Progress',
            assignee: 'Team Member'
          }
        },
        {
          id: 'page-2',
          title: `${query} - Notion Page 2`,
          url: 'https://www.notion.so/mock-page-2',
          lastEdited: new Date().toISOString(),
          properties: {
            status: 'Completed',
            assignee: 'AI Orchestrator'
          }
        }
      ];

      return {
        source: 'notion',
        query,
        data: {
          pages: mockPages,
          note: 'Mock data - implement Notion API for production'
        },
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Notion 검색 실패:', error);
      return {
        source: 'notion',
        query,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 날씨 정보 (Mock - 실제 구현 시 OpenWeatherMap API 필요)
   */
  private async getWeather(location: string): Promise<IntegrationResult> {
    try {
      // Mock data
      const mockWeather = {
        location,
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        forecast: [
          { day: 'Today', temp: 22, condition: 'Partly Cloudy' },
          { day: 'Tomorrow', temp: 24, condition: 'Sunny' },
          { day: 'Day After', temp: 20, condition: 'Rainy' }
        ],
        note: 'Mock data - implement OpenWeatherMap API for production'
      };

      return {
        source: 'weather',
        query: location,
        data: mockWeather,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 날씨 정보 실패:', error);
      return {
        source: 'weather',
        query: location,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 환율 정보 (Mock - 실제 구현 시 Currency API 필요)
   */
  private async getCurrencyRate(currencyPair: string): Promise<IntegrationResult> {
    try {
      // Mock data
      const mockRate = {
        pair: currencyPair,
        rate: 1325.50,
        lastUpdate: new Date().toISOString(),
        change24h: '+2.3%',
        note: 'Mock data - implement Currency API for production'
      };

      return {
        source: 'currency',
        query: currencyPair,
        data: mockRate,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 환율 정보 실패:', error);
      return {
        source: 'currency',
        query: currencyPair,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 주식 정보 (Mock - 실제 구현 시 Stock API 필요)
   */
  private async getStockPrice(symbol: string): Promise<IntegrationResult> {
    try {
      // Mock data
      const mockStock = {
        symbol,
        price: 152340,
        change: '+3.2%',
        volume: '1,234,567',
        high: 155000,
        low: 150000,
        note: 'Mock data - implement Stock API for production'
      };

      return {
        source: 'stock',
        query: symbol,
        data: mockStock,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 주식 정보 실패:', error);
      return {
        source: 'stock',
        query: symbol,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 뉴스 검색 (Mock - 실제 구현 시 News API 필요)
   */
  private async getNews(topic: string): Promise<IntegrationResult> {
    try {
      // Mock data
      const mockNews = {
        topic,
        articles: [
          {
            title: `Latest ${topic} News - Breaking Story`,
            source: 'News Agency 1',
            publishedAt: new Date().toISOString(),
            url: `https://news.example.com/${topic.toLowerCase()}-1`,
            description: `Breaking news about ${topic}...`
          },
          {
            title: `${topic} Update - Expert Analysis`,
            source: 'News Agency 2',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: `https://news.example.com/${topic.toLowerCase()}-2`,
            description: `Expert analysis on ${topic}...`
          },
          {
            title: `${topic} in Focus - Special Report`,
            source: 'News Agency 3',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            url: `https://news.example.com/${topic.toLowerCase()}-3`,
            description: `Special report on ${topic}...`
          }
        ],
        note: 'Mock data - implement News API for production'
      };

      return {
        source: 'news',
        query: topic,
        data: mockNews,
        success: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ 뉴스 검색 실패:', error);
      return {
        source: 'news',
        query: topic,
        data: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 기본 통합
   */
  private async defaultIntegration(query: string): Promise<IntegrationResult> {
    return {
      source: 'default',
      query,
      data: {
        message: 'Default integration - no specific handler implemented'
      },
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 결과 DB 저장
   */
  private async saveResults(results: IntegrationResult[], sessionId: string): Promise<void> {
    try {
      for (const result of results) {
        await this.db.prepare(`
          INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
          VALUES (?, 'agent-action', 'integration', 'integration', ?, ?, ?)
        `).bind(
          sessionId,
          JSON.stringify(result),
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ ${results.length}개 통합 결과 DB 저장 완료`);

    } catch (error) {
      console.error('❌ 통합 결과 저장 실패:', error);
    }
  }
}
