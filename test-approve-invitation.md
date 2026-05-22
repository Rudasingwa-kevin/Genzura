# Debug: Invitation Approval Error

## Steps to Debug

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Try to approve an invitation**
4. **Look for these logs:**
   - `🔍 Notification object:` - Shows the notification structure
   - `🔍 Parsed metadata:` - Shows if metadata was parsed correctly
   - `❌ Error response:` - Shows the exact error from backend

## What to Check

### Frontend Console Logs
Look for:
```
🔍 Notification object: {id: "...", type: "invitation", metadata: {...}}
🔍 Parsed metadata: {invitationId: "...", caseId: "...", ...}
```

### Backend Console Logs (terminal where `npm run dev` is running)
Look for:
```
🔍 Approving invitation: {invitationId: "...", userId: "..."}
❌ Error approving invitation: [error message]
```

## Common Issues

### Issue 1: Metadata is null/undefined
**Symptom**: `🔍 Parsed metadata: null` or `undefined`
**Cause**: Notification doesn't have metadata
**Fix**: The invitation wasn't created properly

### Issue 2: "Invitation not found"
**Symptom**: Backend logs show "Invitation not found"
**Cause**: The invitationId doesn't exist in database
**Fix**: Need to create a fresh invitation

### Issue 3: "User is already a team member"
**Symptom**: Error message about duplicate
**Cause**: User was already added to the case
**Fix**: Invitation approval already worked before

### Issue 4: Authentication error
**Symptom**: 401 Unauthorized
**Cause**: Token not being sent or invalid
**Fix**: Check if user is logged in

## Testing Steps

1. **Login as User A**
2. **Open a case**
3. **Click "Invite Attorney"**
4. **Select User B**
5. **Check console** - Should see invitation sent message
6. **Logout**
7. **Login as User B**
8. **Click Bell icon (notifications)**
9. **Should see invitation notification**
10. **Open DevTools Console (F12)**
11. **Click [Approve] button**
12. **Read the console logs**

## What the Logs Tell You

If you see:
```
🔍 Notification object: {id: "abc123", type: "invitation", metadata: {invitationId: "inv_xyz", ...}}
🔍 Parsed metadata: {invitationId: "inv_xyz", caseId: "case_123", ...}
```
✅ Frontend is working - metadata is correct

If you see:
```
❌ Error response: {error: "Invitation not found"}
```
❌ Backend can't find the invitation - need to recreate it

If you see:
```
❌ Error response: {error: "You are not authorized to respond to this invitation"}
```
❌ You're logged in as the wrong user

## Quick Fix

If all else fails:
1. **Restart backend**: Stop npm run dev and start again
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Create NEW invitation**: Don't try to approve old ones
4. **Test immediately**: Approve right after sending
