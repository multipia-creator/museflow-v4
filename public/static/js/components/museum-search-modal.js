/**
 * Museum Search Modal
 * Search and browse artworks from National Museum of Korea
 */

const MuseumSearchModal = {
  isOpen: false,
  searchResults: [],
  selectedArtworks: [],
  
  /**
   * Show modal
   */
  show() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.render();
    this.attachEvents();
    
    // Focus on search input
    setTimeout(() => {
      const input = document.getElementById('museum-search-input');
      if (input) input.focus();
    }, 100);
    
    // Load initial data
    this.search('');
  },
  
  /**
   * Hide modal
   */
  hide() {
    const modal = document.getElementById('museum-search-modal');
    if (modal) {
      modal.remove();
    }
    this.isOpen = false;
    this.searchResults = [];
    this.selectedArtworks = [];
  },
  
  /**
   * Render modal
   */
  render() {
    const modalHTML = `
      <div id="museum-search-modal" 
           style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0, 0, 0, 0.5); z-index: 10000;
                  display: flex; align-items: center; justify-content: center;
                  animation: fadeIn 0.2s ease-out;">
        
        <div style="background: white; border-radius: 16px; 
                    width: 95%; height: 90%; max-width: 1200px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex; flex-direction: column;
                    animation: slideUp 0.3s ease-out;">
          
          <!-- Header -->
          <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">
                  🏛️ Museum Artwork Search
                </h2>
                <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">
                  National Museum of Korea Collection
                </p>
              </div>
              <button id="close-museum-modal" 
                      style="width: 32px; height: 32px; border: none; background: transparent;
                             border-radius: 8px; cursor: pointer; color: #6b7280;
                             font-size: 20px; display: flex; align-items: center;
                             justify-content: center;">
                ×
              </button>
            </div>
            
            <!-- Search Bar -->
            <div style="display: flex; gap: 8px;">
              <input id="museum-search-input" type="text" 
                     placeholder="Search artworks (e.g., celadon, painting, Buddha)..."
                     style="flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb;
                            border-radius: 8px; font-size: 14px;">
              <button id="museum-search-btn"
                      style="padding: 12px 24px; background: #3b82f6; color: white;
                             border: none; border-radius: 8px; font-size: 14px;
                             font-weight: 600; cursor: pointer;">
                🔍 Search
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div style="flex: 1; overflow-y: auto; padding: 24px;">
            <div id="museum-search-results" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
              <!-- Results will be rendered here -->
            </div>
            
            <div id="museum-loading" style="display: none; text-align: center; padding: 40px;">
              <div class="spinner" style="margin: 0 auto 16px; width: 32px; height: 32px;
                                         border: 3px solid #e5e7eb; border-top-color: #3b82f6;
                                         border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
              <p style="color: #6b7280; font-size: 14px;">Searching museum collection...</p>
            </div>
            
            <div id="museum-no-results" style="display: none; text-align: center; padding: 40px;">
              <p style="color: #6b7280; font-size: 16px; font-weight: 600;">No artworks found</p>
              <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">Try a different search term</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; flex-shrink: 0;
                      display: flex; gap: 12px; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px; color: #6b7280;">
              <span id="museum-selected-count">0</span> artwork(s) selected
            </div>
            <div style="display: flex; gap: 12px;">
              <button id="museum-cancel-btn"
                      style="padding: 10px 20px; border: 1px solid #e5e7eb;
                             background: white; border-radius: 8px; font-size: 14px;
                             font-weight: 600; color: #374151; cursor: pointer;">
                Cancel
              </button>
              <button id="museum-add-btn"
                      style="padding: 10px 24px; border: none; background: #3b82f6;
                             border-radius: 8px; font-size: 14px; font-weight: 600;
                             color: white; cursor: pointer;">
                Add Selected
              </button>
            </div>
          </div>
          
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .museum-artwork-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .museum-artwork-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        .museum-artwork-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .museum-artwork-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background: #f3f4f6;
        }
        
        .museum-artwork-info {
          padding: 16px;
        }
        
        .museum-artwork-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .museum-artwork-artist {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .museum-artwork-meta {
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    document.getElementById('close-museum-modal').addEventListener('click', () => {
      this.hide();
    });
    
    document.getElementById('museum-cancel-btn').addEventListener('click', () => {
      this.hide();
    });
    
    document.getElementById('museum-search-btn').addEventListener('click', () => {
      const query = document.getElementById('museum-search-input').value;
      this.search(query);
    });
    
    document.getElementById('museum-search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = document.getElementById('museum-search-input').value;
        this.search(query);
      }
    });
    
    document.getElementById('museum-add-btn').addEventListener('click', () => {
      this.addSelectedToWorkflow();
    });
    
    // Click outside to close
    document.getElementById('museum-search-modal').addEventListener('click', (e) => {
      if (e.target.id === 'museum-search-modal') {
        this.hide();
      }
    });
  },
  
  /**
   * Search artworks
   */
  async search(query) {
    if (!window.MuseFlowAPI) {
      Toast.error('API not available');
      return;
    }
    
    document.getElementById('museum-loading').style.display = 'block';
    document.getElementById('museum-search-results').style.display = 'none';
    document.getElementById('museum-no-results').style.display = 'none';
    
    try {
      const response = await window.MuseFlowAPI.request(`/api/museum/search?q=${encodeURIComponent(query)}&limit=20`);
      
      if (response.success) {
        this.searchResults = response.data.artworks || [];
        this.renderResults();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      Toast.error('Search failed: ' + error.message);
      this.searchResults = [];
      this.renderResults();
    }
    
    document.getElementById('museum-loading').style.display = 'none';
  },
  
  /**
   * Render search results
   */
  renderResults() {
    const container = document.getElementById('museum-search-results');
    const noResults = document.getElementById('museum-no-results');
    
    if (this.searchResults.length === 0) {
      container.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    container.style.display = 'grid';
    noResults.style.display = 'none';
    
    container.innerHTML = this.searchResults.map((artwork, index) => `
      <div class="museum-artwork-card" data-index="${index}">
        <img src="${artwork.thumbnailUrl || artwork.imageUrl || '/static/images/placeholder-artwork.png'}" 
             alt="${artwork.title}"
             class="museum-artwork-image"
             onerror="this.src='/static/images/placeholder-artwork.png'">
        <div class="museum-artwork-info">
          <div class="museum-artwork-title">${artwork.title}</div>
          <div class="museum-artwork-artist">${artwork.artist}</div>
          <div class="museum-artwork-meta">
            ${artwork.period} • ${artwork.category}
          </div>
        </div>
      </div>
    `).join('');
    
    // Attach click events
    container.querySelectorAll('.museum-artwork-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.toggleSelection(index);
        card.classList.toggle('selected');
        this.updateSelectedCount();
      });
    });
  },
  
  /**
   * Toggle artwork selection
   */
  toggleSelection(index) {
    const artwork = this.searchResults[index];
    const existingIndex = this.selectedArtworks.findIndex(a => a.id === artwork.id);
    
    if (existingIndex >= 0) {
      this.selectedArtworks.splice(existingIndex, 1);
    } else {
      this.selectedArtworks.push(artwork);
    }
  },
  
  /**
   * Update selected count
   */
  updateSelectedCount() {
    document.getElementById('museum-selected-count').textContent = this.selectedArtworks.length;
  },
  
  /**
   * Add selected artworks to workflow
   */
  addSelectedToWorkflow() {
    if (this.selectedArtworks.length === 0) {
      Toast.warning('Please select at least one artwork');
      return;
    }
    
    console.log('Adding artworks:', this.selectedArtworks);
    
    // TODO: Implement adding artworks to Canvas V2
    // This will be handled by Canvas V2 integration
    
    Toast.success(`Added ${this.selectedArtworks.length} artwork(s) to workflow`);
    this.hide();
  }
};
