import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
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
        <link rel="stylesheet" href="/static/css/design-system.css">
        
        <!-- Favicon -->
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏛️</text></svg>">
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
          <div style="
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin-bottom: 24px;
            backdrop-filter: blur(10px);
          ">🏛️</div>
          <h2 style="
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
          ">Museflow</h2>
          <div class="spinner"></div>
        </div>
        
        <!-- App Container (SPA pages will be rendered here) -->
        <div id="app"></div>
        
        <!-- Core Scripts -->
        <script src="/static/js/components/toast.js"></script>
        <script src="/static/js/core/router.js"></script>
        <script src="/static/js/core/auth.js"></script>
        
        <!-- Canvas System -->
        <script src="/static/js/core/canvas-engine.js"></script>
        <script src="/static/js/components/node.js"></script>
        <script src="/static/js/components/connection.js"></script>
        
        <!-- Page Scripts -->
        <script src="/static/js/pages/landing.js"></script>
        <script src="/static/js/pages/login.js"></script>
        <script src="/static/js/pages/signup.js"></script>
        <script src="/static/js/pages/project-manager.js"></script>
        <script src="/static/js/pages/canvas.js"></script>
        <script src="/static/js/pages/canvas-events.js"></script>
        
        <!-- App Initialization (must be last) -->
        <script src="/static/js/core/app.js"></script>
        
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
