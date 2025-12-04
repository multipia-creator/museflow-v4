import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      exclude: [
        // Static assets (highest priority)
        '/static/**',
        '/logo-*.png',
        '/manifest.json',
        '/sw.js',
        
        // Root path (CRITICAL: Prevent Worker interception)
        '/',
        
        // All HTML files (auto-generated from public/*.html)
        '/account.html',
        '/admin.html',
        '/ai-assistant-demo.html',
        '/ar-vr-demo.html',
        '/behavior-analytics.html',
        '/canvas.html',
        '/canvas-v3.html',
        '/dashboard.html',
        '/dashboard-v2.html',
        '/forgot-password.html',
        '/budget.html',
        '/google-mcp.html',
        '/help-center.html',
        '/analytics-dashboard.html',
        '/help-system-demo.html',
        '/index.html',
        '/landing-mockup.html',
        '/landing.html',
        '/login.html',
        '/oauth-callback.html',
        '/projects.html',
        '/signup.html',
        '/test-api-url.html',
        '/test-canvas.html',
        '/workflow.html',
        '/workflow-tools.html',
        '/ai-orchestrator-dashboard.html',
        '/ai-orchestrator-sync.html',
        '/canvas-v4-hybrid.html',
        '/canvas-v5-final.html',
        '/canvas-v5-final-BROKEN-20251204-143038.html',
        '/canvas-v6-clean.html',
        '/canvas-v6-complete.html',
        '/canvas-final.html',
        '/test-css.html',
        '/canvas-layout-sample.html',
        '/e2e-testing.html',
        '/icon-samples.html',
        '/icon-samples-lucide.html',
        '/3d-viewer.html',
        '/digital-twin.html',
        '/digital-twin-pro.html',
        '/test-realtime-sync.html',
        
        // Pretty URL paths (Cloudflare Pages auto-redirects /page.html → /page)
        // CRITICAL: Must exclude ALL to prevent Worker 404 errors
        '/account',
        '/admin',
        '/ai-assistant-demo',
        '/ar-vr-demo',
        '/behavior-analytics',
        '/canvas',
        '/canvas-v3',
        '/dashboard',
        '/dashboard-v2',
        '/forgot-password',
        '/budget',
        '/google-mcp',
        '/help-center',
        '/analytics-dashboard',
        '/help-system-demo',
        '/index',
        '/landing-mockup',
        '/landing',
        '/login',
        '/oauth-callback',
        '/projects',
        '/signup',
        '/test-api-url',
        '/test-canvas',
        '/workflow',
        '/workflow-tools',
        '/ai-orchestrator-dashboard',
        '/ai-orchestrator-sync',
        '/canvas-v4-hybrid',
        '/canvas-v5-final',
        '/canvas-layout-sample',
        '/e2e-testing',
        '/icon-samples',
        '/icon-samples-lucide',
        '/3d-viewer',
        '/digital-twin',
        '/digital-twin-pro',
        '/test-realtime-sync'
      ]
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
