# Genzura Database Guide

## Overview
This guide covers the database setup, seeding, and management for the Genzura Litigation Management System.

## Database Schema

### Core Models

#### Users
- 11 users with different roles (Admin, Senior Attorney, Attorney, Paralegal, Support)
- Different subscription plans (Genzura/Free, Intango/3 months, Inkingi/12 months)
- Complete profile information (phone, location, job title)

#### Clients
- 10 diverse clients across various industries
- Complete contact information and business details
- National ID/TIN numbers for Rwanda-based entities

#### Cases
- 10 cases covering all case types:
  - Litigation (2)
  - IP/Intellectual Property (2)
  - Corporate (2)
  - M&A/Mergers & Acquisitions (1)
  - Real Estate (1)
  - Compliance (1)
  - Employment (1)
- Various statuses: Active, Pending, Resolved, Archived
- Priority levels: High, Medium, Low

#### Related Entities
- **Case Teams**: Multi-user collaboration on cases
- **Timeline Events**: Case activity tracking
- **Documents**: File attachments with metadata
- **Notes**: Attorney case notes
- **Notifications**: User alerts and updates
- **Calendar Events**: Court dates, meetings, deadlines
- **Event Reminders**: Automated reminder system
- **Feedback**: User feedback and feature requests
- **System Settings**: Application configuration

## Quick Start

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Migration
```bash
# Run migrations
npm run migrate:dev

# Or use Prisma directly
npx prisma migrate dev
```

### 3. Seed the Database
```bash
# Seed via npm script
node --loader ts-node/esm prisma/seed.ts

# Or via Prisma
npx prisma db seed
```

### 4. Add Supplemental Data (Optional)
```bash
node scripts/add-more-data.mjs
```

## Default Credentials

**All users have the same password:** `Genzura2026!`

### Key Users:
- **Admin**: s.miller@genzura.law
- **Senior Attorney**: j.wilson@genzura.law, g.mugisha@genzura.law
- **Attorneys**: d.chen@genzura.law, m.uwimana@genzura.law, d.umutesi@genzura.law
- **Paralegals**: e.rodriguez@genzura.law, p.nkurunziza@genzura.law

## Useful Commands

### Database Management
```bash
# View database in Prisma Studio
npm run prisma:studio
# Opens at http://localhost:5555

# Check migration status
npm run migrate:status

# Reset database (WARNING: Deletes all data)
npm run migrate:reset

# Deploy migrations (production)
npm run migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

### Data Verification
```bash
# Check seeded data
node scripts/check-seed-data.mjs

# Add more sample data
node scripts/add-more-data.mjs
```

### Database Backups
```bash
# Backup database
npm run db:backup

# Restore from backup
npm run db:restore

# Check database health
npm run db:check
```

## Data Statistics

### Current Database State:
- **11 Users** (including 1 existing admin)
- **10 Clients** (8 from seed + 2 supplemental)
- **10 Cases** (diverse types and statuses)
- **7 Case Teams** (collaboration examples)
- **7 Timeline Events** (case activities)
- **6 Documents** (various file types)
- **10 Case Notes** (5 from seed + 5 supplemental)
- **9 Notifications** (5 from seed + 4 supplemental)
- **4 Calendar Events** (with attendees)
- **3 Event Reminders** (automated alerts)
- **3 Feedback Entries** (user feedback)
- **5 System Settings** (app configuration)

## Subscription Plans

### Genzura (Free)
- Basic features
- Limited cases
- 4 users on this plan

### Intango (100,000 RWF / 3 months)
- Enhanced features
- More cases and storage
- 3 users on this plan

### Inkingi (200,000 RWF / 12 months)
- Premium features
- Unlimited cases
- Maximum storage
- 3 users on this plan

## Case Examples

### Active Cases (5):
1. **CV-2026-0482** - Commercial Litigation (High Priority)
2. **CORP-2026-0012** - Corporate Merger (High Priority)
3. **RE-2026-0324** - Real Estate Dispute (High Priority)
4. **EMP-2026-0156** - Employment Case (Low Priority)
5. **MA-2026-0598** - M&A Transaction (High Priority)

### Pending Cases (3):
1. **IP-2026-7712** - Patent Filing (Medium Priority)
2. **COMP-2026-0891** - Regulatory Compliance (Medium Priority)
3. **IP-2026-0834** - Trademark Registration (Medium Priority)

### Resolved/Archived (2):
1. **LIT-2026-0723** - Contract Dispute (Resolved)
2. **CORP-2026-0445** - Incorporation (Archived)

## Database Schema Diagram

```
User (11 records)
├── Cases (as attorney)
├── CaseTeam (team memberships)
├── TimelineEvent (authored events)
├── CaseDocument (uploaded docs)
├── CaseNote (authored notes)
├── Feedback (submitted feedback)
├── Notification (user notifications)
├── CalendarEvent (created events)
└── EventAttendee (event attendance)

Client (10 records)
└── Cases (client cases)

Case (10 records)
├── Client (belongs to)
├── Attorney (assigned to)
├── CaseTeam (team members)
├── TimelineEvent (case events)
├── CaseDocument (case files)
├── CaseNote (case notes)
└── CalendarEvent (related events)

CalendarEvent (4 records)
├── Case (optional link)
├── CreatedBy (user)
├── EventAttendee (attendees)
└── EventReminder (reminders)
```

## Troubleshooting

### Migration Issues
```bash
# If migrations are stuck
npx prisma migrate reset

# If schema is out of sync
npx prisma generate
npx prisma db push
```

### Seed Issues
```bash
# If seed fails, check:
1. Database connection (DATABASE_URL in .env)
2. Prisma Client is generated (npm run prisma:generate)
3. Migrations are applied (npm run migrate:dev)
```

### Permission Issues (Windows)
```bash
# If you get EPERM errors:
1. Close any running processes using the database
2. Close Prisma Studio if open
3. Close any IDEs or database clients
4. Retry the command
```

## Best Practices

1. **Backup Before Changes**: Always backup before major changes
2. **Use Migrations**: Never modify schema.prisma and db:push in production
3. **Seed Carefully**: Don't seed production databases
4. **Version Control**: Commit migrations to version control
5. **Environment Variables**: Never commit .env files

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- See `SEED_DATA_SUMMARY.md` for detailed seed data information
- See `MIGRATION_WORKFLOW.md` for migration procedures

## Support

For database issues:
1. Check the logs in `dev.log`
2. Run `npm run db:check` for diagnostics
3. Review migration status with `npm run migrate:status`
4. Check Prisma Studio for visual inspection
