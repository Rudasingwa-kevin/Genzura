/**
 * Database Backup Script
 *
 * Creates a PostgreSQL backup with timestamp
 * Usage: npm run db:backup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

dotenv.config();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function backupDatabase() {
  try {
    console.log('🗄️  Starting database backup...\n');

    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in .env');
    }

    // Extract database info from URL
    // Format: postgresql://user:password@host:port/database
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;

    // Create backups directory if it doesn't exist
    const backupsDir = join(__dirname, '..', 'backups');
    if (!existsSync(backupsDir)) {
      mkdirSync(backupsDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = join(backupsDir, `backup-${timestamp}.sql`);

    // Set PostgreSQL password environment variable
    process.env.PGPASSWORD = password;

    // Run pg_dump
    const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f "${backupFile}"`;

    console.log(`📦 Backing up database: ${database}`);
    console.log(`📁 Backup location: ${backupFile}\n`);

    await execAsync(command);

    // Get file size
    const { stdout: sizeOutput } = await execAsync(`wc -c < "${backupFile}"`);
    const sizeBytes = parseInt(sizeOutput.trim());
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    console.log('✅ Backup completed successfully!');
    console.log(`📊 Backup size: ${sizeMB} MB`);
    console.log(`📄 File: ${backupFile}\n`);

    // Clean up old backups (keep last 30 days)
    console.log('🧹 Cleaning up old backups (>30 days)...');
    const cleanupCommand = process.platform === 'win32'
      ? `forfiles /P "${backupsDir}" /M backup-*.sql /D -30 /C "cmd /c del @path" 2>nul || echo No old backups to clean`
      : `find "${backupsDir}" -name "backup-*.sql" -type f -mtime +30 -delete`;

    await execAsync(cleanupCommand).catch(() => {
      console.log('ℹ️  No old backups to clean');
    });

    console.log('✨ Backup process complete!\n');

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run backup
backupDatabase();
