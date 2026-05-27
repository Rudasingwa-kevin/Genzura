# Database Backup & Recovery Guide

## Overview
Comprehensive guide for backing up and restoring the Genzura PostgreSQL database.

**Date**: May 27, 2026  
**Status**: ✅ Implemented  
**Priority**: 🔴 CRITICAL

---

## Backup Scripts Created

### 1. Automated Backup Script
**Location**: `genzura-api/scripts/backup-db.js`

**Features**:
- ✅ Creates timestamped SQL dump files
- ✅ Stores in `genzura-api/backups/` directory
- ✅ Auto-cleanup: Deletes backups older than 30 days
- ✅ Reports backup size and status
- ✅ Safe error handling

**Usage**:
```bash
cd genzura-api
npm run db:backup
```

**Output**:
```
🔄 Starting database backup...
📝 Backup file: /path/to/backups/genzura_2026-05-27T14-30-00.sql
✅ Backup completed successfully!
📦 Backup size: 15.23 MB
📍 Location: /path/to/backups/genzura_2026-05-27T14-30-00.sql
📊 Total backups: 12
```

---

### 2. Database Restore Script
**Location**: `genzura-api/scripts/restore-db.js`

**Features**:
- ✅ Restores from backup SQL file
- ✅ Confirmation prompt (type "RESTORE" to proceed)
- ✅ Shows backup file info before restoring
- ✅ Safety warnings

**Usage**:
```bash
cd genzura-api
npm run db:restore backups/genzura_2026-05-27T14-30-00.sql
```

**Interactive Prompt**:
```
⚠️  DATABASE RESTORE WARNING ⚠️
This will overwrite your current database with the backup!

📝 Backup file: genzura_2026-05-27T14-30-00.sql
📦 Size: 15.23 MB
📅 Date: 2026-05-27

Type "RESTORE" to continue, or anything else to cancel:
```

---

## Manual Backup Commands

### Quick Manual Backup
```bash
# Backup to file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Backup Specific Tables
```bash
# Backup only User table
pg_dump $DATABASE_URL -t User > users_backup.sql

# Backup multiple tables
pg_dump $DATABASE_URL -t User -t Case -t Document > critical_tables.sql
```

### Backup Schema Only (No Data)
```bash
pg_dump $DATABASE_URL --schema-only > schema_backup.sql
```

---

## Automated Backup Schedule

### Option 1: Cron Job (Linux/Mac)

**Edit crontab**:
```bash
crontab -e
```

**Add daily backup at 2 AM**:
```bash
0 2 * * * cd /path/to/genzura-api && npm run db:backup >> /path/to/logs/backup.log 2>&1
```

**Other schedules**:
```bash
# Every 6 hours
0 */6 * * * cd /path/to/genzura-api && npm run db:backup

# Every Sunday at midnight
0 0 * * 0 cd /path/to/genzura-api && npm run db:backup

# Daily at 2 AM and 2 PM
0 2,14 * * * cd /path/to/genzura-api && npm run db:backup
```

---

### Option 2: Windows Task Scheduler

1. **Open Task Scheduler**
2. **Create Basic Task**
3. **Name**: "Genzura Database Backup"
4. **Trigger**: Daily at 2:00 AM
5. **Action**: Start a program
   - **Program**: `C:\Program Files\nodejs\node.exe`
   - **Arguments**: `scripts\backup-db.js`
   - **Start in**: `C:\Users\KEVIN\Desktop\Genzura\genzura-api`

---

### Option 3: Node-Cron (Built into Application)

**Add to `genzura-api/src/index.ts`**:
```typescript
import cron from 'node-cron';
import { exec } from 'child_process';

