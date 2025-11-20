/**
 * KCISA 3D API Service
 * Integration with Korea Creative Content Agency (KCISA) 3D Cultural Heritage API
 * Documentation: https://www.culture.go.kr/data/openapi (3D model endpoints)
 */

export interface KCISA3DModel {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  category: string;
  period?: string;
  
  // 3D Model URLs
  modelUrl: string; // Primary 3D model file (GLB/GLTF)
  modelUrlGlb?: string; // GLB format
  modelUrlGltf?: string; // GLTF format
  modelUrlObj?: string; // OBJ format
  modelUrlFbx?: string; // FBX format
  
  // Textures
  textureUrls?: string[]; // Texture image URLs
  normalMapUrl?: string;
  metallicMapUrl?: string;
  roughnessMapUrl?: string;
  
  // Preview Images
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // Metadata
  fileSize?: number; // In bytes
  polyCount?: number; // Polygon count
  vertexCount?: number;
  
  // Museum/Collection Info
  museum?: string;
  collectionNumber?: string;
  creator?: string;
  creationDate?: string;
  
  // Rights & Licensing
  license?: string; // CC0, CC-BY, etc.
  copyrightHolder?: string;
  
  // Technical Specs
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string; // 'mm', 'cm', 'm'
  };
  
  // AR/VR Support
  arEnabled?: boolean;
  vrEnabled?: boolean;
  
  created_at?: string;
  updated_at?: string;
}

export interface KCISA3DSearchParams {
  query?: string;
  category?: string;
  period?: string;
  museum?: string;
  format?: 'glb' | 'gltf' | 'obj' | 'fbx';
  minPolyCount?: number;
  maxPolyCount?: number;
  limit?: number;
  offset?: number;
}

export interface KCISA3DSearchResult {
  models: KCISA3DModel[];
  total: number;
  offset: number;
  limit: number;
}

