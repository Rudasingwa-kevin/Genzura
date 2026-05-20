# Fix: Collaborator Modal 403 Error

## Problem
When trying to add a collaborator to a case, users were getting a **403 Forbidden** error because the `/api/users` endpoint required Admin privileges.

## Solution
Created a new endpoint `/api/users/active` that's accessible to all authenticated users, returning only active users (filtering happens on the backend).

## Changes Made

### Backend

1. **`src/services/userService.ts`**
   - Added `getActiveUsers()` method that returns only Active users
   - Returns limited fields (no sensitive data like passwordHash)
   - Sorted by name for better UX

2. **`src/controllers/userController.ts`**
   - Added `getActiveUsers()` controller

3. **`src/routes/userRoutes.ts`**
   - Added `GET /users/active` route (requires authentication, no admin)
   - Placed BEFORE admin-only middleware

### Frontend

1. **`src/api/services/user.service.ts`**
   - Added `getActiveUsers()` method

2. **`src/pages/CaseDetailPage.tsx`**
   - Updated modal to use `getActiveUsers()` instead of `getAll()`
   - Removed client-side filtering for Active status (done on backend)
   - Added better error handling and UI feedback
   - Shows count of available users
   - Better empty states with icons
   - Clear search functionality

## How It Works Now

1. **Any authenticated user** can open "Invite Collaborator" modal
2. Backend returns only **Active users** (invited users who haven't accepted won't appear)
3. Frontend filters out users already on the case team
4. Shows friendly messages for empty states

## To Apply Changes

```bash
# Backend - restart the dev server
cd genzura-api
# Press Ctrl+C to stop current server
npm run dev

# Frontend - refresh the page
# No restart needed, just refresh browser
```

## Testing

1. Login as any user (not just admin)
2. Go to any case detail page
3. Click "Add Collaborator"
4. Should see list of active users (not on the current case)
5. Search should work
6. Browser console will show helpful logs

## Expected Console Output

```
📋 Active users fetched: 8
👥 Existing team members: ["James Wilson", "Elena Rodriguez"]
✓ Skipping Sarah Miller - already on team
✅ Available users: ["David Chen (d.chen@genzura.law)", "Grace Mugisha (g.mugisha@genzura.law)", ...]
```

## Security

- ✅ Endpoint requires authentication
- ✅ Returns only Active users (not Invited or Suspended)
- ✅ Excludes sensitive data (passwords, tokens)
- ✅ Limited to necessary fields for collaboration

## Future Enhancements

- [ ] Add user avatars/photos
- [ ] Show user workload (case count)
- [ ] Recently collaborated users first
- [ ] Role-based suggestions (match attorney to attorney)
