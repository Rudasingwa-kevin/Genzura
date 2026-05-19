# 🛡️ Database Migration Safety System

## Quick Start

### For Development (Adding New Fields)

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run migrate:dev

# 3. Test it works
npm run dev

# 4. Commit to git
git add prisma/
git commit -m "feat: add new field"
```

### For Production Deployment

```bash
# ALWAYS backup first!
npm run db:backup

# Apply migrations
npm run migrate:deploy

# Verify everything worked
npm run db:check
```

---

## 📚 Documentation

- **[MIGRATION_WORKFLOW.md](./MIGRATION_WORKFLOW.md)** - Complete guide (30+ pages)
- **[MIGRATION_QUICK_REFERENCE.md](./MIGRATION_QUICK_REFERENCE.md)** - Quick command reference

---

## 🎯 Key Takeaways

### ✅ DO

- Always backup before migrations: `npm run db:backup`
- Use `migrate:dev` in development
- Use `migrate:deploy` in production
- Test migrations on staging first
- Commit migration files to git

### ❌ DON'T

- Never use `prisma db push` in production
- Never use `migrate:reset` in production
- Never skip backups
- Never deploy without testing

---

## 🆘 Emergency: I Lost Data!

```bash
# 1. STOP SERVER
pm2 stop genzura-api

# 2. Find backup
ls -lah backups/

# 3. Restore
npm run db:restore backups/backup-2026-05-19T10-30-00.sql

# 4. Verify
npm run db:check

# 5. Restart
npm run dev
```

---

## 📊 Current Database Status

```bash
npm run db:check
```

Shows:
- Record counts for all tables
- Recent users and cases
- Subscription overview
- Data integrity status

---

## 🔧 Available Commands

| Command | Description | Safe in Prod? |
|---------|-------------|---------------|
| `npm run migrate:dev` | Create & apply migrations | ❌ No (dev only) |
| `npm run migrate:deploy` | Apply migrations safely | ✅ Yes |
| `npm run migrate:status` | Check migration status | ✅ Yes |
| `npm run migrate:reset` | Reset database | ❌ NO! Wipes data |
| `npm run db:backup` | Create backup | ✅ Yes (required!) |
| `npm run db:restore` | Restore from backup | ⚠️ Careful |
| `npm run db:check` | Health check | ✅ Yes |

---

## 💾 Automatic Backups

Backups are stored in `backups/` folder:
- Named with timestamp: `backup-2026-05-19T10-30-00.sql`
- Auto-cleanup after 30 days
- NOT committed to git (too large)

**Always create a backup before:**
- Schema changes
- Migrations
- Production deployments
- Risky operations

---

## 🚀 What This System Prevents

**Before (What Happened Today):**
- ❌ Used `prisma db push` → Lost all data
- ❌ No backups → Couldn't recover
- ❌ Lost Kamanzi's case and all users

**After (With This System):**
- ✅ Automatic backups before migrations
- ✅ Safe production deployments
- ✅ Easy rollback if issues
- ✅ No more data loss!

---

## 📝 Example: Safe Schema Change

```bash
# Step 1: Edit schema
vim prisma/schema.prisma
# Add: phone String?

# Step 2: Create migration
npm run migrate:dev
# Name: add_phone_field

# Step 3: Test locally
npm run dev
# Verify phone field works

# Step 4: Check database
npm run db:check
# Confirm data intact

# Step 5: Commit
git add prisma/
git commit -m "feat: add phone field"
git push

# Step 6: Deploy to production
ssh production-server
git pull
npm run db:backup        # CRITICAL!
npm run migrate:deploy   # SAFE
npm run db:check        # VERIFY
pm2 restart genzura-api
```

---

## 🎓 Learn More

Read the full guides:
1. **[MIGRATION_WORKFLOW.md](./MIGRATION_WORKFLOW.md)** - Everything about migrations
2. **[MIGRATION_QUICK_REFERENCE.md](./MIGRATION_QUICK_REFERENCE.md)** - Quick commands

**Key sections:**
- Workflow: Adding a New Field
- Complex Schema Changes (Renaming fields)
- Emergency Procedures
- Production Deployment Checklist
- Common Mistakes to Avoid

---

## ✨ Your Data is Now Protected!

This system ensures:
- 🛡️ No accidental data loss
- 💾 Automatic backups
- 🔄 Easy rollback
- 📊 Database health monitoring
- 🚀 Safe production deployments

**Remember: When in doubt, backup first!**
