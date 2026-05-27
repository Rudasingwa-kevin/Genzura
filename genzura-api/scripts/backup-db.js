/**
 * Database Backup Script
 * Creates a backup of the PostgreSQL database
 * Run: node scripts/backup-db.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 Created backups directory');
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(BACKUP_DIR, `genzura_${timestamp}.sql`);

console.log('🔄 Starting database backup...');
console.log(`📝 Backup file: ${backupFile}`);

// Execute pg_dump
const backupCommand = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;

execAsync(backupCommand)
  .then(() => {
    // Check file size
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📦 Backup size: ${fileSizeMB} MB`);
    console.log(`📍 Location: ${backupFile}`);
    
    // Clean up old backups (keep last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(BACKUP_DIR);
    let deletedCount = 0;
    
    files.forEach(file => {
      if (file.endsWith('.sql')) {
        const filePath = path.join(BACKUP_DIR, file);
        const fileStats = fs.statSync(filePath);
        
        if (fileStats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${deletedCount} old backup(s)`);
    }
    
    // List remaining backups
    const remainingBackups = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql'));
    console.log(`\n📊 Total backups: ${remainingBackups.length}`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Backup failed:', error.message);
    
    // Clean up failed backup file
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
    }
    
    process.exit(1);
  });
