# MuseFlow V4 Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.example` to `.dev.vars`
- [ ] Fill in all required secrets in `.dev.vars`
- [ ] Test locally with `npm run dev:sandbox`

### 2. Database Setup
- [ ] Create D1 database: `npx wrangler d1 create museflow-production`
- [ ] Update `wrangler.jsonc` with database ID
- [ ] Apply migrations locally: `npm run db:migrate:local`
- [ ] Verify migrations: `npm run validate:migrations`

### 3. Build & Test
- [ ] Run full build: `npm run build`
- [ ] Verify build output in `dist/`
- [ ] Check `dist/_routes.json` for Pretty URLs
- [ ] Test locally: `npm run dev:sandbox`

---

## 🚀 Deployment Methods

### Method 1: Manual Deployment (Quickest)

```bash
# 1. Build the project
npm run build

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name museflow

# 3. Apply production migrations
npm run db:migrate:prod

# 4. Set production secrets
wrangler secret put JWT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put NAVER_CLIENT_ID
wrangler secret put NAVER_CLIENT_SECRET
wrangler secret put KAKAO_CLIENT_ID
wrangler secret put KAKAO_CLIENT_SECRET
wrangler secret put NOTION_API_KEY
```

### Method 2: GitHub Actions (Automated)

1. **Add GitHub Secrets:**
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "chore: Deploy to production"
   git push origin main
   ```

3. **Verify deployment:**
   - Check GitHub Actions tab for workflow status
   - Visit: `https://museflow.pages.dev`

---

## 🌐 Custom Domain Setup

### Option 1: Cloudflare Dashboard (Recommended)

1. Go to: https://dash.cloudflare.com
2. Navigate to: `Workers & Pages` → `museflow` → `Custom domains`
3. Click: `Set up a custom domain`
4. Enter: `museflow.life`
5. Cloudflare will automatically configure DNS

### Option 2: Manual DNS Configuration

1. Go to: https://dash.cloudflare.com/YOUR_ZONE_ID/museflow.life/dns
2. Add CNAME record:
   - **Type:** CNAME
   - **Name:** `@` (or `museflow.life`)
   - **Target:** `museflow.pages.dev`
   - **Proxy status:** Proxied (orange cloud)
   - **TTL:** Auto

3. Wait 5-10 minutes for DNS propagation
4. Verify: `curl -I https://museflow.life`

---

## 🔐 Production Secrets Management

### Set Secrets via Wrangler CLI:

```bash
# Security
wrangler secret put JWT_SECRET
# Enter: [Generate with: openssl rand -base64 32]

# AI Services
wrangler secret put GEMINI_API_KEY
# Enter: [Your Gemini API key]

# OAuth - Google
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# OAuth - Naver
wrangler secret put NAVER_CLIENT_ID
wrangler secret put NAVER_CLIENT_SECRET

# OAuth - Kakao
wrangler secret put KAKAO_CLIENT_ID
wrangler secret put KAKAO_CLIENT_SECRET

# Notion Integration
wrangler secret put NOTION_API_KEY
wrangler secret put NOTION_DATABASE_ID
```

### Verify Secrets:

```bash
wrangler secret list
```

---

## 🗄️ Database Management

### Local Development:

```bash
# Apply migrations locally
npm run db:migrate:local

# Open local D1 console
wrangler d1 execute museflow-production --local --command="SELECT * FROM users"
```

### Production:

```bash
# Apply migrations to production
npm run db:migrate:prod

# Open production D1 console
wrangler d1 execute museflow-production --command="SELECT * FROM users"

# Backup production database
wrangler d1 export museflow-production --output=backup.sql
```

---

## 📊 Monitoring & Debugging

### Check Logs:

```bash
# Real-time logs
wrangler pages deployment tail

# Specific deployment logs
wrangler pages deployment list
wrangler pages deployment logs DEPLOYMENT_ID
```

### Health Check:

```bash
# Test root path
curl -I https://museflow.pages.dev/

# Test API endpoints
curl https://museflow.pages.dev/api/health

# Test authentication
curl https://museflow.pages.dev/api/auth/check
```

---

## 🔄 Rollback Procedure

### If deployment fails:

```bash
# 1. List deployments
wrangler pages deployment list

# 2. Rollback to previous deployment
wrangler pages deployment rollback DEPLOYMENT_ID
```

### If database migration fails:

```bash
# 1. Restore from backup
wrangler d1 execute museflow-production --file=backup.sql

# 2. Re-apply migrations
npm run db:migrate:prod
```

---

## ✅ Post-Deployment Verification

### 1. Verify Deployment:
- [ ] Root path loads: `https://museflow.pages.dev/`
- [ ] Landing page works: `https://museflow.pages.dev/landing`
- [ ] Login page works: `https://museflow.pages.dev/login`
- [ ] Dashboard loads: `https://museflow.pages.dev/dashboard`

### 2. Verify API Endpoints:
- [ ] Authentication: `https://museflow.pages.dev/api/auth/check`
- [ ] OAuth config: `https://museflow.pages.dev/api/oauth/config`
- [ ] Projects: `https://museflow.pages.dev/api/projects`

### 3. Verify Database:
- [ ] Migrations applied: `wrangler d1 migrations list museflow-production`
- [ ] Tables exist: `wrangler d1 execute museflow-production --command="SELECT name FROM sqlite_master WHERE type='table'"`

### 4. Verify Custom Domain:
- [ ] DNS resolves: `nslookup museflow.life`
- [ ] HTTPS works: `curl -I https://museflow.life`
- [ ] SSL certificate valid: Check browser

---

## 🆘 Troubleshooting

### Issue: 404 on root path

**Solution:**
```bash
# Verify _routes.json excludes root path
cat dist/_routes.json | grep '/'

# Rebuild with route validation
npm run build
npm run validate:routes
```

### Issue: API endpoints return 500

**Solution:**
```bash
# Check environment variables
wrangler secret list

# Verify database connection
wrangler d1 execute museflow-production --command="SELECT 1"

# Check Worker logs
wrangler pages deployment tail
```

### Issue: OAuth login fails

**Solution:**
```bash
# Verify OAuth credentials
wrangler secret list | grep -E 'GOOGLE|NAVER|KAKAO'

# Check redirect URIs match production domain
# Expected: https://museflow.pages.dev/oauth-callback.html
```

### Issue: Custom domain not working

**Solution:**
```bash
# Check DNS records
dig museflow.life +short

# Verify CNAME points to museflow.pages.dev
# Expected output: museflow.pages.dev

# Re-add domain via Cloudflare Pages
wrangler pages project add-domain museflow.life
```

---

## 📞 Support

- **Documentation:** https://github.com/YOUR_GITHUB/museflow-v4
- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev:sandbox          # Start local dev server
npm run build                # Build for production
npm run typecheck            # TypeScript validation

# Deployment
npm run deploy               # Build + Deploy to Cloudflare Pages

# Database
npm run db:migrate:local     # Apply migrations locally
npm run db:migrate:prod      # Apply migrations to production

# Validation
npm run validate:migrations  # Validate SQL migrations
npm run validate:routes      # Validate _routes.json

# Monitoring
wrangler pages deployment tail    # Real-time logs
wrangler pages deployment list    # List deployments
```

---

**Last Updated:** 2025-01-23  
**Version:** 4.0.0  
**Status:** ✅ Production Ready
