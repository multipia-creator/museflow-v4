#!/usr/bin/env node
/**
 * Create Admin Account Script
 * Creates a default admin user in the database
 */

const crypto = require('crypto');

// Admin credentials
const ADMIN_EMAIL = 'admin@museflow.com';
const ADMIN_PASSWORD = 'MuseFlow2024!'; // Change this!
const ADMIN_NAME = '관리자';

// Generate password hash (same as auth.ts)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

const { hash, salt } = hashPassword(ADMIN_PASSWORD);

console.log('🔐 Admin Account Creation Script\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📧 Email:', ADMIN_EMAIL);
console.log('🔑 Password:', ADMIN_PASSWORD);
console.log('👤 Name:', ADMIN_NAME);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('SQL Insert Statement:\n');
console.log(`
INSERT INTO users (email, name, password_hash, salt, role, created_at)
VALUES (
  '${ADMIN_EMAIL}',
  '${ADMIN_NAME}',
  '${hash}',
  '${salt}',
  'admin',
  datetime('now')
);
`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Usage:\n');
console.log('1. Set up D1 database:');
console.log('   npx wrangler d1 create museflow-production\n');
console.log('2. Apply migrations:');
console.log('   npx wrangler d1 migrations apply museflow-production --local\n');
console.log('3. Insert admin account:');
console.log('   npx wrangler d1 execute museflow-production --local \\');
console.log('     --command="INSERT INTO users (email, name, password_hash, salt, role, created_at) \\');
console.log(`     VALUES ('${ADMIN_EMAIL}', '${ADMIN_NAME}', '${hash}', '${salt}', 'admin', datetime('now'))"`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  SECURITY WARNING:');
console.log('   Change the default password after first login!\n');
