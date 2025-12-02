/**
 * MuseFlow Canvas V4 - Advanced Floating Toolbar
 * Figma-Style Tool Groups + Shortcuts + Zoom Controls
 */

const FloatingToolbarAdvanced = {
  currentTool: 'select',
  
  init() {
    console.log('[FloatingToolbarAdvanced] Initializing advanced toolbar...');
    
    // Replace existing toolbar
    this.replaceToolbar();
    
    // Attach keyboard shortcuts
    this.attachKeyboardShortcuts();
    
    console.log('[FloatingToolbarAdvanced] ✅ Advanced toolbar ready');
  },
  
  replaceToolbar() {
    const existing = document.querySelector('.floating-toolbar');
    if (!existing) return;
    
    existing.outerHTML = `
      <div class="floating-toolbar-advanced">
        <!-- Group 1: Core Tools -->
        <div class="tool-group">
          <button class="tool-btn-adv active" data-tool="select" title="Select (V)" onclick="FloatingToolbarAdvanced.selectTool('select')">
            <i data-lucide="mouse-pointer" style="width: 18px; height: 18px;"></i>
            <span class="shortcut-badge">V</span>
          </button>
          <button class="tool-btn-adv" data-tool="hand" title="Hand (H)" onclick="FloatingToolbarAdvanced.selectTool('hand')">
            <i data-lucide="hand" style="width: 18px; height: 18px;"></i>
            <span class="shortcut-badge">H</span>
          </button>
          <button class="tool-btn-adv" data-tool="connection" title="Connect (C)" onclick="FloatingToolbarAdvanced.selectTool('connection')">
            <i data-lucide="git-branch" style="width: 18px; height: 18px;"></i>
            <span class="shortcut-badge">C</span>
          </button>
          <button class="tool-btn-adv" data-tool="comment" title="Comment (M)" onclick="FloatingToolbarAdvanced.selectTool('comment')">
            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
            <span class="shortcut-badge">M</span>
          </button>
        </div>
        
        <!-- Separator -->
        <div class="tool-separator"></div>
        
        <!-- Group 2: Zoom Controls -->
        <div class="tool-group zoom-group">
          <button class="tool-btn-sm" onclick="CanvasEngine.zoomIn()" title="Zoom In (+)">
            <i data-lucide="zoom-in" style="width: 16px; height: 16px;"></i>
          </button>
          <span class="zoom-display" id="zoom-percentage-adv">100%</span>
          <button class="tool-btn-sm" onclick="CanvasEngine.zoomOut()" title="Zoom Out (-)">
            <i data-lucide="zoom-out" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="tool-btn-sm" onclick="CanvasEngine.fitToContent()" title="Fit (Shift+1)">
            <i data-lucide="maximize-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        
        <!-- Separator -->
        <div class="tool-separator"></div>
        
        <!-- Group 3: Actions -->
        <div class="tool-group">
          <button class="tool-btn-adv" onclick="CanvasV3.undo()" title="Undo (Cmd+Z)" id="undo-btn-adv">
            <i data-lucide="undo" style="width: 18px; height: 18px;"></i>
          </button>
          <button class="tool-btn-adv" onclick="CanvasV3.redo()" title="Redo (Cmd+Shift+Z)" id="redo-btn-adv">
            <i data-lucide="redo" style="width: 18px; height: 18px;"></i>
          </button>
          <button class="tool-btn-adv ai-highlight" title="AI Assist (Cmd+.)">
            <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    `;
    
    if (window.lucide) lucide.createIcons();
  },
  
  selectTool(toolName) {
    this.currentTool = toolName;
    
    // Update UI
    document.querySelectorAll('.tool-btn-adv').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`.tool-btn-adv[data-tool="${toolName}"]`);
    if (btn) {
      btn.classList.add('active');
    }
    
    // Update CanvasV3 tool
    if (window.CanvasV3) {
      CanvasV3.currentTool = toolName;
    }
  },
  
  updateZoomDisplay(zoom) {
    const display = document.getElementById('zoom-percentage-adv');
    if (display) {
      display.textContent = Math.round(zoom * 100) + '%';
    }
  },
  
  attachKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Tool shortcuts
      const shortcuts = {
        'v': 'select',
        'h': 'hand',
        'c': 'connection',
        'm': 'comment'
      };
      
      const tool = shortcuts[e.key.toLowerCase()];
      if (tool && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        this.selectTool(tool);
      }
      
      // Zoom shortcuts
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        CanvasEngine.zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        CanvasEngine.zoomOut();
      } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        CanvasEngine.resetZoom();
      } else if (e.key === '1' && e.shiftKey) {
        e.preventDefault();
        CanvasEngine.fitToContent();
      }
    });
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => FloatingToolbarAdvanced.init(), 2000);
  });
} else {
  setTimeout(() => FloatingToolbarAdvanced.init(), 2000);
}
