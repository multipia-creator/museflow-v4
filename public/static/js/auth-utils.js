/**
 * Auth Utilities
 * 통일된 토큰 관리 및 인증 유틸리티
 */

// ============================================================
// 상수
// ============================================================
const TOKEN_KEY = 'museflow_auth_token'; // 단일 키 사용
const API_BASE = window.location.origin;

// ============================================================
// 토큰 관리
// ============================================================

/**
 * 인증 토큰 가져오기
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 인증 토큰 저장
 */
export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 인증 토큰 제거
 */
export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  
  // 레거시 키도 제거 (기존 사용자 대응)
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_session');
}

/**
 * 로그인 여부 확인
 */
export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // JWT 디코딩 (만료 확인)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // 만료 시간 확인 (exp는 초 단위)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // 만료된 토큰 제거
      removeAuthToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    removeAuthToken();
    return false;
  }
}

/**
 * 현재 사용자 정보 가져오기 (JWT에서 디코딩)
 */
export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      exp: payload.exp
    };
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return null;
  }
}

// ============================================================
// API 호출 유틸리티
// ============================================================

/**
 * 인증 헤더를 포함한 API 호출
 */
export async function apiCall(url, options = {}) {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // 401 Unauthorized - 토큰 만료 또는 무효
    if (response.status === 401) {
      removeAuthToken();
      
      // 로그인 페이지가 아니면 리다이렉트
      if (!window.location.pathname.includes('/login')) {
        alert('로그인이 필요합니다');
        window.location.href = '/login.html';
      }
      
      throw new Error('인증이 필요합니다');
    }
    
    // 403 Forbidden - 권한 없음
    if (response.status === 403) {
      alert('이 작업을 수행할 권한이 없습니다');
      throw new Error('권한이 없습니다');
    }
    
    return response;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
}

/**
 * GET 요청
 */
export async function apiGet(url) {
  const response = await apiCall(url, { method: 'GET' });
  return response.json();
}

/**
 * POST 요청
 */
export async function apiPost(url, data) {
  const response = await apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * PUT 요청
 */
export async function apiPut(url, data) {
  const response = await apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * DELETE 요청
 */
export async function apiDelete(url) {
  const response = await apiCall(url, { method: 'DELETE' });
  return response.json();
}

// ============================================================
// 로그아웃
// ============================================================

/**
 * 로그아웃
 */
export function logout() {
  removeAuthToken();
  window.location.href = '/login.html';
}

// ============================================================
// 페이지 보호 (로그인 필요)
// ============================================================

/**
 * 보호된 페이지에서 호출 (로그인 안 되어있으면 리다이렉트)
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    alert('로그인이 필요합니다');
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ============================================================
// 레거시 지원 (기존 코드와의 호환성)
// ============================================================

// 레거시 키로 저장된 토큰을 새 키로 마이그레이션
(function migrateLegacyTokens() {
  const legacyKeys = ['authToken', 'auth_token', 'user_session'];
  
  for (const key of legacyKeys) {
    const token = localStorage.getItem(key);
    if (token && !getAuthToken()) {
      console.log(`🔄 레거시 토큰 마이그레이션: ${key} → ${TOKEN_KEY}`);
      setAuthToken(token);
      localStorage.removeItem(key);
      break;
    }
  }
})();

// ============================================================
// 전역 객체로 노출 (기존 코드 호환)
// ============================================================
window.AuthUtils = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getCurrentUser,
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  logout,
  requireAuth
};
