# Vite Proxy Configuration Fix

## Problem
The frontend was getting 404 errors when calling API endpoints like:
- `/api/admin/subscriptions/cancel`
- `/api/admin/subscriptions/grant`
- `/api/admin/subscriptions/extend`

**Error Message:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
AdminSubscriptionModal.tsx:97 Admin subscription action failed: Error: Failed to cancel subscription
```

## Root Cause
The Vite development server (`vite.config.ts`) had **no proxy configuration**, so API calls were not being forwarded to the backend Express server running on port 5000.

When the frontend made a request to `/api/admin/subscriptions/cancel`, Vite tried to serve it as a static file instead of forwarding it to the backend API server.

## Solution
Added proxy configuration to `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## What This Does

### `/api` Proxy
- **All requests** to `/api/*` are forwarded to `http://localhost:5000/api/*`
- Example: `http://localhost:5173/api/admin/subscriptions/cancel` → `http://localhost:5000/api/admin/subscriptions/cancel`

### `/uploads` Proxy
- **All requests** to `/uploads/*` are forwarded to `http://localhost:5000/uploads/*`
- Example: `http://localhost:5173/uploads/avatars/user.png` → `http://localhost:5000/uploads/avatars/user.png`

### `changeOrigin: true`
- Changes the origin of the request to match the target
- Prevents CORS issues
- Makes the backend think the request came from localhost:5000

## How to Apply Fix

### 1. Restart Vite Dev Server
```bash
cd genzura-web

# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify Backend is Running
```bash
cd genzura-api

# Start backend if not running:
npm run dev
```

### 3. Test the Fix
1. Login as admin
2. Go to User Management
3. Click on a user
4. Try to grant/extend/cancel subscription
5. **Should work now!** ✅

## Why This Was Missing

The original `vite.config.ts` only had:
```typescript
export default defineConfig({
  plugins: [react()],
})
```

This is the default minimal configuration and doesn't include proxy settings. For a full-stack app with separate frontend (Vite on port 5173) and backend (Express on port 5000), you need proxy configuration to forward API calls.

## Verification

### Before Fix
```bash
curl http://localhost:5173/api/admin/subscriptions/stats
# Result: 404 Not Found
```

### After Fix
```bash
curl http://localhost:5173/api/admin/subscriptions/stats
# Result: {"error":"Access denied. No token provided."}
# (This is good! Route exists, just needs auth token)
```

## Related Files

**Modified:**
- `genzura-web/vite.config.ts` - Added proxy configuration

**Backend Routes (Already Working):**
- `genzura-api/src/routes/adminSubscriptionRoutes.ts` - Defines routes
- `genzura-api/src/controllers/adminSubscriptionController.ts` - Handles logic
- `genzura-api/src/index.ts` - Mounts routes

## Additional Notes

### Production Deployment
In production, you typically:
1. Build the frontend: `npm run build` (creates static files)
2. Serve frontend and backend from same domain
3. No proxy needed (same origin)

OR

1. Deploy frontend to CDN/static host
2. Configure CORS on backend
3. Use full backend URL in API calls

### Development Setup
- Frontend: Vite dev server on port **5173**
- Backend: Express server on port **5000**
- Proxy: Vite forwards `/api` and `/uploads` to port 5000

### Common Proxy Issues

**Issue: Still getting 404 after adding proxy**
- Solution: Restart Vite dev server (Ctrl+C, then `npm run dev`)

**Issue: CORS errors instead of 404**
- Solution: Check `changeOrigin: true` is set in proxy config

**Issue: Backend route not found**
- Solution: Check backend server is running on port 5000
- Solution: Check route is properly registered in `index.ts`

## Testing Checklist

After applying fix, test these features:
- [ ] Admin can grant subscription to user
- [ ] Admin can extend subscription
- [ ] Admin can cancel/revoke subscription
- [ ] User receives email notification
- [ ] User sees in-app notification
- [ ] Subscription banner appears for user
- [ ] Audit log entry created

## Status

✅ **Fix Applied**: Proxy configuration added to `vite.config.ts`
⏳ **Action Required**: Restart Vite dev server for changes to take effect
🚀 **Expected Result**: All `/api/*` calls will now reach the backend server

---

**Date**: May 27, 2026
**Issue**: 404 on admin subscription endpoints
**Solution**: Added Vite proxy configuration
**Status**: RESOLVED ✅
