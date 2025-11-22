import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      exclude: [
        '/static/**',
        '/landing.html',
        '/login.html',
        '/signup.html',
        '/dashboard.html',
        '/projects.html',
        '/account.html',
        '/admin.html',
        '/ar-vr-demo.html'
      ]
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
