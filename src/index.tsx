import { Hono } from 'hono'
import { cors } from 'hono/cors'
import api from './api/index'
import auth from './routes/auth'
import oauth from './routes/oauth'
import projects from './routes/projects'
import tasks from './routes/tasks'
import comments from './routes/comments'
import behaviors from './routes/behaviors'
import widgets from './routes/widgets'
import workflow from './routes/workflow'
import ai from './routes/ai'
import dashboard from './routes/dashboard'
import orchestrator from './routes/orchestrator'
import notion from './routes/notion'
import figma from './routes/figma'
import agents from './routes/agents'
import geminiApi from './api-gemini'
import googleWorkspace from './api-google-workspace'
import museumApi from './api-museum'
import databaseApi from './api-database'
import admin from './routes/admin'
import approvals from './api/approvals'

// Export Durable Objects
export { CollaborationRoom } from './durable-objects/collaboration-room'

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  NOTION_API_KEY?: string;
  FIGMA_ACCESS_TOKEN?: string;
  COLLABORATION_ROOM: DurableObjectNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN?: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
  JWT_SECRET: string;
  ENABLE_GOOGLE_WORKSPACE?: string;
  MUSEUM_API_KEY?: string;
  MUSEUM_API_BASE_URL?: string;
};

const app = new Hono<{ Bindings: Bindings }>()

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.onError((err, c) => {
  console.error('❌ Global error:', err)
  
  // Log to monitoring service in production
  if (c.env && typeof c.env === 'object' && 'ENVIRONMENT' in c.env && c.env.ENVIRONMENT === 'production') {
    // TODO: Send to monitoring service (e.g., Sentry, Cloudflare Analytics)
  }
  
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500)
})

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// Mount API routes ONLY
// Note: Static files (HTML, CSS, JS) are served directly by Cloudflare Pages from dist/ folder
// Root path (/) will serve index.html automatically
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/oauth', oauth)
app.route('/api/projects', projects)
app.route('/api/tasks', tasks)
app.route('/api/comments', comments)
app.route('/api/behaviors', behaviors)
app.route('/api/workflow', workflow)
app.route('/api/ai', ai)
app.route('/api/dashboard', dashboard)
app.route('/api/orchestrator', orchestrator)
app.route('/api/notion', notion)
app.route('/api/figma', figma)
app.route('/api/agents', agents)
app.route('/api/widgets', widgets)
app.route('/api/gemini', geminiApi)
app.route('/api/google-workspace', googleWorkspace)
app.route('/api/museum', museumApi)
app.route('/api/db', databaseApi)
app.route('/api/admin', admin)
app.route('/api/approvals', approvals)

// 404 handler for API routes (prevent fallback to landing.html)
app.notFound((c) => {
  // Only handle /api/* paths with 404 JSON response
  if (c.req.path.startsWith('/api/')) {
    return c.json({
      success: false,
      error: 'Not Found',
      message: `API endpoint ${c.req.path} does not exist`,
      timestamp: new Date().toISOString()
    }, 404)
  }
  // For non-API paths (HTML files), return simple 404 message
  // Don't call c.notFound() to avoid infinite loop
  return c.text('404 Not Found', 404)
})

export default app
