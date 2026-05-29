# 🧪 Testing Guide - Attorney Profile & Documents

## Overview

This guide covers end-to-end testing of the new attorney profile and document upload features.

---

## Prerequisites

**Backend:**
```bash
cd genzura-api
npm run dev
# Should see: 🚀 Genzura API running on http://localhost:5000
```

**Frontend:**
```bash
cd genzura-web
npm run dev
# Should see: http://localhost:5173
```

**Database:**
- ✅ Migrations run (`npx prisma db push`)
- ✅ Attorney user exists in database

---

## Test Scenarios

### 1️⃣ Login & Authentication

**Test Steps:**
1. Go to http://localhost:5173/login
2. Login with attorney credentials
3. Should redirect to dashboard

**Expected:**
- ✅ No errors in console
- ✅ Redirects to /dashboard
- ✅ User name appears in header

**Common Issues:**
- ❌ 500 error → Backend not running or database schema outdated
- ❌ Blank page → Check browser console for errors

---

### 2️⃣ Profile Editing - Basic Fields

**Test Steps:**
1. Login as attorney
2. Click profile icon → Settings
3. Update basic fields:
   - First Name: "John"
   - Last Name: "Doe"
   - Phone: "+250 788 123 456"
   - Location: "Kigali, Rwanda"
   - Job Title: "Senior Corporate Attorney"
4. Click "Save Changes"

**Expected:**
- ✅ Toast: "Profile updated successfully!"
- ✅ Changes persist on refresh
- ✅ Name updates in header immediately

**Test in Database:**
```sql
SELECT name, phone, location, "jobTitle" 
FROM "User" 
WHERE email = 'your-attorney-email@example.com';
```

---

### 3️⃣ Profile Editing - Attorney Fields

**Test Steps:**
1. Stay in Settings → Personal Profile
2. Scroll to "Professional Profile" section
3. Update attorney fields:
   - **Bio:** "Experienced corporate attorney with 10+ years specializing in M&A and commercial law. Licensed by Rwanda Bar Association."
   - **Education:** "LLB, University of Rwanda (2013); LLM, University of Cape Town (2016)"
   - **Bar Number:** "RBA-2013-0789"
4. Click "Save Changes"

**Expected:**
- ✅ Toast: "Profile updated successfully!"
- ✅ Character counter updates as you type bio (max 2000)
- ✅ Changes saved to database

**Verify NO "Years of Experience" field:**
- ❌ Should NOT see years of experience input
- ✅ This prevents fraud

**Test in Database:**
```sql
SELECT bio, education, "barNumber" 
FROM "User" 
WHERE email = 'your-attorney-email@example.com';
```

---

### 4️⃣ Document Upload - CV

**Test Steps:**
1. Go to Settings → Documents & Credentials (2nd tab)
2. Should see empty state: "No documents uploaded yet"
3. Click "Upload Document"
4. Fill form:
   - **File:** Select a PDF (e.g., sample-cv.pdf)
   - **Document Type:** CV / Resume
   - **Title:** "Curriculum Vitae"
   - **Description:** "Comprehensive CV showcasing 10+ years of legal practice"
   - **Issuer:** (leave empty)
   - **Issue Date:** (leave empty)
   - **Public Visibility:** ON
5. Click "Upload Document"

**Expected:**
- ✅ Toast: "Document uploaded successfully!"
- ✅ Modal closes
- ✅ Document appears in list with:
   - 📄 CV icon
   - Title: "Curriculum Vitae"
   - Description shown
   - Upload date (today)
   - File size (e.g., "240 KB")
   - 👁 Public badge

**Common Issues:**
- ❌ "Upload failed" → Check file size (<10MB), file type (PDF/JPG/PNG only)
- ❌ 500 error → Backend route not registered or controller error

**Test in Database:**
```sql
SELECT type, title, description, "fileUrl", "isPublic", "fileSize"
FROM "AttorneyDocument"
WHERE "attorneyId" = (SELECT id FROM "User" WHERE email = 'your-attorney-email@example.com');
```

---

### 5️⃣ Document Upload - Multiple Types

**Test Steps:**
Upload different document types:

**A) Bar License:**
- Type: Bar License
- Title: "Rwanda Bar Association License"
- Description: "Active member since 2013"
- Issuer: "Rwanda Bar Association"
- Issue Date: "2013-06-15"
- Public: ON

**B) Certificate:**
- Type: Certificate
- Title: "Advanced Corporate Law Certification"
- Description: "Certification in M&A and commercial transactions"
- Issuer: "East African Law Society"
- Issue Date: "2018-09-20"
- Public: ON

**C) Education Degree:**
- Type: Education Degree
- Title: "LLB, University of Rwanda"
- Description: "Bachelor of Laws with honors"
- Issuer: "University of Rwanda"
- Issue Date: "2013-07-01"
- Public: ON

**Expected:**
- ✅ Each document uploads successfully
- ✅ Different icons for different types (⚖️, 🏆, 🎓)
- ✅ Issuer and date display correctly
- ✅ All show as "Public"

---

### 6️⃣ Document Actions - Download