// Schedule daily backup at 2 AM
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 2 * * *', () => {
    console.log('🔄 Running scheduled database backup...');
    exec('npm run db:backup', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Scheduled backup failed:', error);
        // TODO: Send alert email
      } else {
        console.log('✅ Scheduled backup completed');
        console.log(stdout);
      }
    });
  });
  console.log('⏰ Database backup scheduled (daily at 2 AM)');
}
```

---

## Backup Storage Locations

### Local Storage (Current)
**Location**: `genzura-api/backups/`

**Pros**:
- ✅ Fast access
- ✅ No additional cost

**Cons**:
- ❌ Not redundant (single point of failure)
- ❌ Lost if server crashes

**Recommended**: Local + Cloud storage

---

### Cloud Storage (Recommended for Production)

#### AWS S3
```bash
# After creating backup locally, upload to S3
aws s3 cp backups/genzura_2026-05-27.sql s3://genzura-backups/

# Automated with lifecycle rules
aws s3 mb s3://genzura-backups
aws s3api put-bucket-lifecycle-configuration \
  --bucket genzura-backups \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json**:
```json
{
  "Rules": [{
    "Id": "ArchiveOldBackups",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 30,
      "StorageClass": "GLACIER"
    }],
    "Expiration": {
      "Days": 365
    }
  }]
}
```

---

#### DigitalOcean Spaces
```bash
# Install s3cmd
sudo apt install s3cmd

# Configure
s3cmd --configure

# Upload backup
s3cmd put backups/genzura_2026-05-27.sql s3://genzura-backups/
```

---

## Database Restore Procedures

### Standard Restore
```bash
# Using npm script
npm run db:restore backups/genzura_2026-05-27.sql

# Or manually
psql $DATABASE_URL < backups/genzura_2026-05-27.sql
```

---

### Restore from Compressed Backup
```bash
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

---

### Restore Specific Tables
```bash
# Extract table from backup
pg_restore -t User backups/genzura_2026-05-27.sql | psql $DATABASE_URL
```

---

### Point-in-Time Recovery (Advanced)

If using managed PostgreSQL (AWS RDS, DigitalOcean):

1. **AWS RDS**:
   - Go to RDS Console
   - Select database
   - Actions → Restore to point in time
   - Choose timestamp
   - Create new instance

2. **DigitalOcean**:
   - Go to Databases
   - Select database
   - Backups tab
   - Choose backup
   - Restore

---

## Backup Verification

### Test Backup Integrity
```bash
# Verify SQL file is valid
cat backups/genzura_2026-05-27.sql | psql --dry-run $DATABASE_URL

# Check file size (should not be 0)
ls -lh backups/

# Verify backup contains data
grep -c "INSERT" backups/genzura_2026-05-27.sql
```

---

### Test Restore in Staging

**Best Practice**: Test restores regularly!

```bash
# 1. Create test database
createdb genzura_test

# 2. Update DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:pass@localhost:5432/genzura_test"

# 3. Restore backup
psql $DATABASE_URL < backups/genzura_2026-05-27.sql

# 4. Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# 5. Drop test database
dropdb genzura_test
```

---

## Disaster Recovery Plan

### Scenario 1: Accidental Data Deletion

**Recovery Steps**:
1. Stop application immediately
2. Identify last good backup
3. Restore from backup
4. Verify data integrity
5. Restart application
6. Investigate cause

**Time to Restore**: 5-10 minutes

---

### Scenario 2: Database Corruption

**Recovery Steps**:
1. Stop application
2. Create emergency backup (if possible)
3. Restore from last known good backup
4. Run Prisma migrations
5. Verify schema
6. Test application
7. Restart

**Time to Restore**: 10-20 minutes

---

### Scenario 3: Server Failure

**Recovery Steps**:
1. Provision new server
2. Install dependencies
3. Clone repository
4. Download backup from cloud storage
5. Restore database
6. Configure environment
7. Start application

**Time to Restore**: 30-60 minutes

---

## Monitoring & Alerts

### Backup Success Monitoring

**Add to backup script**:
```javascript
// Send notification on backup completion
import nodemailer from 'nodemailer';

