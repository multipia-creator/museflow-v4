/**
 * MuseFlow Canvas V3 - Enhanced Properties Panel
 * Phase 5: Properties Panel 고도화
 * 
 * Features:
 * - Rich input fields (Date, Color, File, Multi-select)
 * - AI-powered actions (Suggestions, Auto-fill)
 * - Edit history tracking
 */

const PropertiesPanelEnhanced = {
  currentNode: null,
  historyStack: [],
  
  /**
   * Initialize enhanced properties panel
   */
  init() {
    console.log('[PropertiesPanelEnhanced] Initializing enhanced properties panel...');
    
    // Listen to node selection events
    this.attachSelectionListener();
    
    // Render enhanced panel
    this.renderEnhancedPanel();
    
    console.log('[PropertiesPanelEnhanced] Enhanced properties panel ready');
  },
  
  /**
   * Attach selection listener
   */
  attachSelectionListener() {
    document.addEventListener('canvas-node-selected', (e) => {
      this.currentNode = e.detail.node;
      this.renderNodeProperties();
    });
  },
  
  /**
   * Render enhanced panel structure
   */
  renderEnhancedPanel() {
    const rightPanel = document.getElementById('right-panel');
    if (!rightPanel) return;
    
    // Find properties content
    let propertiesContent = rightPanel.querySelector('.properties-content');
    if (!propertiesContent) {
      propertiesContent = document.createElement('div');
      propertiesContent.className = 'properties-content';
      rightPanel.appendChild(propertiesContent);
    }
    
    // Add enhanced sections
    propertiesContent.innerHTML = `
      <div class="properties-header">
        <h3>노드 속성</h3>
        <button id="ai-suggest-btn" class="ai-action-btn" title="AI 제안">
          <i data-lucide="sparkles" style="width: 14px; height: 14px;"></i>
          AI 제안
        </button>
      </div>
      
      <div id="properties-fields" class="properties-fields">
        <div class="empty-state">
          <i data-lucide="mouse-pointer-click" style="width: 32px; height: 32px; opacity: 0.3;"></i>
          <p>노드를 선택하여 속성을 편집하세요</p>
        </div>
      </div>
      
      <div id="properties-history" class="properties-history" style="display: none;">
        <h4>편집 기록</h4>
        <div class="history-list"></div>
      </div>
    `;
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Attach AI suggest button
    const aiSuggestBtn = document.getElementById('ai-suggest-btn');
    if (aiSuggestBtn) {
      aiSuggestBtn.addEventListener('click', () => this.generateAISuggestions());
    }
  },
  
  /**
   * Render node properties
   */
  renderNodeProperties() {
    if (!this.currentNode) return;
    
    const fieldsContainer = document.getElementById('properties-fields');
    if (!fieldsContainer) return;
    
    // Rich fields based on node type
    const fields = this.getFieldsForNodeType(this.currentNode.type);
    
    fieldsContainer.innerHTML = fields.map(field => this.renderField(field)).join('');
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Attach field change listeners
    this.attachFieldListeners();
  },
  
  /**
   * Get fields for node type
   */
  getFieldsForNodeType(nodeType) {
    const commonFields = [
      { name: 'title', label: '제목', type: 'text', required: true },
      { name: 'description', label: '설명', type: 'textarea', rows: 3 }
    ];
    
    // Node-specific fields
    const typeFields = {
      'ex-01': [
        ...commonFields,
        { name: 'budget', label: '예산', type: 'number', unit: '원' },
        { name: 'startDate', label: '시작일', type: 'date' },
        { name: 'endDate', label: '종료일', type: 'date' },
        { name: 'priority', label: '우선순위', type: 'select', options: ['높음', '보통', '낮음'] }
      ],
      'ex-02': [
        ...commonFields,
        { name: 'totalBudget', label: '총 예산', type: 'number', unit: '원' },
        { name: 'categories', label: '예산 항목', type: 'multiselect', options: ['인건비', '재료비', '홍보비', '운영비'] }
      ],
      'co-01': [
        ...commonFields,
        { name: 'acquisitionDate', label: '취득일', type: 'date' },
        { name: 'condition', label: '상태', type: 'select', options: ['양호', '보통', '열악', '복원 필요'] },
        { name: 'images', label: '이미지', type: 'file', accept: 'image/*', multiple: true }
      ]
    };
    
    return typeFields[nodeType] || commonFields;
  },
  
  /**
   * Render individual field
   */
  renderField(field) {
    const value = this.currentNode.data?.[field.name] || '';
    
    switch (field.type) {
      case 'text':
        return `
          <div class="field-group">
            <label>${field.label}${field.required ? ' *' : ''}</label>
            <input type="text" name="${field.name}" value="${value}" ${field.required ? 'required' : ''} />
          </div>
        `;
      
      case 'textarea':
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <textarea name="${field.name}" rows="${field.rows || 3}">${value}</textarea>
          </div>
        `;
      
      case 'number':
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <div class="input-with-unit">
              <input type="number" name="${field.name}" value="${value}" />
              ${field.unit ? `<span class="unit">${field.unit}</span>` : ''}
            </div>
          </div>
        `;
      
      case 'date':
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <input type="date" name="${field.name}" value="${value}" />
          </div>
        `;
      
      case 'select':
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <select name="${field.name}">
              <option value="">선택하세요</option>
              ${field.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          </div>
        `;
      
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <div class="multiselect">
              ${field.options.map(opt => `
                <label class="checkbox-label">
                  <input type="checkbox" name="${field.name}[]" value="${opt}" ${selectedValues.includes(opt) ? 'checked' : ''} />
                  <span>${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      
      case 'file':
        return `
          <div class="field-group">
            <label>${field.label}</label>
            <input type="file" name="${field.name}" accept="${field.accept || '*'}" ${field.multiple ? 'multiple' : ''} />
          </div>
        `;
      
      default:
        return '';
    }
  },
  
  /**
   * Attach field change listeners
   */
  attachFieldListeners() {
    const fieldsContainer = document.getElementById('properties-fields');
    if (!fieldsContainer) return;
    
    const inputs = fieldsContainer.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleFieldChange(e.target);
      });
    });
  },
  
  /**
   * Handle field change
   */
  handleFieldChange(input) {
    if (!this.currentNode) return;
    
    const fieldName = input.name.replace('[]', '');
    let value;
    
    // Handle different input types
    if (input.type === 'checkbox') {
      // Multi-select checkboxes
      const checkboxes = document.querySelectorAll(`input[name="${input.name}"]:checked`);
      value = Array.from(checkboxes).map(cb => cb.value);
    } else if (input.type === 'file') {
      value = input.files;
    } else {
      value = input.value;
    }
    
    // Save to history
    this.saveToHistory(fieldName, this.currentNode.data?.[fieldName], value);
    
    // Update node data
    if (!this.currentNode.data) {
      this.currentNode.data = {};
    }
    this.currentNode.data[fieldName] = value;
    
    // Trigger save
    if (window.CanvasState && window.CanvasState.saveProject) {
      window.CanvasState.saveProject();
    }
  },
  
  /**
   * Save field change to history
   */
  saveToHistory(fieldName, oldValue, newValue) {
    this.historyStack.push({
      timestamp: new Date(),
      field: fieldName,
      oldValue,
      newValue
    });
    
    // Show history section
    const historySection = document.getElementById('properties-history');
    if (historySection) {
      historySection.style.display = 'block';
      this.renderHistory();
    }
  },
  
  /**
   * Render edit history
   */
  renderHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    const recentHistory = this.historyStack.slice(-5).reverse();
    
    historyList.innerHTML = recentHistory.map(entry => `
      <div class="history-entry">
        <div class="history-time">${this.formatTime(entry.timestamp)}</div>
        <div class="history-change">
          <strong>${entry.field}</strong>: 
          <span class="old-value">${entry.oldValue || '(비어있음)'}</span> → 
          <span class="new-value">${entry.newValue}</span>
        </div>
      </div>
    `).join('');
  },
  
  /**
   * Format timestamp
   */
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  },
  
  /**
   * Generate AI suggestions
   */
  async generateAISuggestions() {
    if (!this.currentNode) {
      this.showToast('노드를 먼저 선택하세요', 'warning');
      return;
    }
    
    // Show loading
    this.showToast('AI가 제안을 생성 중입니다...', 'info');
    
    // Simulate AI suggestion (replace with actual AI call)
    setTimeout(() => {
      const suggestions = this.getMockSuggestions();
      this.displaySuggestions(suggestions);
    }, 1500);
  },
  
  /**
   * Get mock AI suggestions
   */
  getMockSuggestions() {
    return {
      title: '2024년 봄 특별전: 한국 현대미술의 정수',
      description: '한국 현대미술의 주요 작품 50점을 선정하여 시대별, 주제별로 전시합니다.',
      budget: 50000000,
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      priority: '높음'
    };
  },
  
  /**
   * Display AI suggestions
   */
  displaySuggestions(suggestions) {
    const fieldsContainer = document.getElementById('properties-fields');
    if (!fieldsContainer) return;
    
    // Highlight suggested fields
    Object.keys(suggestions).forEach(fieldName => {
      const input = fieldsContainer.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.value = suggestions[fieldName];
        input.classList.add('ai-suggested');
        
        // Auto-save after 1s
        setTimeout(() => {
          input.classList.remove('ai-suggested');
          this.handleFieldChange(input);
        }, 1000);
      }
    });
    
    this.showToast('AI 제안이 적용되었습니다', 'success');
  },
  
  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    if (window.Toast) {
      window.Toast.show(message, type);
    } else {
      console.log(`[Toast] ${type}: ${message}`);
    }
  }
};

// Auto-initialize when Canvas V3 is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => PropertiesPanelEnhanced.init(), 1000);
  });
} else {
  setTimeout(() => PropertiesPanelEnhanced.init(), 1000);
}
