/**
 * Database Restore Script
 * Restores a database backup
 * Run: node scripts/restore-db.js <backup-file>
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Please provide a backup file path');
  console.log('Usage: node scripts/restore-db.js <backup-file>');
  console.log('Example: node scripts/restore-db.js backups/genzura_2026-05-27.sql');
  process.exit(1);
}

// Check if backup file exists
if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup file not found: ${backupFile}`);
  process.exit(1);
}

// Get backup file info
const stats = fs.statSync(backupFile);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
const fileDate = stats.mtime.toISOString().split('T')[0];

console.log('⚠️  DATABASE RESTORE WARNING ⚠️');
console.log('This will overwrite your current database with the backup!');
console.log('');
console.log(`📝 Backup file: ${path.basename(backupFile)}`);
console.log(`📦 Size: ${fileSizeMB} MB`);
console.log(`📅 Date: ${fileDate}`);
console.log('');

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Type "RESTORE" to continue, or anything else to cancel: ', (answer) => {
  rl.close();
  
  if (answer !== 'RESTORE') {
    console.log('❌ Restore cancelled');
    process.exit(0);
  }
  
  console.log('🔄 Starting database restore...');
  
  // Execute psql to restore
  const restoreCommand = `psql "${DATABASE_URL}" < "${backupFile}"`;
  
  execAsync(restoreCommand)
    .then(() => {
      console.log('✅ Database restored successfully!');
      console.log('🔄 Remember to restart your application');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Restore failed:', error.message);
      console.error('');
      console.error('⚠️  Your database may be in an inconsistent state!');
      console.error('⚠️  Please check the error message and try again');
      process.exit(1);
    });
});
