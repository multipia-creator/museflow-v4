/**
 * MuseFlow Unified Footer Component
 * Auto-loads version from version.json
 */

(function() {
  'use strict';

  // Default version (fallback)
  let currentVersion = 'V15.0';
  
  // Load version from version.json
  async function loadVersion() {
    try {
      const response = await fetch('/version.json');
      if (response.ok) {
        const data = await response.json();
        currentVersion = data.displayVersion || `V${data.version}`;
        updateFooterVersion();
      }
    } catch (error) {
      console.warn('Could not load version.json, using fallback version:', currentVersion);
    }
  }
  
  // Update footer version in DOM
  function updateFooterVersion() {
    const versionElements = document.querySelectorAll('.museflow-footer-version');
    versionElements.forEach(el => {
      el.textContent = currentVersion;
    });
  }
  
  // Create unified footer HTML
  function createFooterHTML() {
    return `
      <footer class="museflow-footer">
        <div class="museflow-footer-content">
          <div class="museflow-footer-logo">
            ✨ MuseFlow
          </div>
          <div class="museflow-footer-divider"></div>
          <div class="museflow-footer-text">
            Copyright © 2026, Imageroot
          </div>
          <div class="museflow-footer-divider"></div>
          <div class="museflow-footer-text">
            Made by Hyun Woo Nam Professor
          </div>
          <div class="museflow-footer-divider"></div>
          <div class="museflow-footer-version">
            ${currentVersion}
          </div>
        </div>
      </footer>
    `;
  }
  
  // Initialize footer
  function initFooter() {
    // Check if footer already exists
    const existingFooter = document.querySelector('.museflow-footer');
    if (existingFooter) {
      // Just update version
      updateFooterVersion();
      return;
    }
    
    // Create footer if auto-inject is enabled
    const autoInject = document.body.getAttribute('data-footer-auto') === 'true';
    if (autoInject) {
      document.body.insertAdjacentHTML('beforeend', createFooterHTML());
    }
  }
  
  // Load version and initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initFooter();
      loadVersion();
    });
  } else {
    initFooter();
    loadVersion();
  }
  
  // Export for manual use
  window.MuseFlowFooter = {
    init: initFooter,
    loadVersion: loadVersion,
    createHTML: createFooterHTML,
    getCurrentVersion: () => currentVersion
  };
})();
