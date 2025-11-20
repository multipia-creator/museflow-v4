/**
 * Soma Museum API Service
 * Integration with Seoul Museum of Art (SeMA) Open API
 * Documentation: https://www.sema.seoul.kr/openapi
 */

export interface SomaArtwork {
  id: string;
  title: string;
  titleEn?: string;
  artist: string;
  artistEn?: string;
  year: string;
  medium: string;
  dimensions: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  category: string;
  collection: string;
  genre?: string;
  location?: string;
  acquisitionDate?: string;
}

export interface SomaSearchParams {
  query?: string;
  category?: string;
  artist?: string;
  year?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface SomaSearchResult {
  artworks: SomaArtwork[];
  total: number;
  offset: number;
  limit: number;
}

export class SomaMuseumService {
  private apiKey: string;
  private baseUrl: string = 'https://openapi.sema.seoul.kr/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search artworks from Soma Museum
   */
  async searchArtworks(params: SomaSearchParams = {}): Promise<SomaSearchResult> {
    const {
      query = '',
      category = '',
      artist = '',
      year = '',
      genre = '',
      limit = 20,
      offset = 0,
    } = params;

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        rows: limit.toString(),
        start: offset.toString(),
        format: 'json',
      });

      if (query) {
        queryParams.set('keyword', query);
      }

      if (category) {
        queryParams.set('category', category);
      }

      if (artist) {
        queryParams.set('artist', artist);
      }

      if (year) {
        queryParams.set('year', year);
      }

      if (genre) {
        queryParams.set('genre', genre);
      }

      // Make API request
      const url = `${this.baseUrl}/collection?${queryParams}`;
      console.log('🏛️ Soma Museum API request:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Soma Museum API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      const artworks = this.parseArtworks(data);

      return {
        artworks,
        total: data.response?.numFound || 0,
        offset,
        limit,
      };
    } catch (error: any) {
      console.error('❌ Soma Museum API error:', error);
      throw new Error(`Failed to search Soma artworks: ${error.message}`);
    }
  }

  /**
   * Get artwork by ID
   */
  async getArtwork(id: string): Promise<SomaArtwork | null> {
    try {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        id: id,
        format: 'json',
      });

      const url = `${this.baseUrl}/collection/detail?${queryParams}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Soma Museum API error: ${response.status}`);
      }

      const data = await response.json();
      const artworks = this.parseArtworks(data);

      return artworks[0] || null;
    } catch (error: any) {
      console.error('❌ Soma Museum API error:', error);
      return null;
    }
  }

  /**
   * Parse API response to artwork objects
   */
  private parseArtworks(data: any): SomaArtwork[] {
    try {
      const items = data.response?.docs || [];
      const itemArray = Array.isArray(items) ? items : [items];

      return itemArray.map((item: any) => ({
        id: item.id || item.objectId || '',
        title: item.title || item.titleKo || 'Untitled',
        titleEn: item.titleEn || '',
        artist: item.artist || item.artistName || 'Unknown',
        artistEn: item.artistEn || item.artistNameEn || '',
        year: item.year || item.creationDate || 'Unknown',
        medium: item.medium || item.material || 'Unknown Medium',
        dimensions: item.dimensions || item.size || 'Unknown',
        imageUrl: item.imageUrl || item.imgUrl || item.thumbUrl || '',
        thumbnailUrl: item.thumbnailUrl || item.thumbUrl || '',
        description: item.description || item.explanation || '',
        category: item.category || item.classification || 'Contemporary Art',
        collection: 'Seoul Museum of Art (Soma)',
        genre: item.genre || '',
        location: item.location || item.galleryLocation || '',
        acquisitionDate: item.acquisitionDate || '',
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
    // Common categories in Soma Museum
    return [
      'Contemporary Art',
      'Installation',
      'Video Art',
      'Photography',
      'Sculpture',
      'Painting',
      'Mixed Media',
      'Digital Art',
      'Performance Art',
      'Public Art',
    ];
  }

  /**
   * Get genres
   */
  async getGenres(): Promise<string[]> {
    return [
      'Abstract',
      'Figurative',
      'Conceptual',
      'Minimalism',
      'Pop Art',
      'Expressionism',
      'Realism',
      'Experimental',
      'Interactive',
    ];
  }
}

// Singleton instance
let somaMuseumService: SomaMuseumService | null = null;

/**
 * Initialize Soma Museum Service
 */
export function initSomaMuseum(apiKey: string): SomaMuseumService {
  if (!somaMuseumService) {
    somaMuseumService = new SomaMuseumService(apiKey);
  }
  return somaMuseumService;
}

/**
 * Get Soma Museum Service instance
 */
export function getSomaMuseum(): SomaMuseumService {
  if (!somaMuseumService) {
    throw new Error('Soma Museum API not initialized. Call initSomaMuseum() first.');
  }
  return somaMuseumService;
}
