/**
 * Standardized Error Codes for MuseFlow V4
 * 
 * Format: CATEGORY_NUMBER
 * - AUTH_xxx: Authentication errors
 * - VAL_xxx: Validation errors
 * - DB_xxx: Database errors
 * - OAUTH_xxx: OAuth errors
 * - RATE_xxx: Rate limiting errors
 * - SYS_xxx: System errors
 */

export enum ErrorCode {
  // Authentication (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  AUTH_RATE_LIMIT = 'AUTH_004',
  AUTH_EMAIL_EXISTS = 'AUTH_005',
  AUTH_USER_NOT_FOUND = 'AUTH_006',
  AUTH_PASSWORD_WEAK = 'AUTH_007',
  AUTH_SESSION_EXPIRED = 'AUTH_008',
  
  // Validation (VAL_xxx)
  VAL_INVALID_INPUT = 'VAL_001',
  VAL_MISSING_FIELD = 'VAL_002',
  VAL_INVALID_EMAIL = 'VAL_003',
  VAL_INVALID_FORMAT = 'VAL_004',
  VAL_OUT_OF_RANGE = 'VAL_005',
  
  // Database (DB_xxx)
  DB_QUERY_FAILED = 'DB_001',
  DB_CONNECTION_FAILED = 'DB_002',
  DB_DUPLICATE_KEY = 'DB_003',
  DB_CONSTRAINT_VIOLATION = 'DB_004',
  DB_MIGRATION_FAILED = 'DB_005',
  
  // OAuth (OAUTH_xxx)
  OAUTH_PROVIDER_ERROR = 'OAUTH_001',
  OAUTH_STATE_MISMATCH = 'OAUTH_002',
  OAUTH_CODE_INVALID = 'OAUTH_003',
  OAUTH_TOKEN_EXCHANGE_FAILED = 'OAUTH_004',
  OAUTH_USER_INFO_FAILED = 'OAUTH_005',
  
  // Rate Limiting (RATE_xxx)
  RATE_TOO_MANY_REQUESTS = 'RATE_001',
  RATE_QUOTA_EXCEEDED = 'RATE_002',
  
  // System (SYS_xxx)
  SYS_INTERNAL_ERROR = 'SYS_001',
  SYS_SERVICE_UNAVAILABLE = 'SYS_002',
  SYS_TIMEOUT = 'SYS_003',
  SYS_NOT_IMPLEMENTED = 'SYS_004',
  
  // Project (PROJ_xxx)
  PROJ_NOT_FOUND = 'PROJ_001',
  PROJ_ACCESS_DENIED = 'PROJ_002',
  PROJ_INVALID_STATUS = 'PROJ_003',
  
  // Resource (RES_xxx)
  RES_NOT_FOUND = 'RES_001',
  RES_ALREADY_EXISTS = 'RES_002',
  RES_ACCESS_DENIED = 'RES_003',
}

