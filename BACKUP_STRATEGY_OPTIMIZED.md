# Optimized Backup Strategy for Limited Storage

**Problem**: Database hosting has 500MB limit, daily 20MB backups would fill it in 25 days  
**Solution**: Multi-tier backup strategy with compression and S3 storage  
**Date**: May 27, 2026

---

## The Problem

```
Database Storage: 500MB (Supabase/managed hosting)
├─ Actual database: ~450MB
└─ Available for backups: 50MB

Daily backups: 20MB each
30 days of backups: 600MB
Result: 😱 EXCEEDS AVAILABLE SPACE BY 550MB!
```

---

## ✅ The Solution: 3-2-1 Strategy

### Strategy Overview

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1: Local (Application Server)                     │
│  ├─ Daily backups (compressed)                          │
│  ├─ Keep: Last 7 days only                              │
│  ├─ Storage: 7 × 4MB = 28MB                             │
│  └─ Purpose: Quick recovery for recent mistakes         │
└─────────────────────────────────────────────────────────┘
              │
              │ Upload to...
              ▼
┌─────────────────────────────────────────────────────────┐
│  TIER 2: AWS S3 Standard                                │
│  ├─ Daily backups (compressed)                          │
│  ├─ Keep: Last 30 days                                  │
│  ├─ Storage: 30 × 4MB = 120MB                           │
│  ├─ Cost: $0.003/month (practically free)               │
│  └─ Purpose: Medium-term recovery                       │
└─────────────────────────────────────────────────────────┘
              │
              │ Auto-transition to...
              ▼
┌─────────────────────────────────────────────────────────┐
│  TIER 3: AWS S3 Glacier                                 │
│  ├─ Weekly backups (compressed)                         │
│  ├─ Keep: 1 year                                        │
│  ├─ Storage: 52 × 4MB = 208MB                           │
│  ├─ Cost: $0.0008/month (almost free)                   │
│  └─ Purpose: Long-term compliance/disaster recovery     │
└─────────────────────────────────────────────────────────┘
```

---

## Compression Magic 🗜️

### Before Compression
```
genzura_2026-05-27.sql
Size: 20MB
Format: Plain SQL text
```

### After Compression (gzip)
```
genzura_2026-05-27.sql.gz
Size: 4MB (80% reduction!)
Format: Compressed binary
```

**Why it works so well:**
- SQL is text (lots of repeated patterns)
- `INSERT INTO "User"...` repeated thousands of times
- gzip compresses repeated patterns extremely well

---

## Storage Breakdown

### Current Problem (Naive approach)
```
Local Storage: 30 days × 20MB = 600MB ❌ TOO MUCH!
```

### Optimized Solution
```
Local Storage:
  7 days × 4MB (compressed) = 28MB ✅ FITS!

S3 Standard:
  30 days × 4MB = 120MB
  Cost: $0.003/month ✅ CHEAP!

S3 Glacier:
  52 weeks × 4MB = 208MB
  Cost: $0.0008/month ✅ CHEAPER!

Total Storage: 356MB
Total Monthly Cost: $0.004 (less than 1 cent!)
```

---

## Implementation

### Step 1: Update Environment Variables

Add to `.env`:
```bash
# Backup configuration
AWS_S3_BACKUP_BUCKET="genzura-backups"  # Separate from files bucket
AWS_REGION="eu-north-1"
```

### Step 2: Create S3 Backup Bucket

```bash
# Create bucket for backups
aws s3api create-bucket \
  --bucket genzura-backups \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1

# Enable versioning (extra safety)
aws s3api put-bucket-versioning \
  --bucket genzura-backups \
  --versioning-configuration Status=Enabled
```

### Step 3: Configure Lifecycle Rules

Create `lifecycle-rules.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldDailyBackups",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "ArchiveToGlacier",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ]
    },
    {
      "Id": "DeleteOldGlacierBackups",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 365
      }
    }
  ]
}
```

Apply rules:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket genzura-backups \
  --lifecycle-configuration file://lifecycle-rules.json
```

### Step 4: Update Backup Script

Use the new script I created:
```bash
npm run db:backup-s3
```

### Step 5: Add to package.json

```json
{
  "scripts": {
    "db:backup-s3": "node scripts/backup-to-s3.js"
  }
}
```

