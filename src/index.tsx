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

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './' }))

// Serve HTML files with .html extension
app.use('/*.html', serveStatic({ root: './' }))

// Landing page
app.get('/', (c) => {
  return c.redirect('/landing.html')
})

// Canvas V2 route (main SPA) - Fallback for any other route
// Note: HTML files are served via serveStatic middleware above
app.get('*', (c) => {
  // Add cache control headers to HTML response
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  c.header('Pragma', 'no-cache')
  c.header('Expires', '0')
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Museflow - AI-Powered Museum Workflow</title>
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        
        <!-- Styles -->
        <link rel="stylesheet" href="/static/css/design-system.css?v=${Date.now()}">
        
        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/static/images/logo-square.png">
    </head>
    <body>
        <!-- Loading Screen -->
        <div id="loading-screen" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a1f 50%, #000000 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        ">
          <!-- Animated background particles -->
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: 
              radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
            animation: bgFloat 15s ease-in-out infinite;
          "></div>
          <img 
            src="/static/images/logo-square.png" 
            alt="MuseFlow" 
            style="
              width: 180px;
              height: 180px;
              margin-bottom: 32px;
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              border-radius: 32px;
              box-shadow: 0 20px 60px rgba(139, 92, 246, 0.6);
            "
          />
          <div class="spinner" style="position: relative; z-index: 1;"></div>
          <p style="
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            font-weight: 500;
            margin-top: 24px;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: relative;
            z-index: 1;
          ">Loading MuseFlow.life</p>
        </div>
        
        <style>
          @keyframes bgFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        </style>
        
        <!-- App Container (SPA pages will be rendered here) -->
        <div id="app"></div>
        
        <!-- Core Scripts -->
        <script src="/static/js/components/toast.js?v=${Date.now()}"></script>
        <script src="/static/js/components/loading-overlay.js?v=${Date.now()}"></script>
        <script src="/static/js/components/error-modal.js?v=${Date.now()}"></script>
        <script src="/static/js/components/navbar.js?v=${Date.now()}"></script>
        <script src="/static/js/core/router.js?v=${Date.now()}"></script>
        <script src="/static/js/core/auth.js?v=${Date.now()}"></script>
        <script src="/static/js/data/test-data.js?v=${Date.now()}"></script>
        
        <!-- SDK Scripts (Backend Integration) -->
        <script src="/static/js/sdk/api-client.js?v=${Date.now()}"></script>
        <script src="/static/js/sdk/workflow-sync.js?v=${Date.now()}"></script>
        <script src="/static/js/sdk/ai-generator.js?v=${Date.now()}"></script>
        <script src="/static/js/sdk/collaboration-client.js?v=${Date.now()}"></script>
        
        <!-- AI Components -->
        <script src="/static/js/components/ai-generation-modal.js?v=${Date.now()}"></script>
        <script src="/static/js/components/collaboration-panel.js?v=${Date.now()}"></script>
        <script src="/static/js/components/museum-search-modal.js?v=${Date.now()}"></script>
        
        <!-- Page Scripts -->
        <script src="/static/js/pages/features.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/content-pages.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/login.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/signup.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/project-manager.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/profile-settings.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/admin-dashboard.js?v=${Date.now()}"></script>
        
        <!-- Canvas V2 - World-Class Node Editor -->
        <script src="/static/js/pages/canvas-v2.js?v=${Date.now()}"></script>
        
        <!-- App Initialization (must be last) -->
        <script src="/static/js/core/app.js?v=${Date.now()}"></script>
        
        <!-- Remove loading screen after initialization -->
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              const loadingScreen = document.getElementById('loading-screen');
              if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                  loadingScreen.remove();
                }, 500);
              }
            }, 1000);
          });
        </script>
    </body>
    </html>
  `)
})

export default app
