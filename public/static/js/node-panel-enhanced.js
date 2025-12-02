/**
 * Enhanced Node Panel - Recent, Favorites, Tags
 * Improves node discoverability and user efficiency
 */

const NodePanelEnhanced = {
  recentNodes: [],
  favoriteNodes: new Set(),
  selectedTags: new Set(),
  maxRecentItems: 10,
  
  allTags: [
    { id: 'ai', name: 'AI', icon: 'sparkles', color: '#8b5cf6' },
    { id: 'document', name: '문서', icon: 'file-text', color: '#3b82f6' },
    { id: 'communication', name: '소통', icon: 'mail', color: '#10b981' },
    { id: 'analysis', name: '분석', icon: 'bar-chart', color: '#f59e0b' },
    { id: 'schedule', name: '일정', icon: 'calendar', color: '#ec4899' },
    { id: 'translate', name: '번역', icon: 'languages', color: '#6366f1' }
  ],
  
  // Node type to tag mapping
  nodeTagMap: {
    // AI nodes
    'ai-gemini-generate': ['ai', 'document'],
    'ai-gemini-improve': ['ai', 'document'],
    'ai-gemini-translate': ['ai', 'translate'],
    'ai-gemini-summarize': ['ai', 'document'],
    'ai-docs-create': ['ai', 'document'],
    'ai-gmail-send': ['ai', 'communication'],
    'ai-calendar-create': ['ai', 'schedule'],
    
    // Exhibition nodes
    'ex-01': ['document'],
    'ex-02': ['analysis'],
    'ex-03': ['schedule'],
    'ex-08': ['communication'],
    
    // Education nodes
    'ed-01': ['document'],
    'ed-03': ['document'],
    'ed-05': ['communication'],
    
    // Default
    default: []
  },
  
  init() {
    this.loadFromStorage();
    this.render();
    this.attachEvents();
    console.log('✅ Enhanced Node Panel initialized');
  },
  
  loadFromStorage() {
    // Load recent nodes
    const recent = localStorage.getItem('recent_nodes');
    if (recent) {
      try {
        this.recentNodes = JSON.parse(recent);
      } catch (e) {
        this.recentNodes = [];
      }
    }
    
    // Load favorites
    const favorites = localStorage.getItem('favorite_nodes');
    if (favorites) {
      try {
        this.favoriteNodes = new Set(JSON.parse(favorites));
      } catch (e) {
        this.favoriteNodes = new Set();
      }
    }
  },
  
  saveToStorage() {
    localStorage.setItem('recent_nodes', JSON.stringify(this.recentNodes));
    localStorage.setItem('favorite_nodes', JSON.stringify([...this.favoriteNodes]));
  },
  
  addRecentNode(nodeType) {
    // Remove if already exists
    this.recentNodes = this.recentNodes.filter(n => n !== nodeType);
    
    // Add to front
    this.recentNodes.unshift(nodeType);
    
    // Limit to max items
    if (this.recentNodes.length > this.maxRecentItems) {
      this.recentNodes = this.recentNodes.slice(0, this.maxRecentItems);
    }
    
    this.saveToStorage();
    this.render();
  },
  
  toggleFavorite(nodeType) {
    if (this.favoriteNodes.has(nodeType)) {
      this.favoriteNodes.delete(nodeType);
      Toast.info('즐겨찾기에서 제거되었습니다', 2000);
    } else {
      this.favoriteNodes.add(nodeType);
      Toast.success('즐겨찾기에 추가되었습니다', 2000);
    }
    
    this.saveToStorage();
    this.render();
  },
  
  toggleTag(tagId) {
    if (this.selectedTags.has(tagId)) {
      this.selectedTags.delete(tagId);
    } else {
      this.selectedTags.add(tagId);
    }
    
    this.filterByTags();
  },
  
  clearTags() {
    this.selectedTags.clear();
    this.filterByTags();
  },
  
  filterByTags() {
    const categories = document.querySelectorAll('.category');
    
    if (this.selectedTags.size === 0) {
      // Show all
      categories.forEach(cat => {
        cat.style.display = '';
        const items = cat.querySelectorAll('.node-item');
        items.forEach(item => item.style.display = '');
      });
      return;
    }
    
    // Filter by tags
    categories.forEach(cat => {
      const items = cat.querySelectorAll('.node-item');
      let visibleCount = 0;
      
      items.forEach(item => {
        const nodeId = item.dataset.nodeId;
        const nodeTags = this.nodeTagMap[nodeId] || this.nodeTagMap.default;
        
        // Check if node has any of the selected tags
        const hasTag = [...this.selectedTags].some(tag => nodeTags.includes(tag));
        
        if (hasTag) {
          item.style.display = '';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Hide category if no visible items
      cat.style.display = visibleCount > 0 ? '' : 'none';
    });
    
    this.render();
  },
  
  getNodeInfo(nodeType) {
    // Get node info from library
    if (window.NODE_LIBRARY_88) {
      for (const category of Object.values(NODE_LIBRARY_88)) {
        const node = category.nodes.find(n => n.id === nodeType);
        if (node) return node;
      }
    }
    return null;
  },
  
  render() {
    const panelHeader = document.querySelector('.panel-header');
    if (!panelHeader) return;
    
    // Remove existing enhanced panels
    document.querySelectorAll('.enhanced-panel-section').forEach(el => el.remove());
    
    // Insert after search box
    const searchBox = document.getElementById('node-search');
    if (!searchBox) return;
    
    const container = document.createElement('div');
    container.className = 'enhanced-panel-section';
    container.innerHTML = this.renderHTML();
    
    searchBox.parentNode.insertBefore(container, searchBox.nextSibling);
    
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },
  
  renderHTML() {
    return `
      <!-- Tag Filter -->
      <div class="tag-filter-section">
        <div class="section-header">
          <span class="section-title">🏷️ 태그 필터</span>
          ${this.selectedTags.size > 0 ? 
            `<button class="clear-tags-btn" onclick="NodePanelEnhanced.clearTags()">초기화</button>` : 
            ''}
        </div>
        <div class="tag-chips">
          ${this.allTags.map(tag => `
            <button class="tag-chip ${this.selectedTags.has(tag.id) ? 'active' : ''}"
                    onclick="NodePanelEnhanced.toggleTag('${tag.id}')"
                    style="--tag-color: ${tag.color}">
              <i data-lucide="${tag.icon}" style="width: 14px; height: 14px;"></i>
              ${tag.name}
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Favorites -->
      ${this.favoriteNodes.size > 0 ? `
        <div class="favorites-section">
          <div class="section-header">
            <span class="section-title">⭐ 즐겨찾기 (${this.favoriteNodes.size})</span>
          </div>
          <div class="node-list">
            ${[...this.favoriteNodes].map(nodeType => this.renderNodeItem(nodeType, true)).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Recent Nodes -->
      ${this.recentNodes.length > 0 ? `
        <div class="recent-section">
          <div class="section-header">
            <span class="section-title">🕐 최근 사용 (${this.recentNodes.length})</span>
          </div>
          <div class="node-list">
            ${this.recentNodes.map(nodeType => this.renderNodeItem(nodeType, false)).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Separator -->
      <div class="section-separator"></div>
    `;
  },
  
  renderNodeItem(nodeType, showFavoriteBtn) {
    const nodeInfo = this.getNodeInfo(nodeType);
    if (!nodeInfo) return '';
    
    const isFavorite = this.favoriteNodes.has(nodeType);
    const tags = this.nodeTagMap[nodeType] || [];
    
    return `
      <div class="enhanced-node-item" draggable="true" data-node-id="${nodeType}">
        <div class="node-content">
          <i data-lucide="${nodeInfo.icon}" class="node-icon" style="width: 20px; height: 20px;"></i>
          <span class="node-name">${nodeInfo.name}</span>
        </div>
        <div class="node-actions">
          ${tags.length > 0 ? `
            <div class="node-tags">
              ${tags.slice(0, 2).map(tagId => {
                const tag = this.allTags.find(t => t.id === tagId);
                return tag ? `<span class="mini-tag" style="color: ${tag.color}">●</span>` : '';
              }).join('')}
            </div>
          ` : ''}
          <button class="favorite-btn ${isFavorite ? 'active' : ''}"
                  onclick="event.stopPropagation(); NodePanelEnhanced.toggleFavorite('${nodeType}')"
                  title="${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}">
            ${isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
    `;
  },
  
  attachEvents() {
    // Make enhanced node items draggable
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('enhanced-node-item')) {
        const nodeType = e.target.dataset.nodeId;
        e.dataTransfer.setData('nodeType', nodeType);
        e.target.style.opacity = '0.5';
      }
    });
    
    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('enhanced-node-item')) {
        e.target.style.opacity = '1';
      }
    });
    
    // Click to add node to center
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.enhanced-node-item');
      if (item && !e.target.classList.contains('favorite-btn')) {
        const nodeType = item.dataset.nodeId;
        
        // Add to recent
        this.addRecentNode(nodeType);
        
        // Add to canvas at center
        if (window.CanvasV3 && window.CanvasEngine) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          // Convert to world coordinates
          const worldX = (centerX - CanvasEngine.viewport.x) / CanvasEngine.viewport.zoom;
          const worldY = (centerY - CanvasEngine.viewport.y) / CanvasEngine.viewport.zoom;
          
          CanvasV3.createNodeFromDrop(nodeType, centerX, centerY);
          
          Toast.success('노드가 추가되었습니다', 2000);
        }
      }
    });
  }
};

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .enhanced-panel-section {
    margin-top: 16px;
    padding: 0 12px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .clear-tags-btn {
    background: none;
    border: none;
    color: #8b5cf6;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
  }
  
  .clear-tags-btn:hover {
    background: rgba(139, 92, 246, 0.1);
  }
  
  .tag-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  
  .tag-chip {
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
  }
  
  .tag-chip:hover {
    border-color: var(--tag-color);
    color: var(--tag-color);
    background: color-mix(in srgb, var(--tag-color) 5%, white);
  }
  
  .tag-chip.active {
    border-color: var(--tag-color);
    background: var(--tag-color);
    color: white;
  }
  
  .node-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  
  .enhanced-node-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    transition: all 0.2s ease;
  }
  
  .enhanced-node-item:hover {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.05);
    transform: translateX(4px);
  }
  
  .node-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }
  
  .node-icon {
    color: #8b5cf6;
  }
  
  .node-name {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
  }
  
  .node-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .node-tags {
    display: flex;
    gap: 4px;
  }
  
  .mini-tag {
    font-size: 10px;
  }
  
  .favorite-btn {
    background: none;
    border: none;
    color: #d1d5db;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .favorite-btn:hover {
    color: #f59e0b;
    transform: scale(1.2);
  }
  
  .favorite-btn.active {
    color: #f59e0b;
  }
  
  .section-separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    margin: 16px 0;
  }
  
  .favorites-section,
  .recent-section,
  .tag-filter-section {
    margin-bottom: 16px;
  }
  
  @media (max-width: 768px) {
    .tag-chips {
      gap: 4px;
    }
    
    .tag-chip {
      padding: 4px 8px;
      font-size: 11px;
    }
    
    .enhanced-node-item {
      padding: 8px 10px;
    }
    
    .node-name {
      font-size: 12px;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => NodePanelEnhanced.init(), 1000);
  });
} else {
  setTimeout(() => NodePanelEnhanced.init(), 1000);
}

console.log('✅ Enhanced Node Panel loaded');
