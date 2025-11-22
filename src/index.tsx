import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import api from './api/index'
import auth from './routes/auth'
import projects from './routes/projects'
import behaviors from './routes/behaviors'

// Export Durable Objects
export { CollaborationRoom } from './durable-objects/collaboration-room'

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  NOTION_API_KEY?: string;
  COLLABORATION_ROOM: DurableObjectNamespace;
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

// Mount API routes
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/projects', projects)
app.route('/api/behaviors', behaviors)

// Serve static files
// Note: Cache busting is handled via query parameters (?v=timestamp) in HTML
app.use('/static/*', serveStatic({ root: './' }))

// Serve HTML files with .html extension
app.use('/*.html', serveStatic({ root: './' }))

// Landing page
app.get('/', (c) => {
  return c.redirect('/landing.html')
})

// Disabled: Let Wrangler Pages handle static file serving automatically
// Canvas V2 route removed to allow proper HTML file serving

export default app
