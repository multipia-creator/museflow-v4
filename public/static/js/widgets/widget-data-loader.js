/**
 * Widget Data Loader
 * Loads real-time data for dashboard widgets
 */

const WidgetDataLoader = {
  // Cache for widget data
  cache: new Map(),
  cacheExpiry: new Map(),
  
  // Default cache duration (milliseconds)
  defaultCacheDuration: 60000, // 1 minute
  
  /**
   * Load weather data
   */
  async loadWeatherData(options = {}) {
    const cacheKey = 'weather';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const lat = options.lat || '37.5665';
      const lon = options.lon || '126.9780';
      
      const response = await fetch(`/api/widgets/data/weather?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load weather data');
      }

      this.setCache(cacheKey, result.data, this.defaultCacheDuration);
      return result.data;

    } catch (error) {
      console.error('❌ Failed to load weather data:', error);
      return this.getMockWeatherData();
    }
  },

  /**
   * Load visitor statistics
   */
  async loadVisitorStats(period = 'today') {
    const cacheKey = `visitor-stats-${period}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/api/widgets/data/visitor-stats?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Visitor stats API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load visitor stats');
      }

      this.setCache(cacheKey, result.data, this.defaultCacheDuration);
      return result.data;

    } catch (error) {
      console.error('❌ Failed to load visitor stats:', error);
      return this.getMockVisitorStats();
    }
  },

  /**
   * Load collection statistics
   */
  async loadCollectionStats() {
    const cacheKey = 'collection-stats';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('/api/widgets/data/collection-stats');
      
      if (!response.ok) {
        throw new Error(`Collection stats API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load collection stats');
      }

      this.setCache(cacheKey, result.data, 300000); // 5 min cache
      return result.data;

    } catch (error) {
      console.error('❌ Failed to load collection stats:', error);
      return this.getMockCollectionStats();
    }
  },

  /**
   * Load quick statistics
   */
  async loadQuickStats() {
    const cacheKey = 'quick-stats';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('/api/widgets/data/quick-stats');
      
      if (!response.ok) {
        throw new Error(`Quick stats API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load quick stats');
      }

      this.setCache(cacheKey, result.data, this.defaultCacheDuration);
      return result.data;

    } catch (error) {
      console.error('❌ Failed to load quick stats:', error);
      return this.getMockQuickStats();
    }
  },

  /**
   * Cache management
   */
  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return false;
    }
    
    return true;
  },

  setCache(key, data, duration) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + duration);
  },

  clearCache(key) {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  },

  /**
   * Mock data fallbacks
   */
  getMockWeatherData() {
    return {
      temperature: 18,
      condition: 'Sunny',
      humidity: 65,
      wind_speed: 8,
      feels_like: 17,
      location: 'Seoul, KR',
      icon: 'sun',
      updated_at: new Date().toISOString()
    };
  },

  getMockVisitorStats() {
    return {
      total_visitors: 1800,
      current_visitors: 120,
      peak_hour: '14:00',
      average_duration: '45 min',
      popular_exhibits: [
        { name: '특별전: 조선시대 도자기', visitors: 340 },
        { name: '상설전: 한국 미술', visitors: 280 }
      ],
      hourly_data: Array.from({ length: 12 }, (_, i) => ({
        hour: `${9 + i}:00`,
        visitors: Math.round(50 + Math.random() * 150)
      })),
      period: 'today',
      updated_at: new Date().toISOString()
    };
  },

  getMockCollectionStats() {
    return {
      total_items: 12450,
      digitized: 8920,
      on_display: 1230,
      in_storage: 11220,
      categories: [
        { name: '도자기', count: 3450, percentage: 27.7 },
        { name: '회화', count: 2890, percentage: 23.2 },
        { name: '조각', count: 2120, percentage: 17.0 }
      ],
      recent_acquisitions: [],
      updated_at: new Date().toISOString()
    };
  },

  getMockQuickStats() {
    return {
      active_projects: 5,
      pending_tasks: 13,
      team_members: 8,
      upcoming_events: 4,
      total_visitors_today: 1500,
      revenue_today: 2800000,
      updated_at: new Date().toISOString()
    };
  }
};

// Export globally
window.WidgetDataLoader = WidgetDataLoader;