/**
 * Error message templates
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ErrorCode.AUTH_RATE_LIMIT]: 'Too many login attempts. Please try again in 15 minutes.',
  [ErrorCode.AUTH_EMAIL_EXISTS]: 'An account with this email already exists',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'User not found',
  [ErrorCode.AUTH_PASSWORD_WEAK]: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ErrorCode.VAL_INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.VAL_MISSING_FIELD]: 'Required field is missing',
  [ErrorCode.VAL_INVALID_EMAIL]: 'Invalid email format',
  [ErrorCode.VAL_INVALID_FORMAT]: 'Invalid data format',
  [ErrorCode.VAL_OUT_OF_RANGE]: 'Value is out of acceptable range',
  
  [ErrorCode.DB_QUERY_FAILED]: 'Database query failed',
  [ErrorCode.DB_CONNECTION_FAILED]: 'Database connection failed',
  [ErrorCode.DB_DUPLICATE_KEY]: 'Record with this key already exists',
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'Database constraint violation',
  [ErrorCode.DB_MIGRATION_FAILED]: 'Database migration failed',
  
  [ErrorCode.OAUTH_PROVIDER_ERROR]: 'OAuth provider returned an error',
  [ErrorCode.OAUTH_STATE_MISMATCH]: 'OAuth state mismatch. Possible CSRF attack.',
  [ErrorCode.OAUTH_CODE_INVALID]: 'Invalid OAuth authorization code',
  [ErrorCode.OAUTH_TOKEN_EXCHANGE_FAILED]: 'Failed to exchange OAuth code for token',
  [ErrorCode.OAUTH_USER_INFO_FAILED]: 'Failed to fetch user info from OAuth provider',
  
  [ErrorCode.RATE_TOO_MANY_REQUESTS]: 'Too many requests. Please slow down.',
  [ErrorCode.RATE_QUOTA_EXCEEDED]: 'API quota exceeded',
  
  [ErrorCode.SYS_INTERNAL_ERROR]: 'Internal server error. Please try again later.',
  [ErrorCode.SYS_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCode.SYS_TIMEOUT]: 'Request timeout',
  [ErrorCode.SYS_NOT_IMPLEMENTED]: 'Feature not implemented yet',
  
  [ErrorCode.PROJ_NOT_FOUND]: 'Project not found',
  [ErrorCode.PROJ_ACCESS_DENIED]: 'You do not have permission to access this project',
  [ErrorCode.PROJ_INVALID_STATUS]: 'Invalid project status',
  
  [ErrorCode.RES_NOT_FOUND]: 'Resource not found',
  [ErrorCode.RES_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCode.RES_ACCESS_DENIED]: 'Access denied to this resource',
};

/**
 * HTTP status codes for each error code
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  [ErrorCode.AUTH_RATE_LIMIT]: 429,
  [ErrorCode.AUTH_EMAIL_EXISTS]: 409,
  [ErrorCode.AUTH_USER_NOT_FOUND]: 404,
  [ErrorCode.AUTH_PASSWORD_WEAK]: 400,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  
  [ErrorCode.VAL_INVALID_INPUT]: 400,
  [ErrorCode.VAL_MISSING_FIELD]: 400,
  [ErrorCode.VAL_INVALID_EMAIL]: 400,
  [ErrorCode.VAL_INVALID_FORMAT]: 400,
  [ErrorCode.VAL_OUT_OF_RANGE]: 400,
  
  [ErrorCode.DB_QUERY_FAILED]: 500,
  [ErrorCode.DB_CONNECTION_FAILED]: 503,
  [ErrorCode.DB_DUPLICATE_KEY]: 409,
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: 400,
  [ErrorCode.DB_MIGRATION_FAILED]: 500,
  
  [ErrorCode.OAUTH_PROVIDER_ERROR]: 502,
  [ErrorCode.OAUTH_STATE_MISMATCH]: 400,
  [ErrorCode.OAUTH_CODE_INVALID]: 400,
  [ErrorCode.OAUTH_TOKEN_EXCHANGE_FAILED]: 502,
  [ErrorCode.OAUTH_USER_INFO_FAILED]: 502,
  
  [ErrorCode.RATE_TOO_MANY_REQUESTS]: 429,
  [ErrorCode.RATE_QUOTA_EXCEEDED]: 429,
  
  [ErrorCode.SYS_INTERNAL_ERROR]: 500,
  [ErrorCode.SYS_SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.SYS_TIMEOUT]: 504,
  [ErrorCode.SYS_NOT_IMPLEMENTED]: 501,
  
  [ErrorCode.PROJ_NOT_FOUND]: 404,
  [ErrorCode.PROJ_ACCESS_DENIED]: 403,
  [ErrorCode.PROJ_INVALID_STATUS]: 400,
  
  [ErrorCode.RES_NOT_FOUND]: 404,
  [ErrorCode.RES_ALREADY_EXISTS]: 409,
  [ErrorCode.RES_ACCESS_DENIED]: 403,
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public details?: Record<string, any>
  ) {
    super(ErrorMessages[code]);
    this.name = 'ApiError';
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get HTTP status code
   */
  getStatusCode(): number {
    return ErrorStatusCodes[this.code];
  }
}

/**
 * Create error response helper
 */
export function createErrorResponse(
  code: ErrorCode,
  details?: Record<string, any>
): { body: any; status: number } {
  const error = new ApiError(code, details);
  return {
    body: error.toJSON(),
    status: error.getStatusCode()
  };
}

/**
 * Validation error helper
 */
export function validationError(field: string, reason: string) {
  return new ApiError(ErrorCode.VAL_INVALID_INPUT, { field, reason });
}

/**
 * Database error helper
 */
export function databaseError(operation: string, error: any) {
  return new ApiError(ErrorCode.DB_QUERY_FAILED, {
    operation,
    error: error.message || String(error)
  });
}

/**
 * OAuth error helper
 */
export function oauthError(provider: string, error: any) {
  return new ApiError(ErrorCode.OAUTH_PROVIDER_ERROR, {
    provider,
    error: error.message || String(error)
  });
}
