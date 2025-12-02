/**
 * MuseFlow Canvas V5 - Lucide Icons Manager
 * Single initialization + Emoji fallback
 */

const LucideManager = {
  initialized: false,
  fallbackMode: false,
  
  // Emoji fallback map
  emojiMap: {
    'mouse-pointer': '👆',
    'hand': '✋',
    'git-branch': '🔀',
    'zoom-in': '🔍＋',
    'zoom-out': '🔍－',
    'maximize-2': '⛶',
    'undo': '↶',
    'redo': '↷',
    'sparkles': '✨',
    'search': '🔍',
    'star': '⭐',
    'clock': '🕐',
    'layers': '📚',
    'palette': '🎨',
    'graduation-cap': '🎓',
    'archive': '📦',
    'book-open': '📖',
    'briefcase': '💼',
    'users': '👥',
    'cpu': '💻',
    'chevron-down': '▼',
    'chevron-right': '▶',
    'x': '✕',
    'plus': '➕',
    'copy': '📋',
    'download': '⬇️',
    'upload': '⬆️',
    'image': '🖼️',
    'file-text': '📄',
    'message-circle': '💬',
    'share-2': '🔗',
    'save': '💾',
    'grid': '⊞',
    'inbox': '📥',
    'zap': '⚡'
  },
  
  /**
   * Initialize Lucide icons (single call)
   */
  init() {
    if (this.initialized) {
      console.log('[LucideManager] Already initialized');
      return;
    }
    
    if (!window.lucide) {
      console.warn('[LucideManager] ⚠️ Lucide not loaded, will use emoji fallback');
      this.fallbackMode = true;
      this.applyFallback();
      return;
    }
    
    try {
      window.lucide.createIcons();
      this.initialized = true;
      console.log('[LucideManager] ✅ Lucide icons initialized');
      
      // Verify icons rendered
      setTimeout(() => this.verifyIcons(), 1000);
    } catch (error) {
      console.error('[LucideManager] ❌ Lucide init failed:', error);
      this.fallbackMode = true;
      this.applyFallback();
    }
  },
  
  /**
   * Refresh icons (for dynamically added elements)
   */
  refresh() {
    if (this.fallbackMode) {
      this.applyFallback();
      return;
    }
    
    if (!window.lucide) {
      console.warn('[LucideManager] Lucide not available');
      return;
    }
    
    try {
      window.lucide.createIcons();
    } catch (error) {
      console.error('[LucideManager] Refresh failed:', error);
      this.fallbackMode = true;
      this.applyFallback();
    }
  },
  
  /**
   * Verify icons actually rendered
   */
  verifyIcons() {
    const lucideIcons = document.querySelectorAll('i[data-lucide]');
    const renderedIcons = document.querySelectorAll('i[data-lucide] svg');
    
    console.log(`[LucideManager] Icons: ${lucideIcons.length} total, ${renderedIcons.length} rendered`);
    
    // If less than 50% rendered, use fallback
    if (lucideIcons.length > 0 && renderedIcons.length < lucideIcons.length * 0.5) {
      console.warn('[LucideManager] ⚠️ Less than 50% icons rendered, switching to emoji fallback');
      this.fallbackMode = true;
      this.applyFallback();
    }
  },
  
  /**
   * Apply emoji fallback for all icons
   */
  applyFallback() {
    const icons = document.querySelectorAll('i[data-lucide]');
    let count = 0;
    
    icons.forEach(icon => {
      // Skip if already has SVG
      if (icon.querySelector('svg')) return;
      
      const iconName = icon.getAttribute('data-lucide');
      const emoji = this.emojiMap[iconName];
      
      if (emoji) {
        icon.textContent = emoji;
        icon.style.fontSize = '18px';
        icon.style.lineHeight = '1';
        icon.style.display = 'inline-block';
        count++;
      } else {
        // Fallback for unknown icons
        icon.textContent = '●';
        icon.style.fontSize = '14px';
      }
    });
    
    if (count > 0) {
      console.log(`[LucideManager] ✅ Applied emoji fallback to ${count} icons`);
    }
  },
  
  /**
   * Safe icon creation for dynamic elements
   */
  createIcon(iconName, size = 18) {
    if (this.fallbackMode || !window.lucide) {
      const emoji = this.emojiMap[iconName] || '●';
      return `<span style="font-size: ${size}px; line-height: 1;">${emoji}</span>`;
    }
    
    return `<i data-lucide="${iconName}" style="width: ${size}px; height: ${size}px;"></i>`;
  }
};

// Auto-initialize when Lucide loads
if (window.lucide) {
  LucideManager.init();
} else {
  // Wait for Lucide to load
  const checkLucide = setInterval(() => {
    if (window.lucide) {
      clearInterval(checkLucide);
      LucideManager.init();
    }
  }, 100);
  
  // Timeout after 3 seconds
  setTimeout(() => {
    clearInterval(checkLucide);
    if (!window.lucide) {
      console.warn('[LucideManager] ⚠️ Lucide failed to load, using emoji fallback');
      LucideManager.fallbackMode = true;
      LucideManager.applyFallback();
    }
  }, 3000);
}

// Global access
window.LucideManager = LucideManager;
