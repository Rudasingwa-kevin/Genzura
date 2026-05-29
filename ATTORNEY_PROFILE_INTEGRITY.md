# 🛡️ Attorney Profile Integrity

## Problem Identified

User asked: *"The attorney can lie about years of experience, so can we remove it?"*

**Issue:** Allowing attorneys to manually enter their years of experience creates an integrity problem where they could:
- ❌ Inflate their experience to appear more qualified
- ❌ Gain unfair advantage in the attorney directory
- ❌ Mislead potential clients
- ❌ Undermine trust in the platform

## Solution Implemented

✅ **Removed manual years of experience field**
✅ **Automatic calculation based on account creation date**
✅ **No way for attorneys to manipulate this value**

---

## How It Works Now

### Automatic Calculation

```javascript
yearsOfExperience = Math.max(
  1,  // Minimum 1 year
  Math.floor(
    (Date.now() - new Date(attorney.createdAt).getTime()) / 
    (1000 * 60 * 60 * 24 * 365)
  )
)
```

### Example:
- **Account created:** January 1, 2020
- **Today:** May 29, 2026
- **Years of experience:** 6 years (automatic)

The attorney **cannot change this value** - it's calculated on the fly every time their profile is viewed.

---

## What Was Removed

### Frontend (Settings Page):

**Before:**
```typescript
// Attorney could manually enter years
<Field label="Years of Experience">
  <Input
    type="number"
    value={yearsOfExperience}
    onChange={e => setYearsOfExperience(e.target.value)}
    placeholder="e.g., 10"
    min="0"
    max="50"
  />
</Field>
```

**After:**
```typescript
// Field completely removed - automatic calculation only
```

### Backend:

**Removed from:**
- ✅ `userController.updateProfile()` - No longer accepts yearsOfExperience
- ✅ `userService.updateProfile()` - No longer saves yearsOfExperience
- ✅ `publicController.getPublicAttorneyById()` - Doesn't read from database, always calculates

---

## What Attorneys Can Still Edit

Attorneys have full control over these fields in Settings:

✅ **Bio** - Professional description (2000 chars)
✅ **Education** - Degrees and qualifications
✅ **Bar Number** - Bar association license
✅ **Documents** - Upload CV, certificates, licenses
✅ **Basic Info** - Name, phone, location, job title

These fields are verifiable:
- **Bar Number** - Can be verified with Rwanda Bar Association
- **Education** - Shown with degrees and institutions
- **Documents** - Attorneys upload actual certificates/licenses
- **Years of Experience** - Auto-calculated, cannot be faked

---

## Benefits

### For Platform:
- ✅ **Integrity** - No false claims about experience
- ✅ **Trust** - Clients can rely on accurate information
- ✅ **Fairness** - New attorneys don't compete with inflated experience claims
- ✅ **Compliance** - Reduces liability from false advertising

### For Clients:
- ✅ **Accurate Information** - Experience is verifiable
- ✅ **Fair Comparison** - Can compare attorneys objectively
- ✅ **No Deception** - Platform enforces honesty

### For Attorneys:
- ✅ **Level Playing Field** - Everyone plays by same rules
- ✅ **Credibility** - Platform ensures accurate profiles
- ✅ **Focus on Real Credentials** - Documents and cases matter more

---

## Edge Cases Handled

### Case 1: New Attorney
```
Account created: Today
Years of experience: 1 (minimum enforced)
```
We use `Math.max(1, calculated)` to ensure new attorneys show at least 1 year instead of 0.

### Case 2: Experienced Attorney Just Joined
```
Account created: Today
Real-world experience: 15 years
Years shown: 1
```

**Why this is OK:**
- Platform shows "years on Genzura" not "total career years"
- Attorney can mention 15 years in their **bio**
- Attorney can upload degrees from 15 years ago
- **Case statistics** will show their actual work
- Over time, the automatic calculation becomes accurate

### Case 3: Attorney Who Practiced Elsewhere
```
Account created: January 2024
Years on platform: 2
```

They can state in their bio:
> "Experienced attorney with 12 years of practice across East Africa. 
> Member of Genzura since 2024."

This provides context while the platform shows verified platform tenure.

---

## Alternative: License Date Field

If you want to show **true years of experience**, consider adding:

```prisma
model User {
  // ...
  barLicenseDate  DateTime?  // When they got their bar license
}
```

Then calculate:
```javascript
yearsOfExperience = Math.floor(
  (Date.now() - new Date(attorney.barLicenseDate).getTime()) / 
  (1000 * 60 * 60 * 24 * 365)
)
```

**Pros:**
- Shows real professional experience
- Based on verifiable bar license date
- Accurate for experienced attorneys joining platform

**Cons:**
- Still requires attorney to enter date (could lie)
- Would need verification against bar association records
- More complex to implement

**Recommendation:** Keep current approach (platform tenure) for now. Add license date verification later if needed.

---

## Data Migration

Since we removed the manual field, existing data:

**Database:**
- `yearsOfExperience` column still exists in database
- Contains old manual values (now ignored)
- Public API always calculates from `createdAt`

**No migration needed** because:
- Public API doesn't read `yearsOfExperience` column anymore
- Always calculates dynamically
- Old data is harmless (unused)

**Optional cleanup:**
```sql
-- Optional: Clear old manual values
UPDATE "User" 
SET "yearsOfExperience" = NULL 
WHERE role IN ('Attorney', 'Senior_Attorney');
```

---

## Future Enhancements

### 1. Bar License Verification
Integrate with Rwanda Bar Association API to:
- Verify bar numbers automatically
- Pull official license date
- Mark profiles as "Verified"

### 2. Badge System
```
🔹 "1+ Year on Genzura"
🔸 "5+ Years on Genzura"  
🔶 "10+ Years on Genzura"
⭐ "Verified Bar License"
```

### 3. Experience Timeline
Show timeline of activity:
```
2024 - Joined Genzura
2024 - First case won
2025 - 10+ cases resolved
2026 - 50+ cases resolved
```

---

## Testing

### Manual Test:

1. **Login as attorney**
2. **Go to Settings → Personal Profile**
3. **Check:** No "Years of Experience" field
4. **Save profile**
5. **Visit public attorney profile**
6. **Verify:** Years calculated from account creation

### Database Test:

```sql
-- Check an attorney's account age
SELECT 
  name,
  "createdAt",
  FLOOR(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 31536000) as calculated_years,
  "yearsOfExperience" as old_manual_value
FROM "User"
WHERE role = 'Attorney';
```

### API Test:

```bash
# Get attorney profile
curl http://localhost:5000/api/public/attorneys/{id}

# Check response
{
  "yearsOfExperience": 2,  // Auto-calculated
  "createdAt": "2024-01-15T..."  // Source of calculation
}
```

---

## Summary

✅ **Problem:** Attorneys could lie about experience  
✅ **Solution:** Automatic calculation based on account creation  
✅ **Implementation:** Removed manual field from UI and API  
✅ **Result:** Verifiable, trustworthy attorney profiles  

**Integrity maintained!** 🛡️

---

## Related Files

**Frontend:**
- `genzura-web/src/pages/SettingsPage.tsx` - Removed years input field

**Backend:**
- `genzura-api/src/controllers/userController.ts` - Removed from update
- `genzura-api/src/services/userService.ts` - Removed from service
- `genzura-api/src/controllers/publicController.ts` - Always calculates

**Commits:**
- `81a5c55` - fix: remove manual yearsOfExperience field to prevent fraud

---

**Status:** ✅ Complete  
**Impact:** High - Improves platform integrity  
**Date:** May 29, 2026
