/**
 * Environment Variables Validation Script
 * Checks that all required environment variables are set
 * Run: node scripts/check-env.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_KEY',
  'SENDER_EMAIL',
  'SENDER_NAME',
  'FRONTEND_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const SECURITY_CHECKS = [
  {
    var: 'JWT_SECRET',
    check: (val) => val.length >= 32,
    message: 'JWT_SECRET must be at least 32 characters for security'
  },
  {
    var: 'JWT_SECRET',
    check: (val) => !val.includes('your-secret-key') && !val.includes('your_super_secret'),
    message: 'JWT_SECRET appears to be a placeholder. Generate a strong secret: openssl rand -base64 48'
  },
  {
    var: 'DATABASE_URL',
    check: (val) => process.env.NODE_ENV !== 'production' || val.includes('sslmode=require'),
    message: 'Production DATABASE_URL should include sslmode=require for security'
  },
  {
    var: 'SENDER_EMAIL',
    check: (val) => val && val.includes('@'),
    message: 'SENDER_EMAIL must be a valid email address'
  }
];

console.log('🔍 Checking environment variables...\n');

// Check required variables
let hasErrors = false;
const missing = [];

REQUIRED_VARS.forEach(varName => {
  if (!process.env[varName]) {
    missing.push(varName);
    hasErrors = true;
  }
});

if (missing.length > 0) {
  console.log('❌ Missing required environment variables:');
  missing.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n💡 Copy .env.example to .env and fill in the values\n');
}

// Security checks
const securityWarnings = [];

SECURITY_CHECKS.forEach(({ var: varName, check, message }) => {
  const value = process.env[varName];
  if (value && !check(value)) {
    securityWarnings.push({ varName, message });
  }
});

if (securityWarnings.length > 0) {
  console.log('⚠️  Security warnings:');
  securityWarnings.forEach(({ varName, message }) => {
    console.log(`   - ${varName}: ${message}`);
  });
  console.log('');
  hasErrors = true;
}

// Environment info
if (!hasErrors) {
  console.log('✅ All required environment variables are set');
  console.log('\n📋 Environment Info:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Database: ${process.env.DATABASE_URL.includes('localhost') ? 'Local' : 'Remote'}`);
  console.log(`   - Email: ${process.env.SENDER_EMAIL}`);
  console.log(`   - S3 Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`   - Frontend: ${process.env.FRONTEND_URL}`);
  console.log('\n✨ Environment configuration looks good!\n');
  process.exit(0);
} else {
  console.log('❌ Environment configuration has issues. Please fix them before running the application.\n');
  process.exit(1);
}
