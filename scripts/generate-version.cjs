#!/usr/bin/env node

/**
 * Generate version.json from package.json
 * This script creates a version.json file that can be accessed by the frontend
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create version object
const versionData = {
  version: packageJson.version,
  name: packageJson.name,
  buildDate: new Date().toISOString(),
  buildTimestamp: Date.now(),
  displayVersion: `V${packageJson.version.split('.')[0]}.${packageJson.version.split('.')[1]}`
};

// Write to public directory (for development)
const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');
fs.writeFileSync(publicVersionPath, JSON.stringify(versionData, null, 2));

console.log('✅ Generated version.json:');
console.log(`   Version: ${versionData.version}`);
console.log(`   Display: ${versionData.displayVersion}`);
console.log(`   Location: ${publicVersionPath}`);

// Also write to dist directory if it exists (for production)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  const distVersionPath = path.join(distDir, 'version.json');
  fs.writeFileSync(distVersionPath, JSON.stringify(versionData, null, 2));
  console.log(`   Also copied to: ${distVersionPath}`);
}