---

## Automated Backup Schedule

### Daily Backup (to S3)
```bash
# Cron job - runs daily at 2 AM
0 2 * * * cd /path/to/genzura-api && npm run db:backup-s3 >> logs/backup.log 2>&1
```

### What Happens Each Day

```
2:00 AM - Script runs
  ↓
2:00:10 - Create SQL dump (20MB)
  ↓
2:00:20 - Compress with gzip (4MB)
  ↓
2:00:25 - Upload to S3 Standard
  ↓
2:00:30 - Delete local compressed file
  ↓
2:00:31 - Clean up local backups >7 days
  ↓
2:00:32 - Done! ✅

Local Storage Used: 28MB (last 7 days)
S3 Storage Used: 120MB (last 30 days)
After 30 days: S3 moves old backups to Glacier
After 365 days: Glacier backups deleted
```

---

## Storage Math

### Scenario 1: Small Firm (10MB backups)
```
Compressed: 2MB per backup

Local (7 days):     14MB
S3 Standard (30):   60MB
S3 Glacier (52):    104MB

Monthly Cost: $0.002
Annual Cost: $0.024
```

### Scenario 2: Medium Firm (20MB backups)
```
Compressed: 4MB per backup

Local (7 days):     28MB
S3 Standard (30):   120MB
S3 Glacier (52):    208MB

Monthly Cost: $0.004
Annual Cost: $0.048
```

### Scenario 3: Large Firm (50MB backups)
```
Compressed: 10MB per backup

Local (7 days):     70MB
S3 Standard (30):   300MB
S3 Glacier (52):    520MB

Monthly Cost: $0.008
Annual Cost: $0.096
```

**All scenarios cost less than 10 cents per year!** 🎉

---

## Alternative: Use Managed Database Backups

### Supabase (Recommended)

