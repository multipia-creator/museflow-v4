/**
 * Museum API Service
 * Integration with National Museum of Korea Open API
 */

export interface MuseumArtwork {
  id: string;
  title: string;
  titleEn?: string;
  artist: string;
  artistEn?: string;
  period: string;
  material: string;
  dimensions: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  category: string;
  collection: string;
  exhibitionHistory?: string[];
}

export interface MuseumSearchParams {
  query?: string;
  category?: string;
  period?: string;
  artist?: string;
  limit?: number;
  offset?: number;
}

export interface MuseumSearchResult {
  artworks: MuseumArtwork[];
  total: number;
  offset: number;
  limit: number;
}

export class MuseumAPIService {
  private apiKey: string;
  private baseUrl: string = 'https://www.emuseum.go.kr/openapi/relic';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search artworks
   */
  async searchArtworks(params: MuseumSearchParams = {}): Promise<MuseumSearchResult> {
    const {
      query = '',
      category = '',
      period = '',
      artist = '',
      limit = 20,
      offset = 0,
    } = params;

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        serviceKey: this.apiKey,
        numOfRows: limit.toString(),
        pageNo: Math.floor(offset / limit + 1).toString(),
      });

      if (query) {
        queryParams.set('searchKeyword', query);
      }

      if (category) {
        queryParams.set('classification', category);
      }

      // Make API request
      const url = `${this.baseUrl}/list?${queryParams}`;
      console.log('🏛️ Museum API request:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Museum API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      const artworks = this.parseArtworks(data);

      return {
        artworks,
        total: data.response?.body?.totalCount || 0,
        offset,
        limit,
      };
    } catch (error: any) {
      console.error('❌ Museum API error:', error);
      throw new Error(`Failed to search artworks: ${error.message}`);
    }
  }

  /**
   * Get artwork by ID
   */
  async getArtwork(id: string): Promise<MuseumArtwork | null> {
    try {
      const queryParams = new URLSearchParams({
        serviceKey: this.apiKey,
        relicNo: id,
      });

      const url = `${this.baseUrl}/detail?${queryParams}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Museum API error: ${response.status}`);
      }

      const data = await response.json();
      const artworks = this.parseArtworks(data);

      return artworks[0] || null;
    } catch (error: any) {
      console.error('❌ Museum API error:', error);
      return null;
    }
  }

  /**
   * Parse API response to artwork objects
   */
  private parseArtworks(data: any): MuseumArtwork[] {
    try {
      const items = data.response?.body?.items?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      return itemArray.map((item: any) => ({
        id: item.relicNo || item.id || '',
        title: item.relicName || item.title || 'Untitled',
        titleEn: item.relicNameEn || item.titleEn || '',
        artist: item.authorName || item.artist || 'Unknown',
        artistEn: item.authorNameEn || item.artistEn || '',
        period: item.period || item.dynasty || 'Unknown Period',
        material: item.material || 'Unknown Material',
        dimensions: item.dimensions || item.size || 'Unknown',
        imageUrl: item.imageUrl || item.imgUrl || '',
        thumbnailUrl: item.thumbnailUrl || item.thumbUrl || '',
        description: item.description || item.summary || '',
        category: item.classification || item.category || 'General',
        collection: item.collection || 'National Museum of Korea',
        exhibitionHistory: [],
      }));
    } catch (error) {
      console.error('Parse error:', error);
      return [];
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    // Common categories in Korean museums
    return [
      'Painting',
      'Sculpture',
      'Ceramics',
      'Metalwork',
      'Calligraphy',
      'Buddhist Art',
      'Furniture',
      'Textiles',
      'Lacquerware',
      'Arms and Armor',
    ];
  }

  /**
   * Get periods
   */
  async getPeriods(): Promise<string[]> {
    return [
      'Prehistoric',
      'Three Kingdoms',
      'Unified Silla',
      'Goryeo',
      'Joseon',
      'Korean Empire',
      'Modern',
      'Contemporary',
    ];
  }
}

// Singleton instance
let museumAPIService: MuseumAPIService | null = null;

/**
 * Initialize Museum API Service
 */
export function initMuseumAPI(apiKey: string): MuseumAPIService {
  if (!museumAPIService) {
    museumAPIService = new MuseumAPIService(apiKey);
  }
  return museumAPIService;
}

/**
 * Get Museum API Service instance
 */
export function getMuseumAPI(): MuseumAPIService {
  if (!museumAPIService) {
    throw new Error('Museum API not initialized. Call initMuseumAPI() first.');
  }
  return museumAPIService;
}
