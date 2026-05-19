# Database Migration Workflow

## Overview

This guide ensures safe database schema changes without data loss in development and production.

---

## Commands Reference

### Development (Local Machine)

```bash
# 1. Create a new migration (SAFE - only affects local DB)
npm run migrate:dev

# 2. View migration status
npm run migrate:status

# 3. Reset database (DANGER - wipes all data, local only!)
npm run migrate:reset
```

### Production (Deployed Server)

```bash
# Apply migrations (SAFE - preserves data)
npm run migrate:deploy

# Rollback last migration (if needed)
npm run migrate:rollback
```

### Database Backups

```bash
# Create backup before migration
npm run db:backup

# Restore from backup
npm run db:restore backups/backup-2026-05-19.sql
```

---

## Workflow: Adding a New Field

### Step 1: Modify Schema (Development)

Edit `prisma/schema.prisma`:

```prisma
model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  // New field
  address  String? // ✅ Optional field (safe)
}
```

**Safety Tips:**
- ✅ Make new fields optional (`?`) to avoid breaking existing data
- ✅ Use `@default()` for required fields
- ❌ Don't remove fields without migration plan
- ❌ Don't change field types without data transformation

### Step 2: Create Migration (Development)

```bash
npm run migrate:dev
```

**What happens:**
1. Prisma generates migration SQL
2. Migration is saved to `prisma/migrations/`
3. Applied to your local database
4. Prisma Client is regenerated

**Migration file example:** `prisma/migrations/20260519_add_user_address/migration.sql`
```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;
```

### Step 3: Test Migration (Development)

```bash
# Test the migration works
npm run dev

# Verify data is intact
npm run db:check
```

### Step 4: Commit Migration (Git)

```bash
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "feat: add address field to User model"
git push
```

**Important:** Always commit migration files! They're needed for production deployment.

### Step 5: Deploy to Production

```bash
# SSH into production server
ssh user@genzura-api.rw

# Navigate to project
cd /var/www/genzura-api

# Pull latest code
git pull origin main

# Backup database (CRITICAL!)
npm run db:backup

# Apply migrations (SAFE)
npm run migrate:deploy

# Restart server
pm2 restart genzura-api
```

---

## Workflow: Complex Schema Changes

### Renaming a Field

**Bad (causes data loss):**
```prisma
model User {
  id       String @id
  fullName String // ❌ Renamed from 'name' - data lost!
}
```

**Good (preserves data):**

**Step 1:** Add new field
```prisma
model User {
  id       String @id
  name     String // Old field
  fullName String? // New field
}
```

**Step 2:** Create migration
```bash
npm run migrate:dev
```

**Step 3:** Create data migration script
```typescript
// prisma/migrations/20260519_migrate_name_to_fullname/data-migration.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateNameToFullName() {
  await prisma.$executeRaw`
    UPDATE "User" 
    SET "fullName" = "name" 
    WHERE "fullName" IS NULL;
  `;
}

migrateNameToFullName();
```

**Step 4:** Run data migration
```bash
node prisma/migrations/20260519_migrate_name_to_fullname/data-migration.ts
```

**Step 5:** Remove old field (new migration)
```prisma
model User {
  id       String @id
  fullName String // ✅ Old data preserved
}
```

---

## Emergency Procedures

### Data Loss Recovery

If data is accidentally lost:

**1. Stop the server immediately**
```bash
pm2 stop genzura-api
```

**2. Check for backups**
```bash
ls -lah backups/
```

**3. Restore from backup**
```bash
npm run db:restore backups/backup-2026-05-19.sql
```

**4. Verify restoration**
```bash
npm run db:check
```

### Rolling Back a Migration

If a migration causes issues:

**Option 1: Rollback (if script exists)**
```bash
npm run migrate:rollback
```

**Option 2: Restore from backup**
```bash
npm run db:restore backups/pre-migration-backup.sql
```

**Option 3: Manual rollback**
```bash
# Find the migration to undo
ls prisma/migrations/

# Manually write SQL to undo changes
psql genzura_db -c "ALTER TABLE User DROP COLUMN address;"
```

---

## Production Deployment Checklist

Before deploying schema changes to production:

- [ ] Migration tested on local database
- [ ] Migration tested on staging environment
- [ ] Database backup created (`npm run db:backup`)
- [ ] Migration SQL reviewed (check `prisma/migrations/`)
- [ ] Team notified about deployment
- [ ] Rollback plan prepared
- [ ] Downtime window scheduled (if needed)

**During deployment:**

1. Enable maintenance mode (optional)
2. Create backup: `npm run db:backup`
3. Run migrations: `npm run migrate:deploy`
4. Verify application works
5. Monitor for errors (5-10 minutes)
6. Disable maintenance mode

**If issues occur:**

1. Roll back immediately
2. Restore from backup
3. Investigate issue in development
4. Try again after fixing

---

## Common Mistakes to Avoid

### ❌ NEVER Do This in Production

```bash
# DANGER: Drops all data!
npx prisma db push

# DANGER: Wipes database!
npx prisma migrate reset

# DANGER: Resets database!
npx prisma migrate dev --create-only --skip-seed
```

### ❌ Don't Deploy Without Migrations

**Bad:**
1. Change schema.prisma
2. Git push
3. Deploy
4. Run `db push` ❌

**Good:**
1. Change schema.prisma
2. Run `migrate dev` ✅
3. Commit migration files
4. Deploy
5. Run `migrate deploy` ✅

### ❌ Don't Remove Fields Without Plan

**Bad:**
```prisma
model User {
  id    String @id
  email String
  // ❌ Removed 'name' field - data lost!
}
```

**Good:**
1. Mark field as deprecated in code
2. Stop using field in application
3. Deploy code changes
4. Wait 1-2 weeks (ensure no issues)
5. Create migration to remove field
6. Keep backup for 30 days

---

## Automated Backup Strategy

**Development:**
- Manual backups before major changes
- Keep backups for 7 days

**Staging:**
- Daily automated backups
- Keep backups for 14 days

**Production:**
- Hourly automated backups (past 24 hours)
- Daily backups (past 30 days)
- Weekly backups (past 6 months)
- Pre-migration backups (keep forever)

**Backup script runs automatically via cron:**
```bash
# /etc/cron.d/genzura-backup
0 * * * * cd /var/www/genzura-api && npm run db:backup
```

---

## Migration Best Practices

### 1. Always Use Optional Fields First

```prisma
// ✅ Good: New fields are optional
model User {
  id      String  @id
  name    String
  phone   String? // Optional - safe to add
}
```

### 2. Use Defaults for Required Fields

```prisma
// ✅ Good: Required field with default
model User {
  id     String  @id
  status String  @default("Active")
}
```

### 3. Test Migrations Locally First

```bash
# Create test database
createdb genzura_test

# Test migration
DATABASE_URL="postgresql://localhost/genzura_test" npm run migrate:dev

# Verify data integrity
npm run db:check
```

### 4. Document Breaking Changes

In migration commit message:
```
feat: add user authentication fields

BREAKING CHANGE: Adds required email field
- Existing users need email migration
- Run data-migration.ts before deploying
- Backup required before this migration
```

### 5. Small, Incremental Changes

**Bad:** One huge migration changing 10 tables
**Good:** 10 small migrations, each tested independently

---

## Monitoring & Alerts

Set up alerts for:
- Migration failures
- Long-running migrations (>5 minutes)
- Database connection issues during migration
- Backup failures

**Example alert (Slack/Discord webhook):**
```typescript
if (migrationFailed) {
  sendAlert({
    channel: '#genzura-alerts',
    message: '🚨 Migration failed in production!',
    action: 'Check logs and consider rollback'
  });
}
```

---

## Summary

**Key Takeaways:**
1. ✅ Always use `migrate dev` in development
2. ✅ Always use `migrate deploy` in production
3. ✅ Always backup before migrations
4. ✅ Always commit migration files to git
5. ✅ Test migrations on staging first
6. ❌ Never use `db push` in production
7. ❌ Never remove fields without migration plan
8. ❌ Never deploy without backups

**When in Doubt:**
1. Backup first
2. Test on staging
3. Deploy during low-traffic hours
4. Monitor closely
5. Have rollback plan ready

---

## Support

Questions about migrations? Check:
- Prisma Docs: https://pris.ly/d/migrate
- Team migration guide: This document
- Ask in #dev-help Slack channel

**Emergency Contact:**
If production migration fails and you need immediate help, contact the DevOps team.
