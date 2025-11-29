# MuseFlow V4 API Reference

**Base URL:** `https://museflow.pages.dev/api`  
**Version:** 4.0.0  
**Last Updated:** 2025-11-29

---

## 📋 **Table of Contents**

1. [Authentication](#authentication)
2. [OAuth](#oauth)
3. [Projects](#projects)
4. [Behaviors](#behaviors)
5. [Help System](#help-system)
6. [Error Codes](#error-codes)
7. [Rate Limits](#rate-limits)

---

## 🔐 **Authentication**

### **POST /api/auth/signup**
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-29T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid input (email format, weak password)
- `409` - Email already exists
- `429` - Rate limit exceeded
- `500` - Internal server error

**Rate Limit:** 5 requests per 15 minutes per IP

---

### **POST /api/auth/login**
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "profile_image": "https://...",
    "last_login": "2025-11-29T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

**Error Responses:**
- `401` - Invalid credentials
- `429` - Too many login attempts (5 per 15 min)
- `500` - Internal server error

**Rate Limit:** 5 requests per 15 minutes per email

---

### **GET /api/auth/me**
Get current user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "profile_image": "https://...",
    "oauth_provider": "google",
    "created_at": "2025-11-29T12:00:00.000Z",
    "last_login": "2025-11-29T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token
- `500` - Internal server error

---

### **PUT /api/auth/profile**
Update user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "profile_image": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "profile_image": "https://example.com/avatar.jpg",
    "updated_at": "2025-11-29T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `400` - Invalid input
- `500` - Internal server error

---

### **POST /api/auth/logout**
Invalidate user session.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔗 **OAuth**

### **GET /api/oauth/config**
Get OAuth provider configurations.

**Response (200 OK):**
```json
{
  "google": {
    "client_id": "123456789-abcdef.apps.googleusercontent.com",
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
    "scope": "openid email profile"
  },
  "naver": {
    "client_id": "YOUR_NAVER_CLIENT_ID",
    "auth_url": "https://nid.naver.com/oauth2.0/authorize",
    "scope": "email profile"
  },
  "kakao": {
    "client_id": "YOUR_KAKAO_CLIENT_ID",
    "auth_url": "https://kauth.kakao.com/oauth/authorize",
    "scope": "account_email profile_nickname"
  }
}
```

---

### **POST /api/oauth/exchange**
Exchange OAuth code for access token.

**Request Body:**
```json
{
  "provider": "google",
  "code": "4/0AbCD123...",
  "state": "random-csrf-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "ya29.a0AfB_by...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `400` - Invalid code or state
- `401` - CSRF state mismatch
- `500` - Provider API error

---

### **POST /api/oauth/login**
Complete OAuth login flow.

**Request Body:**
```json
{
  "provider": "google",
  "access_token": "ya29.a0AfB_by...",
  "state": "random-csrf-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe",
    "oauth_provider": "google",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "is_new_user": true
}
```

---

## 📁 **Projects**

### **GET /api/projects**
List all projects for authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `draft`, `active`, `completed`, `archived`
- `limit` (optional, default: 20): Maximum 100
- `offset` (optional, default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "title": "Ancient Egypt Exhibition",
      "description": "Major exhibition showcasing Egyptian artifacts",
      "status": "active",
      "workflow_data": {...},
      "created_at": "2025-11-29T12:00:00.000Z",
      "updated_at": "2025-11-29T12:00:00.000Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### **POST /api/projects**
Create a new project.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Renaissance Art Exhibition",
  "description": "Exploring Renaissance masterpieces",
  "workflow_data": {
    "nodes": [],
    "connections": []
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "project": {
    "id": 2,
    "title": "Renaissance Art Exhibition",
    "description": "Exploring Renaissance masterpieces",
    "status": "draft",
    "workflow_data": {...},
    "created_at": "2025-11-29T12:00:00.000Z",
    "updated_at": "2025-11-29T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid input (title required)
- `401` - Unauthorized
- `500` - Internal server error

---

### **GET /api/projects/:id**
Get project details by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "title": "Ancient Egypt Exhibition",
    "description": "Major exhibition showcasing Egyptian artifacts",
    "status": "active",
    "workflow_data": {
      "nodes": [...],
      "connections": [...]
    },
    "created_at": "2025-11-29T12:00:00.000Z",
    "updated_at": "2025-11-29T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Project not found
- `403` - Not authorized to access this project
- `401` - Unauthorized

---

### **PUT /api/projects/:id**
Update project.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed",
  "workflow_data": {...}
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "status": "completed",
    "updated_at": "2025-11-29T12:00:00.000Z"
  }
}
```

---

### **DELETE /api/projects/:id**
Delete project.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `404` - Project not found
- `403` - Not authorized
- `401` - Unauthorized

---

## 📊 **Behaviors**

### **POST /api/behaviors/track**
Track user behavior event.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "event_type": "page_view",
  "resource_type": "project",
  "resource_id": 1,
  "page_path": "/projects/1",
  "duration": 45,
  "metadata": {
    "scroll_depth": 80,
    "interactions": 5
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "behavior_id": 123
}
```

---

### **GET /api/behaviors/insights**
Get user insights.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "insights": [
    {
      "insight_type": "most_visited_pages",
      "insight_data": {
        "pages": [
          {"path": "/dashboard", "count": 42},
          {"path": "/projects", "count": 31}
        ]
      },
      "valid_until": "2025-11-30T12:00:00.000Z"
    }
  ]
}
```

---

## 🆘 **Help System**

### **POST /api/help/ai-assistant**
Query AI assistant.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "message": "How do I create an exhibition?",
  "conversation_id": "conv-123",
  "context": {
    "page": "/projects",
    "user_role": "curator"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "answer": "To create an exhibition, click the 'New Project' button...",
  "related_articles": [
    {
      "id": "art-001",
      "title": "Creating Your First Exhibition",
      "url": "/help-center.html#art-001"
    }
  ],
  "confidence": 0.92,
  "conversation_id": "conv-123"
}
```

---

## ⚠️ **Error Codes**

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_001` | Invalid credentials | Email or password incorrect |
| `AUTH_002` | Token expired | JWT token has expired |
| `AUTH_003` | Token invalid | Malformed or tampered JWT |
| `AUTH_004` | Rate limit exceeded | Too many requests |
| `VAL_001` | Invalid input | Request body validation failed |
| `DB_001` | Database error | Database query failed |
| `OAUTH_001` | Provider error | OAuth provider returned error |
| `OAUTH_002` | State mismatch | CSRF state validation failed |

**Error Response Format:**
```json
{
  "success": false,
  "error": "AUTH_001",
  "message": "Invalid credentials",
  "details": {
    "field": "password",
    "reason": "Incorrect password"
  },
  "timestamp": "2025-11-29T12:00:00.000Z"
}
```

---

## 🚦 **Rate Limits**

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/signup` | 5 | 15 min |
| `/api/auth/login` | 5 | 15 min |
| `/api/auth/*` | 30 | 15 min |
| `/api/projects/*` | 100 | 15 min |
| `/api/behaviors/*` | 200 | 15 min |
| `/api/help/*` | 50 | 15 min |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701266400
```

---

## 🔄 **Pagination**

All list endpoints support pagination:

**Query Parameters:**
- `limit`: Items per page (default: 20, max: 100)
- `offset`: Skip N items (default: 0)

**Response Metadata:**
```json
{
  "total": 156,
  "limit": 20,
  "offset": 40,
  "has_more": true
}
```

---

## 📝 **Versioning**

API version is specified in the base URL:
- Current: `/api` (v4.0.0)
- Deprecated: None

Breaking changes will introduce new versions: `/api/v2`

---

**Status:** ✅ Production Ready  
**Support:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for contact info
