import { Hono } from 'hono'
import { cors } from 'hono/cors'
import api from './api/index'
import auth from './routes/auth'
import oauth from './routes/oauth'
import projects from './routes/projects'
import behaviors from './routes/behaviors'

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
// Note: Static files (HTML, CSS, JS) are served directly by Wrangler Pages Dev from dist/ folder
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/oauth', oauth)
app.route('/api/projects', projects)
app.route('/api/behaviors', behaviors)

export default app