**Free Tier:**
- ✅ Automatic daily backups (7 days)
- ✅ Stored separately (doesn't use your 500MB)
- ✅ No configuration needed
- ✅ One-click restore from dashboard

**How to enable:**
1. Go to Supabase Dashboard
2. Select your project
3. Settings → Database
4. Backups section
5. Already enabled by default! ✅

**You don't need to do anything!** Supabase handles it automatically.

---

### AWS RDS

**Automated Backups:**
- ✅ Daily automated snapshots
- ✅ Retention: 1-35 days (configurable)
- ✅ Point-in-time recovery (5-minute granularity)
- ✅ Stored in separate AWS storage (not your DB storage)
- ✅ Free for retention period equal to DB size

**How to enable:**
1. RDS Console → Select database
2. Modify → Backup
3. Automated backups: Enabled
4. Retention period: 30 days
5. Backup window: 02:00-03:00

---

### DigitalOcean Managed Database

**Automated Backups:**
- ✅ Daily automated backups
- ✅ Retention: 7 days (free), 30 days (paid)
- ✅ Stored separately
- ✅ One-click restore

**How to enable:**
1. Already enabled by default! ✅
2. Go to: Database → Settings → Backups
3. View backup history
4. Restore with one click

---

## Comparison: DIY vs Managed

| Feature | DIY (Our Script) | Supabase Free | AWS RDS | DigitalOcean |
|---------|------------------|---------------|---------|--------------|
| **Cost** | ~$0.01/month | FREE | ~$15/month | ~$15/month |
| **Setup** | Manual | Auto | Auto | Auto |
| **Retention** | Customizable | 7 days | 1-35 days | 7-30 days |
| **Point-in-time** | No | No | Yes | No |
| **Storage impact** | 28MB local | 0MB | 0MB | 0MB |
| **Restore** | CLI command | Dashboard | Dashboard | Dashboard |
| **Maintenance** | You manage | They manage | They manage | They manage |

---

## Recommendation by Budget

### No Budget (FREE) 💚
**Use: Supabase Free Tier + Managed Backups**
- ✅ Automatic daily backups (7 days)
- ✅ Zero cost
- ✅ Zero maintenance
- ✅ Doesn't use your 500MB limit

**Setup time:** 0 minutes (already enabled!)

---

### Tiny Budget ($0.01/month) 💙
**Use: Supabase + Our S3 Script**
- ✅ Automatic daily backups (7 days) from Supabase
- ✅ Extra long-term backups (1 year) to S3
- ✅ Best of both worlds

**Setup time:** 15 minutes

---

### Small Budget ($15/month) 💜
**Use: AWS RDS or DigitalOcean**
- ✅ Fully managed database
- ✅ Automatic backups included
- ✅ Point-in-time recovery (RDS)
- ✅ Better performance
- ✅ Automatic scaling

**Setup time:** 30 minutes

---

## Disaster Recovery Testing

### Monthly Test (5 minutes)

```bash
# 1. Run backup
npm run db:backup-s3

# 2. Test backup is valid
npm run db:test-backup backups/latest.sql.gz

# 3. Verify S3 upload
aws s3 ls s3://genzura-backups/database-backups/

# 4. Download and test restore (optional)
aws s3 cp s3://genzura-backups/database-backups/latest.sql.gz ./test.sql.gz
gunzip test.sql.gz
npm run db:restore test.sql
```

---

## Recovery Scenarios

### Scenario 1: "I just deleted something 1 hour ago"
**Recovery Time:** 2 minutes

```bash
# Use today's local backup
npm run db:restore backups/genzura_2026-05-27.sql.gz
# Uncompress and restore
gunzip -c backups/genzura_2026-05-27.sql.gz | psql $DATABASE_URL
```

**Data Lost:** 1 hour of work (since last backup)

---

### Scenario 2: "I need data from last week"
**Recovery Time:** 5 minutes

```bash
# Download from S3
aws s3 cp s3://genzura-backups/database-backups/genzura_2026-05-20.sql.gz ./

# Restore
gunzip -c genzura_2026-05-20.sql.gz | psql $DATABASE_URL
```

**Data Lost:** Everything after May 20

---

### Scenario 3: "My server exploded"
**Recovery Time:** 30 minutes

```bash
# 1. Get new server
# 2. Install PostgreSQL
# 3. Download latest backup from S3
aws s3 cp s3://genzura-backups/database-backups/ ./ --recursive

# 4. Restore most recent
gunzip -c genzura_2026-05-27.sql.gz | psql $NEW_DATABASE_URL

# 5. Back in business!
```

---

## Monitoring & Alerts

### What to Monitor

```bash
# Check backup ran successfully (daily)
if [ ! -f "backups/genzura_$(date +%Y-%m-%d)*.sql.gz" ]; then
  echo "⚠️ TODAY'S BACKUP MISSING!" | mail -s "Backup Alert" admin@genzura.com
fi

# Check S3 has recent backup
aws s3 ls s3://genzura-backups/database-backups/ --recursive | tail -1

# Check backup size is reasonable (not 0 bytes, not suddenly huge)
```

---

## Summary

### Problem Solved ✅

**Before:**
- ❌ 600MB of backups on 500MB storage
- ❌ Database server runs out of space in 25 days
- ❌ Can't keep long-term backups

**After:**
- ✅ Only 28MB local (7 days)
- ✅ 120MB on S3 (30 days)
- ✅ 208MB on Glacier (1 year)
- ✅ Total cost: Less than 1 cent/month
- ✅ Never run out of database space

---

### Action Plan

**Option 1: Zero Cost (Recommended for starting out)**
1. ✅ Use Supabase/Managed DB built-in backups
2. ✅ Nothing to configure - already working!
3. ✅ 7 days retention - good enough initially

**Option 2: Best Practice (Recommended for production)**
1. ✅ Use managed DB backups (7-30 days)
2. ✅ Add our S3 script for long-term backups (1 year)
3. ✅ Configure lifecycle rules for auto-archiving
4. ✅ Test monthly
5. ✅ Cost: $0.01/month

**Option 3: Enterprise (If you have budget)**
1. ✅ Use AWS RDS with automated backups
2. ✅ Point-in-time recovery (restore to any second)
3. ✅ 35-day retention
4. ✅ Cost: $15/month (includes database hosting)

---

## Quick Start

```bash
# Install the new script
npm run db:backup-s3

# Add to crontab for daily execution
0 2 * * * cd /path/to/genzura-api && npm run db:backup-s3

# That's it! 🎉
```

---

**Your database is now safe, and you'll never run out of storage!** 💾✨

**Last Updated**: May 27, 2026
