#!/usr/bin/env node
/**
 * Migration Validation Script
 * Prevents duplicate migration numbers and ensures sequential ordering
 * Run: node scripts/validate-migrations.js
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const ERRORS = [];
const WARNINGS = [];

console.log('🔍 Validating database migrations...\n');

// Read all migration files
const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error('❌ ERROR: No migration files found in migrations/');
  process.exit(1);
}

console.log(`Found ${files.length} migration files:\n`);

// Extract migration numbers
const migrations = files.map(filename => {
  const match = filename.match(/^(\d+)_(.+)\.sql$/);
  if (!match) {
    ERRORS.push(`Invalid filename format: ${filename} (expected: NNNN_description.sql)`);
    return null;
  }
  
  const [, number, description] = match;
  return {
    filename,
    number: parseInt(number, 10),
    description,
    path: path.join(MIGRATIONS_DIR, filename)
  };
}).filter(Boolean);

// Check for duplicate numbers
const numbers = migrations.map(m => m.number);
const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);

if (duplicates.length > 0) {
  ERRORS.push(`Duplicate migration numbers detected: ${[...new Set(duplicates)].join(', ')}`);
}

// Check for sequential ordering
let lastNumber = 0;
for (const migration of migrations) {
  if (migration.number !== lastNumber + 1) {
    WARNINGS.push(`Gap in migration sequence: ${lastNumber} → ${migration.number}`);
  }
  lastNumber = migration.number;
}

// Check file contents
for (const migration of migrations) {
  const content = fs.readFileSync(migration.path, 'utf-8');
  
  // Check for CREATE TABLE statements
  if (!content.includes('CREATE TABLE')) {
    WARNINGS.push(`${migration.filename}: No CREATE TABLE statements found`);
  }
  
  // Check for IF NOT EXISTS
  const createTableCount = (content.match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
  if (createTableCount === 0 && content.includes('CREATE TABLE')) {
    WARNINGS.push(`${migration.filename}: CREATE TABLE without IF NOT EXISTS (may fail on re-run)`);
  }
  
  console.log(`  ✅ ${migration.filename}`);
}

console.log('\n' + '='.repeat(60));

// Report results
if (ERRORS.length > 0) {
  console.error('\n❌ ERRORS FOUND:\n');
  ERRORS.forEach(err => console.error(`  - ${err}`));
  console.error('\n🚫 Migration validation FAILED\n');
  process.exit(1);
}

if (WARNINGS.length > 0) {
  console.warn('\n⚠️  WARNINGS:\n');
  WARNINGS.forEach(warn => console.warn(`  - ${warn}`));
}

console.log('\n✅ All migrations validated successfully!\n');
console.log(`Total: ${migrations.length} migrations`);
console.log(`Range: ${migrations[0].number} - ${migrations[migrations.length - 1].number}\n`);

process.exit(0);
