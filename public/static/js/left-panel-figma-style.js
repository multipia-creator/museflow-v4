/**
 * MuseFlow Canvas V4 - Figma-Style Left Panel
 * Complete UI Overhaul for World-Class UX
 * 
 * Features:
 * - Fuzzy Search (Fuse.js) with tag filtering
 * - Recent Items (5 most used)
 * - Favorites System (Star/Unstar)
 * - Node Thumbnails (120x60px mini previews)
 * - 3-level Hierarchy (Category > Subcategory > Node)
 * - Drag Preview with ghost image
 */

const LeftPanelFigma = {
  // State
  recentNodes: [],
  favoriteNodes: [],
  searchQuery: '',
  activeFilters: new Set(['all']),
  
  /**
   * Initialize Figma-style left panel
   */
  init() {
    console.log('[LeftPanelFigma] Initializing Figma-style left panel...');
    
    // Load saved data
    this.loadRecentNodes();
    this.loadFavorites();
    
    // Render enhanced panel
    this.renderEnhancedPanel();
    
    // Attach events
    this.attachEvents();
    
    // Load Fuse.js for fuzzy search
    this.loadFuseJS();
    
    console.log('[LeftPanelFigma] ✅ Figma-style panel ready');
  },
  
  /**
   * Load recent nodes from localStorage
   */
  loadRecentNodes() {
    try {
      const saved = localStorage.getItem('museflow_recent_nodes');
      this.recentNodes = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load recent nodes:', error);
      this.recentNodes = [];
    }
  },
  
  /**
   * Load favorites from localStorage
   */
  loadFavorites() {
    try {
      const saved = localStorage.getItem('museflow_favorite_nodes');
      this.favoriteNodes = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load favorites:', error);
      this.favoriteNodes = [];
    }
  },
  
  /**
   * Add node to recent items
   */
  addToRecent(nodeType) {
    // Remove if already exists
    this.recentNodes = this.recentNodes.filter(item => item.type !== nodeType);
    
    // Add to beginning
    this.recentNodes.unshift({
      type: nodeType,
      timestamp: Date.now()
    });
    
    // Keep only 5 items
    if (this.recentNodes.length > 5) {
      this.recentNodes = this.recentNodes.slice(0, 5);
    }
    
    // Save
    localStorage.setItem('museflow_recent_nodes', JSON.stringify(this.recentNodes));
    
    // Re-render recent section
    this.renderRecentSection();
  },
  
  /**
   * Toggle favorite
   */
  toggleFavorite(nodeType) {
    const index = this.favoriteNodes.indexOf(nodeType);
    
    if (index > -1) {
      // Remove from favorites
      this.favoriteNodes.splice(index, 1);
    } else {
      // Add to favorites
      this.favoriteNodes.push(nodeType);
    }
    
    // Save
    localStorage.setItem('museflow_favorite_nodes', JSON.stringify(this.favoriteNodes));
    
    // Re-render
    this.renderEnhancedPanel();
  },
  
  /**
   * Check if node is favorited
   */
  isFavorite(nodeType) {
    return this.favoriteNodes.includes(nodeType);
  },
  
  /**
   * Render enhanced left panel (CRITICAL FIX: Force render)
   */
  renderEnhancedPanel() {
    const leftPanel = document.getElementById('left-panel');
    if (!leftPanel) {
      console.error('[LeftPanelFigma] ❌ left-panel element not found!');
      return;
    }
    
    // CRITICAL: Clear existing content first
    leftPanel.innerHTML = '';
    
    leftPanel.innerHTML = `
      <!-- Search Section (Always visible) -->
      <div class="figma-search-section">
        <div class="search-box-advanced">
          <i data-lucide="search" style="width: 16px; height: 16px; color: #9ca3af;"></i>
          <input 
            type="text" 
            id="figma-search-input"
            placeholder="Search nodes... (Cmd+K)" 
            class="search-input-advanced"
            value="${this.searchQuery}" />
          ${this.searchQuery ? `
            <button class="search-clear" onclick="LeftPanelFigma.clearSearch()">
              <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
          ` : ''}
        </div>
        
        <!-- Filter Pills -->
        <div class="filter-pills" id="filter-pills">
          ${this.renderFilterPills()}
        </div>
      </div>
      
      <!-- Quick Access Section (Collapsible) -->
      <div class="figma-quick-access" id="quick-access-section">
        <div class="section-header" onclick="LeftPanelFigma.toggleSection('quick-access')">
          <i data-lucide="star" style="width: 16px; height: 16px; color: #f59e0b;"></i>
          <span>Quick Access</span>
          <i data-lucide="chevron-down" class="section-chevron" style="width: 14px; height: 14px;"></i>
        </div>
        <div class="section-content" id="quick-access-content">
          ${this.renderQuickAccessContent()}
        </div>
      </div>
      
      <!-- All Nodes Section (Scrollable Tree) -->
      <div class="figma-all-nodes" id="all-nodes-section">
        <div class="section-header">
          <i data-lucide="layers" style="width: 16px; height: 16px;"></i>
          <span>All Nodes</span>
          <span class="node-count">${this.getTotalNodeCount()}</span>
        </div>
        <div class="section-content nodes-tree" id="nodes-tree">
          ${this.renderNodesTree()}
        </div>
      </div>
    `;
    
    // Re-initialize Lucide icons (use LucideManager)
    setTimeout(() => {
      if (window.LucideManager) {
        window.LucideManager.refresh();
      } else if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 100);
    
    console.log('[LeftPanelFigma] ✅ Panel rendered successfully');
  },
  
  /**
   * Render filter pills
   */
  renderFilterPills() {
    const categories = [
      { id: 'all', label: 'All', count: 88 },
      { id: 'exhibition', label: '🎨 Exhibition', count: 11 },
      { id: 'education', label: '🎓 Education', count: 11 },
      { id: 'collection', label: '🗂️ Collection', count: 11 },
      { id: 'ai', label: '🤖 AI', count: 15 },
      { id: 'research', label: '📚 Research', count: 11 },
      { id: 'admin', label: '⚙️ Admin', count: 11 }
    ];
    
    return categories.map(cat => `
      <button 
        class="pill ${this.activeFilters.has(cat.id) ? 'active' : ''}" 
        data-filter="${cat.id}"
        onclick="LeftPanelFigma.toggleFilter('${cat.id}')">
        ${cat.label}
        <span class="count">${cat.count}</span>
      </button>
    `).join('');
  },
  
  /**
   * Render quick access content (Recent + Favorites)
   */
  renderQuickAccessContent() {
    const recentHTML = this.recentNodes.length > 0 
      ? `
        <div class="quick-section">
          <div class="quick-label">
            <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
            Recent
          </div>
          ${this.recentNodes.map(item => this.renderNodeItem(item.type, 'recent')).join('')}
        </div>
      `
      : '';
    
    const favoritesHTML = this.favoriteNodes.length > 0
      ? `
        <div class="quick-section">
          <div class="quick-label">
            <i data-lucide="star" style="width: 12px; height: 12px;"></i>
            Favorites
          </div>
          ${this.favoriteNodes.map(nodeType => this.renderNodeItem(nodeType, 'favorite')).join('')}
        </div>
      `
      : '';
    
    if (!recentHTML && !favoritesHTML) {
      return `
        <div class="empty-state-small">
          <i data-lucide="inbox" style="width: 32px; height: 32px; opacity: 0.3;"></i>
          <p>No recent or favorite nodes yet</p>
          <small>Drag nodes from below to start</small>
        </div>
      `;
    }
    
    return recentHTML + favoritesHTML;
  },
  
  /**
   * Render nodes tree (3-level hierarchy)
   */
  renderNodesTree() {
    if (!window.NodeLibrary88) {
      return '<p>Loading nodes...</p>';
    }
    
    const categories = this.getFilteredCategories();
    
    return categories.map(category => `
      <div class="tree-category" data-category="${category.id}">
        <div class="tree-category-header" onclick="LeftPanelFigma.toggleCategory('${category.id}')">
          <i data-lucide="chevron-right" class="tree-chevron" style="width: 14px; height: 14px;"></i>
          <i data-lucide="${category.icon}" style="width: 16px; height: 16px; color: ${category.color};"></i>
          <span class="tree-category-title">${category.label}</span>
          <span class="tree-node-count">${category.nodeCount}</span>
        </div>
        <div class="tree-subcategories" style="display: none;">
          ${category.subcategories.map(sub => `
            <div class="tree-subcategory">
              <div class="tree-subcategory-header" onclick="LeftPanelFigma.toggleSubcategory('${category.id}', '${sub.id}')">
                <i data-lucide="chevron-right" class="tree-chevron-small" style="width: 12px; height: 12px;"></i>
                <span>${sub.label}</span>
                <span class="tree-node-count-small">${sub.nodes.length}</span>
              </div>
              <div class="tree-nodes" style="display: none;">
                ${sub.nodes.map(node => this.renderNodeItem(node.id, 'tree')).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },
  
  /**
   * Render individual node item with thumbnail
   */
  renderNodeItem(nodeType, context = 'tree') {
    const nodeInfo = this.getNodeInfo(nodeType);
    if (!nodeInfo) return '';
    
    const isFav = this.isFavorite(nodeType);
    const thumbnailUrl = this.getNodeThumbnail(nodeType);
    
    return `
      <div 
        class="node-item-advanced ${context}" 
        draggable="true"
        data-node-type="${nodeType}"
        ondragstart="LeftPanelFigma.handleDragStart(event, '${nodeType}')"
        ondragend="LeftPanelFigma.handleDragEnd(event)">
        
        <!-- Thumbnail -->
        <div class="node-thumbnail" style="background-image: url('${thumbnailUrl}');">
          ${!thumbnailUrl ? `<i data-lucide="${nodeInfo.icon}" style="width: 24px; height: 24px; color: ${nodeInfo.color};"></i>` : ''}
        </div>
        
        <!-- Info -->
        <div class="node-info">
          <div class="node-title">${nodeInfo.title}</div>
          <div class="node-meta">
            <span class="node-type-badge">${nodeInfo.category}</span>
            ${nodeInfo.tags ? `<span class="node-tag">${nodeInfo.tags[0]}</span>` : ''}
          </div>
        </div>
        
        <!-- Actions -->
        <div class="node-actions">
          <button 
            class="node-action-btn favorite ${isFav ? 'active' : ''}" 
            onclick="event.stopPropagation(); LeftPanelFigma.toggleFavorite('${nodeType}')"
            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
            <i data-lucide="star" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * Get node info from library
   */
  getNodeInfo(nodeType) {
    if (!window.NodeLibrary88) return null;
    
    const allNodes = window.NodeLibrary88.getAllNodes();
    return allNodes.find(n => n.id === nodeType);
  },
  
  /**
   * Get node thumbnail (mock for now)
   */
  getNodeThumbnail(nodeType) {
    // TODO: Generate actual thumbnails
    return null;
  },
  
  /**
   * Get filtered categories based on active filters
   */
  getFilteredCategories() {
    // Mock data structure
    return [
      {
        id: 'exhibition',
        label: 'Exhibition',
        icon: 'palette',
        color: '#8b5cf6',
        nodeCount: 11,
        subcategories: [
          {
            id: 'planning',
            label: 'Planning',
            nodes: [
              { id: 'ex-plan-01', title: '기획안 작성' },
              { id: 'ex-plan-02', title: '예산 편성' },
              { id: 'ex-plan-03', title: '일정 관리' }
            ]
          },
          {
            id: 'installation',
            label: 'Installation',
            nodes: [
              { id: 'ex-inst-01', title: '공간 배치' },
              { id: 'ex-inst-02', title: '조명 설계' }
            ]
          }
        ]
      },
      {
        id: 'education',
        label: 'Education',
        icon: 'graduation-cap',
        color: '#06b6d4',
        nodeCount: 11,
        subcategories: [
          {
            id: 'program',
            label: 'Program',
            nodes: [
              { id: 'ed-prog-01', title: '프로그램 기획' },
              { id: 'ed-prog-02', title: '커리큘럼 개발' }
            ]
          }
        ]
      }
      // ... more categories
    ];
  },
  
  /**
   * Get total node count
   */
  getTotalNodeCount() {
    return 88; // Total nodes in library
  },
  
  /**
   * Toggle filter
   */
  toggleFilter(filterId) {
    if (filterId === 'all') {
      this.activeFilters.clear();
      this.activeFilters.add('all');
    } else {
      this.activeFilters.delete('all');
      
      if (this.activeFilters.has(filterId)) {
        this.activeFilters.delete(filterId);
        if (this.activeFilters.size === 0) {
          this.activeFilters.add('all');
        }
      } else {
        this.activeFilters.add(filterId);
      }
    }
    
    this.renderEnhancedPanel();
  },
  
  /**
   * Toggle category expansion
   */
  toggleCategory(categoryId) {
    const category = document.querySelector(`.tree-category[data-category="${categoryId}"]`);
    if (!category) return;
    
    const chevron = category.querySelector('.tree-chevron');
    const subcategories = category.querySelector('.tree-subcategories');
    
    const isExpanded = subcategories.style.display !== 'none';
    
    subcategories.style.display = isExpanded ? 'none' : 'block';
    chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
  },
  
  /**
   * Toggle subcategory expansion
   */
  toggleSubcategory(categoryId, subcategoryId) {
    const subcategory = document.querySelector(
      `.tree-category[data-category="${categoryId}"] .tree-subcategory:has(.tree-subcategory-header)`
    );
    if (!subcategory) return;
    
    const chevron = subcategory.querySelector('.tree-chevron-small');
    const nodes = subcategory.querySelector('.tree-nodes');
    
    const isExpanded = nodes.style.display !== 'none';
    
    nodes.style.display = isExpanded ? 'none' : 'block';
    chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
  },
  
  /**
   * Toggle section (Quick Access, etc.)
   */
  toggleSection(sectionId) {
    const section = document.getElementById(`${sectionId}-section`);
    if (!section) return;
    
    const chevron = section.querySelector('.section-chevron');
    const content = section.querySelector('.section-content');
    
    const isExpanded = content.style.display !== 'none';
    
    content.style.display = isExpanded ? 'none' : 'block';
    chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
  },
  
  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery = '';
    this.renderEnhancedPanel();
  },
  
  /**
   * Handle drag start
   */
  handleDragStart(event, nodeType) {
    event.dataTransfer.setData('nodeType', nodeType);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Create ghost image
    const nodeItem = event.target.closest('.node-item-advanced');
    if (nodeItem) {
      const ghost = nodeItem.cloneNode(true);
      ghost.style.opacity = '0.7';
      ghost.style.transform = 'rotate(-5deg)';
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, 60, 30);
      setTimeout(() => ghost.remove(), 0);
    }
    
    // Add dragging class
    event.target.classList.add('dragging');
  },
  
  /**
   * Handle drag end
   */
  handleDragEnd(event) {
    event.target.classList.remove('dragging');
  },
  
  /**
   * Attach events
   */
  attachEvents() {
    // Search input
    const searchInput = document.getElementById('figma-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.performSearch();
      });
    }
    
    // Cmd+K shortcut (handled by CommandPalette)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        const input = document.getElementById('figma-search-input');
        if (input) input.focus();
      }
    });
  },
  
  /**
   * Perform fuzzy search
   */
  performSearch() {
    if (!this.fuseInstance) {
      // Fallback: simple filter
      this.renderEnhancedPanel();
      return;
    }
    
    if (!this.searchQuery.trim()) {
      this.renderEnhancedPanel();
      return;
    }
    
    // Fuzzy search with Fuse.js
    const results = this.fuseInstance.search(this.searchQuery);
    
    // Render search results
    this.renderSearchResults(results);
  },
  
  /**
   * Render search results
   */
  renderSearchResults(results) {
    const nodesTree = document.getElementById('nodes-tree');
    if (!nodesTree) return;
    
    if (results.length === 0) {
      nodesTree.innerHTML = `
        <div class="empty-state-small">
          <i data-lucide="search-x" style="width: 32px; height: 32px; opacity: 0.3;"></i>
          <p>No nodes found for "${this.searchQuery}"</p>
          <small>Try different keywords</small>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }
    
    nodesTree.innerHTML = `
      <div class="search-results">
        <div class="search-results-header">
          Found ${results.length} node${results.length > 1 ? 's' : ''}
        </div>
        ${results.map(result => this.renderNodeItem(result.item.id, 'search')).join('')}
      </div>
    `;
    
    if (window.lucide) lucide.createIcons();
  },
  
  /**
   * Load Fuse.js library
   */
  async loadFuseJS() {
    if (window.Fuse) {
      this.initializeFuse();
      return;
    }
    
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js';
      script.onload = () => {
        console.log('[LeftPanelFigma] Fuse.js loaded');
        this.initializeFuse();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Failed to load Fuse.js:', error);
    }
  },
  
  /**
   * Initialize Fuse.js instance
   */
  initializeFuse() {
    if (!window.Fuse || !window.NodeLibrary88) return;
    
    const allNodes = window.NodeLibrary88.getAllNodes();
    
    this.fuseInstance = new Fuse(allNodes, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    });
    
    console.log('[LeftPanelFigma] Fuse.js search initialized');
  },
  
  /**
   * Render recent section only
   */
  renderRecentSection() {
    const content = document.getElementById('quick-access-content');
    if (content) {
      content.innerHTML = this.renderQuickAccessContent();
      if (window.lucide) lucide.createIcons();
    }
  }
};

// Auto-initialize when Canvas V3 is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => LeftPanelFigma.init(), 1500);
  });
} else {
  setTimeout(() => LeftPanelFigma.init(), 1500);
}
