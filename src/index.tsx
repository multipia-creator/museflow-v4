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

// Export Durable Objects
export { CollaborationRoom } from './durable-objects/collaboration-room'

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  NOTION_API_KEY?: string;
  COLLABORATION_ROOM: DurableObjectNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
  JWT_SECRET: string;
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
app.route('/', widgets)

export default app
