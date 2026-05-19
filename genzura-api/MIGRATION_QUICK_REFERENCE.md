# Database Migration Quick Reference

## 🚀 Common Commands

### Development (Local)

```bash
# Create a new migration
npm run migrate:dev

# Check migration status
npm run migrate:status

# View database in browser
npm run prisma:studio

# Reset database (DANGER - wipes data!)
npm run migrate:reset
```

### Production (Server)

```bash
# Backup database FIRST
npm run db:backup

# Apply migrations (SAFE)
npm run migrate:deploy

# Check database health
npm run db:check
```

---

## ✅ Safe Workflow (Follow This!)

**Step 1:** Change schema in `prisma/schema.prisma`

**Step 2:** Create migration (local)
```bash
npm run migrate:dev
```

**Step 3:** Test the changes
```bash
npm run dev
# Test your app thoroughly
```

**Step 4:** Commit to git
```bash
git add prisma/
git commit -m "feat: add new field to User model"
git push
```

**Step 5:** Deploy to production
```bash
# On production server
npm run db:backup           # ALWAYS backup first!
npm run migrate:deploy      # Apply migrations
npm run db:check           # Verify
```

---

## ❌ NEVER Do These in Production!

```bash
# DANGER: Drops all data
npm run migrate:reset

# DANGER: Can lose data
npx prisma db push

# DANGER: Resets database
npx prisma migrate dev
```

---

## 🆘 Emergency: Data Lost

**If you accidentally deleted data:**

1. **STOP THE SERVER IMMEDIATELY**
   ```bash
   pm2 stop genzura-api
   ```

2. **Find latest backup**
   ```bash
   ls -lah backups/
   ```

3. **Restore from backup**
   ```bash
   npm run db:restore backups/backup-2026-05-19T10-30-00.sql
   ```

4. **Verify restoration**
   ```bash
   npm run db:check
   ```

5. **Restart server**
   ```bash
   npm run dev
   ```

---

## 📋 Pre-Deployment Checklist

Before running migrations in production:

- [ ] Backup created: `npm run db:backup`
- [ ] Migration tested locally
- [ ] Migration tested on staging
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Low-traffic time scheduled

---

## 🔧 Troubleshooting

**Migration fails with "table already exists"**
```bash
npm run migrate:status
# Mark problematic migration as applied
npx prisma migrate resolve --applied "20260519_migration_name"
```

**Database out of sync**
```bash
npm run prisma:generate
npm run migrate:status
```

**Can't connect to database**
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test connection
npm run db:check
```

---

## 📞 Need Help?

- Read full guide: `MIGRATION_WORKFLOW.md`
- Check Prisma docs: https://pris.ly/d/migrate
- Ask team in #dev-help

---

## 💾 Backup Strategy

| Environment | Frequency | Retention |
|-------------|-----------|-----------|
| Development | Manual before changes | 7 days |
| Staging | Daily | 14 days |
| Production | Hourly + Pre-migration | 30 days |

**Manual backup:**
```bash
npm run db:backup
```

**Restore backup:**
```bash
npm run db:restore backups/backup-2026-05-19T10-30-00.sql
```

---

## 🎯 Remember

1. ✅ **ALWAYS** backup before migrations
2. ✅ **ALWAYS** test on staging first  
3. ✅ **ALWAYS** use `migrate:deploy` in production
4. ❌ **NEVER** use `db push` in production
5. ❌ **NEVER** use `migrate:reset` in production

**When in doubt, backup first!**
