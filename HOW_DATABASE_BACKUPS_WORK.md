# How Database Backups Work - Complete Visual Guide

**Date**: May 27, 2026  
**For**: Genzura Legal Practice Management System

---

## Table of Contents
1. [What is a Backup?](#what-is-a-backup)
2. [How Backup Works (Step by Step)](#how-backup-works)
3. [How Restore Works](#how-restore-works)
4. [Real-World Scenarios](#real-world-scenarios)
5. [Backup Commands](#backup-commands)
6. [Testing Your Backups](#testing-your-backups)
7. [Common Questions](#common-questions)

---

## What is a Backup?

A database backup is a **complete copy** of all your data saved to a file. Think of it like:

📸 **Taking a photo of your entire database**
- If you delete something by accident → Restore from photo
- If your computer crashes → Restore from photo
- If someone hacks your database → Restore from photo

### What Gets Backed Up?

**EVERYTHING:**
```
✅ All tables (User, Case, Document, etc.)
✅ All data in those tables (every record)
✅ Table structure (columns, types, constraints)
✅ Relationships (foreign keys)
✅ Indexes (for fast searching)
✅ Sequences (auto-increment IDs)

❌ NOT backed up:
   - Uploaded files (PDFs, images) - stored in S3/uploads folder
   - Application code
   - Environment variables
```

---

## How Backup Works (Step by Step)

### Visual Flow

```
┌────────────────────────────────────────────┐
│  Step 1: You run the command               │
│  $ npm run db:backup                       │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 2: Script connects to PostgreSQL     │
│  Using: DATABASE_URL from .env             │
│  postgresql://user:pass@localhost:5432/db  │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 3: pg_dump reads EVERYTHING          │
│  ┌──────────────────────────────────────┐ │
│  │  Reading User table...      ████ 25% │ │
│  │  Reading Case table...      ████ 50% │ │
│  │  Reading Document table...  ████ 75% │ │
│  │  Reading all other tables... ████100%│ │
│  └──────────────────────────────────────┘ │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 4: Converts to SQL commands          │
│  ┌──────────────────────────────────────┐ │
│  │ CREATE TABLE "User" (...);           │ │
│  │ INSERT INTO "User" VALUES (...);     │ │
│  │ INSERT INTO "User" VALUES (...);     │ │
│  │ CREATE TABLE "Case" (...);           │ │
│  │ INSERT INTO "Case" VALUES (...);     │ │
│  │ ... thousands of SQL commands        │ │
│  └──────────────────────────────────────┘ │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 5: Saves to file                     │
│  📁 backups/genzura_2026-05-27.sql         │
│  📦 Size: 15.3 MB                          │
│  ✅ Backup complete!                       │
└────────────────────────────────────────────┘
```

---

### What's Inside a Backup File?

Let me show you **exactly** what's in `genzura_2026-05-27.sql`:

```sql
-- ==========================================
-- SECTION 1: DROP EXISTING TABLES (cleanup)
-- ==========================================
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Case" CASCADE;
DROP TABLE IF EXISTS "Document" CASCADE;
-- ... drops all tables

-- ==========================================
-- SECTION 2: CREATE TABLE STRUCTURES
-- ==========================================
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Attorney',
    "initials" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'Open',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Case_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Case_ownerId_fkey" FOREIGN KEY ("ownerId") 
        REFERENCES "User"("id") ON DELETE CASCADE
);

-- ... creates all 20+ tables

-- ==========================================
-- SECTION 3: INSERT ALL DATA
-- ==========================================
INSERT INTO "User" ("id", "email", "name", "password", "role", "initials", "avatarUrl", "createdAt", "updatedAt") 
VALUES 
('cm5abc123', 'admin@genzura.com', 'Admin User', '$2a$10$hash...', 'Admin', 'AU', NULL, '2026-01-15 10:30:00', '2026-05-27 08:00:00'),
('cm5def456', 'john@lawfirm.com', 'John Doe', '$2a$10$hash...', 'Attorney', 'JD', '/uploads/avatar1.jpg', '2026-02-20 14:15:00', '2026-05-26 16:30:00'),
('cm5ghi789', 'jane@lawfirm.com', 'Jane Smith', '$2a$10$hash...', 'Attorney', 'JS', NULL, '2026-03-10 09:00:00', '2026-05-27 07:45:00');
-- ... inserts ALL users (hundreds of lines)

INSERT INTO "Case" ("id", "caseNumber", "title", "description", "status", "ownerId", "createdAt", "updatedAt") 
VALUES 
('case001', 'C-2026-001', 'Smith vs. City Council', 'Land dispute case', 'Open', 'cm5def456', '2026-01-20 10:00:00', '2026-05-25 15:30:00'),
('case002', 'C-2026-002', 'Johnson Divorce', 'Divorce proceedings', 'InProgress', 'cm5ghi789', '2026-02-05 11:30:00', '2026-05-26 14:00:00');
-- ... inserts ALL cases (hundreds of lines)

-- ==========================================
-- SECTION 4: CREATE INDEXES
-- ==========================================
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Case_ownerId_idx" ON "Case"("ownerId");
-- ... creates all indexes for fast queries

-- ==========================================
-- SECTION 5: SEQUENCES (for auto-increment)
-- ==========================================
SELECT setval('"User_id_seq"', 1523, true);
SELECT setval('"Case_id_seq"', 89, true);
-- ... resets all auto-increment counters
```

**Total file size**: 15-50 MB (depends on how much data you have)

---

## How Restore Works

### Visual Flow

```
┌────────────────────────────────────────────┐
│  Step 1: You run restore command           │
│  $ npm run db:restore backups/file.sql     │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 2: Script asks for confirmation      │
│  ⚠️  This will OVERWRITE your database!    │
│  Type "RESTORE" to continue:               │
│  > RESTORE ✓                               │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 3: Connect to database               │
│  Using: DATABASE_URL                       │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 4: Execute SQL commands from backup  │
│  ┌──────────────────────────────────────┐ │
│  │ DROP TABLE "User" CASCADE;           │ │ ← Delete current User table
│  │ DROP TABLE "Case" CASCADE;           │ │ ← Delete current Case table
│  │ CREATE TABLE "User" (...);           │ │ ← Recreate User table
│  │ CREATE TABLE "Case" (...);           │ │ ← Recreate Case table
│  │ INSERT INTO "User" VALUES (...);     │ │ ← Add back old users
│  │ INSERT INTO "Case" VALUES (...);     │ │ ← Add back old cases
│  │ ... executes all SQL commands        │ │
│  └──────────────────────────────────────┘ │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  Step 5: Database restored!                │
│  ✅ Database now identical to backup time  │
│  🔄 Remember to restart your application   │
└────────────────────────────────────────────┘
```

---

## Real-World Scenarios

### Scenario 1: Accidental Deletion

**Timeline:**

**Monday 9 AM** - Create daily backup
```
Database contains:
- 5 users
- 50 cases
- 200 documents
```

**Monday 2 PM** - Someone accidentally runs:
```sql
DELETE FROM "Case";  -- 😱 Deletes ALL cases!
```

**Database now:**
```
- 5 users ✅
- 0 cases ❌ (all gone!)
- 200 documents ✅
```

**Monday 2:05 PM** - PANIC! Then remember backups exist 😌

**Monday 2:10 PM** - Restore from morning backup:
```bash
npm run db:restore backups/genzura_2026-05-27_09-00.sql
```

**Monday 2:11 PM** - Database restored:
```
- 5 users ✅
- 50 cases ✅ (back!)
- 200 documents ✅
```

**Data lost**: Work done between 9 AM - 2 PM (5 hours)

---

### Scenario 2: Ransomware Attack

**Timeline:**

**Tuesday 2 AM** - Automated backup runs (you're sleeping)
```
Backup created: genzura_2026-05-28_02-00.sql
Uploaded to: AWS S3 (safe in cloud)
```

**Tuesday 10 AM** - Ransomware encrypts your entire server
```
😈 Your files have been encrypted!
😈 Pay $10,000 in Bitcoin to decrypt!
🚨 Database: ENCRYPTED
🚨 Backups folder: ENCRYPTED
```

**Tuesday 11 AM** - You don't panic because...

**Cloud backup is safe!** ☁️
1. Get new clean server
2. Install PostgreSQL
3. Download backup from S3
4. Restore database
5. Back in business!

**Total downtime**: 2-3 hours  
**Cost**: $0 (instead of $10,000)

---

### Scenario 3: Testing Major Update

**Before Update:**
```bash
# Create backup before risky operation
npm run db:backup
# Creates: genzura_2026-05-27_14-30-00.sql
```

**During Update:**
```bash
# Run database migration
npm run migrate:deploy
```

**If something goes wrong:**
```bash
# Restore to state before update
npm run db:restore backups/genzura_2026-05-27_14-30-00.sql
# Try again with different approach
```

**Result**: Safe experimentation! No fear of breaking things.

---

## Backup Commands

### Basic Commands

```bash
# 1. Create a backup
npm run db:backup

# Output:
# 🔄 Starting database backup...
# 📝 Backup file: backups/genzura_2026-05-27T14-30-00.sql
# ✅ Backup completed successfully!
# 📦 Backup size: 15.23 MB
# 📊 Total backups: 12
```

```bash
# 2. List all backups
ls -lh backups/

# Output:
# -rw-r--r-- 1 user  15M May 27 14:30 genzura_2026-05-27T14-30-00.sql
# -rw-r--r-- 1 user  14M May 26 02:00 genzura_2026-05-26T02-00-00.sql
# -rw-r--r-- 1 user  14M May 25 02:00 genzura_2026-05-25T02-00-00.sql
```

```bash
# 3. Restore from backup
npm run db:restore backups/genzura_2026-05-27T14-30-00.sql

# Interactive prompt:
# ⚠️  DATABASE RESTORE WARNING ⚠️
# This will overwrite your current database!
# Type "RESTORE" to continue: 
```

```bash
# 4. Test a backup (don't actually restore, just verify it's valid)
npm run db:test-backup backups/genzura_2026-05-27T14-30-00.sql

# Output:
# 🧪 Testing backup restore...
# 1️⃣  Creating test database...
# 2️⃣  Restoring backup to test database...
# 3️⃣  Verifying data integrity...
#    📊 Tables found: 23
#    👥 Users in backup: 5
#    📁 Cases in backup: 50
# 4️⃣  Cleaning up test database...
# 🎉 SUCCESS! Backup is valid
```

---

### Advanced Commands

```bash
# Backup with compression (smaller file)
pg_dump $DATABASE_URL | gzip > backup.sql.gz

# Restore compressed backup
gunzip -c backup.sql.gz | psql $DATABASE_URL

# Backup only specific tables
pg_dump $DATABASE_URL -t User -t Case > partial_backup.sql

# Backup schema only (no data)
pg_dump $DATABASE_URL --schema-only > schema.sql

# Backup data only (no schema)
pg_dump $DATABASE_URL --data-only > data.sql
```

---

## Testing Your Backups

### Why Test?

**Horror story:**
```
Company does daily backups for 2 years ✅
Server crashes 💥
Try to restore from backup...
Backup file is corrupted! ❌
Discover backups haven't worked for 6 months 😱
Lost 6 months of data 💀
```

**Lesson**: Test your backups regularly!

---

### How to Test (Monthly Recommended)

```bash
# 1. Create fresh backup
npm run db:backup

# 2. Test it can be restored
npm run db:test-backup backups/latest.sql

# 3. If test passes, backup is good! ✅
# 4. If test fails, fix backup system immediately! 🚨
```

---

### What the Test Does

```
1. Creates temporary test database
   ↓
2. Tries to restore backup to test database
   ↓
3. Verifies:
   - SQL syntax is valid ✅
   - Tables can be created ✅
   - Data can be inserted ✅
   - Row counts match ✅
   ↓
4. Deletes test database (cleanup)
   ↓
5. Reports: SUCCESS or FAILURE
```

---

## Common Questions

### Q1: How often should I backup?

**Answer:** Depends on how much data loss you can tolerate

| Backup Frequency | Max Data Loss | Who Needs This |
|-----------------|---------------|----------------|
| **Every hour** | 1 hour of work | High-volume law firms |
| **Daily** (2 AM) | 1 day of work | Most small firms ✅ Recommended |
| **Weekly** | 1 week of work | Personal projects only |
| **Monthly** | 1 month of work | ❌ Too risky! |

**Genzura Recommendation**: Daily at 2 AM

---

### Q2: Where should I store backups?

**Answer:** Follow the **3-2-1 Rule**

```
3 copies of data
2 different storage types
1 copy off-site (cloud)
```

**Example for Genzura:**
```
1. Original database (running on server)
2. Local backup (server's backups/ folder)
3. Cloud backup (AWS S3) ✅ CRITICAL!
```

**Why cloud?** If your office burns down, local backups burn too! 🔥

---

### Q3: How long to keep backups?

**Recommended retention:**

```
Daily backups:   Keep 30 days
Weekly backups:  Keep 1 year
Monthly backups: Keep forever (or 7 years for legal compliance)
```

**Storage calculator:**
```
Daily (30 days × 15 MB)    = 450 MB
Weekly (52 weeks × 15 MB)  = 780 MB
Monthly (12 months × 15 MB) = 180 MB
Total: ~1.4 GB
```

**Cost**: ~$0.03/month on AWS S3

---

### Q4: What if backup file is huge?

**Solutions:**

```bash
# 1. Use compression (reduces size by 80%)
pg_dump $DATABASE_URL | gzip > backup.sql.gz
# 15 MB → 3 MB

# 2. Backup only critical tables
pg_dump $DATABASE_URL -t User -t Case -t Document > critical.sql

# 3. Use incremental backups (advanced)
# Only backup what changed since last backup
```

---

### Q5: Can I backup while app is running?

**Answer:** YES! ✅

PostgreSQL supports **hot backups** (backups while database is active)

```
Users still working → 👨‍💼 👩‍💼
Database still running → 🗄️ ✅
Backup happening → 📦 ✅
No downtime! → 🎉
```

**Note:** For maximum consistency, schedule backups during low-traffic times (2-4 AM)

---

### Q6: What's NOT backed up?

**These are separate from database:**

```
❌ Uploaded files (PDFs, images)
   - Location: uploads/ folder or S3 bucket
   - Backup separately: aws s3 sync uploads/ s3://backups/

❌ Application code
   - Location: Git repository
   - Backup: Already in GitHub! ✅

❌ Environment variables (.env)
   - Location: .env file
   - Backup: Store in password manager

❌ Server configuration
   - Location: nginx.conf, pm2 config, etc.
   - Backup: Include in documentation
```

---

### Q7: How long does backup take?

**Depends on database size:**

| Database Size | Backup Time | Restore Time |
|--------------|-------------|--------------|
| 10 MB (new) | 2 seconds | 5 seconds |
| 100 MB (small firm) | 10 seconds | 30 seconds |
| 1 GB (medium firm) | 2 minutes | 5 minutes |
| 10 GB (large firm) | 20 minutes | 50 minutes |

**Genzura (typical)**: 15 MB = ~10 seconds backup, ~30 seconds restore

---

### Q8: Can I automate backups?

**YES! Highly recommended:**

**Option 1: Cron (Linux/Mac)**
```bash
# Add to crontab (run: crontab -e)
0 2 * * * cd /path/to/genzura-api && npm run db:backup
```

**Option 2: Windows Task Scheduler**
```
Task: Daily at 2:00 AM
Action: node scripts/backup-db.js
```

**Option 3: In your application (Node-cron)**
```javascript
// Add to index.ts
cron.schedule('0 2 * * *', () => {
  exec('npm run db:backup');
});
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  GENZURA DATABASE BACKUP CHEAT SHEET           │
├─────────────────────────────────────────────────┤
│                                                  │
│  CREATE BACKUP:                                 │
│  $ npm run db:backup                            │
│                                                  │
│  RESTORE BACKUP:                                │
│  $ npm run db:restore backups/file.sql          │
│                                                  │
│  TEST BACKUP:                                   │
│  $ npm run db:test-backup backups/file.sql      │
│                                                  │
│  LIST BACKUPS:                                  │
│  $ ls -lh backups/                              │
│                                                  │
│  BACKUP LOCATION:                               │
│  genzura-api/backups/                           │
│                                                  │
│  AUTO-CLEANUP:                                  │
│  Backups older than 30 days deleted             │
│                                                  │
│  RECOMMENDED SCHEDULE:                          │
│  Daily at 2 AM                                  │
│                                                  │
│  EMERGENCY CONTACTS:                            │
│  [Add your DevOps team contacts here]          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Summary

### ✅ What You Learned

1. **What backups are**: Complete snapshots of your database saved as SQL files
2. **How they work**: pg_dump reads database → writes SQL commands → saves to file
3. **How to create**: `npm run db:backup` (takes 10 seconds)
4. **How to restore**: `npm run db:restore backups/file.sql` (takes 30 seconds)
5. **How to test**: `npm run db:test-backup backups/file.sql` (monthly)
6. **Where to store**: Local + AWS S3 (3-2-1 rule)
7. **How often**: Daily at 2 AM (automated)
8. **How long to keep**: 30 days local, 1 year cloud

### 🎯 Action Items

- [ ] Test backup command works: `npm run db:backup`
- [ ] Test restore command works: `npm run db:restore`
- [ ] Set up automated daily backups (cron or Task Scheduler)
- [ ] Configure AWS S3 for cloud backup storage
- [ ] Add monthly calendar reminder to test backups
- [ ] Document disaster recovery contact list

---

**Your data is precious. Back it up!** 💾

**Last Updated**: May 27, 2026