const sendBackupNotification = async (status, details) => {
  // Email alert
  await transporter.sendMail({
    to: 'admin@genzura.com',
    subject: `Database Backup ${status}`,
    text: details
  });
};
```

---

### Backup Failure Alerts

Monitor these conditions:
- ❌ Backup file size is 0 bytes
- ❌ Backup hasn't run in 25 hours
- ❌ Backup directory is full
- ❌ Backup process failed

---

## Backup Retention Policy

### Recommended Schedule

| Backup Type | Frequency | Retention |
|------------|-----------|-----------|
| **Local** | Daily | 30 days |
| **S3 Standard** | Daily | 30 days |
| **S3 Glacier** | Weekly | 1 year |
| **Off-site** | Monthly | 2 years |

---

### Storage Requirements

**Estimate**: ~500 MB per backup (depends on data size)

**30-day retention**: ~15 GB  
**1-year retention**: ~180 GB

**Cost (AWS S3)**:
- Standard: $0.023/GB/month = $3.45/month for 15 GB
- Glacier: $0.004/GB/month = $8.64/month for 180 GB

---

## Security Best Practices

### Encrypt Backups

```bash
# Encrypt backup with GPG
pg_dump $DATABASE_URL | gzip | gpg -e -r admin@genzura.com > backup_encrypted.sql.gz.gpg

# Decrypt and restore
gpg -d backup_encrypted.sql.gz.gpg | gunzip | psql $DATABASE_URL
```

---

### Secure Backup Storage

1. ✅ Use encrypted cloud storage
2. ✅ Restrict access with IAM policies
3. ✅ Enable S3 bucket versioning
4. ✅ Use VPC endpoints for AWS
5. ✅ Enable audit logging

---

### Access Control

**Who can restore**:
- ✅ DevOps team
- ✅ Database administrators
- ❌ Developers (read-only)
- ❌ End users

---

## Quick Reference Commands

### Backup
```bash
# Standard backup
npm run db:backup

# Manual backup with compression
pg_dump $DATABASE_URL | gzip > backup.sql.gz

# Backup to S3
npm run db:backup && aws s3 cp backups/*.sql s3://genzura-backups/
```

### Restore
```bash
# Standard restore
npm run db:restore backups/genzura_YYYY-MM-DD.sql

# Manual restore
psql $DATABASE_URL < backups/genzura_YYYY-MM-DD.sql

# Restore from S3
aws s3 cp s3://genzura-backups/genzura_YYYY-MM-DD.sql backups/
npm run db:restore backups/genzura_YYYY-MM-DD.sql
```

### Verification
```bash
# List backups
ls -lh backups/

# Check backup size
du -sh backups/*

# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Count records in User table
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

---

## Troubleshooting

### Issue: "pg_dump: command not found"

**Solution**: Install PostgreSQL client tools
```bash
# Ubuntu/Debian
sudo apt install postgresql-client

# Mac
brew install postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

---

### Issue: "Permission denied"

**Solution**: Check file permissions
```bash
chmod +x scripts/backup-db.js
chmod 755 backups/
```

---

### Issue: "Backup file is empty (0 bytes)"

**Causes**:
- Database connection failed
- Incorrect DATABASE_URL
- Database is empty
- Disk full

**Solution**:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# Check disk space
df -h

# Check error logs
cat logs/backup.log
```

---

### Issue: "Restore hangs or takes too long"

**Solution**:
```bash
# Check database connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Kill active connections
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='genzura_db';"

# Retry restore
npm run db:restore backups/file.sql
```

---

## Backup Checklist

### Daily
- [ ] Verify automated backup ran successfully
- [ ] Check backup file size is reasonable
- [ ] Monitor disk space in backups directory

### Weekly
- [ ] Test restore on staging environment
- [ ] Upload weekly backup to cloud storage
- [ ] Verify backup retention policy

### Monthly
- [ ] Full disaster recovery test
- [ ] Review backup retention policy
- [ ] Update backup documentation
- [ ] Rotate encryption keys (if using)

---

## Status

**Implementation**: ✅ Complete  
**Testing**: ⚠️ Needs production testing  
**Automation**: ⏰ Needs cron setup  
**Cloud Storage**: 🔴 Not configured  

**Next Steps**:
1. Test backup script: `npm run db:backup`
2. Test restore script: `npm run db:restore`
3. Set up automated daily backups
4. Configure S3 backup storage
5. Test disaster recovery procedure

---

**Last Updated**: May 27, 2026  
**Created By**: Claude Code Assistant
