import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
// Note: Cache busting is handled via query parameters (?v=timestamp) in HTML
app.use('/static/*', serveStatic({ root: './' }))

// Main route - Serve the SPA
app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        ">
          <img 
            src="/static/images/logo-square.png" 
            alt="Museflow" 
            style="
              width: 120px;
              height: 120px;
              margin-bottom: 32px;
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            "
          />
          <div class="spinner"></div>
        </div>
        
        <!-- App Container (SPA pages will be rendered here) -->
        <div id="app"></div>
        
        <!-- Core Scripts -->
        <script src="/static/js/components/toast.js?v=${Date.now()}"></script>
        <script src="/static/js/components/navbar.js?v=${Date.now()}"></script>
        <script src="/static/js/core/router.js?v=${Date.now()}"></script>
        <script src="/static/js/core/auth.js?v=${Date.now()}"></script>
        <script src="/static/js/data/test-data.js?v=${Date.now()}"></script>
        
        <!-- Canvas System -->
        <script src="/static/js/core/canvas-engine.js?v=${Date.now()}"></script>
        <script src="/static/js/components/node.js?v=${Date.now()}"></script>
        <script src="/static/js/components/connection.js?v=${Date.now()}"></script>
        
        <!-- Page Scripts -->
        <script src="/static/js/pages/features.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/content-pages.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/login.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/signup.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/project-manager.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/profile-settings.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/admin-dashboard.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/canvas.js?v=${Date.now()}"></script>
        <script src="/static/js/pages/canvas-events.js?v=${Date.now()}"></script>
        
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
