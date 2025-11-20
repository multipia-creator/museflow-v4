/**
 * Embedding Service
 * Generate and manage embeddings for semantic search
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
}

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'text-embedding-004' // Latest Gemini embedding model
    });
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      const result = await this.model.embedContent(text);
      const embedding = result.embedding.values;

      return {
        embedding,
        dimensions: embedding.length,
      };
    } catch (error: any) {
      console.error('❌ Embedding generation failed:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (const text of texts) {
      try {
        const result = await this.generateEmbedding(text);
        results.push(result);
      } catch (error) {
        console.error(`Failed to embed: "${text.substring(0, 50)}..."`);
        // Push zero vector as fallback
        results.push({
          embedding: new Array(768).fill(0), // text-embedding-004 is 768 dimensions
          dimensions: 768,
        });
      }
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find most similar embeddings
   */
  findMostSimilar(
    query: number[],
    candidates: { id: string; embedding: number[] }[],
    topK: number = 10
  ): { id: string; similarity: number }[] {
    const similarities = candidates.map(candidate => ({
      id: candidate.id,
      similarity: this.cosineSimilarity(query, candidate.embedding),
    }));

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topK);
  }

  /**
   * Generate artwork embedding from metadata
   */
  generateArtworkText(artwork: {
    title: string;
    artist: string;
    period: string;
    category: string;
    material?: string;
    description?: string;
  }): string {
    const parts: string[] = [];

    parts.push(`Title: ${artwork.title}`);
    parts.push(`Artist: ${artwork.artist}`);
    parts.push(`Period: ${artwork.period}`);
    parts.push(`Category: ${artwork.category}`);

    if (artwork.material) {
      parts.push(`Material: ${artwork.material}`);
    }

    if (artwork.description) {
      parts.push(`Description: ${artwork.description}`);
    }

    return parts.join('. ');
  }
}

// Singleton instance
let embeddingService: EmbeddingService | null = null;

/**
 * Initialize Embedding Service
 */
export function initEmbedding(apiKey: string): EmbeddingService {
  if (!embeddingService) {
    embeddingService = new EmbeddingService(apiKey);
  }
  return embeddingService;
}

/**
 * Get Embedding Service instance
 */
export function getEmbedding(): EmbeddingService {
  if (!embeddingService) {
    throw new Error('Embedding service not initialized. Call initEmbedding() first.');
  }
  return embeddingService;
}
