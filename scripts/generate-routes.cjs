#!/usr/bin/env node
/**
 * Generate _routes.json for Cloudflare Pages
 * Ensures all static assets and HTML files are excluded from Worker routing
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const ROUTES_FILE = path.join(DIST_DIR, '_routes.json');

// Manually define all exclude paths
const exclude = [
  // Static assets (highest priority)
  '/static/*',
  '/manifest.json',
  '/sw.js',
  
  // Root path (CRITICAL)
  '/',
  
  // All HTML files
  '/account.html',
  '/admin.html',
  '/ai-assistant-demo.html',
  '/analytics-dashboard.html',
  '/ar-vr-demo.html',
  '/behavior-analytics.html',
  '/canvas.html',
  '/canvas-v3.html',
  '/dashboard.html',
  '/dashboard-v2.html',
  '/forgot-password.html',
  '/budget.html',
  '/google-mcp.html',
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
  '/workflow-tools.html',
  '/ai-orchestrator-dashboard.html',
  '/ai-orchestrator-sync.html',
  '/canvas-v4-hybrid.html',
  '/canvas-v4-ultimate.html',
  '/canvas-v4-complete.html',
  '/canvas-v4-complete-final.html',
  '/canvas-v5-final.html',
  '/canvas-v5-clean.html',
  '/canvas-v5-final-BROKEN-20251204-143038.html',
  '/canvas-v6-clean.html',
  '/canvas-v6-complete.html',
  '/canvas-complete.html',
  '/canvas-final.html',
  '/canvas-enhanced.html',
  '/canvas-ultimate-clean.html',
  '/test-css.html',
  '/canvas-layout-sample.html',
  '/e2e-testing.html',
  '/icon-samples.html',
  '/icon-samples-lucide.html',
  '/3d-viewer.html',
  '/digital-twin.html',
  '/digital-twin-pro.html',
  '/test-realtime-sync.html',
  '/about.html',
  '/modules.html',
  
  // Pretty URL paths (all)
  '/account',
  '/admin',
  '/analytics-dashboard',
  '/ar-vr-demo',
  '/canvas',
  '/canvas-v3',
  '/dashboard',
  '/dashboard-v2',
  '/forgot-password',
  '/budget',
  '/google-mcp',
  '/landing',
  '/login',
  '/projects',
  '/signup',
  '/workflow',
  '/workflow-tools',
  '/ai-orchestrator-dashboard',
  '/ai-orchestrator-sync',
  '/canvas-v4-hybrid',
  '/canvas-v5-final',
  '/canvas-v6-clean',
  '/canvas-v6-complete',
  '/canvas-complete',
  '/canvas-final',
  '/canvas-enhanced',
  '/canvas-ultimate-clean',
  '/test-css',
  '/canvas-layout-sample',
  '/e2e-testing',
  '/icon-samples',
  '/icon-samples-lucide',
  '/3d-viewer',
  '/digital-twin',
  '/digital-twin-pro',
  '/test-realtime-sync',
  '/about',
  '/modules'
];

const routes = {
  version: 1,
  include: ['/*'],
  exclude: exclude.sort()
};

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Write _routes.json
fs.writeFileSync(ROUTES_FILE, JSON.stringify(routes, null, 2));

console.log(`✅ Generated _routes.json with ${exclude.length} excluded paths`);
console.log(`   Location: ${ROUTES_FILE}`);
