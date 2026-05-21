# User Data Isolation - Implementation Guide

## Problem
When creating a new user, they could see all existing cases and documents in the system, even though those cases belonged to other users. This is because the application was returning all cases from the database without filtering by user.

## Solution Implemented

### 1. **Case Access Control (Backend)**

#### Modified Files:
- `genzura-api/src/services/caseService.ts`
- `genzura-api/src/controllers/caseController.ts`

#### Changes:

**a) `CaseService.getAllCases(userId?)`**
- Now accepts an optional `userId` parameter
- When `userId` is provided, filters cases where:
  - User is the lead attorney (`attorneyId === userId`), OR
  - User is a team member (`team.some(member => member.userId === userId)`)
- **ALL users** (including admins) only see their assigned cases
- If no userId provided, returns empty array

**b) `CaseService.getCaseById(idOrCaseNumber, userId?, userRole?)`**
- Now accepts optional `userId` and `userRole` parameters
- Checks if user has permission to view the case
- Returns 403 error if user tries to access a case they're not involved with
- **ALL users** (including admins) must be assigned to a case to view it

**c) `CaseController.getAll()`**
- **ALL users** see only their own cases (where they're attorney or team member)
- No special privileges for admin role regarding case visibility

**d) `CaseController.getOne()`**
- Passes user info to `getCaseById` for permission checking
- Returns 403 status for unauthorized access attempts

### 2. **Database Seeding (Improved)**

#### Modified File:
- `genzura-api/prisma/seed.ts`

#### Changes:
- Added cleanup step at the start to delete all existing seed data
- Changed from `upsert` to `create` to ensure fresh data
- Properly handles foreign key constraints by deleting in correct order:
  1. Event attendees
  2. Calendar events
  3. Notifications
  4. Case notes
  5. Case documents
  6. Timeline events
  7. Case teams
  8. Cases
  9. Clients
  10. Feedback
  11. Users

### 3. **Utility Script**

#### New File:
- `genzura-api/scripts/show-user-data.mjs`

A utility script to see what data each user has:
```bash
node scripts/show-user-data.mjs
```

Shows:
- Lead attorney assignments
- Team member assignments
- Notification counts

## Current User Data Distribution

After running the seed:

| User | Role | Lead Attorney | Team Member | Total Cases |
|------|------|---------------|-------------|-------------|
| James Wilson | Senior Attorney | 2 | 1 | 3 |
| Sarah Miller | Admin | 0 | 0 | 0 |
| David Chen | Attorney | 1 | 1 | 2 |
| Elena Rodriguez | Paralegal | 0 | 2 | 2 |
| Michael Uwimana | Attorney | 3 | 0 | 3 |
| Grace Mugisha | Senior Attorney | 2 | 1 | 3 |
| Patrick Nkurunziza | Paralegal | 0 | 2 | 2 |
| Alice Kayitesi | Attorney | 1 | 0 | 1 |
| Robert Habimana | Support | 0 | 0 | 0 |
| Diana Umutesi | Attorney | 1 | 0 | 1 |

**Note:** Admin role does NOT grant automatic access to all cases. Admins must be assigned to cases to view them.

## How to Reset the Database

To clear all seed data and start fresh:

```bash
cd genzura-api
npx tsx prisma/seed.ts
```

This will:
1. Delete all existing seed data
2. Create 10 demo users
3. Create 8 demo clients
4. Create 10 cases with proper assignments
5. Create related documents, notes, events, etc.

## Testing

### Test Case 1: Regular User Can Only See Their Cases
1. Login as `d.chen@genzura.law` (password: `Genzura2026!`)
2. Go to cases list
3. Should see only 2 cases:
   - COMP-2026-0891 (Lead Attorney)
   - CV-2026-0482 (Team Member)

### Test Case 2: Admin Also Only Sees Assigned Cases
1. Login as `s.miller@genzura.law` (Admin, password: `Genzura2026!`)
2. Go to cases list
3. Should see 0 cases (admin is not assigned to any cases)
4. Admin role does NOT grant automatic access to all cases

### Test Case 3: New User Has No Cases
1. Create a new user via invitation or direct creation
2. Login with that user
3. Should see empty cases list
4. Should NOT see any existing cases from other users

### Test Case 4: Permission Denied on Direct Access
1. Login as `d.chen@genzura.law`
2. Try to access case `IP-2026-7712` (belongs to Grace Mugisha)
3. Should get 403 Forbidden error

## Benefits

✅ **Data Privacy**: Users can only see cases they're involved with
✅ **Security**: Prevents unauthorized access to sensitive case information
✅ **Clean Start**: New users start with empty case list
✅ **Strict Access Control**: Even admins must be assigned to cases to view them
✅ **Team Collaboration**: Users can see cases where they're team members
✅ **Assignment-Based Access**: Access is based solely on case assignments, not user roles

## Notes

- The seed data is for **development and testing only**
- In production, you should NOT run the seed script
- All seed users have the same password: `Genzura2026!`
- Case access is based on `attorneyId` and `CaseTeam` relationships
