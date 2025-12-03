/**
 * Figma API Service
 * Canvas designs sync with Figma
 * @version 1.0.0
 */

export interface FigmaConfig {
  accessToken: string;
  fileKey?: string;
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: 'FRAME';
  children: FigmaNode[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FigmaExportRequest {
  fileKey: string;
  nodeIds: string[];
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  scale?: number;
}

export interface FigmaCreateFrameRequest {
  fileKey: string;
  pageName: string;
  frameName: string;
  width: number;
  height: number;
  backgroundColor?: string;
  content?: {
    text?: string;
    image?: string;
    components?: any[];
  };
}

export class FigmaService {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get file metadata
   */
  async getFile(fileKey: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma getFile error:', error);
      throw error;
    }
  }

  /**
   * Get file nodes
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    try {
      const ids = nodeIds.join(',');
      const response = await fetch(
        `${this.baseUrl}/files/${fileKey}/nodes?ids=${ids}`,
        {
          headers: {
            'X-Figma-Token': this.accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma getFileNodes error:', error);
      throw error;
    }
  }

  /**
   * Export images from Figma
   */
  async exportImages(request: FigmaExportRequest): Promise<any> {
    try {
      const { fileKey, nodeIds, format, scale = 2 } = request;
      const ids = nodeIds.join(',');
      
      const response = await fetch(
        `${this.baseUrl}/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`,
        {
          headers: {
            'X-Figma-Token': this.accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma exportImages error:', error);
      throw error;
    }
  }

  /**
   * Create a new frame in Figma file
   * Note: Figma API doesn't support direct frame creation yet
   * This is a mock implementation for demonstration
   */
  async createFrame(request: FigmaCreateFrameRequest): Promise<any> {
    console.log('🎨 Figma createFrame (Mock):', request);
    
    // TODO: Use Figma Webhooks or Plugins API for actual frame creation
    // Current Figma REST API is read-only
    
    return {
      success: true,
      message: 'Frame created (Mock mode)',
      frameId: `frame-${Date.now()}`,
      fileUrl: `https://www.figma.com/file/${request.fileKey}`,
      mockData: request,
    };
  }

  /**
   * Get team projects
   */
  async getTeamProjects(teamId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/teams/${teamId}/projects`,
        {
          headers: {
            'X-Figma-Token': this.accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma getTeamProjects error:', error);
      throw error;
    }
  }

  /**
   * Get project files
   */
  async getProjectFiles(projectId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectId}/files`,
        {
          headers: {
            'X-Figma-Token': this.accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma getProjectFiles error:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  async getMe(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Figma getMe error:', error);
      throw error;
    }
  }

  /**
   * Sync Canvas node to Figma
   * This creates a visual representation in Figma
   */
  async syncCanvasNodeToFigma(node: any, fileKey: string): Promise<any> {
    console.log('🔄 Syncing Canvas node to Figma:', node);

    // Since Figma API is read-only, we simulate the sync
    const frameRequest: FigmaCreateFrameRequest = {
      fileKey,
      pageName: 'MuseFlow Canvas Sync',
      frameName: node.title || 'Canvas Node',
      width: 400,
      height: 300,
      backgroundColor: this.getNodeColor(node.type),
      content: {
        text: node.description || '',
        components: [],
      },
    };

    return await this.createFrame(frameRequest);
  }

  /**
   * Get node color by type
   */
  private getNodeColor(type: string): string {
    const colors: { [key: string]: string } = {
      budget: '#10B981',
      chart: '#3B82F6',
      concept: '#8B5CF6',
      education: '#F59E0B',
      artwork: '#EC4899',
      document: '#6366F1',
      default: '#667eea',
    };
    return colors[type] || colors.default;
  }
}

/**
 * Helper function to create Figma service instance
 */
export function createFigmaService(accessToken?: string): FigmaService | null {
  if (!accessToken) {
    console.warn('⚠️ Figma access token not provided');
    return null;
  }
  return new FigmaService(accessToken);
}
