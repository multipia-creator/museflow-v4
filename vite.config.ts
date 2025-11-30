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
        '/dashboard.html',
        '/forgot-password.html',
        '/budget.html',
        '/help-center.html',
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
        
        // Pretty URL paths (Cloudflare Pages auto-redirects /page.html → /page)
        // CRITICAL: Must exclude ALL to prevent Worker 404 errors
        '/account',
        '/admin',
        '/ai-assistant-demo',
        '/ar-vr-demo',
        '/behavior-analytics',
        '/canvas',
        '/dashboard',
        '/forgot-password',
        '/budget',
        '/help-center',
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
        '/workflow'
      ]
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
