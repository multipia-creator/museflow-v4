/**
 * Cache Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../src/services/cache.service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  describe('Basic Operations', () => {
    it('should set and get cache value', async () => {
      await cache.set('test-key', { data: 'test-value' });
      const result = await cache.get('test-key');
      
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete cache value', async () => {
      await cache.set('test-key', 'value');
      await cache.delete('test-key');
      const result = await cache.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should clear all cache', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.clear();
      
      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect TTL setting', async () => {
      await cache.set('test-key', 'value', { ttl: 1 }); // 1 second
      
      // Should exist immediately
      let result = await cache.get('test-key');
      expect(result).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      result = await cache.get('test-key');
      expect(result).toBeNull();
    });

    it('should clean expired entries', async () => {
      await cache.set('key1', 'value1', { ttl: 1 });
      await cache.set('key2', 'value2', { ttl: 10 });
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const cleaned = cache.cleanExpired();
      expect(cleaned).toBe(1);
      
      const stats = cache.getStats();
      expect(stats.validEntries).toBe(1);
    });
  });

  describe('Tags', () => {
    it('should invalidate by tags', async () => {
      await cache.set('user:1', 'data1', { tags: ['users'] });
      await cache.set('user:2', 'data2', { tags: ['users'] });
      await cache.set('post:1', 'data3', { tags: ['posts'] });
      
      await cache.invalidateByTags(['users']);
      
      expect(await cache.get('user:1')).toBeNull();
      expect(await cache.get('user:2')).toBeNull();
      expect(await cache.get('post:1')).toBe('data3');
    });
  });

  describe('Statistics', () => {
    it('should track cache statistics', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2', { ttl: 1 });
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const stats = cache.getStats();
      
      expect(stats.totalEntries).toBe(2);
      expect(stats.validEntries).toBe(1);
      expect(stats.expiredEntries).toBe(1);
    });
  });
});
