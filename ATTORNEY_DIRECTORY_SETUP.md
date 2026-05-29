# 🚀 Attorney Directory - Quick Setup Guide

## ✅ Files Created

### Backend
- ✅ `genzura-api/src/controllers/publicController.ts` - API logic
- ✅ `genzura-api/src/routes/publicRoutes.ts` - Routes
- ✅ `genzura-api/src/index.ts` - Updated with public routes

### Frontend
- ✅ `genzura-web/src/pages/AttorneyDirectoryPage.tsx` - Directory page
- ✅ `genzura-web/src/pages/AttorneyProfilePage.tsx` - Profile page
- ✅ `genzura-web/src/App.tsx` - Routes added
- ✅ `genzura-web/src/pages/LandingPage.tsx` - Navigation link added

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Start Backend
```bash
cd genzura-api
npm run dev
```

Should see:
```
🚀 Server running on port 5000
✅ Database connected
```

### Step 2: Start Frontend
```bash
cd genzura-web
npm run dev
```

Should see:
```
Local: http://localhost:5173
```

### Step 3: Test It!

1. **Open browser**: http://localhost:5173
2. **Click "Find Attorneys"** in the navigation
3. **You should see the attorney directory**

---

## 🧪 Testing Guide

### Test 1: View Attorney Directory

**URL:** http://localhost:5173/attorneys

**Expected:**
- Beautiful gradient header with search bar
- List of attorney cards
- Each card shows:
  - Avatar (or initials)
  - Name and title
  - Company and location
  - Statistics (cases, success rate)
  - Specializations
  - "View Profile" button

**If empty:**
- Your database might not have attorneys yet
- Create a test attorney (see below)

---

### Test 2: Search Functionality

**Steps:**
1. In the search bar, type an attorney name
2. Results should filter in real-time
3. Try searching by firm name
4. Clear search - all attorneys return

**Expected:** Instant filtering

---

### Test 3: Location Filter

**Steps:**
1. Click "Filters" button
2. Select a location from dropdown
3. Results filter to that location
4. Clear filter - all attorneys return

**Expected:** Only attorneys in selected location show

---

### Test 4: View Attorney Profile

**Steps:**
1. Click "View Profile" on any attorney card
2. Navigate to profile page

**Expected:**
- Detailed profile with large avatar
- Contact information section
- Case statistics with charts
- Specializations breakdown
- "Contact Attorney" button
- Back navigation

---

### Test 5: Contact Form

**Steps:**
1. On attorney profile, click "Contact Attorney"
2. Modal opens with form
3. Fill in:
   - Your name: "Test Client"
   - Email: "test@example.com"
   - Phone: "+250 123 456 789"
   - Case type: Select "Litigation"
   - Message: "I need help with..."
4. Click "Send Message"

**Expected:**
- Success message appears
- Modal closes
- Message stored in feedback table

**Verify in database:**
```sql
SELECT * FROM "Feedback" ORDER BY "createdAt" DESC LIMIT 1;
```

---

## 🎭 Create Test Attorneys

If you don't have attorneys in your database:

### Method 1: Via API (Recommended)

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@lawfirm.rw",
    "password": "password123",
    "role": "Attorney",
    "company": "Doe & Associates",
    "location": "Kigali, Rwanda",
    "jobTitle": "Senior Attorney at Law",
    "phone": "+250 788 123 456"
  }'
```

### Method 2: Via Database

```sql
-- Insert test attorney
INSERT INTO "User" (
  id,
  name,
  email,
  "passwordHash",
  role,
  status,
  initials,
  company,
  location,
  "jobTitle",
  phone,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Jane Smith',
  'jane.smith@lawfirm.rw',
  '$2a$10$abcdefghijklmnopqrstuv', -- hashed 'password123'
  'Senior_Attorney',
  'Active',
  'JS',
  'Smith Legal Partners',
  'Kigali, Rwanda',
  'Senior Partner',
  '+250 788 987 654',
  NOW(),
  NOW()
);
```

### Method 3: Update Existing User

```sql
-- Make existing user an attorney
UPDATE "User" 
SET 
  role = 'Attorney',
  status = 'Active',
  company = 'My Law Firm',
  location = 'Kigali, Rwanda',
  "jobTitle" = 'Attorney at Law',
  phone = '+250 788 111 222'
