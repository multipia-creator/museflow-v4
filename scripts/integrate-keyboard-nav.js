#!/usr/bin/env node

/**
 * Integrate Keyboard Navigation script to all pages
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
    'public/about.html'
];

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);
    
    if (!fs.existsSync(filePath)) return;
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if already added
    if (html.includes('keyboard-navigation.js')) {
        console.log(`✓  ${page}: Already integrated`);
        return;
    }
    
    // Add script before </body>
    const script = `
    <!-- ⌨️  Keyboard Navigation & Accessibility -->
    <script src="/static/js/keyboard-navigation.js"></script>
    `;
    
    html = html.replace('</body>', `${script}\n</body>`);
    
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${page}: Keyboard navigation integrated`);
});

console.log('\n✨ Keyboard navigation integrated to all pages!');
