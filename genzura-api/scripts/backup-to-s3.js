/**
 * Database Backup to S3 Script
 * Creates backup and uploads to AWS S3
 * Run: node scripts/backup-to-s3.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DATABASE_URL = process.env.DATABASE_URL;
const S3_BUCKET = process.env.AWS_S3_BACKUP_BUCKET || process.env.AWS_S3_BUCKET;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Check if S3 is configured
const s3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  S3_BUCKET
);

if (!s3Configured) {
  console.log('⚠️  AWS S3 not configured. Backup will only be stored locally.');
  console.log('   To enable S3 backups, set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET');
}

// Create S3 client
const s3Client = s3Configured ? new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFilename = `genzura_${timestamp}.sql`;
const backupFile = path.join(BACKUP_DIR, backupFilename);
const compressedFile = `${backupFile}.gz`;

console.log('🔄 Starting database backup with S3 upload...');
console.log(`📝 Backup file: ${backupFilename}`);

async function createBackup() {
  // Step 1: Create SQL dump
  console.log('\n1️⃣  Creating database dump...');
  const backupCommand = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;
  await execAsync(backupCommand);

  const stats = fs.statSync(backupFile);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Backup created: ${fileSizeMB} MB`);

  // Step 2: Compress the backup
  console.log('\n2️⃣  Compressing backup...');
  await execAsync(`gzip -f "${backupFile}"`);

  const compressedStats = fs.statSync(compressedFile);
  const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
  const compressionRatio = ((1 - compressedStats.size / stats.size) * 100).toFixed(1);
  console.log(`✅ Compressed: ${compressedSizeMB} MB (${compressionRatio}% smaller)`);

  // Step 3: Upload to S3 (if configured)
  if (s3Configured && s3Client) {
    console.log('\n3️⃣  Uploading to AWS S3...');
    try {
      const fileContent = fs.readFileSync(compressedFile);
      const s3Key = `database-backups/${backupFilename}.gz`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/gzip',
        Metadata: {
          'backup-date': new Date().toISOString(),
          'original-size': stats.size.toString(),
          'compressed-size': compressedStats.size.toString(),
        }
      });

      await s3Client.send(command);
      console.log(`✅ Uploaded to: s3://${S3_BUCKET}/${s3Key}`);

      // Step 4: Delete local compressed file (keep only on S3)
      console.log('\n4️⃣  Cleaning up local compressed file...');
      fs.unlinkSync(compressedFile);
      console.log('✅ Local compressed file deleted (backup saved in S3)');

    } catch (error) {
      console.error('❌ S3 upload failed:', error.message);
      console.log('⚠️  Keeping local compressed backup');
    }
  } else {
    console.log('\n⚠️  Skipping S3 upload (not configured)');
    console.log(`📍 Local backup: ${compressedFile}`);
  }

  // Step 5: Clean up old local backups (keep only 7 days locally)
  console.log('\n5️⃣  Cleaning up old local backups...');
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const files = fs.readdirSync(BACKUP_DIR);
  let deletedCount = 0;

  files.forEach(file => {
    if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
      const filePath = path.join(BACKUP_DIR, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.mtimeMs < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  });

  if (deletedCount > 0) {
    console.log(`🗑️  Cleaned up ${deletedCount} old local backup(s)`);
  } else {
    console.log('✅ No old backups to clean up');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 BACKUP SUMMARY');
  console.log('='.repeat(50));
  console.log(`Original size:    ${fileSizeMB} MB`);
  console.log(`Compressed size:  ${compressedSizeMB} MB`);
  console.log(`Compression:      ${compressionRatio}% reduction`);
  console.log(`S3 storage:       ${s3Configured ? '✅ Uploaded' : '❌ Not configured'}`);
  console.log(`Local storage:    Only last 7 days`);
  console.log('='.repeat(50));
  console.log('');
  console.log('✅ Backup completed successfully!');
}

createBackup().catch((error) => {
  console.error('❌ Backup failed:', error.message);

  // Clean up failed backup files
  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
  }
  if (fs.existsSync(compressedFile)) {
    fs.unlinkSync(compressedFile);
  }

  process.exit(1);
});
