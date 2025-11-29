# MuseFlow V4 Security Guide

## 🛡️ **Security Overview**

MuseFlow V4 implements enterprise-grade security across all layers.

---

## 🔒 **1. XSS Prevention**

### **Current Status**
- ⚠️ **115 XSS risks detected** in HTML files using `innerHTML`

### **Mitigation Strategy**

#### **Safe HTML Rendering:**
```javascript
// ❌ DANGEROUS - Never use innerHTML with user input
element.innerHTML = userInput;

// ✅ SAFE - Use textContent for plain text
element.textContent = userInput;

// ✅ SAFE - Use DOMPurify for HTML content
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### **Immediate Actions Required:**
1. Audit all 115 `innerHTML` usages in `public/` directory
2. Replace with `textContent` for plain text
3. Add DOMPurify library for HTML content:
   ```bash
   npm install dompurify
   npm install -D @types/dompurify
   ```
4. Create sanitization utility:
   ```typescript
   // src/utils/sanitize.ts
   import DOMPurify from 'dompurify';
   
   export function sanitizeHtml(dirty: string): string {
     return DOMPurify.sanitize(dirty, {
       ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
       ALLOWED_ATTR: ['href', 'target', 'rel']
     });
   }
   ```

---

## 🔑 **2. Secret Management**

### **Current Status**
- ⚠️ **29 hardcoded secrets detected** in source code

### **Best Practices**

#### **Environment Variables:**
```typescript
// ❌ DANGEROUS - Hardcoded secrets
const apiKey = "sk-1234567890abcdef";

// ✅ SAFE - Use environment variables
const apiKey = c.env.GEMINI_API_KEY;
```

#### **Audit Required:**
```bash
# Find all potential secrets
grep -r "SECRET\|PASSWORD\|API_KEY\|TOKEN" src/ --include="*.ts" --include="*.tsx" | grep -v "env\."
```

#### **Migration Plan:**
1. Identify all hardcoded secrets
2. Move to `.dev.vars` (local) or Cloudflare secrets (production)
3. Update code to use `c.env.VARIABLE_NAME`
4. Add to `.gitignore` if not already present

---

## 💉 **3. SQL Injection Prevention**

### **Current Status**
- ⚠️ **2 SQL injection risks** using template literals

### **Safe Query Patterns**

#### **Parameterized Queries (Recommended):**
```typescript
// ❌ DANGEROUS - String interpolation
const result = await c.env.DB.prepare(`
  SELECT * FROM users WHERE email = '${email}'
`).first();

// ✅ SAFE - Parameterized query
const result = await c.env.DB.prepare(`
  SELECT * FROM users WHERE email = ?
`).bind(email).first();
```

#### **Audit Checklist:**
- [ ] Review all database queries in `src/api/`
- [ ] Replace `${}` with parameterized `?` placeholders
- [ ] Use `.bind()` for parameter values
- [ ] Test with malicious inputs: `' OR '1'='1`

---

## 🔐 **4. Authentication Security**

### **Implemented:**
- ✅ PBKDF2 password hashing (100,000 iterations)
- ✅ JWT token management
- ✅ Rate limiting (5 attempts/15 min)
- ✅ CSRF protection via state parameter
- ✅ OAuth state validation (V4 fixed)

### **Best Practices:**

#### **Password Storage:**
```typescript
// Always use PBKDF2 with salt
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(
    password,
    salt,
    100000, // iterations
    64,     // key length
    'sha256'
  ).toString('hex');
}
```

#### **JWT Security:**
```typescript
// Minimum 32 characters for HS256
const JWT_SECRET = c.env.JWT_SECRET; // Must be 256+ bits

// Always set expiration
const token = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: '24h' }
);
```

---

## 🌐 **5. CORS Configuration**

### **Current Setup:**
```typescript
app.use('*', cors({
  origin: '*', // ⚠️ TOO PERMISSIVE for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
```

### **Production Recommendation:**
```typescript
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://museflow.pages.dev',
      'https://museflow.life',
      'http://localhost:3000' // Dev only
    ];
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
```

---

## 📝 **6. Input Validation**

### **Implementation with Zod:**

```typescript
import { z } from 'zod';

// Define schemas
const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100)
});

// Validate in routes
app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const validated = SignupSchema.parse(body);
    // Use validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
  }
});
```

---

## 🔍 **7. Security Headers**

### **Add Helmet Middleware:**

```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://museflow.pages.dev"]
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin'
}));
```

---

## 🚨 **8. Rate Limiting**

### **Current Implementation:**
- ✅ Login: 5 attempts per 15 minutes

### **Extend to Other Endpoints:**

```typescript
// Rate limiter utility
const rateLimiters = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const limiter = rateLimiters.get(key);
  
  if (!limiter || now > limiter.resetAt) {
    rateLimiters.set(key, { count: 1, resetAt: now + windowMs });
    return false; // Not rate limited
  }
  
  if (limiter.count >= maxAttempts) {
    return true; // Rate limited
  }
  
  limiter.count++;
  return false;
}

// Use in routes
app.post('/api/sensitive-endpoint', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || 'unknown';
  
  if (rateLimit(clientIp, 10, 60000)) { // 10 req/min
    return c.json({ error: 'Too many requests' }, 429);
  }
  
  // Process request...
});
```

---

## 🛠️ **9. Security Audit Checklist**

### **Pre-Deployment:**
- [ ] Run `npm audit` for dependency vulnerabilities
- [ ] Replace all `innerHTML` with safe alternatives
- [ ] Migrate hardcoded secrets to environment variables
- [ ] Fix SQL injection risks with parameterized queries
- [ ] Update CORS to whitelist specific origins
- [ ] Add security headers via Helmet middleware
- [ ] Implement rate limiting on all public endpoints
- [ ] Enable HTTPS-only (enforced by Cloudflare)
- [ ] Test with OWASP ZAP or Burp Suite

### **Automated Tools:**
```bash
# Dependency audit
npm audit --production

# Static analysis
npm install -D eslint-plugin-security
npx eslint --ext .ts,.tsx src/

# Secret scanning
git secrets --scan

# TypeScript type check
npm run typecheck
```

---

## 📊 **10. Monitoring & Alerting**

### **Security Event Logging:**

```typescript
// Log security events
function logSecurityEvent(event: string, details: any) {
  console.error(`🚨 SECURITY: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // TODO: Send to monitoring service (Sentry, Cloudflare Analytics)
}

// Use in suspicious activities
if (failedLoginAttempts > 5) {
  logSecurityEvent('BRUTE_FORCE_ATTEMPT', {
    ip: clientIp,
    email: email,
    attempts: failedLoginAttempts
  });
}
```

### **Recommended Services:**
- **Sentry** - Error & performance monitoring
- **Cloudflare Analytics** - Built-in for Pages
- **Logflare** - Real-time log aggregation

---

## 🔗 **11. External Resources**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Security Best Practices](https://developers.cloudflare.com/workers/platform/security/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [TypeScript Security Guide](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## 📞 **12. Reporting Vulnerabilities**

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@museflow.life (if configured)
3. Provide: Description, reproduction steps, impact assessment
4. Expected response: Within 48 hours

---

**Last Updated:** 2025-11-29  
**Security Version:** 1.0.0  
**Status:** ⚠️ Requires Immediate Action (115 XSS, 29 secrets, 2 SQL injection)
