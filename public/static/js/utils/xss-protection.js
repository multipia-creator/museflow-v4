/**
 * Client-Side XSS Protection Utility
 * 
 * This module provides XSS protection for client-side JavaScript.
 * Use DOMPurify CDN for production: https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js
 * 
 * @module xss-protection
 */

/**
 * Check if DOMPurify is loaded
 * @returns {boolean}
 */
function isDOMPurifyLoaded() {
  return typeof window.DOMPurify !== 'undefined';
}

/**
 * Load DOMPurify from CDN if not already loaded
 * @returns {Promise<void>}
 */
async function loadDOMPurify() {
  if (isDOMPurifyLoaded()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js';
    script.integrity = 'sha384-4H2a3RkQiFG8qjP6FKpY5xKqLLN/L6M1n0Qzk3Q7vW3n3x7aB8rE8oK5rV8wJ5nB';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Sanitize HTML content (async - loads DOMPurify if needed)
 * @param {string} dirty - Untrusted HTML
 * @returns {Promise<string>} - Sanitized HTML
 */
async function sanitizeHtmlAsync(dirty) {
  await loadDOMPurify();
  return window.DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
}

/**
 * Sanitize HTML content (sync - requires DOMPurify to be loaded)
 * @param {string} dirty - Untrusted HTML
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtml(dirty) {
  if (!isDOMPurifyLoaded()) {
    console.warn('⚠️ DOMPurify not loaded. Stripping all HTML.');
    return stripHtml(dirty);
  }
  
  return window.DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
}

/**
 * Strip all HTML tags (fallback when DOMPurify not available)
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
function stripHtml(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL or empty string
 */
function sanitizeUrl(url) {
  if (!url) return '';
  
  const trimmed = url.trim().toLowerCase();
  const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
  
  for (const protocol of dangerous) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }
  
  return url;
}

/**
 * Safe innerHTML setter
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content
 */
function setInnerHTMLSafe(element, html) {
  if (!element) return;
  
  if (isDOMPurifyLoaded()) {
    element.innerHTML = window.DOMPurify.sanitize(html);
  } else {
    // Fallback: use textContent for safety
    element.textContent = stripHtml(html);
  }
}

/**
 * Safe setAttribute for potentially dangerous attributes
 * @param {HTMLElement} element - Target element
 * @param {string} attr - Attribute name
 * @param {string} value - Attribute value
 */
function setAttributeSafe(element, attr, value) {
  if (!element || !attr) return;
  
  // Sanitize URL attributes
  if (['href', 'src', 'action', 'formaction', 'data'].includes(attr.toLowerCase())) {
    value = sanitizeUrl(value);
  }
  
  // Block event handler attributes
  if (attr.toLowerCase().startsWith('on')) {
    console.warn(`⚠️ Blocked event handler attribute: ${attr}`);
    return;
  }
  
  element.setAttribute(attr, value);
}

/**
 * Create safe HTML element with sanitized content
 * @param {string} tag - Tag name
 * @param {object} attributes - Attributes object
 * @param {string} content - HTML content
 * @returns {HTMLElement}
 */
function createSafeElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // Set attributes safely
  for (const [key, value] of Object.entries(attributes)) {
    setAttributeSafe(element, key, value);
  }
  
  // Set content safely
  if (content) {
    setInnerHTMLSafe(element, content);
  }
  
  return element;
}

/**
 * Escape HTML for safe display in text nodes
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Initialize XSS protection by loading DOMPurify
 */
async function initXSSProtection() {
  try {
    await loadDOMPurify();
    console.log('✅ XSS Protection initialized (DOMPurify loaded)');
  } catch (error) {
    console.error('❌ Failed to load DOMPurify:', error);
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initXSSProtection);
} else {
  initXSSProtection();
}

// Export for use in other modules
window.XSSProtection = {
  sanitizeHtml,
  sanitizeHtmlAsync,
  sanitizeUrl,
  stripHtml,
  setInnerHTMLSafe,
  setAttributeSafe,
  createSafeElement,
  escapeHtml,
  isDOMPurifyLoaded
};