**Test Steps:**
1. In documents list, hover over a document
2. Click download icon (⬇)

**Expected:**
- ✅ Document opens in new tab OR downloads
- ✅ File is the correct PDF/image
- ✅ No errors

**Common Issues:**
- ❌ 404 Not Found → File path issue (S3 or local)
- ❌ CORS error → S3 bucket CORS not configured

---

### 7️⃣ Document Actions - Toggle Visibility

**Test Steps:**
1. Click eye icon (👁) on a public document
2. Should change to 🔒 and show "Private"
3. Toast: "Document hidden from public"
4. Click eye-off icon (🔒)
5. Should change back to 👁 and show "Public"
6. Toast: "Document now public"

**Expected:**
- ✅ Visibility toggles instantly
- ✅ Icon and badge update
- ✅ Toast notifications appear

**Test in Database:**
```sql
SELECT title, "isPublic" 
FROM "AttorneyDocument"
WHERE "attorneyId" = (SELECT id FROM "User" WHERE email = 'your-attorney-email@example.com');
```

---

### 8️⃣ Document Actions - Delete

**Test Steps:**
1. Click trash icon (🗑) on a document
2. Confirm deletion dialog: "Are you sure..."
3. Click OK

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Toast: "Document deleted"
- ✅ Document removed from list
- ✅ File removed from storage (S3 or local)

**Test in Database:**
```sql
-- Should NOT find deleted document
SELECT * FROM "AttorneyDocument"
WHERE "attorneyId" = (SELECT id FROM "User" WHERE email = 'your-attorney-email@example.com');
```

---

### 9️⃣ Public Attorney Directory

**Test Steps:**
1. **Logout** (important - test public view)
2. Go to http://localhost:5173/attorneys
3. Should see attorney directory with:
   - Search bar
   - Filters (location, specialization)
   - Attorney cards

**Expected:**
- ✅ Your attorney appears in list
- ✅ Card shows:
   - Name
   - Photo (if uploaded)
   - Location
   - Job title
   - Statistics (cases, success rate)
   - Years of experience (auto-calculated)
- ✅ Search works
- ✅ No login required

---

### 🔟 Public Attorney Profile

**Test Steps:**
1. Still logged out
2. Click on your attorney card
3. Should go to `/attorneys/{id}` page

**Expected:**

**✅ Profile Header:**
- Name
- Photo
- Job title
- Location
- Years of experience (auto-calculated from account creation)
- Statistics (total cases, active cases, success rate)

**✅ About Section:**
- Bio displays (if you added one)
- Shows full bio text

**✅ Specializations:**
- Shows practice areas (auto-calculated from cases)

**✅ Education & Credentials (Sidebar):**
- 🎓 Education shows
- ✓ Bar Number shows
- Both match what you entered in Settings

**✅ Professional Documents:**
- Section titled "🎓 Credentials & Documents"
- Only PUBLIC documents show (private ones hidden)
- Each document card shows:
  - Icon (📄, ⚖️, 🏆, etc.)
  - Title
  - Description
  - Issuer (if provided)
  - Issue date (if provided)
  - File size
  - Download button

**❌ Should NOT show:**
- Private documents (you toggled visibility off)
- Email address (obfuscated until contact)
- Any internal data

**Test Download:**
- Click download on a public document
- Should download/open the file

---

### 1️⃣1️⃣ Contact Attorney Form

**Test Steps:**
1. Still on public attorney profile (logged out)
2. Click "Contact Attorney" button
3. Fill form:
   - Name: "Jane Client"
   - Email: "jane@example.com"
   - Phone: "+250 788 999 888"
   - Message: "I need help with a corporate matter"
4. Click "Send Message"

**Expected:**
- ✅ Toast: "Message sent successfully!"
- ✅ Form clears
- ✅ Modal closes

**Check Backend Logs:**
- Should see email sent (if email is configured)
- Or stored in database for attorney to view later

---

### 1️⃣2️⃣ Changes Appear Immediately

**Test Steps:**
1. **Login again** as attorney
2. Go to Settings → Personal Profile
3. Update bio to: "UPDATED BIO - Testing immediate sync"
4. Save changes
5. **Open new incognito window**
6. Go to http://localhost:5173/attorneys/{your-id}

**Expected:**
- ✅ Bio shows "UPDATED BIO - Testing immediate sync"
- ✅ No delay, no cache
- ✅ Changes are immediate

**Repeat for Documents:**
1. Login, upload new document
2. Open incognito, view public profile
3. ✅ New document appears immediately

---

### 1️⃣3️⃣ Years of Experience Integrity

**Test Steps:**
1. Check your attorney profile (public view)
2. Note years of experience (e.g., "2 years")
3. Try to find anywhere to edit this
4. Go to Settings → Personal Profile
5. Look for "Years of Experience" field

**Expected:**
- ❌ NO field to manually edit years
- ✅ Auto-calculated from account creation date
- ✅ Cannot be manipulated

**Verify Calculation:**
```javascript
// If account created: Jan 1, 2024
// Today: May 29, 2026
// Expected: 2 years

Math.floor((new Date('2026-05-29') - new Date('2024-01-01')) / (365 * 24 * 60 * 60 * 1000))
// = 2
```

