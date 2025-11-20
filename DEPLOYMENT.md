# 🚀 MuseFlow V4 - Production Deployment Guide

Complete guide for deploying MuseFlow V4 to Cloudflare Pages.

---

## 📋 Prerequisites

### 1. Cloudflare Account
- Sign up at https://dash.cloudflare.com
- Verify your email address
- Add a payment method (required for Workers/Pages)

### 2. API Keys
- Gemini API Key (from Google AI Studio)
- Cloudflare API Token (with Pages and D1 permissions)
- Museum API Keys (optional):
  - National Museum of Korea API Key
  - Soma Museum API Key
  - KCISA 3D API Key

### 3. Local Environment
```bash
Node.js 20+
npm or yarn
wrangler CLI (will be installed via npm)
```

---

## 🔧 Step 1: Setup Cloudflare Authentication

### Option A: Using `setup_cloudflare_api_key` (Recommended)
```bash
# This tool will configure authentication automatically
# Call setup_cloudflare_api_key in your development environment
```

### Option B: Manual Setup
```bash
# Login to Cloudflare
npx wrangler login

# Or use API token
npx wrangler whoami
```

---

## 🗄️ Step 2: Create D1 Database

```bash
# Create production database
npx wrangler d1 create museflow-production

# Output will show:
# database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Copy the database_id and update wrangler.jsonc
```

Update `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "museflow-production",
      "database_id": "YOUR_DATABASE_ID_HERE",
      "migrations_dir": "./migrations"
    }
  ]
}
```

---

## 📦 Step 3: Apply Database Migrations

```bash
# Apply migrations to production database
npx wrangler d1 migrations apply museflow-production

# Verify migrations
npx wrangler d1 execute museflow-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

Expected tables:
- workflows
- nodes
- connections
- agent_executions
- collaboration_sessions
- knowledge_entities
- knowledge_relationships
- workflow_events
- ai_suggestions
- museum_data_cache
- notion_sync_state
- nft_assets
- nft_collections
- nft_transfers

---

## 💾 Step 4: Create KV Namespace (Optional but Recommended)

```bash
# Create KV namespace for caching
npx wrangler kv:namespace create CACHE_KV

# Output will show:
# id: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Update wrangler.jsonc
```

Update `wrangler.jsonc`:
```jsonc
{
  "kv_namespaces": [
    {
      "binding": "CACHE_KV",
      "id": "YOUR_KV_ID_HERE"
    }
  ]
}
```

---

## 🏗️ Step 5: Build the Project

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -lh dist/
# Should contain: _worker.js, _routes.json, and static assets
```

---

## 🌐 Step 6: Create Cloudflare Pages Project

```bash
# Create Pages project
npx wrangler pages project create museflow-v4 \
  --production-branch main \
  --compatibility-date 2024-01-01

# Note: Use 'main' as production branch unless specifically required otherwise
```

---

## 🚀 Step 7: Deploy to Cloudflare Pages

```bash
# Deploy dist directory
npx wrangler pages deploy dist --project-name museflow-v4

# Output will show:
# ✨ Deployment complete!
# URL: https://xxxxxxxx.museflow-v4.pages.dev
```

---

## 🔐 Step 8: Configure Environment Variables

```bash
# Required: Gemini API Key
npx wrangler pages secret put GEMINI_API_KEY --project-name museflow-v4
# Enter your Gemini API key when prompted

# Optional: Museum API Keys
npx wrangler pages secret put MUSEUM_API_KEY --project-name museflow-v4
npx wrangler pages secret put SOMA_API_KEY --project-name museflow-v4
npx wrangler pages secret put KCISA_API_KEY --project-name museflow-v4

# Optional: Notion Integration
npx wrangler pages secret put NOTION_API_KEY --project-name museflow-v4
npx wrangler pages secret put NOTION_DATABASE_PROJECTS --project-name museflow-v4
npx wrangler pages secret put NOTION_DATABASE_TASKS --project-name museflow-v4

# List all secrets
npx wrangler pages secret list --project-name museflow-v4
```

---

## 🔗 Step 9: Custom Domain (Optional)

