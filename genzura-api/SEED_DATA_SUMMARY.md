# Seed Data Summary

## Overview
The database has been successfully seeded with comprehensive test data for the Genzura Litigation Management System.

## Default Login Credentials
All users have the same password: `Genzura2026!`

## Data Created

### Users (10)
1. **James Wilson** (j.wilson@genzura.law) - Senior Attorney
   - Location: Kigali, Rwanda
   - Subscription: Inkingi (12 months)
   - Primary cases: CV-2026-0482, LIT-2026-0723

2. **Sarah Miller** (s.miller@genzura.law) - Admin
   - Location: Kigali, Rwanda
   - Subscription: Inkingi (12 months)
   - Role: System Administrator

3. **David Chen** (d.chen@genzura.law) - Attorney
   - Location: Kigali, Rwanda
   - Subscription: Intango (3 months)
   - Primary cases: COMP-2026-0891

4. **Elena Rodriguez** (e.rodriguez@genzura.law) - Paralegal
   - Location: Kigali, Rwanda
   - Subscription: Genzura (Free)
   - Supporting multiple cases

5. **Michael Uwimana** (m.uwimana@genzura.law) - Attorney
   - Location: Kigali, Rwanda
   - Subscription: Intango (3 months)
   - Primary cases: CORP-2026-0012, CORP-2026-0445

6. **Grace Mugisha** (g.mugisha@genzura.law) - Senior Attorney (IP)
   - Location: Kigali, Rwanda
   - Subscription: Inkingi (12 months)
   - Primary cases: IP-2026-7712, IP-2026-0834

7. **Patrick Nkurunziza** (p.nkurunziza@genzura.law) - Senior Paralegal
   - Location: Kigali, Rwanda
   - Subscription: Genzura (Free)

8. **Alice Kayitesi** (a.kayitesi@genzura.law) - Employment Attorney
   - Location: Kigali, Rwanda
   - Status: Invited (pending activation)
   - Primary cases: EMP-2026-0156

9. **Robert Habimana** (r.habimana@genzura.law) - Legal Support Specialist
   - Location: Kigali, Rwanda
   - Subscription: Genzura (Free)

10. **Diana Umutesi** (d.umutesi@genzura.law) - Real Estate Attorney
    - Location: Kigali, Rwanda
    - Subscription: Intango (3 months)
    - Primary cases: RE-2026-0324

### Clients (8)
1. **Alpha Corporation Legal** - Technology sector
2. **Tech Innovations IP Dept** - Semiconductors
3. **Apex Global M&A** - Finance
4. **Green Valley Properties** - Real Estate
5. **Rwanda Coffee Exports** - Agriculture
6. **Digital Finance Rwanda** - Fintech
7. **BuildRight Construction** - Construction
8. **HealthCare Plus** - Healthcare

### Cases (10)
1. **CV-2026-0482** - Alpha Corp v. Beta Inc (Active, High Priority)
   - Type: Litigation
   - Attorney: James Wilson
   - Deadline: August 15, 2026

2. **IP-2026-7712** - Tech Innovations Patent Filing (Pending, Medium Priority)
   - Type: IP
   - Attorney: Grace Mugisha
   - Deadline: September 20, 2026

3. **CORP-2026-0012** - Apex Global Merger (Active, High Priority)
   - Type: Corporate
   - Attorney: Michael Uwimana
   - Deadline: November 5, 2026

4. **RE-2026-0324** - Green Valley Land Dispute (Active, High Priority)
   - Type: Real Estate
   - Attorney: Diana Umutesi
   - Deadline: July 30, 2026

5. **COMP-2026-0891** - Rwanda Coffee Regulatory Compliance (Pending, Medium Priority)
   - Type: Compliance
   - Attorney: David Chen
   - Deadline: June 30, 2026

6. **EMP-2026-0156** - Digital Finance Employment Case (Active, Low Priority)
   - Type: Employment
   - Attorney: Alice Kayitesi
   - Deadline: August 1, 2026

7. **LIT-2026-0723** - BuildRight Contract Dispute (Resolved, Medium Priority)
   - Type: Litigation
   - Attorney: James Wilson
   - Status: Successfully settled

8. **CORP-2026-0445** - HealthCare Plus Incorporation (Archived, Low Priority)
   - Type: Corporate
   - Attorney: Michael Uwimana
   - Status: Completed

9. **MA-2026-0598** - Tech Innovations Acquisition (Active, High Priority)
   - Type: M&A
   - Attorney: Michael Uwimana
   - Deadline: October 15, 2026

10. **IP-2026-0834** - Alpha Corp Trademark Registration (Pending, Medium Priority)
    - Type: IP
    - Attorney: Grace Mugisha
    - Deadline: July 10, 2026

### Additional Data
- **7 Case Team Memberships** - Showing collaboration between attorneys and paralegals
- **7 Timeline Events** - Case activity tracking
- **6 Case Documents** - PDF and DOCX files
- **5 Case Notes** - Attorney notes and observations
- **5 Notifications** - Deadlines, alerts, and updates
- **4 Calendar Events** - Court hearings, client meetings, and deadlines
- **5 System Settings** - Application configuration

## Case Status Distribution
- Active: 5 cases
- Pending: 3 cases
- Resolved: 1 case
- Archived: 1 case

## Case Type Distribution
- Litigation: 2 cases
- IP: 2 cases
- Corporate: 2 cases
- M&A: 1 case
- Real Estate: 1 case
- Compliance: 1 case
- Employment: 1 case

## Subscription Plans Distribution
- Inkingi (12 months): 3 users
- Intango (3 months): 3 users
- Genzura (Free): 4 users

## How to Use This Data
1. **Login**: Use any user email with password `Genzura2026!`
2. **View Cases**: Browse the 10 different case types and statuses
3. **Test Features**: 
   - Document uploads (existing docs as examples)
   - Timeline tracking
   - Team collaboration
   - Calendar events
   - Notifications
4. **Prisma Studio**: Run `npm run prisma:studio` to view and manage data visually

## Re-seeding
To reset and re-seed the database:
```bash
npm run migrate:reset
# This will drop the database, recreate it, run migrations, and seed
```

Or manually seed:
```bash
node --loader ts-node/esm prisma/seed.ts
```
