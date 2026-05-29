# 🔧 Fix: Blank Page on Refresh

## Problem
When you refresh `/attorneys` page, it goes blank.

## ✅ What I Fixed

### 1. Added Error Handling
- Shows error message if API fails
- "Try again" button to retry
- Better loading states
- Prevents blank page

### 2. Updated Vite Config
- Added `historyApiFallback: true` (though Vite handles this by default)
- Ensures React Router works on refresh

### 3. Improved Error States
- Error banner shows if API call fails
- Clear error messages
- Fallback UI instead of blank page

---

## 🧪 Testing

### Test 1: Normal Load
```bash
# Start servers
cd genzura-api && npm run dev
cd genzura-web && npm run dev

# Visit
http://localhost:5173/attorneys
```
**Expected:** Directory loads with attorneys

### Test 2: Refresh Page
```bash
# On /attorneys page, press F5 or Ctrl+R
```
**Expected:** Page reloads and shows attorneys (not blank!)

### Test 3: Direct URL
```bash
# Close browser
# Reopen and go directly to:
http://localhost:5173/attorneys
```
**Expected:** Works correctly

---

## 🐛 If Still Blank

### Check 1: Is Backend Running?
```bash
# Test API directly
curl http://localhost:5000/api/public/attorneys
```

**Should return:**
```json
{
  "success": true,
  "data": [...]
}
```

**If connection refused:**
- Start backend: `cd genzura-api && npm run dev`

### Check 2: Browser Console
Open browser DevTools (F12) → Console tab

**Look for errors:**
- ❌ `Failed to fetch` - Backend not running
- ❌ `404 Not Found` - Route issue
- ❌ `CORS error` - Check CORS settings

### Check 3: Network Tab
F12 → Network tab → Refresh page

**Check requests:**
- `/api/public/attorneys` - Should be status 200
- If 404 or 500, there's a backend issue

### Check 4: Routes Registered
```typescript
// In genzura-api/src/index.ts
app.use('/api/public', publicRoutes); // Should be there
```

```typescript
// In genzura-web/src/App.tsx
<Route path="/attorneys" element={<AttorneyDirectoryPage />} />
<Route path="/attorneys/:id" element={<AttorneyProfilePage />} />
```

---

## 🔧 Manual Fixes

### Fix 1: Clear Browser Cache
```
Ctrl + Shift + Delete
Clear cache and cookies
Restart browser
```

### Fix 2: Restart Dev Servers
```bash
# Kill all node processes
# Windows:
taskkill /F /IM node.exe

# Then restart
cd genzura-api && npm run dev
cd genzura-web && npm run dev
```

### Fix 3: Reinstall Dependencies
```bash
cd genzura-web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📊 What the Error UI Shows

### If API Fails:
```
┌─────────────────────────────────────────┐
│ ⚠️ Failed to load attorneys.           │
│ Please check your connection and       │
│ try again.                              │
│                                         │
│ [Try again]                             │
└─────────────────────────────────────────┘
```

### If No Attorneys:
```
┌─────────────────────────────────────────┐
│        👥                               │
│   No attorneys found                    │
│   Try adjusting your search or filters  │
│                                         │
│   [Clear all filters]                   │
└─────────────────────────────────────────┘
```

### Loading State:
```
┌─────────────────────────────────────────┐
│ [Skeleton Card 1]                       │
│ [Skeleton Card 2]                       │
│ [Skeleton Card 3]                       │
└─────────────────────────────────────────┘
```

---

## ✅ Verify Fix Works

1. **Start both servers**
   ```bash
   # Terminal 1
   cd genzura-api && npm run dev

   # Terminal 2  
   cd genzura-web && npm run dev
   ```

2. **Test scenarios:**
   - ✅ Navigate to `/attorneys` - works
   - ✅ Refresh page (F5) - still works
   - ✅ Direct URL visit - works
   - ✅ Stop backend - shows error (not blank!)
   - ✅ Restart backend - click "Try again" - works

---

## 🎯 Root Cause

The blank page happened because:

1. **No Error Handling** - When API failed, nothing was shown
2. **No Fallback UI** - If API took too long or failed, blank screen
3. **Silent Failures** - Errors logged to console but user saw nothing

**Fixed by:**
- ✅ Adding error state management
- ✅ Displaying error messages
- ✅ Adding "Try again" button
- ✅ Better loading states
- ✅ Fallback UI for all scenarios

---

## 🚀 Production Notes

This is mostly a dev issue. In production (Vercel):

- `vercel.json` already has rewrites configured
- All routes serve `index.html`
- Should work perfectly on refresh

**But:** The error handling improvements help in production too!
- Shows clear error if API is down
- Gives users a "Try again" button
- Better UX than blank page

---

**Status:** ✅ Fixed
**Test:** Refresh page - should work now!
