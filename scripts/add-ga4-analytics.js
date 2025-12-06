#!/usr/bin/env node

/**
 * MuseFlow V18.0 - Add GA4 Analytics
 * Adds Google Analytics 4 tracking to all pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
    'public/landing.html',
    'public/dashboard.html',
    'public/canvas-ultimate-clean.html',
    'public/modules.html',
    'public/about.html',
    'public/login.html',
    'public/signup.html'
];

function addGA4Analytics(htmlFile) {
    console.log(`\n📝 Processing: ${htmlFile}`);
    
    const rootDir = path.join(__dirname, '..');
    const filePath = path.join(rootDir, htmlFile);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found, skipping: ${htmlFile}`);
        return;
    }
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if GA4 already added
    if (html.includes('analytics-ga4.js')) {
        console.log(`✓  GA4 Analytics already added, skipping`);
        return;
    }
    
    // Remove old GA4 implementation if exists
    html = html.replace(
        /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+"><\/script>/gi,
        ''
    );
    html = html.replace(
        /<script>\s*window\.dataLayer[\s\S]*?<\/script>/gi,
        ''
    );
    
    // Add new GA4 analytics script (async loading for performance)
    const ga4Script = `
    <!-- 📊 Google Analytics 4 - Advanced Event Tracking -->
    <script src="/static/js/analytics-ga4.js" async></script>`;
    
    html = html.replace('</head>', `${ga4Script}\n    </head>`);
    
    fs.writeFileSync(filePath, html, 'utf8');
    
    console.log(`✅ Added GA4 Analytics script (async)`);
}

console.log('🚀 MuseFlow V18.0 - GA4 Analytics Integration\n');
console.log('=' .repeat(60));

pages.forEach(page => {
    try {
        addGA4Analytics(page);
    } catch (error) {
        console.error(`❌ Error processing ${page}:`, error.message);
    }
});

console.log('\n' + '='.repeat(60));
console.log('\n✨ GA4 Analytics integration complete!');
console.log('\n📊 Tracked Events:');
console.log('   • Page Views & Performance');
console.log('   • AI Agent Executions');
console.log('   • Widget Interactions (Drag/Drop)');
console.log('   • Canvas Activities (Zoom/Pan/Connect)');
console.log('   • Dashboard Interactions');
console.log('   • Core Web Vitals (LCP)');
console.log('   • JavaScript Errors');
console.log('\n💡 Next Steps:');
console.log('   1. Replace G-XXXXXXXXXX with real Measurement ID');
console.log('   2. Verify tracking in GA4 DebugView');
console.log('   3. Set up custom reports in GA4 console\n');
