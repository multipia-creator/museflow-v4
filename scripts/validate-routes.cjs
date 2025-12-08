#!/usr/bin/env node
/**
 * _routes.json Validation Script
 * Ensures all static files are properly excluded from Worker routing
 * Run: node scripts/validate-routes.js
 */

const fs = require('fs');
const path = require('path');

const ROUTES_FILE = path.join(__dirname, '../dist/_routes.json');
const PUBLIC_DIR = path.join(__dirname, '../public');
const ERRORS = [];
const WARNINGS = [];

console.log('🔍 Validating _routes.json configuration...\n');

// Check if dist/_routes.json exists
if (!fs.existsSync(ROUTES_FILE)) {
  console.error('❌ ERROR: dist/_routes.json not found');
  console.error('   Run "npm run build" first\n');
  process.exit(1);
}

// Read _routes.json
const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf-8'));

if (!routes.exclude || !Array.isArray(routes.exclude)) {
  ERRORS.push('Invalid _routes.json: "exclude" array missing');
  console.error('❌ ERRORS:\n');
  ERRORS.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log(`Excluded paths: ${routes.exclude.length}\n`);

// Get all HTML files from public/
const htmlFiles = fs.readdirSync(PUBLIC_DIR)
  .filter(f => f.endsWith('.html'))
  .map(f => `/${f}`);

console.log(`HTML files in public/: ${htmlFiles.length}\n`);

// Check if all HTML files are excluded (support wildcard /*.html)
const hasHtmlWildcard = routes.exclude.includes('/*.html');
const missingHtml = hasHtmlWildcard ? [] : htmlFiles.filter(file => !routes.exclude.includes(file));
if (missingHtml.length > 0) {
  ERRORS.push(`HTML files not excluded: ${missingHtml.join(', ')}`);
}

// Check if Pretty URLs are excluded
const prettyUrls = htmlFiles.map(f => f.replace('.html', ''));
const missingPretty = prettyUrls.filter(url => !routes.exclude.includes(url));
if (missingPretty.length > 0) {
  WARNINGS.push(`Pretty URL paths not excluded: ${missingPretty.join(', ')}`);
}

// Check if root path is excluded
if (!routes.exclude.includes('/')) {
  ERRORS.push('Root path "/" not excluded (will cause 404)');
}

// Check if /static/** is excluded
const hasStaticPattern = routes.exclude.some(p => 
  p === '/static/*' || p === '/static/**'
);
if (!hasStaticPattern) {
  WARNINGS.push('/static/** pattern not found in exclude list');
}

console.log('='.repeat(60));

// Report results
if (ERRORS.length > 0) {
  console.error('\n❌ ERRORS FOUND:\n');
  ERRORS.forEach(err => console.error(`  - ${err}`));
  console.error('\n🚫 Routing validation FAILED\n');
  console.error('Fix: Update vite.config.ts exclude list\n');
  process.exit(1);
}

if (WARNINGS.length > 0) {
  console.warn('\n⚠️  WARNINGS:\n');
  WARNINGS.forEach(warn => console.warn(`  - ${warn}`));
  console.warn('\n');
}

console.log('\n✅ _routes.json validated successfully!\n');
console.log(`Excluded paths: ${routes.exclude.length}`);
console.log(`HTML files covered: ${htmlFiles.length - missingHtml.length}/${htmlFiles.length}`);
console.log(`Pretty URLs covered: ${prettyUrls.length - missingPretty.length}/${prettyUrls.length}\n`);

process.exit(0);
