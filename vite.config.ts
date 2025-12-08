import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    build({
      exclude: [
        // Static assets (highest priority)
        '/static/**',
        '/_archived/**',
        '/logo-*.png',
        '/manifest.json',
        '/sw.js',
        
        // Root path (CRITICAL: Prevent Worker interception)
        '/',
        
        // All HTML files (auto-generated, 27 files)
        '/3d-viewer.html',
        '/about.html',
        '/account.html',
        '/admin.html',
        '/ai-assistant-demo.html',
        '/analytics-dashboard.html',
        '/ar-vr-demo.html',
        '/behavior-dashboard.html',
        '/budget.html',
        '/canvas-ultimate-clean.html',
        '/contact.html',
        '/dashboard.html',
        '/digital-twin-pro.html',
        '/forgot-password.html',
        '/google-mcp.html',
        '/help-center.html',
        '/help-system-demo.html',
        '/index.html',
        '/landing.html',
        '/login.html',
        '/modules.html',
        '/oauth-callback.html',
        '/pricing.html',
        '/projects.html',
        '/signup.html',
        '/workflow-tools.html',
        '/workflow.html',
        
        // Pretty URL paths (Cloudflare Pages auto-redirects /page.html → /page)
        '/3d-viewer',
        '/about',
        '/account',
        '/admin',
        '/ai-assistant-demo',
        '/analytics-dashboard',
        '/ar-vr-demo',
        '/behavior-dashboard',
        '/budget',
        '/canvas-ultimate-clean',
        '/contact',
        '/dashboard',
        '/digital-twin-pro',
        '/forgot-password',
        '/google-mcp',
        '/help-center',
        '/help-system-demo',
        '/landing',
        '/login',
        '/modules',
        '/oauth-callback',
        '/pricing',
        '/projects',
        '/signup',
        '/workflow-tools',
        '/workflow'
      ]
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
