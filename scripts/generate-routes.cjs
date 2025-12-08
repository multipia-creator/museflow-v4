#!/usr/bin/env node
/**
 * Generate _routes.json for Cloudflare Pages
 * Automatically detects HTML files and generates exclude list
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '../public');
const ROUTES_FILE = path.join(DIST_DIR, '_routes.json');

// Read all HTML files from public directory
const htmlFiles = fs.readdirSync(PUBLIC_DIR)
  .filter(file => file.endsWith('.html') && !file.startsWith('_'))
  .map(file => file.replace('.html', ''));

// Base exclude paths
const exclude = [
  // Static assets (highest priority)
  '/static/*',
  '/_archived/*',
  '/manifest.json',
  '/sw.js',
  '/version.json',
  
  // Root path (CRITICAL)
  '/',
  
  // All HTML files (wildcard)
  '/*.html',
  
  // Pretty URL paths (auto-generated from HTML files)
  ...htmlFiles.map(name => `/${name}`)
];

const routes = {
  version: 1,
  include: ['/*'],
  exclude: [...new Set(exclude)].sort() // Remove duplicates and sort
};

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Write _routes.json
fs.writeFileSync(ROUTES_FILE, JSON.stringify(routes, null, 2));

console.log(`✅ Generated _routes.json with ${routes.exclude.length} excluded paths`);
console.log(`   Location: ${ROUTES_FILE}`);
console.log(`   HTML files detected: ${htmlFiles.length}`);
