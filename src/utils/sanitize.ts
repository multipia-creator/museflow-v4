/**
 * XSS Prevention Utility using DOMPurify
 * 
 * This module provides safe HTML sanitization to prevent XSS attacks.
 * All user-generated content should be sanitized before rendering.
 * 
 * @module sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Default DOMPurify configuration for general HTML content
 */
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true
};

/**
 * Strict configuration for minimal HTML (only text formatting)
 */
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false
};

/**
 * Rich content configuration (allows more tags for content editors)
 */
const RICH_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title'],
  ALLOW_DATA_ATTR: true,
  SAFE_FOR_TEMPLATES: true
};

/**
 * Sanitize HTML content with default configuration
 * 
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script><p>Safe content</p>';
 * const safe = sanitizeHtml(userInput);
 * // Result: '<p>Safe content</p>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, DEFAULT_CONFIG);
}

/**
 * Sanitize HTML with strict configuration (minimal tags)
 * 
 * @param dirty - Untrusted HTML string
 * @returns Strictly sanitized HTML
 * 
 * @example
 * ```typescript
 * const userInput = '<a href="evil.com">Click</a><b>Bold</b>';
 * const safe = sanitizeHtmlStrict(userInput);
 * // Result: '<b>Bold</b>'
 * ```
 */
export function sanitizeHtmlStrict(dirty: string): string {
  return DOMPurify.sanitize(dirty, STRICT_CONFIG);
}

/**
 * Sanitize HTML with rich content configuration
 * 
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML with rich formatting preserved
 * 
 * @example
 * ```typescript
 * const userInput = '<img src="x" onerror="alert(1)"><img src="safe.jpg">';
 * const safe = sanitizeHtmlRich(userInput);
 * // Result: '<img src="safe.jpg">'
 * ```
 */
export function sanitizeHtmlRich(dirty: string): string {
  return DOMPurify.sanitize(dirty, RICH_CONFIG);
}

/**
 * Strip all HTML tags and return plain text
 * 
 * @param dirty - Untrusted HTML string
 * @returns Plain text with all HTML removed
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert(1)</script><p>Hello <b>World</b></p>';
 * const safe = stripHtml(userInput);
 * // Result: 'Hello World'
 * ```
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * 
 * @param url - Untrusted URL string
 * @returns Sanitized URL or empty string if unsafe
 * 
 * @example
 * ```typescript
 * sanitizeUrl('javascript:alert(1)'); // Returns: ''
 * sanitizeUrl('https://example.com'); // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }
  
  // Allow only http, https, mailto, tel
  const allowedProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  const hasAllowedProtocol = allowedProtocols.some(p => trimmed.startsWith(p));
  
  // If no protocol, assume relative URL (safe)
  if (!trimmed.includes(':')) {
    return url;
  }
  
  return hasAllowedProtocol ? url : '';
}

/**
 * Sanitize HTML attributes (for dynamic attribute setting)
 * 
 * @param attrValue - Untrusted attribute value
 * @returns Sanitized attribute value
 * 
 * @example
 * ```typescript
 * const userInput = '" onload="alert(1)';
 * const safe = sanitizeAttribute(userInput);
 * // Returns: escaped version without event handlers
 * ```
 */
export function sanitizeAttribute(attrValue: string): string {
  // Remove potential XSS vectors in attributes
  return attrValue
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, ''); // Remove data protocol
}

/**
 * Safe innerHTML replacement for DOM elements
 * 
 * @param element - Target DOM element
 * @param html - HTML content to set
 * @param config - DOMPurify configuration (default, strict, or rich)
 * 
 * @example
 * ```typescript
 * const div = document.getElementById('content');
 * setInnerHTMLSafe(div, userGeneratedHtml);
 * ```
 */
export function setInnerHTMLSafe(
  element: HTMLElement,
  html: string,
  config: 'default' | 'strict' | 'rich' = 'default'
): void {
  let sanitized: string;
  
  switch (config) {
    case 'strict':
      sanitized = sanitizeHtmlStrict(html);
      break;
    case 'rich':
      sanitized = sanitizeHtmlRich(html);
      break;
    default:
      sanitized = sanitizeHtml(html);
  }
  
  element.innerHTML = sanitized;
}

/**
 * Sanitize JSON data from untrusted sources
 * 
 * @param jsonString - Untrusted JSON string
 * @returns Parsed and sanitized object, or null if invalid
 * 
 * @example
 * ```typescript
 * const userJson = '{"name":"<script>alert(1)</script>"}';
 * const safe = sanitizeJson(userJson);
 * // Result: { name: '' } (script removed)
 * ```
 */
export function sanitizeJson<T = any>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
}

/**
 * Recursively sanitize all string values in an object
 * 
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return stripHtml(obj) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as any;
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  return emailRegex.test(trimmed) ? trimmed : '';
}

/**
 * Sanitize filename for safe file operations
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove directory traversal
    .substring(0, 255); // Limit length
}
