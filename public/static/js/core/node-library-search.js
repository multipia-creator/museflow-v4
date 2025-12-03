/**
 * Node Library Search & Filter
 * Search and filter nodes in left panel
 */

const NodeLibrarySearch = {
  // Recent nodes storage key
  RECENT_NODES_KEY: 'museflow_recent_nodes',
  MAX_RECENT_NODES: 5,

  /**
   * Initialize search functionality
   */
  init() {
    console.log('🔍 Initializing Node Library Search...');
    
    // Wait for left panel to be available
    const waitForPanel = setInterval(() => {
      const leftPanel = document.querySelector('.left-panel');
      if (leftPanel) {
        clearInterval(waitForPanel);
        this.setupSearchUI();
        this.setupRecentNodes();
        console.log('✅ Node Library Search initialized');
      }
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(waitForPanel), 10000);
  },

  /**
   * Setup search UI
   */
  setupSearchUI() {
    const leftPanel = document.querySelector('.left-panel');
    if (!leftPanel) return;

    // Find node categories container
    const categoriesContainer = leftPanel.querySelector('[data-node-categories]') || 
                                 leftPanel.querySelector('.node-categories') ||
                                 leftPanel;

    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.id = 'node-search-container';
    searchContainer.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid var(--border-primary);
      background: var(--surface);
      position: sticky;
      top: 0;
      z-index: 10;
    `;

    searchContainer.innerHTML = `
      <div style="position: relative;">
        <input
          type="text"
          id="node-search-input"
          placeholder="노드 검색... (예: Gemini, Docs, Email)"
          style="
            width: 100%;
            padding: 12px 40px 12px 40px;
            border: 2px solid var(--border-primary);
            border-radius: var(--radius-md);
            font-size: 14px;
            color: var(--text-primary);
            background: var(--bg-primary);
            transition: all 200ms ease;
          "
        />
        <i class="fas fa-search" style="
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          font-size: 14px;
        "></i>
        <button
          id="node-search-clear"
          style="
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            color: var(--text-tertiary);
            border-radius: 50%;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 150ms ease;
          "
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div id="search-filters" style="
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      ">
        <button class="filter-btn active" data-filter="all" style="
          padding: 6px 12px;
          border: 1px solid var(--border-primary);
          background: var(--primary);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        ">
          전체
        </button>
        <button class="filter-btn" data-filter="ai" style="
          padding: 6px 12px;
          border: 1px solid var(--border-primary);
          background: var(--surface);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        ">
          AI
        </button>
        <button class="filter-btn" data-filter="workspace" style="
          padding: 6px 12px;
          border: 1px solid var(--border-primary);
          background: var(--surface);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        ">
          Workspace
        </button>
        <button class="filter-btn" data-filter="data" style="
          padding: 6px 12px;
          border: 1px solid var(--border-primary);
          background: var(--surface);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        ">
          Data
        </button>
      </div>
    `;

    // Insert at the beginning of left panel
    if (categoriesContainer.firstChild) {
      categoriesContainer.insertBefore(searchContainer, categoriesContainer.firstChild);
    } else {
      categoriesContainer.appendChild(searchContainer);
    }

    // Attach event listeners
    this.attachSearchListeners();
  },

  /**
   * Attach search event listeners
   */
  attachSearchListeners() {
    const searchInput = document.getElementById('node-search-input');
    const clearBtn = document.getElementById('node-search-clear');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!searchInput) return;

    // Search input
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      // Show/hide clear button
      if (clearBtn) {
        clearBtn.style.display = query ? 'flex' : 'none';
      }

      this.filterNodes(query, this.getCurrentFilter());
    });

    // Focus style
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = 'var(--primary)';
      searchInput.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
    });

    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = 'var(--border-primary)';
      searchInput.style.boxShadow = 'none';
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        this.filterNodes('', this.getCurrentFilter());
        searchInput.focus();
      });

      clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = 'var(--bg-hover)';
      });

      clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = 'transparent';
      });
    }

    // Filter buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'var(--surface)';
          b.style.color = 'var(--text-secondary)';
        });

        // Add active to clicked
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';

        // Apply filter
        const filter = btn.getAttribute('data-filter');
        const query = searchInput.value.trim();
        this.filterNodes(query, filter);
      });

      // Hover effects
      btn.addEventListener('mouseenter', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = 'var(--bg-hover)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = 'var(--surface)';
        }
      });
    });
  },

  /**
   * Filter nodes based on query and category
   */
  filterNodes(query, category) {
    const nodeItems = document.querySelectorAll('.node-item');
    
    nodeItems.forEach(item => {
      const nodeName = (item.querySelector('.node-item-name')?.textContent || '').toLowerCase();
      const nodeDesc = (item.querySelector('.node-item-description')?.textContent || '').toLowerCase();
      const nodeCategory = item.getAttribute('data-category') || '';
      
      const queryLower = query.toLowerCase();
      
      const matchesQuery = !query || nodeName.includes(queryLower) || nodeDesc.includes(queryLower);
      const matchesCategory = category === 'all' || nodeCategory === category;
      
      if (matchesQuery && matchesCategory) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    // Update "no results" message
    this.updateNoResultsMessage(query, category);
  },

  /**
   * Get current active filter
   */
  getCurrentFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
  },

  /**
   * Update no results message
   */
  updateNoResultsMessage(query, category) {
    const leftPanel = document.querySelector('.left-panel');
    if (!leftPanel) return;

    // Remove existing message
    const existing = leftPanel.querySelector('#no-results-message');
    if (existing) {
      existing.remove();
    }

    // Check if any nodes are visible
    const visibleNodes = Array.from(document.querySelectorAll('.node-item')).filter(
      item => item.style.display !== 'none'
    );

    if (visibleNodes.length === 0) {
      const message = document.createElement('div');
      message.id = 'no-results-message';
      message.style.cssText = `
        padding: 40px 20px;
        text-align: center;
        color: var(--text-tertiary);
      `;

      message.innerHTML = `
        <i class="fas fa-search" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
        <p style="font-size: 14px; margin: 0;">
          "${query}" 검색 결과가 없습니다
        </p>
      `;

      leftPanel.appendChild(message);
    }
  },

  /**
   * Setup recent nodes section
   */
  setupRecentNodes() {
    const leftPanel = document.querySelector('.left-panel');
    if (!leftPanel) return;

    // Create recent nodes section
    const recentSection = document.createElement('div');
    recentSection.id = 'recent-nodes-section';
    recentSection.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid var(--border-primary);
      background: var(--bg-secondary);
    `;

    recentSection.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
      ">
        <i class="fas fa-clock"></i>
        <span>최근 사용한 노드</span>
      </div>
      <div id="recent-nodes-list" style="
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <!-- Recent nodes will be inserted here -->
      </div>
    `;

    // Insert after search container
    const searchContainer = document.getElementById('node-search-container');
    if (searchContainer && searchContainer.nextSibling) {
      searchContainer.parentNode.insertBefore(recentSection, searchContainer.nextSibling);
    } else if (searchContainer) {
      searchContainer.parentNode.appendChild(recentSection);
    }

    // Load and display recent nodes
    this.updateRecentNodesList();
  },

  /**
   * Add node to recent list
   */
  addToRecentNodes(nodeType, nodeName) {
    const recentNodes = this.getRecentNodes();
    
    // Remove if already exists
    const filtered = recentNodes.filter(n => n.type !== nodeType);
    
    // Add to beginning
    filtered.unshift({ type: nodeType, name: nodeName, timestamp: Date.now() });
    
    // Keep only MAX_RECENT_NODES
    const trimmed = filtered.slice(0, this.MAX_RECENT_NODES);
    
    // Save to localStorage
    try {
      localStorage.setItem(this.RECENT_NODES_KEY, JSON.stringify(trimmed));
      this.updateRecentNodesList();
    } catch (error) {
      console.warn('Failed to save recent nodes:', error);
    }
  },

  /**
   * Get recent nodes from localStorage
   */
  getRecentNodes() {
    try {
      const stored = localStorage.getItem(this.RECENT_NODES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load recent nodes:', error);
      return [];
    }
  },

  /**
   * Update recent nodes list UI
   */
  updateRecentNodesList() {
    const container = document.getElementById('recent-nodes-list');
    if (!container) return;

    const recentNodes = this.getRecentNodes();

    if (recentNodes.length === 0) {
      container.innerHTML = `
        <div style="
          padding: 12px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 12px;
        ">
          아직 사용한 노드가 없습니다
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    recentNodes.forEach(node => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px 12px;
        background: var(--surface);
        border-radius: var(--radius-sm);
        font-size: 13px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 150ms ease;
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      item.innerHTML = `
        <i class="fas fa-cube" style="color: var(--primary); font-size: 12px;"></i>
        <span>${node.name}</span>
      `;

      item.addEventListener('mouseenter', () => {
        item.style.background = 'var(--bg-hover)';
        item.style.transform = 'translateX(4px)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = 'var(--surface)';
        item.style.transform = 'translateX(0)';
      });

      // TODO: Add node on click
      item.addEventListener('click', () => {
        console.log('Add recent node:', node.type);
        // Trigger node add event
      });

      container.appendChild(item);
    });
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    NodeLibrarySearch.init();
  });
} else {
  NodeLibrarySearch.init();
}

// Export globally
window.NodeLibrarySearch = NodeLibrarySearch;
