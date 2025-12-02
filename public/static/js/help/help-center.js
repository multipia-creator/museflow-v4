/**
 * MuseFlow V4 - Help Center
 * 
 * 전체 도움말 시스템의 중앙 허브. 사용자가 모든 도움말 리소스를
 * 검색하고 탐색할 수 있는 통합 인터페이스를 제공합니다.
 * 
 * Features:
 * - Full-text search across all articles
 * - Role-based filtering
 * - Category navigation
 * - Popular and recently updated articles
 * - Breadcrumb navigation
 * - Related articles recommendation
 * - Reading progress tracking
 * - Helpful voting system
 * 
 * Usage:
 *   <script src="/static/js/help/help-center.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', () => {
 *       HelpCenter.init({
 *         dataUrl: '/static/data/help/help-center-data.json',
 *         userRole: 'curator',
 *         container: '#help-center-container'
 *       });
 *     });
 *   </script>
 * 
 * @version 1.0.0
 * @date 2025-01-22
 */

const HelpCenter = {
  // Configuration
  config: {
    dataUrl: '/static/data/help/help-center-data.json',
    userRole: 'curator',
    container: '#help-center-container',
    searchDebounce: 300,
    articlesPerPage: 12,
    enableAnalytics: true
  },

  // Data
  data: {
    categories: [],
    allArticles: [],
    popularArticles: [],
    recentlyUpdated: [],
    version: null,
    lastUpdated: null
  },

  // State
  state: {
    currentView: 'home', // 'home', 'category', 'article', 'search'
    currentCategory: null,
    currentArticle: null,
    searchQuery: '',
    searchResults: [],
    filteredRole: null,
    currentPage: 1,
    breadcrumbs: []
  },

  /**
   * Initialize Help Center
   * @param {Object} options - Configuration options
   */
  async init(options = {}) {
    console.log('[HelpCenter] Initializing...');
    
    // Merge config
    this.config = { ...this.config, ...options };
    
    // Load data
    await this.loadData();
    
    // Inject styles
    this.injectStyles();
    
    // Render initial view
    this.render();
    
    // Setup event listeners
    this.attachEventListeners();
    
    console.log('[HelpCenter] Initialized successfully');
  },

  /**
   * Load help center data from JSON
   */
  async loadData() {
    try {
      const response = await fetch(this.config.dataUrl);
      const data = await response.json();
      
      this.data.categories = data.categories;
      this.data.version = data.version;
      this.data.lastUpdated = data.lastUpdated;
      
      // Flatten all articles for search
      this.data.allArticles = [];
      data.categories.forEach(category => {
        category.articles.forEach(article => {
          this.data.allArticles.push({
            ...article,
            categoryId: category.id,
            categoryTitle: category.title,
            categoryIcon: category.icon
          });
        });
      });
      
      // Get popular articles
      this.data.popularArticles = data.popularArticles
        .map(id => this.data.allArticles.find(a => a.id === id))
        .filter(Boolean);
      
      // Get recently updated
      this.data.recentlyUpdated = data.recentlyUpdated
        .map(id => this.data.allArticles.find(a => a.id === id))
        .filter(Boolean);
      
      console.log('[HelpCenter] Data loaded:', {
        categories: this.data.categories.length,
        articles: this.data.allArticles.length,
        popular: this.data.popularArticles.length
      });
    } catch (error) {
      console.error('[HelpCenter] Failed to load data:', error);
      this.showError('도움말 데이터를 불러오는데 실패했습니다.');
    }
  },

  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('help-center-styles')) return;

    const style = document.createElement('style');
    style.id = 'help-center-styles';
    style.textContent = `
      /* Help Center Container */
      .help-center {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* Header */
      .help-center-header {
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        border-radius: 16px;
        color: white;
        margin-bottom: 32px;
      }

      .help-center-title {
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 16px 0;
      }

      .help-center-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
      }

      /* Search Bar */
      .help-search-container {
        max-width: 600px;
        margin: 24px auto 0;
        position: relative;
      }

      .help-search-input {
        width: 100%;
        padding: 16px 24px 16px 56px;
        font-size: 16px;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        outline: none;
      }

      .help-search-input:focus {
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
      }

      .help-search-icon {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
        opacity: 0.5;
      }

      /* Breadcrumbs */
      .help-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
        font-size: 14px;
        color: #6b7280;
      }

      .help-breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .help-breadcrumb-link {
        color: #4f46e5;
        text-decoration: none;
        transition: color 0.2s;
      }

      .help-breadcrumb-link:hover {
        color: #4338ca;
        text-decoration: underline;
      }

      .help-breadcrumb-separator {
        opacity: 0.5;
      }

      /* Filters */
      .help-filters {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .help-filter-btn {
        padding: 8px 16px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .help-filter-btn:hover {
        background: #e5e7eb;
      }

      .help-filter-btn.active {
        background: #4f46e5;
        color: white;
        border-color: #4f46e5;
      }

      /* Categories Grid */
      .help-categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 48px;
      }

      .help-category-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }

      .help-category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        border-color: var(--category-color);
      }

      .help-category-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .help-category-icon {
        font-size: 32px;
      }

      .help-category-title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .help-category-description {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 16px 0;
      }

      .help-category-count {
        font-size: 13px;
        color: #9ca3af;
      }

      /* Articles List */
      .help-articles-section {
        margin-bottom: 48px;
      }

      .help-section-title {
        font-size: 24px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 20px 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .help-articles-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }

      .help-article-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
      }

      .help-article-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        border-color: #4f46e5;
      }

      .help-article-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .help-article-category-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .help-article-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 8px 0;
        flex: 1;
      }

      .help-article-summary {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 12px 0;
        flex: 1;
      }

      .help-article-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 13px;
        color: #9ca3af;
        padding-top: 12px;
        border-top: 1px solid #f3f4f6;
      }

      .help-article-meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .help-article-difficulty {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .help-article-difficulty.beginner {
        background: #dbeafe;
        color: #1e40af;
      }

      .help-article-difficulty.intermediate {
        background: #fef3c7;
        color: #92400e;
      }

      .help-article-difficulty.advanced {
        background: #fee2e2;
        color: #991b1b;
      }

      /* Article View */
      .help-article-view {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      .help-article-view-header {
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #f3f4f6;
      }

      .help-article-view-title {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 12px 0;
      }

      .help-article-view-meta {
        display: flex;
        align-items: center;
        gap: 24px;
        font-size: 14px;
        color: #6b7280;
      }

      .help-article-content {
        font-size: 16px;
        line-height: 1.8;
        color: #374151;
        margin-bottom: 32px;
      }

      .help-article-actions {
        display: flex;
        gap: 16px;
        padding: 24px;
        background: #f9fafb;
        border-radius: 12px;
        margin-bottom: 32px;
      }

      .help-article-action-btn {
        flex: 1;
        padding: 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .help-article-action-btn:hover {
        background: #f3f4f6;
        border-color: #4f46e5;
      }

      .help-article-action-btn.voted {
        background: #4f46e5;
        color: white;
        border-color: #4f46e5;
      }

      /* Related Articles */
      .help-related-articles {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 2px solid #f3f4f6;
      }

      /* Search Results */
      .help-search-results {
        margin-top: 24px;
      }

      .help-search-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .help-search-results-count {
        font-size: 16px;
        color: #6b7280;
      }

      .help-search-highlight {
        background: #fef3c7;
        padding: 2px 4px;
        border-radius: 2px;
      }

      /* Empty State */
      .help-empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #9ca3af;
      }

      .help-empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .help-empty-text {
        font-size: 18px;
        margin-bottom: 8px;
      }

      .help-empty-subtext {
        font-size: 14px;
      }

      /* Loading */
      .help-loading {
        text-align: center;
        padding: 60px 20px;
      }

      .help-loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Tags */
      .help-article-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .help-article-tag {
        padding: 4px 12px;
        background: #f3f4f6;
        border-radius: 16px;
        font-size: 12px;
        color: #6b7280;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .help-center-title {
          font-size: 28px;
        }

        .help-categories-grid,
        .help-articles-list {
          grid-template-columns: 1fr;
        }

        .help-article-view {
          padding: 24px 16px;
        }

        .help-article-view-title {
          font-size: 24px;
        }

        .help-filters {
          overflow-x: auto;
          flex-wrap: nowrap;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Render the current view
   */
  render() {
    const container = document.querySelector(this.config.container);
    if (!container) {
      console.error('[HelpCenter] Container not found:', this.config.container);
      return;
    }

    let html = '';

    // Header
    html += this.renderHeader();

    // Breadcrumbs
    if (this.state.breadcrumbs.length > 0) {
      html += this.renderBreadcrumbs();
    }

    // Content based on view
    switch (this.state.currentView) {
      case 'home':
        html += this.renderHomeView();
        break;
      case 'category':
        html += this.renderCategoryView();
        break;
      case 'article':
        html += this.renderArticleView();
        break;
      case 'search':
        html += this.renderSearchView();
        break;
      default:
        html += this.renderHomeView();
    }

    container.innerHTML = html;
  },

  /**
   * Render header with search
   */
  renderHeader() {
    return `
      <div class="help-center-header">
        <h1 class="help-center-title">MuseFlow 도움말 센터</h1>
        <p class="help-center-subtitle">필요한 정보를 빠르게 찾아보세요</p>
        <div class="help-search-container">
          <span class="help-search-icon">🔍</span>
          <input 
            type="text" 
            class="help-search-input" 
            placeholder="도움말 검색... (예: 작품 등록, AI 메타데이터, 전시 만들기)"
            value="${this.state.searchQuery}"
            id="help-search-input"
          />
        </div>
      </div>
    `;
  },

  /**
   * Render breadcrumbs
   */
  renderBreadcrumbs() {
    return `
      <div class="help-breadcrumbs">
        ${this.state.breadcrumbs.map((crumb, index) => `
          <div class="help-breadcrumb-item">
            ${index > 0 ? '<span class="help-breadcrumb-separator">›</span>' : ''}
            ${index < this.state.breadcrumbs.length - 1 
              ? `<a href="#" class="help-breadcrumb-link" data-breadcrumb="${index}">${crumb}</a>`
              : `<span>${crumb}</span>`
            }
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render home view
   */
  renderHomeView() {
    let html = '<div class="help-center-body">';

    // Categories
    html += `
      <div class="help-articles-section">
        <h2 class="help-section-title">📚 카테고리별 도움말</h2>
        <div class="help-categories-grid">
          ${this.data.categories.map(category => `
            <div class="help-category-card" style="--category-color: ${category.color}" data-category="${category.id}">
              <div class="help-category-header">
                <span class="help-category-icon">${category.icon}</span>
                <h3 class="help-category-title">${category.title}</h3>
              </div>
              <p class="help-category-description">${category.description}</p>
              <div class="help-category-count">${category.articles.length}개 문서</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Popular articles
    if (this.data.popularArticles.length > 0) {
      html += `
        <div class="help-articles-section">
          <h2 class="help-section-title">🔥 인기 문서</h2>
          <div class="help-articles-list">
            ${this.data.popularArticles.slice(0, 6).map(article => this.renderArticleCard(article)).join('')}
          </div>
        </div>
      `;
    }

    // Recently updated
    if (this.data.recentlyUpdated.length > 0) {
      html += `
        <div class="help-articles-section">
          <h2 class="help-section-title">🆕 최근 업데이트</h2>
          <div class="help-articles-list">
            ${this.data.recentlyUpdated.slice(0, 6).map(article => this.renderArticleCard(article)).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  /**
   * Render category view
   */
  renderCategoryView() {
    const category = this.data.categories.find(c => c.id === this.state.currentCategory);
    if (!category) return this.renderError('카테고리를 찾을 수 없습니다.');

    let html = '<div class="help-center-body">';

    html += `
      <div class="help-articles-section">
        <h2 class="help-section-title">
          <span>${category.icon}</span>
          <span>${category.title}</span>
        </h2>
        <p style="color: #6b7280; margin-bottom: 24px;">${category.description}</p>
        
        <div class="help-articles-list">
          ${category.articles.map(article => this.renderArticleCard(article)).join('')}
        </div>
      </div>
    `;

    html += '</div>';
    return html;
  },

  /**
   * Render article card
   */
  renderArticleCard(article) {
    return `
      <div class="help-article-card" data-article="${article.id}">
        <div class="help-article-header">
          <span class="help-article-category-icon">${article.categoryIcon}</span>
          <div style="flex: 1;">
            <h3 class="help-article-title">${article.title}</h3>
            <div class="help-article-tags">
              ${article.tags.slice(0, 3).map(tag => `<span class="help-article-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        <p class="help-article-summary">${article.summary}</p>
        <div class="help-article-meta">
          <span class="help-article-meta-item">⏱️ ${article.readTime}분</span>
          <span class="help-article-meta-item">👍 ${article.helpful}</span>
          <span class="help-article-difficulty ${article.difficulty}">${this.getDifficultyLabel(article.difficulty)}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render article view
   */
  renderArticleView() {
    const article = this.data.allArticles.find(a => a.id === this.state.currentArticle);
    if (!article) return this.renderError('문서를 찾을 수 없습니다.');

    let html = '<div class="help-article-view">';

    // Header
    html += `
      <div class="help-article-view-header">
        <h1 class="help-article-view-title">${article.title}</h1>
        <div class="help-article-view-meta">
          <span>${article.categoryIcon} ${article.categoryTitle}</span>
          <span>⏱️ ${article.readTime}분</span>
          <span>👁️ ${article.views.toLocaleString()} 조회</span>
          <span class="help-article-difficulty ${article.difficulty}">${this.getDifficultyLabel(article.difficulty)}</span>
          <span>🗓️ ${article.lastUpdated}</span>
        </div>
        ${article.tags.length > 0 ? `
          <div class="help-article-tags" style="margin-top: 16px;">
            ${article.tags.map(tag => `<span class="help-article-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Content placeholder
    html += `
      <div class="help-article-content">
        <p><em>실제 문서 콘텐츠는 ${article.content}에서 로드됩니다.</em></p>
        <p><strong>요약:</strong> ${article.summary}</p>
        
        ${article.videoTutorial ? `
          <div style="margin: 24px 0; padding: 20px; background: #dbeafe; border-radius: 12px;">
            <h3>🎥 관련 영상 튜토리얼</h3>
            <p>이 주제에 대한 상세한 영상 가이드를 시청하세요.</p>
            <button class="help-article-action-btn" style="max-width: 200px;" data-video="${article.videoTutorial}">
              영상 보기 ▶
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Actions
    html += `
      <div class="help-article-actions">
        <button class="help-article-action-btn" data-action="helpful">
          <span>👍</span>
          <span>도움이 되었어요 (${article.helpful})</span>
        </button>
        <button class="help-article-action-btn" data-action="print">
          <span>🖨️</span>
          <span>인쇄</span>
        </button>
        <button class="help-article-action-btn" data-action="share">
          <span>📤</span>
          <span>공유</span>
        </button>
      </div>
    `;

    // Related articles
    if (article.relatedArticles && article.relatedArticles.length > 0) {
      const relatedArticles = article.relatedArticles
        .map(id => this.data.allArticles.find(a => a.id === id))
        .filter(Boolean);

      if (relatedArticles.length > 0) {
        html += `
          <div class="help-related-articles">
            <h2 class="help-section-title">🔗 관련 문서</h2>
            <div class="help-articles-list">
              ${relatedArticles.map(a => this.renderArticleCard(a)).join('')}
            </div>
          </div>
        `;
      }
    }

    html += '</div>';
    return html;
  },

  /**
   * Render search view
   */
  renderSearchView() {
    let html = '<div class="help-search-results">';

    html += `
      <div class="help-search-results-header">
        <div class="help-search-results-count">
          "${this.state.searchQuery}" 검색 결과: ${this.state.searchResults.length}개
        </div>
      </div>
    `;

    if (this.state.searchResults.length === 0) {
      html += `
        <div class="help-empty-state">
          <div class="help-empty-icon">🔍</div>
          <div class="help-empty-text">검색 결과가 없습니다</div>
          <div class="help-empty-subtext">다른 키워드로 다시 시도해보세요</div>
        </div>
      `;
    } else {
      html += `
        <div class="help-articles-list">
          ${this.state.searchResults.map(article => this.renderArticleCard(article)).join('')}
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  /**
   * Render error state
   */
  renderError(message) {
    return `
      <div class="help-empty-state">
        <div class="help-empty-icon">⚠️</div>
        <div class="help-empty-text">${message}</div>
      </div>
    `;
  },

  /**
   * Get difficulty label in Korean
   */
  getDifficultyLabel(difficulty) {
    const labels = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    };
    return labels[difficulty] || difficulty;
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const container = document.querySelector(this.config.container);
    if (!container) return;

    // Search input
    let searchTimeout;
    container.addEventListener('input', (e) => {
      if (e.target.id === 'help-search-input') {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
          if (query.length > 0) {
            this.search(query);
          } else {
            this.showHome();
          }
        }, this.config.searchDebounce);
      }
    });

    // Delegated click events
    container.addEventListener('click', (e) => {
      // Category card
      const categoryCard = e.target.closest('.help-category-card');
      if (categoryCard) {
        const categoryId = categoryCard.dataset.category;
        this.showCategory(categoryId);
        return;
      }

      // Article card
      const articleCard = e.target.closest('.help-article-card');
      if (articleCard) {
        const articleId = articleCard.dataset.article;
        this.showArticle(articleId);
        return;
      }

      // Breadcrumb
      const breadcrumb = e.target.closest('[data-breadcrumb]');
      if (breadcrumb) {
        e.preventDefault();
        const index = parseInt(breadcrumb.dataset.breadcrumb);
        this.navigateBreadcrumb(index);
        return;
      }

      // Article actions
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        this.handleArticleAction(action);
        return;
      }

      // Video tutorial
      const videoBtn = e.target.closest('[data-video]');
      if (videoBtn) {
        const videoId = videoBtn.dataset.video;
        this.playTutorial(videoId);
        return;
      }
    });
  },

  /**
   * Show home view
   */
  showHome() {
    this.state.currentView = 'home';
    this.state.currentCategory = null;
    this.state.currentArticle = null;
    this.state.searchQuery = '';
    this.state.breadcrumbs = [];
    this.render();
    this.trackView('home');
  },

  /**
   * Show category view
   */
  showCategory(categoryId) {
    const category = this.data.categories.find(c => c.id === categoryId);
    if (!category) return;

    this.state.currentView = 'category';
    this.state.currentCategory = categoryId;
    this.state.currentArticle = null;
    this.state.breadcrumbs = ['홈', category.title];
    this.render();
    this.trackView('category', { categoryId, categoryTitle: category.title });
  },

  /**
   * Show article view
   */
  showArticle(articleId) {
    const article = this.data.allArticles.find(a => a.id === articleId);
    if (!article) return;

    this.state.currentView = 'article';
    this.state.currentArticle = articleId;
    this.state.breadcrumbs = ['홈', article.categoryTitle, article.title];
    this.render();
    this.trackView('article', { articleId, articleTitle: article.title });

    // Increment view count (in real app, this would be an API call)
    article.views++;
  },

  /**
   * Search articles
   */
  search(query) {
    this.state.searchQuery = query;
    this.state.currentView = 'search';
    
    const lowerQuery = query.toLowerCase();
    
    this.state.searchResults = this.data.allArticles.filter(article => {
      // Search in title, summary, tags
      const matchTitle = article.title.toLowerCase().includes(lowerQuery);
      const matchSummary = article.summary.toLowerCase().includes(lowerQuery);
      const matchTags = article.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      // Role filter
      if (this.config.userRole && article.roles.length > 0) {
        const roleMatch = article.roles.includes(this.config.userRole);
        if (!roleMatch) return false;
      }
      
      return matchTitle || matchSummary || matchTags;
    });

    this.state.breadcrumbs = ['홈', `검색: ${query}`];
    this.render();
    this.trackSearch(query, this.state.searchResults.length);
  },

  /**
   * Navigate breadcrumb
   */
  navigateBreadcrumb(index) {
    if (index === 0) {
      this.showHome();
    } else if (index === 1 && this.state.currentView === 'article') {
      // Navigate back to category
      const article = this.data.allArticles.find(a => a.id === this.state.currentArticle);
      if (article) {
        this.showCategory(article.categoryId);
      }
    }
  },

  /**
   * Handle article actions
   */
  handleArticleAction(action) {
    const article = this.data.allArticles.find(a => a.id === this.state.currentArticle);
    if (!article) return;

    switch (action) {
      case 'helpful':
        article.helpful++;
        this.trackEvent('article_helpful', { articleId: article.id });
        
        // Visual feedback
        const btn = document.querySelector('[data-action="helpful"]');
        if (btn) {
          btn.classList.add('voted');
          btn.innerHTML = '<span>✅</span><span>도움이 되었어요 (' + article.helpful + ')</span>';
        }
        break;
        
      case 'print':
        window.print();
        this.trackEvent('article_print', { articleId: article.id });
        break;
        
      case 'share':
        const url = window.location.href;
        if (navigator.share) {
          navigator.share({
            title: article.title,
            text: article.summary,
            url: url
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(url);
          console.log('링크가 클립보드에 복사되었습니다!');
        }
        this.trackEvent('article_share', { articleId: article.id });
        break;
    }
  },

  /**
   * Play tutorial video
   */
  playTutorial(videoId) {
    console.log('[HelpCenter] Playing tutorial:', videoId);
    this.trackEvent('tutorial_play', { videoId });
    
    // Dispatch event for video player integration
    window.dispatchEvent(new CustomEvent('help:playTutorial', {
      detail: { videoId }
    }));
    
    // TODO: Implement video overlay player (Phase 3)
    console.log(`튜토리얼 영상 재생: ${videoId}\n\n(Video Overlay Player는 Phase 3에서 구현 예정)`);
  },

  /**
   * Track view analytics
   */
  trackView(viewType, data = {}) {
    if (!this.config.enableAnalytics) return;

    const event = {
      type: 'view',
      viewType: viewType,
      timestamp: new Date().toISOString(),
      userRole: this.config.userRole,
      ...data
    };

    console.log('[HelpCenter] Track view:', event);
    
    // Store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('help_center_events') || '[]');
    events.push(event);
    localStorage.setItem('help_center_events', JSON.stringify(events.slice(-100)));
  },

  /**
   * Track search analytics
   */
  trackSearch(query, resultsCount) {
    if (!this.config.enableAnalytics) return;

    const event = {
      type: 'search',
      query: query,
      resultsCount: resultsCount,
      timestamp: new Date().toISOString(),
      userRole: this.config.userRole
    };

    console.log('[HelpCenter] Track search:', event);
    
    const events = JSON.parse(localStorage.getItem('help_center_events') || '[]');
    events.push(event);
    localStorage.setItem('help_center_events', JSON.stringify(events.slice(-100)));
  },

  /**
   * Track event analytics
   */
  trackEvent(eventName, data = {}) {
    if (!this.config.enableAnalytics) return;

    const event = {
      type: 'event',
      name: eventName,
      timestamp: new Date().toISOString(),
      userRole: this.config.userRole,
      ...data
    };

    console.log('[HelpCenter] Track event:', event);
    
    const events = JSON.parse(localStorage.getItem('help_center_events') || '[]');
    events.push(event);
    localStorage.setItem('help_center_events', JSON.stringify(events.slice(-100)));
  },

  /**
   * Show error message
   */
  showError(message) {
    const container = document.querySelector(this.config.container);
    if (!container) return;

    container.innerHTML = this.renderError(message);
  },

  /**
   * Destroy Help Center
   */
  destroy() {
    const styles = document.getElementById('help-center-styles');
    if (styles) styles.remove();

    const container = document.querySelector(this.config.container);
    if (container) container.innerHTML = '';

    console.log('[HelpCenter] Destroyed');
  }
};

// Auto-initialize if data attribute present
if (document.querySelector('[data-help-center-auto-init]')) {
  document.addEventListener('DOMContentLoaded', () => {
    const config = document.querySelector('[data-help-center-auto-init]').dataset;
    HelpCenter.init({
      dataUrl: config.dataUrl || '/static/data/help/help-center-data.json',
      userRole: config.userRole || 'curator',
      container: config.container || '#help-center-container'
    });
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HelpCenter;
}
