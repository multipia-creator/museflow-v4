/**
 * Query Optimizer Service
 * Optimizes database queries and provides query analysis
 */

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsAffected: number;
  explanation?: string;
}

export interface OptimizationSuggestion {
  type: 'index' | 'query_rewrite' | 'denormalization' | 'caching';
  description: string;
  priority: 'high' | 'medium' | 'low';
  implementation?: string;
}

export class QueryOptimizerService {
  private db: D1Database;
  private queryLog: QueryAnalysis[] = [];
  private maxLogSize: number = 100;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute query with timing
   */
  async executeWithTiming<T = any>(query: string, params?: any[]): Promise<{
    results: T[];
    executionTime: number;
  }> {
    const startTime = performance.now();
    
    let statement = this.db.prepare(query);
    if (params && params.length > 0) {
      statement = statement.bind(...params);
    }
    
    const result = await statement.all();
    const executionTime = performance.now() - startTime;

    // Log query
    this.logQuery({
      query,
      executionTime,
      rowsAffected: result.results?.length || 0,
    });

    return {
      results: result.results as T[],
      executionTime,
    };
  }

  /**
   * Analyze query performance
   */
  async analyzeQuery(query: string, params?: any[]): Promise<QueryAnalysis> {
    // Get query explanation
    const explainQuery = `EXPLAIN QUERY PLAN ${query}`;
    let statement = this.db.prepare(explainQuery);
    if (params && params.length > 0) {
      statement = statement.bind(...params);
    }
    
    const explanation = await statement.all();
    
    // Execute with timing
    const { executionTime, results } = await this.executeWithTiming(query, params);

    return {
      query,
      executionTime,
      rowsAffected: results.length,
      explanation: JSON.stringify(explanation.results, null, 2),
    };
  }

  /**
   * Log query execution
   */
  private logQuery(analysis: QueryAnalysis): void {
    this.queryLog.push(analysis);
    
    // Keep log size under limit
    if (this.queryLog.length > this.maxLogSize) {
      this.queryLog.shift();
    }

    // Warn on slow queries (> 100ms)
    if (analysis.executionTime > 100) {
      console.warn(`⚠️ Slow query detected: ${analysis.executionTime.toFixed(2)}ms`);
      console.warn(`Query: ${analysis.query.substring(0, 100)}...`);
    }
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = 100): QueryAnalysis[] {
    return this.queryLog
      .filter(q => q.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * Get query statistics
   */
  getStats(): any {
    if (this.queryLog.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        fastestQuery: null,
        slowestQuery: null,
      };
    }

    const executionTimes = this.queryLog.map(q => q.executionTime);
    const totalTime = executionTimes.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / this.queryLog.length;
    
    const slowQueries = this.queryLog.filter(q => q.executionTime > 100).length;
    
    const sortedByTime = [...this.queryLog].sort((a, b) => a.executionTime - b.executionTime);
    const fastest = sortedByTime[0];
    const slowest = sortedByTime[sortedByTime.length - 1];

    return {
      totalQueries: this.queryLog.length,
      averageExecutionTime: avgTime.toFixed(2),
      slowQueries,
      fastestQuery: {
        query: fastest.query.substring(0, 100),
        time: fastest.executionTime.toFixed(2),
      },
      slowestQuery: {
        query: slowest.query.substring(0, 100),
        time: slowest.executionTime.toFixed(2),
      },
    };
  }

  /**
   * Suggest optimizations
   */
  suggestOptimizations(query: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for SELECT *
    if (query.includes('SELECT *')) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Avoid SELECT * - specify only needed columns',
        priority: 'medium',
        implementation: 'Replace SELECT * with explicit column list',
      });
    }

    // Check for missing WHERE clause
    if (query.toUpperCase().includes('SELECT') && 
        !query.toUpperCase().includes('WHERE') &&
        !query.toUpperCase().includes('LIMIT')) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Query without WHERE or LIMIT may return too many rows',
        priority: 'high',
        implementation: 'Add WHERE clause or LIMIT to reduce result set',
      });
    }

    // Check for LIKE with leading wildcard
    if (query.includes("LIKE '%")) {
      suggestions.push({
        type: 'index',
        description: 'LIKE with leading wildcard prevents index usage',
        priority: 'high',
        implementation: 'Consider full-text search or restructure query',
      });
    }

    // Check for multiple JOINs
    const joinCount = (query.match(/JOIN/gi) || []).length;
    if (joinCount > 3) {
      suggestions.push({
        type: 'denormalization',
        description: `Query has ${joinCount} JOINs - consider denormalization`,
        priority: 'medium',
        implementation: 'Consider duplicating frequently accessed data',
      });
    }

    // Check for subqueries
    if (query.includes('(SELECT')) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Subquery detected - consider JOIN or CTE instead',
        priority: 'medium',
        implementation: 'Rewrite using JOIN or WITH clause (CTE)',
      });
    }

    // Check for ORDER BY without LIMIT
    if (query.toUpperCase().includes('ORDER BY') && 
        !query.toUpperCase().includes('LIMIT')) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'ORDER BY without LIMIT sorts entire result set',
        priority: 'low',
        implementation: 'Add LIMIT if only top N rows are needed',
      });
    }

    // Suggest caching for frequently executed queries
    const queryFrequency = this.queryLog.filter(q => 
      q.query.substring(0, 50) === query.substring(0, 50)
    ).length;
    
    if (queryFrequency > 10) {
      suggestions.push({
        type: 'caching',
        description: `Query executed ${queryFrequency} times - consider caching`,
        priority: 'high',
        implementation: 'Implement result caching with appropriate TTL',
      });
    }

    return suggestions;
  }

  /**
   * Batch execute queries (transaction)
   */
  async batchExecute(queries: { query: string; params?: any[] }[]): Promise<any[]> {
    const startTime = performance.now();
    
    const statements = queries.map(({ query, params }) => {
      let stmt = this.db.prepare(query);
      if (params && params.length > 0) {
        stmt = stmt.bind(...params);
      }
      return stmt;
    });

    const results = await this.db.batch(statements);
    const executionTime = performance.now() - startTime;

    console.log(`📦 Batch executed ${queries.length} queries in ${executionTime.toFixed(2)}ms`);

    return results;
  }

  /**
   * Clear query log
   */
  clearLog(): void {
    this.queryLog = [];
    console.log('🗑️ Query log cleared');
  }

  /**
   * Export query log
   */
  exportLog(): QueryAnalysis[] {
    return [...this.queryLog];
  }

  /**
   * Common optimized queries
   */

  // Get recent items with limit
  async getRecent(table: string, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT * FROM ${table}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const { results } = await this.executeWithTiming(query, [limit]);
    return results;
  }

  // Count with WHERE clause
  async countWhere(table: string, whereClause: string, params: any[] = []): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM ${table}
      WHERE ${whereClause}
    `;
    const { results } = await this.executeWithTiming(query, params);
    return results[0]?.count || 0;
  }

  // Paginated results
  async paginate(
    table: string,
    page: number = 1,
    pageSize: number = 20,
    orderBy: string = 'created_at DESC'
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const offset = (page - 1) * pageSize;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
    const { results: countResults } = await this.executeWithTiming(countQuery);
    const total = countResults[0]?.count || 0;

    // Get paginated data
    const dataQuery = `
      SELECT * FROM ${table}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const { results: data } = await this.executeWithTiming(dataQuery, [pageSize, offset]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export default QueryOptimizerService;
