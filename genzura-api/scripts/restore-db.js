/**
 * Database Restore Script
 *
 * Restores PostgreSQL database from backup file
 * Usage: npm run db:restore backups/backup-2026-05-19T10-30-00.sql
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import readline from 'readline';

dotenv.config();

const execAsync = promisify(exec);

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Error: Backup file path required');
  console.log('\nUsage:');
  console.log('  npm run db:restore backups/backup-2026-05-19T10-30-00.sql');
  console.log('\nAvailable backups:');
  exec('ls -1 backups/*.sql 2>/dev/null || dir /B backups\\*.sql 2>nul', (err, stdout) => {
    if (stdout) {
      console.log(stdout);
    } else {
      console.log('  No backups found');
    }
  });
  process.exit(1);
}

async function confirmRestore() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will OVERWRITE the current database!\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function restoreDatabase() {
  try {
    console.log('🗄️  Database Restore Tool\n');

    // Check if backup file exists
    if (!existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    console.log(`📁 Backup file: ${backupFile}`);

    // Get confirmation
    const confirmed = await confirmRestore();
    if (!confirmed) {
      console.log('\n❌ Restore cancelled by user');
      process.exit(0);
    }

    console.log('\n🔄 Starting database restore...\n');

    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in .env');
    }

    // Extract database info
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;

    // Set PostgreSQL password
    process.env.PGPASSWORD = password;

    console.log(`📦 Restoring to database: ${database}`);
    console.log('⏳ This may take a few minutes...\n');

    // Drop existing database and recreate (clean slate)
    console.log('1️⃣  Dropping existing database...');
    await execAsync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "DROP DATABASE IF EXISTS ${database};"`);

    console.log('2️⃣  Creating fresh database...');
    await execAsync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE ${database};"`);

    // Restore from backup
    console.log('3️⃣  Restoring from backup file...');
    const restoreCommand = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFile}"`;
    await execAsync(restoreCommand);

    console.log('4️⃣  Verifying restoration...');

    // Count tables
    const { stdout: tableCount } = await execAsync(
      `psql -h ${host} -p ${port} -U ${user} -d ${database} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`
    );

    const tables = parseInt(tableCount.trim());

    console.log('\n✅ Restore completed successfully!');
    console.log(`📊 Tables restored: ${tables}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Verify data integrity');
    console.log('   3. Test critical features\n');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check if PostgreSQL is running');
    console.log('   • Verify DATABASE_URL in .env');
    console.log('   • Ensure backup file is not corrupted');
    console.log('   • Check PostgreSQL user permissions\n');
    process.exit(1);
  }
}

// Run restore
restoreDatabase();