WHERE email = 'existing@user.com';
```

---

## 🎯 Create Test Cases for Statistics

To make attorney profiles look good with statistics:

```sql
-- Create test cases for an attorney
INSERT INTO "Case" (
  id,
  "caseNumber",
  title,
  "clientId",
  "attorneyId",
  status,
  priority,
  type,
  "filedDate",
  description,
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  'CASE-' || LPAD(generate_series::text, 5, '0'),
  'Test Case ' || generate_series,
  (SELECT id FROM "Client" LIMIT 1), -- Use any client
  '<attorney-user-id>', -- Replace with actual attorney ID
  CASE 
    WHEN generate_series % 3 = 0 THEN 'Resolved'::"CaseStatus"
    WHEN generate_series % 3 = 1 THEN 'Active'::"CaseStatus"
    ELSE 'Pending'::"CaseStatus"
  END,
  'Medium'::"CasePriority",
  CASE 
    WHEN generate_series % 4 = 0 THEN 'Litigation'::"CaseType"
    WHEN generate_series % 4 = 1 THEN 'Corporate'::"CaseType"
    WHEN generate_series % 4 = 2 THEN 'Employment'::"CaseType"
    ELSE 'Real_Estate'::"CaseType"
  END,
  NOW() - (generate_series || ' days')::interval,
  'Test case description',
  NOW(),
  NOW()
FROM generate_series(1, 20);
```

This creates 20 test cases with:
- Various statuses (Active, Pending, Resolved)
- Different case types
- Spread over time

---

## 📊 Verify Statistics

### Check Attorney Statistics via API

```bash
curl http://localhost:5000/api/public/attorneys/<attorney-id>
```

**Should return:**
```json
{
  "statistics": {
    "totalCases": 20,
    "activeCases": 7,
    "resolvedCases": 7,
    "successRate": 35,
    "specializations": [
      {"type": "Litigation", "count": 5, "percentage": 25},
      {"type": "Corporate", "count": 5, "percentage": 25},
      {"type": "Employment", "count": 5, "percentage": 25}
    ]
  }
}
```

---

## 🎨 Customize Appearance

### Change Colors

Edit `AttorneyDirectoryPage.tsx`:

```typescript
// Change header gradient
<div className="bg-gradient-to-r from-blue-600 to-purple-600">
// Change to:
<div className="bg-gradient-to-r from-green-600 to-teal-600">

// Change button colors
<button className="bg-blue-600 hover:bg-blue-700">
// Change to:
<button className="bg-green-600 hover:bg-green-700">
```

### Add More Stats

In `publicController.ts`, add custom statistics:

```typescript
// Add client satisfaction
const clientSatisfaction = 4.5; // Calculate from reviews

// Add response time
const avgResponseTime = '< 24 hours';

// Return with other stats
statistics: {
  ...existingStats,
  clientSatisfaction,
  avgResponseTime,
}
```

---

## 🔧 Common Issues

### Issue 1: "No attorneys found"

**Problem:** Directory shows empty state

**Solution:**
```bash
# Check if attorneys exist
curl http://localhost:5000/api/public/attorneys

# If empty array [], create test attorneys (see above)
```

---

### Issue 2: Statistics show 0

**Problem:** Attorney has 0 cases, 0% success rate

**Solution:**
```sql
-- Create test cases for that attorney
-- See "Create Test Cases" section above
```

---

### Issue 3: Avatar not showing

**Problem:** Initials avatar not displaying

**Solution:**
- Check browser console for errors
- Verify avatar URL is valid (or null for initials)
- Check CSS classes are applied correctly

**Fallback:** System automatically shows initials if no avatar URL

---

### Issue 4: Contact form not sending

**Problem:** "Send Message" does nothing

**Solution:**
```bash
# Check backend logs
cd genzura-api
# Look for errors

# Test endpoint directly
curl -X POST http://localhost:5000/api/public/contact-attorney \
  -H "Content-Type: application/json" \
  -d '{
    "attorneyId": "<attorney-id>",
    "name": "Test",
    "email": "test@test.com",
    "message": "Test message"
  }'
```

---

### Issue 5: Routes not working

**Problem:** 404 on `/attorneys` page

**Solutions:**

1. **Backend:** Check routes registered
```typescript
// In genzura-api/src/index.ts
app.use('/api/public', publicRoutes); // Should be there
```

2. **Frontend:** Check routes in App.tsx
```typescript
<Route path="/attorneys" element={<AttorneyDirectoryPage />} />
<Route path="/attorneys/:id" element={<AttorneyProfilePage />} />
```

3. **Restart both servers**
```bash
# Kill and restart
cd genzura-api && npm run dev
cd genzura-web && npm run dev
```

---

## 📱 Mobile Testing

### Test on Mobile View

**Chrome DevTools:**
1. Press F12
2. Click device toggle icon
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Test directory and profile pages

**Expected:**
- Responsive layout
- Mobile menu works
- Cards stack vertically
- Touch-friendly buttons
- Search bar expands properly

---

## 🚀 Production Deployment

### Before Deploying:

1. **Test thoroughly**
   - All CRUD operations
   - Error handling
   - Mobile responsiveness

2. **Check environment variables**
   ```bash
   # .env in genzura-api
   DATABASE_URL=<production-db>
   NODE_ENV=production
   ```

3. **Build frontend**
   ```bash
   cd genzura-web
   npm run build
   ```

4. **Test production build locally**
   ```bash
   npm run preview
   ```

5. **Deploy to Render/Vercel**
   - Push to GitHub
   - Render auto-deploys backend
   - Vercel auto-deploys frontend

---

## ✅ Success Checklist

Before calling it done:

- [ ] Directory page loads and shows attorneys
- [ ] Search works in real-time
- [ ] Location filter works
- [ ] Attorney cards display correctly
- [ ] Profile page shows detailed stats
- [ ] Contact form sends messages
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Navigation links work
- [ ] Statistics calculate correctly
- [ ] Images/avatars load
- [ ] Success/error messages show
- [ ] Back buttons work
- [ ] Professional appearance

---

## 🎉 You're Done!

The attorney directory is now **fully functional**!

**What residents can do:**
- ✅ Browse all attorneys
- ✅ Search by name/firm
- ✅ Filter by location
- ✅ View detailed profiles
- ✅ See track records
- ✅ Contact attorneys directly

**What attorneys get:**
- ✅ Public profile
- ✅ Lead generation
- ✅ Professional showcase
- ✅ Automatic statistics
- ✅ Client inquiries

---

**Need Help?**
- Check `ATTORNEY_DIRECTORY_GUIDE.md` for detailed docs
- Review code comments in controller/pages
- Test API endpoints with curl/Postman

**Ready to launch!** 🚀
