/**
 * Security Utilities
 * - Password hashing with PBKDF2 (bcrypt-style)
 * - XSS protection via input sanitization
 * - CSRF token generation
 * - Rate limiting
 */

/**
 * Generate a random salt for password hashing
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password using PBKDF2 with salt
 * This is more secure than simple SHA-256
 * @param password - Plain text password
 * @param salt - Random salt (auto-generated if not provided)
 * @returns Promise<{hash: string, salt: string}>
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || generateSalt();
  
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(actualSalt),
      iterations: 100000, // Recommended minimum
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  const hash = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { hash, salt: actualSalt };
}

/**
 * Verify password against stored hash and salt
 * @param password - Plain text password to verify
 * @param storedHash - Stored password hash
 * @param salt - Salt used for hashing
 * @returns Promise<boolean>
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns {valid: boolean, message?: string}
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  // Optional: Add more strength requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return { valid: true };
}

/**
 * Generate CSRF token
 * @returns string
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Rate Limiting Store (in-memory)
 * In production, use Redis or Cloudflare KV
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check and update rate limit for an identifier (IP address or email)
 * @param identifier - Unique identifier (IP or email)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns {allowed: boolean, remaining: number, resetAt: number}
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    rateLimitStore.delete(identifier);
  }
  
  if (!entry || now > entry.resetAt) {
    // First attempt or expired window
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }
  
  // Within rate limit window
  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);
  
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt
  };
}

/**
 * Reset rate limit for an identifier (use after successful login)
 * @param identifier - Unique identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Generate secure JWT secret from environment or generate random
 * @param envSecret - Secret from environment variables
 * @returns string
 */
export function getJWTSecret(envSecret?: string): string {
  if (envSecret) return envSecret;
  
  // Fallback: generate random secret (not recommended for production)
  console.warn('JWT_SECRET not set, using random secret (not suitable for production)');
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