---

## Edge Cases to Test

### 📎 Large File Upload
- Upload a 9.9MB PDF → Should work
- Upload a 10.1MB PDF → Should fail with error
- **Expected:** "File size must be less than 10MB"

### 📎 Invalid File Type
- Try uploading .txt file → Should fail
- Try uploading .docx file → Should fail
- **Expected:** "Invalid file type. Only PDF, JPEG, and PNG files are allowed."

### 📎 Empty Fields
- Try uploading without selecting file → Should fail
- Try uploading without title → Should fail
- **Expected:** Validation errors

### 📎 Special Characters
- Bio with emojis: "Experienced attorney 👨‍⚖️"
- Education with accents: "École de Droit"
- **Expected:** Saves correctly, displays properly

### 📎 Long Text
- Bio with 2000 characters → Should work
- Bio with 2001 characters → Should be blocked or truncated
- **Expected:** Character counter prevents exceeding limit

---

## Browser Testing

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Safari (if on Mac)

**Common Issues:**
- File upload may work differently in Safari
- DatePicker format varies by browser locale

---

## Mobile Testing

If possible, test on mobile:
1. Open http://localhost:5173 on phone (same network)
2. Navigate attorney directory
3. View attorney profile
4. Test contact form

**Expected:**
- ✅ Responsive design
- ✅ Touch interactions work
- ✅ Forms usable on mobile

---

## Performance Testing

### Document List Loading
**Test:**
- Upload 10 documents
- Go to Settings → Documents & Credentials
- Measure load time

**Expected:**
- ✅ Loads in <2 seconds
- ✅ No lag when scrolling

### Public Profile Loading
**Test:**
- Visit public attorney profile
- Measure page load time

**Expected:**
- ✅ Loads in <3 seconds
- ✅ Images load progressively

---

## Security Testing

### Authentication
**Test:**
1. Logout
2. Try to access http://localhost:5173/settings directly
3. Should redirect to login

**Expected:**
- ❌ Cannot access Settings without login
- ✅ Redirects to /login

### Document Privacy
**Test:**
1. Upload document, set to PRIVATE
2. Logout
3. View public profile
4. Try to access document URL directly

**Expected:**
- ❌ Private document NOT shown on public profile
- ❌ Cannot access private document URL directly (should return 403)

### Other Attorney's Documents
**Test:**
1. Login as Attorney A
2. Note document ID from Attorney B
3. Try: DELETE /api/users/documents/{attorney-b-document-id}

**Expected:**
- ❌ 403 Forbidden - Cannot delete other attorney's documents
- ✅ Can only manage own documents

---

## Known Issues & Limitations

### Current Limitations:

1. **No Document Ordering**
   - Documents appear in upload order
   - Cannot reorder manually

2. **No Bulk Upload**
   - Must upload one document at a time
   - Could be tedious for 10+ documents

3. **No Document Preview**
   - Cannot preview PDF in modal before uploading
   - Must download to view after upload

4. **Years of Experience**
   - Shows platform tenure, not total career years
   - Experienced attorneys joining will show low years initially
   - (This is intentional for integrity)

5. **File Size Limit**
   - 10MB max per file
   - Cannot upload large video files or presentations

---

## Bug Reporting Template

If you find a bug, report it like this:

```
**Bug Title:** Document upload fails with error 500

**Steps to Reproduce:**
1. Go to Settings → Documents & Credentials
2. Click Upload Document
3. Select CV.pdf (5MB)
4. Fill in title and type
5. Click Upload

**Expected:** Document uploads successfully

**Actual:** Error 500, toast "Failed to upload document"

**Browser:** Chrome 120
**OS:** Windows 11
**Environment:** Local development

**Console Errors:**
[Paste any console errors here]

**Backend Logs:**
[Paste any backend errors here]
```

---

## Success Criteria

Feature is ready for production when:

- ✅ All test scenarios pass
- ✅ No console errors
- ✅ Works in Chrome, Firefox, Edge
- ✅ Mobile responsive
- ✅ Performance acceptable (<3s page loads)
- ✅ Security tests pass
- ✅ Data persists correctly in database
- ✅ No bugs found in 30-minute exploratory testing

---

## Quick Test Commands

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Check Database
```sql
-- Count documents
SELECT COUNT(*) FROM "AttorneyDocument";

-- View all attorney profiles
SELECT name, bio, education, "barNumber" 
FROM "User" 
WHERE role IN ('Attorney', 'Senior_Attorney');
```

### Clear Test Data
```sql
-- CAUTION: Only on test database!
DELETE FROM "AttorneyDocument" WHERE "attorneyId" = 'test-attorney-id';
```

---

## Testing Complete! ✅

Once all tests pass:
1. Document any bugs found
2. Fix critical issues
3. Note "nice to have" improvements for later
4. Consider ready for next phase

**Next Step After Testing:**
- Deploy to staging environment, or
- Build Attorney Inbox feature, or
- Enhance search & discovery

Good luck testing! 🧪
