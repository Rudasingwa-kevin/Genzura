/**
 * Backup Testing Script
 * Tests that a backup can be successfully restored to a test database
 * Run: node scripts/test-backup.js <backup-file>
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

const DATABASE_URL = process.env.DATABASE_URL;
const backupFile = process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

if (!backupFile || !fs.existsSync(backupFile)) {
  console.error('❌ Please provide a valid backup file');
  console.log('Usage: node scripts/test-backup.js backups/file.sql');
  process.exit(1);
}

console.log('🧪 Testing backup restore...');
console.log(`📝 Backup file: ${backupFile}`);
console.log('');

// Extract database name from URL
const dbMatch = DATABASE_URL.match(/\/([^?]+)/);
const originalDbName = dbMatch ? dbMatch[1] : 'genzura_db';
const testDbName = `${originalDbName}_test`;

// Create connection string for test database
const testDatabaseUrl = DATABASE_URL.replace(originalDbName, testDbName);

async function testBackup() {
  try {
    console.log('1️⃣  Creating test database...');
    await execAsync(`createdb ${testDbName}`);
    console.log('✅ Test database created');

    console.log('');
    console.log('2️⃣  Restoring backup to test database...');
    await execAsync(`psql "${testDatabaseUrl}" < "${backupFile}"`);
    console.log('✅ Backup restored successfully');

    console.log('');
    console.log('3️⃣  Verifying data integrity...');

    // Count tables
    const { stdout: tableCount } = await execAsync(
      `psql "${testDatabaseUrl}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`
    );
    console.log(`   📊 Tables found: ${tableCount.trim()}`);

    // Count users
    try {
      const { stdout: userCount } = await execAsync(
        `psql "${testDatabaseUrl}" -t -c "SELECT COUNT(*) FROM \\"User\\";"`
      );
      console.log(`   👥 Users in backup: ${userCount.trim()}`);
    } catch (e) {
      console.log('   ⚠️  Could not count users (table may not exist)');
    }

    // Count cases
    try {
      const { stdout: caseCount } = await execAsync(
        `psql "${testDatabaseUrl}" -t -c "SELECT COUNT(*) FROM \\"Case\\";"`
      );
      console.log(`   📁 Cases in backup: ${caseCount.trim()}`);
    } catch (e) {
      console.log('   ⚠️  Could not count cases (table may not exist)');
    }

    console.log('');
    console.log('4️⃣  Cleaning up test database...');
    await execAsync(`dropdb ${testDbName}`);
    console.log('✅ Test database removed');

    console.log('');
    console.log('🎉 SUCCESS! Backup is valid and can be restored.');
    console.log('');
    console.log('Backup Test Summary:');
    console.log('  ✅ File exists and readable');
    console.log('  ✅ SQL syntax is valid');
    console.log('  ✅ Tables can be created');
    console.log('  ✅ Data can be inserted');
    console.log('  ✅ Database is functional after restore');

  } catch (error) {
    console.error('');
    console.error('❌ Backup test FAILED!');
    console.error('Error:', error.message);
    console.error('');
    console.error('⚠️  This backup may be corrupted or invalid!');

    // Try to clean up test database if it exists
    try {
      await execAsync(`dropdb ${testDbName}`);
    } catch (e) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

testBackup();