```bash
# Add custom domain
npx wrangler pages domain add yourdomain.com --project-name museflow-v4

# Verify DNS settings in Cloudflare dashboard
```

---

## ✅ Step 10: Verify Deployment

### Test Endpoints

```bash
# Health check
curl https://your-deployment.pages.dev/api/health

# AI test
curl https://your-deployment.pages.dev/api/ai/test

# Performance test
curl https://your-deployment.pages.dev/api/performance/test

# Chatbot test
curl https://your-deployment.pages.dev/api/chatbot/stats
```

### Access URLs

- **Production**: https://your-deployment.pages.dev
- **Branch**: https://main.museflow-v4.pages.dev
- **Dashboard**: https://dash.cloudflare.com/pages/museflow-v4

---

## 🔄 Continuous Deployment

### Update Deployment

```bash
# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name museflow-v4
```

### Rollback Deployment

```bash
# View deployments
npx wrangler pages deployment list --project-name museflow-v4

# Rollback to specific deployment
npx wrangler pages deployment rollback <DEPLOYMENT_ID> --project-name museflow-v4
```

---

## 📊 Monitoring & Analytics

### View Logs

```bash
# Real-time logs
npx wrangler pages deployment tail --project-name museflow-v4

# View specific deployment logs
npx wrangler pages deployment logs <DEPLOYMENT_ID> --project-name museflow-v4
```

### Analytics Dashboard

Visit: https://dash.cloudflare.com/pages/museflow-v4/analytics

Metrics available:
- Requests per second
- Bandwidth usage
- Error rates
- Response times
- Geographic distribution

---

## 🐛 Troubleshooting

### Issue: Build Fails

```bash
# Clear build cache
rm -rf dist node_modules .wrangler
npm install
npm run build
```

### Issue: D1 Database Not Found

```bash
# List all databases
npx wrangler d1 list

# Verify database_id in wrangler.jsonc matches
```

### Issue: KV Namespace Not Working

```bash
# List KV namespaces
npx wrangler kv:namespace list

# Verify KV id in wrangler.jsonc matches
```

### Issue: Secrets Not Working

```bash
# Re-set secret
npx wrangler pages secret put GEMINI_API_KEY --project-name museflow-v4

# Verify secrets
npx wrangler pages secret list --project-name museflow-v4
```

### Issue: CORS Errors

Check that CORS middleware is properly configured in `src/api/index.ts`:
```typescript
api.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 📝 Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] Database migrations applied
- [ ] All secrets configured
- [ ] KV namespace working (if used)
- [ ] AI endpoints responding
- [ ] Chatbot functional
- [ ] Performance metrics available
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics tracking enabled

---

## 🔒 Security Best Practices

1. **Never commit secrets** to git
   - Use `.dev.vars` for local development
   - Use `wrangler pages secret put` for production

2. **Rotate API keys** regularly
   - Set reminders for key rotation
   - Update secrets when compromised

3. **Monitor usage** for anomalies
   - Check Cloudflare Analytics
   - Set up alerts for unusual traffic

4. **Use HTTPS** everywhere
   - Cloudflare Pages provides SSL automatically
   - Enforce HTTPS redirects

5. **Implement rate limiting**
   - Use Cloudflare rate limiting rules
   - Protect expensive AI endpoints

---

## 💰 Cost Estimation

### Cloudflare Pages (Free Tier)
- 500 builds/month
- Unlimited bandwidth
- Unlimited requests

### Cloudflare D1 (Free Tier)
- 5GB storage
- 5M read requests/day
- 100K write requests/day

### Cloudflare Workers (Free Tier)
- 100K requests/day
- 10ms CPU time per request

### Gemini API
- ~$0.0006 per workflow generation
- ~$0.0002 per chatbot response

**Estimated monthly cost** for moderate usage:
- Cloudflare: $0 (free tier)
- Gemini: $5-20 (depending on usage)
- **Total: $5-20/month**

---

## 📞 Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **D1 Docs**: https://developers.cloudflare.com/d1
- **GitHub Issues**: Create issue in repository

---

*Last Updated: 2025-11-20*  
*Version: 2.0.0*
