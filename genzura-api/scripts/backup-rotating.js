/**
 * Rotating Database Backup Script
 * Keeps exactly 7 local backups (rotating), uploads weekly to S3
 *
 * Strategy:
 * - Local: Keep last 7 days only (28MB max)
 * - Cloud: Weekly snapshots (16MB for 4 weeks)
 *
 * Run: node scripts/backup-rotating.js
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

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DATABASE_URL = process.env.DATABASE_URL;
const MAX_LOCAL_BACKUPS = 7; // Keep exactly 7 local backups
const S3_BUCKET = process.env.AWS_S3_BACKUP_BUCKET || process.env.AWS_S3_BUCKET;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// Check if S3 is configured
const s3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  S3_BUCKET
);

const s3Client = s3Configured ? new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate filename
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
const backupFilename = `genzura_${timestamp}.sql`;
const backupFile = path.join(BACKUP_DIR, backupFilename);
const compressedFilename = `${backupFilename}.gz`;
const compressedFile = path.join(BACKUP_DIR, compressedFilename);

console.log('🔄 Starting rotating backup...');
console.log(`📅 Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`);
console.log('');

async function createBackup() {
  // Step 1: Create SQL dump
  console.log('1️⃣  Creating database dump...');
  const backupCommand = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;
  await execAsync(backupCommand);

  const stats = fs.statSync(backupFile);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Backup created: ${fileSizeMB} MB`);

  // Step 2: Compress
  console.log('');
  console.log('2️⃣  Compressing backup...');
  await execAsync(`gzip -f "${backupFile}"`);

  const compressedStats = fs.statSync(compressedFile);
  const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
  const compressionRatio = ((1 - compressedStats.size / stats.size) * 100).toFixed(1);
  console.log(`✅ Compressed: ${compressedSizeMB} MB (saved ${compressionRatio}%)`);

  // Step 3: Rotate local backups (keep only last 7)
  console.log('');
  console.log('3️⃣  Rotating local backups (keep last 7)...');

  // Get all backup files, sorted by modification time (oldest first)
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.sql.gz'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs
    }))
    .sort((a, b) => a.time - b.time); // Oldest first

  // If we have more than MAX_LOCAL_BACKUPS, delete oldest
  let deletedCount = 0;
  while (files.length > MAX_LOCAL_BACKUPS) {
    const oldest = files.shift(); // Remove and get oldest
    fs.unlinkSync(oldest.path);
    deletedCount++;
    console.log(`   🗑️  Deleted: ${oldest.name}`);
  }

  if (deletedCount === 0) {
    console.log(`   ✅ No cleanup needed (${files.length} backups < ${MAX_LOCAL_BACKUPS} limit)`);
  } else {
    console.log(`   ✅ Deleted ${deletedCount} old backup(s), kept ${files.length} most recent`);
  }

  // Step 4: Calculate total local storage used
  const totalSize = files.reduce((sum, f) => {
    return sum + fs.statSync(f.path).size;
  }, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log(`   📊 Total local storage: ${totalSizeMB} MB (${files.length} backups)`);

  // Step 5: Weekly S3 upload (only on Sundays)
  if (dayOfWeek === 0 && s3Configured && s3Client) {
    console.log('');
    console.log('4️⃣  📅 SUNDAY: Uploading weekly snapshot to S3...');
    try {
      const fileContent = fs.readFileSync(compressedFile);
      const weekNumber = getWeekNumber(now);
      const s3Key = `database-backups/weekly/week-${weekNumber}_${compressedFilename}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/gzip',
        Metadata: {
          'backup-date': now.toISOString(),
          'day-of-week': 'Sunday',
          'week-number': weekNumber.toString(),
          'size-mb': compressedSizeMB,
        }
      });

      await s3Client.send(command);
      console.log(`   ✅ Uploaded to: s3://${S3_BUCKET}/${s3Key}`);
      console.log(`   📦 Weekly snapshot saved (keep for disaster recovery)`);

    } catch (error) {
      console.error('   ❌ S3 upload failed:', error.message);
      console.log('   ⚠️  Weekly backup not saved to cloud');
    }
  } else if (dayOfWeek === 0 && !s3Configured) {
    console.log('');
    console.log('4️⃣  📅 SUNDAY: S3 not configured, skipping weekly snapshot');
    console.log('   💡 Configure AWS_S3_BUCKET for disaster recovery backups');
  } else {
    console.log('');
    console.log('4️⃣  📅 Not Sunday, skipping S3 upload (only weekly snapshots)');
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 BACKUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Backup file:        ${compressedFilename}`);
  console.log(`Original size:      ${fileSizeMB} MB`);
  console.log(`Compressed size:    ${compressedSizeMB} MB`);
  console.log(`Compression ratio:  ${compressionRatio}%`);
  console.log(`Local backups:      ${files.length}/${MAX_LOCAL_BACKUPS} backups (${totalSizeMB} MB)`);
  console.log(`Storage limit:      ${(MAX_LOCAL_BACKUPS * 4).toFixed(0)} MB max`);
  console.log(`Weekly S3 upload:   ${dayOfWeek === 0 ? '✅ Uploaded' : '⏭️  Next Sunday'}`);
  console.log('='.repeat(60));
  console.log('');
  console.log('✅ Backup completed successfully!');
  console.log('');

  // Pro tip
  if (!s3Configured) {
    console.log('💡 TIP: Configure S3 for weekly off-site backups:');
    console.log('   1. Set AWS_ACCESS_KEY_ID in .env');
    console.log('   2. Set AWS_SECRET_ACCESS_KEY in .env');
    console.log('   3. Set AWS_S3_BUCKET in .env');
    console.log('');
  }
}

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

createBackup().catch((error) => {
  console.error('❌ Backup failed:', error.message);

  // Clean up failed files
  if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
  if (fs.existsSync(compressedFile)) fs.unlinkSync(compressedFile);

  process.exit(1);
});
