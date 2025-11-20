/**
 * Embedding Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmbeddingService } from '../embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    // Note: This requires a valid API key
    // In CI/CD, use environment variables or mocks
    service = new EmbeddingService('test-api-key');
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0];
      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBe(0);
    });

    it('should throw error for different dimensions', () => {
      const a = [1, 0];
      const b = [1, 0, 0];
      expect(() => service.cosineSimilarity(a, b)).toThrow();
    });
  });

  describe('findMostSimilar', () => {
    it('should return top k similar embeddings', () => {
      const query = [1, 0, 0];
      const candidates = [
        { id: '1', embedding: [1, 0, 0] },
        { id: '2', embedding: [0.8, 0.2, 0] },
        { id: '3', embedding: [0, 1, 0] },
      ];

      const results = service.findMostSimilar(query, candidates, 2);
      
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1'); // Perfect match
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });
  });

  describe('generateArtworkText', () => {
    it('should generate comprehensive artwork text', () => {
      const artwork = {
        title: 'Moonlight Sonata',
        artist: 'Kim Hong-do',
        period: 'Joseon',
        category: 'Painting',
        material: 'Ink on paper',
        description: 'Beautiful moonlit landscape',
      };

      const text = service.generateArtworkText(artwork);
      
      expect(text).toContain('Moonlight Sonata');
      expect(text).toContain('Kim Hong-do');
      expect(text).toContain('Joseon');
      expect(text).toContain('Painting');
      expect(text).toContain('Ink on paper');
      expect(text).toContain('Beautiful moonlit landscape');
    });

    it('should handle missing optional fields', () => {
      const artwork = {
        title: 'Test Artwork',
        artist: 'Test Artist',
        period: 'Modern',
        category: 'Sculpture',
      };

      const text = service.generateArtworkText(artwork);
      
      expect(text).toContain('Test Artwork');
      expect(text).not.toContain('Material:');
      expect(text).not.toContain('Description:');
    });
  });
});