export class KCISA3DService {
  private apiKey: string;
  private baseUrl: string = 'https://www.culture.go.kr/openapi/rest/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search 3D models
   */
  async search3DModels(params: KCISA3DSearchParams = {}): Promise<KCISA3DSearchResult> {
    const {
      query = '',
      category = '',
      period = '',
      museum = '',
      format = 'glb',
      minPolyCount = 0,
      maxPolyCount = 1000000,
      limit = 20,
      offset = 0,
    } = params;

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        serviceKey: this.apiKey,
        keyword: query,
        rows: limit.toString(),
        startIndex: offset.toString(),
        type: '3d', // Filter for 3D content
        format: format,
      });

      if (category) {
        queryParams.set('classification', category);
      }

      if (period) {
        queryParams.set('period', period);
      }

      if (museum) {
        queryParams.set('museum', museum);
      }

      // Make API request
      const url = `${this.baseUrl}/3dCulture?${queryParams}`;
      console.log('🎨 KCISA 3D API request:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`KCISA 3D API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      const models = this.parse3DModels(data);

      // Filter by polygon count if specified
      const filteredModels = models.filter(model => {
        if (!model.polyCount) return true;
        return model.polyCount >= minPolyCount && model.polyCount <= maxPolyCount;
      });

      return {
        models: filteredModels,
        total: data.response?.body?.totalCount || filteredModels.length,
        offset,
        limit,
      };
    } catch (error: any) {
      console.error('❌ KCISA 3D API error:', error);
      throw new Error(`Failed to search 3D models: ${error.message}`);
    }
  }

  /**
   * Get 3D model by ID
   */
  async get3DModel(id: string): Promise<KCISA3DModel | null> {
    try {
      const queryParams = new URLSearchParams({
        serviceKey: this.apiKey,
        id: id,
        type: '3d',
      });

      const url = `${this.baseUrl}/3dCulture/detail?${queryParams}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`KCISA 3D API error: ${response.status}`);
      }

      const data = await response.json();
      const models = this.parse3DModels(data);

      return models[0] || null;
    } catch (error: any) {
      console.error('❌ KCISA 3D API error:', error);
      return null;
    }
  }

  /**
   * Parse API response to 3D model objects
   */
  private parse3DModels(data: any): KCISA3DModel[] {
    try {
      const items = data.response?.body?.items?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      return itemArray.map((item: any) => ({
        id: item.id || item.seq || '',
        name: item.title || item.name || 'Untitled 3D Model',
        nameEn: item.titleEn || item.nameEn || '',
        description: item.description || item.summary || '',
        category: item.classification || item.category || '3D Cultural Heritage',
        period: item.period || item.dynasty || '',
        
        // 3D Model URLs - prioritize GLB format
        modelUrl: item.modelUrl || item.glbUrl || item.gltfUrl || '',
        modelUrlGlb: item.glbUrl || item.modelGlb || '',
        modelUrlGltf: item.gltfUrl || item.modelGltf || '',
        modelUrlObj: item.objUrl || item.modelObj || '',
        modelUrlFbx: item.fbxUrl || item.modelFbx || '',
        
        // Textures
        textureUrls: item.textureUrls || [],
        normalMapUrl: item.normalMapUrl || '',
        metallicMapUrl: item.metallicMapUrl || '',
        roughnessMapUrl: item.roughnessMapUrl || '',
        
        // Preview Images
        thumbnailUrl: item.thumbnailUrl || item.thumbUrl || '',
        previewUrl: item.previewUrl || item.imageUrl || '',
        
        // Metadata
        fileSize: parseInt(item.fileSize) || undefined,
        polyCount: parseInt(item.polyCount || item.polygonCount) || undefined,
        vertexCount: parseInt(item.vertexCount) || undefined,
        
        // Museum Info
        museum: item.museum || item.institution || '',
        collectionNumber: item.collectionNumber || item.inventoryNumber || '',
        creator: item.creator || item.artist || '',
        creationDate: item.creationDate || item.period || '',
        
        // Rights
        license: item.license || 'Unknown',
        copyrightHolder: item.copyrightHolder || item.museum || '',
        
        // Dimensions
        dimensions: item.dimensions ? {
          width: parseFloat(item.dimensions.width) || 0,
          height: parseFloat(item.dimensions.height) || 0,
          depth: parseFloat(item.dimensions.depth) || 0,
          unit: item.dimensions.unit || 'cm',
        } : undefined,
        
        // AR/VR
        arEnabled: item.arEnabled === 'true' || item.arEnabled === true,
        vrEnabled: item.vrEnabled === 'true' || item.vrEnabled === true,
        
        created_at: item.createdAt || item.registDate || '',
        updated_at: item.updatedAt || item.modifyDate || '',
      }));
    } catch (error) {
      console.error('Parse error:', error);
      return [];
    }
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    return [
      'Sculpture',
      'Architecture',
      'Pottery',
      'Metal Craft',
      'Buddhist Art',
      'Paintings',
      'Furniture',
      'Tools',
      'Ornaments',
      'Historical Sites',
    ];
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return ['glb', 'gltf', 'obj', 'fbx'];
  }

  /**
   * Validate model URL accessibility
   */
  async validateModelUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get model file size
   */
  async getModelFileSize(url: string): Promise<number | null> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) : null;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance
let kcisa3DService: KCISA3DService | null = null;

/**
 * Initialize KCISA 3D Service
 */
export function initKCISA3D(apiKey: string): KCISA3DService {
  if (!kcisa3DService) {
    kcisa3DService = new KCISA3DService(apiKey);
  }
  return kcisa3DService;
}

/**
 * Get KCISA 3D Service instance
 */
export function getKCISA3D(): KCISA3DService {
  if (!kcisa3DService) {
    throw new Error('KCISA 3D API not initialized. Call initKCISA3D() first.');
  }
  return kcisa3DService;
}
