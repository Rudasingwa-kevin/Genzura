# 👨‍⚖️ Attorney Directory - Public Feature

## Overview

A public-facing attorney directory where residents in Rwanda can browse and contact attorneys. This feature helps potential clients find lawyers based on location, expertise, and track record.

---

## ✅ What Was Built

### Backend (API)

1. **`src/controllers/publicController.ts`** - Public endpoints controller
   - Get all attorneys with statistics
   - Get individual attorney profile
   - Get attorney locations for filtering
   - Contact attorney functionality

2. **`src/routes/publicRoutes.ts`** - Public routes (no authentication)
   - `GET /api/public/attorneys` - List all attorneys
   - `GET /api/public/attorneys/:id` - Get attorney details
   - `GET /api/public/attorney-locations` - Get filter options
   - `POST /api/public/contact-attorney` - Send inquiry to attorney

### Frontend (React)

1. **`src/pages/AttorneyDirectoryPage.tsx`** - Main directory page
   - Search by name, firm, or expertise
   - Filter by location
   - Attorney cards with statistics
   - Responsive grid layout

2. **`src/pages/AttorneyProfilePage.tsx`** - Individual attorney profile
   - Detailed statistics
   - Case expertise breakdown
   - Contact modal
   - Success rate visualization

3. **Navigation Links** - Added to landing page
   - "Find Attorneys" in header menu
   - Mobile menu support

---

## 🎨 Features

### For Potential Clients (Public Users)

✅ **Browse Attorneys**
- See all active attorneys in the system
- View attorney photos/avatars
- See firm name and location
- Quick statistics (total cases, success rate, active cases)

✅ **Search & Filter**
- Search by attorney name, firm, or job title
- Filter by location (city)
- Real-time search results

✅ **Attorney Profiles**
- Detailed case statistics
- Areas of expertise (Litigation, Corporate, etc.)
- Experience level
- Contact information (email, phone)
- Success rate visualization

✅ **Contact Attorneys**
- Built-in contact form
- Specify case type
- Direct email/phone display
- Messages stored as feedback

### For Attorneys (Benefits)

✅ **Public Visibility**
- Profile automatically appears in directory
- Statistics calculated from their cases
- Professional showcase
- Lead generation

✅ **Statistics Displayed**
- Total cases handled
- Success rate (resolved cases %)
- Active case count
- Specialization breakdown

---

## 🔧 How It Works

### Backend Logic

```typescript
// 1. Fetch active attorneys
const attorneys = await prisma.user.findMany({
  where: {
    status: 'Active',
    role: { in: ['Attorney', 'Senior_Attorney'] }
  },
  include: {
    cases: true, // For calculating statistics
    _count: { select: { cases: true } }
  }
});

// 2. Calculate statistics
const casesByType = attorney.cases.reduce((acc, c) => {
  acc[c.type] = (acc[c.type] || 0) + 1;
  return acc;
}, {});

const resolvedCases = attorney.cases.filter(c => c.status === 'Resolved').length;
const successRate = Math.round((resolvedCases / totalCases) * 100);

// 3. Format for display
return {
  id: attorney.id,
  name: attorney.name,
  location: attorney.location,
  statistics: {
    totalCases,
    successRate,
    specializations: top3CaseTypes
  }
};
```

### Frontend Flow

```
Landing Page
     │
     ├─→ "Find Attorneys" link
     │
     ▼
Attorney Directory Page (/attorneys)
     │
     ├─→ Search/Filter
     ├─→ Browse attorney cards
     │
     ▼
Click "View Profile"
     │
     ▼
Attorney Profile Page (/attorneys/:id)
     │
     ├─→ View detailed stats
     ├─→ See expertise areas
     │
     ▼
Click "Contact Attorney"
     │
     ▼
Contact Modal
     │
     ├─→ Fill form (name, email, message)
     ├─→ Submit
     │
     ▼
Message sent to attorney as feedback
```

---

## 📡 API Endpoints

### 1. Get All Attorneys
```http
GET /api/public/attorneys
```

**Query Parameters:**
- `search` - Search by name, company, job title
- `location` - Filter by location
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attorney123",
      "name": "John Doe",
      "emailDomain": "example.com",
      "phone": "+250 XXX XXX XXX",
      "company": "Doe & Associates",
      "location": "Kigali, Rwanda",
      "jobTitle": "Senior Attorney at Law",
      "avatarUrl": "https://...",
      "role": "Senior_Attorney",
      "yearsOfExperience": 5,
      "statistics": {
        "totalCases": 45,
        "activeCases": 12,
        "resolvedCases": 30,
        "successRate": 88,
        "specializations": ["Litigation", "Corporate", "Employment"]
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 2. Get Attorney Details
```http
GET /api/public/attorneys/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attorney123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250 XXX XXX XXX",
    "company": "Doe & Associates",
    "location": "Kigali, Rwanda",
    "jobTitle": "Senior Attorney at Law",
    "avatarUrl": "https://...",
    "role": "Senior_Attorney",
    "language": "EN",
    "yearsOfExperience": 5,
    "statistics": {
      "totalCases": 45,
      "activeCases": 12,
      "pendingCases": 3,
      "resolvedCases": 30,
      "archivedCases": 0,
      "successRate": 88,
      "specializations": [
        {
          "type": "Litigation",
          "count": 25,
          "percentage": 55
        },
        {
          "type": "Corporate",
          "count": 15,
          "percentage": 33
        },
        {
          "type": "Employment",
          "count": 5,
          "percentage": 11
        }
      ]
    }
  }
}
```

### 3. Get Locations
```http
GET /api/public/attorney-locations
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Kigali, Rwanda",
    "Musanze, Rwanda",
    "Huye, Rwanda"
  ]
}
```

### 4. Contact Attorney
```http
POST /api/public/contact-attorney
```

**Request Body:**
```json
{
  "attorneyId": "attorney123",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+250 XXX XXX XXX",
  "caseType": "Litigation",
  "message": "I need legal assistance with a property dispute..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact request sent successfully",
  "data": {
    "id": "feedback456"
  }
}
```

---

## 🎨 UI Components

### Attorney Card (Directory Page)

```
┌─────────────────────────────────────┐
│  [Avatar]  John Doe                 │
│            Senior Attorney          │
│            ⭐ Senior Attorney        │
│                                     │
│  🏢 Doe & Associates                │
│  📍 Kigali, Rwanda                  │
│  💼 5+ years experience             │
│                                     │
│  ┌──────┬──────┬──────┬──────┐     │
│  │  45  │ 88%  │  30  │  12  │     │
│  │Cases │Success│Resolved│Active│   │
│  └──────┴──────┴──────┴──────┘     │
│                                     │
│  Specializations:                   │
│  [Litigation] [Corporate]           │
│                                     │
│  [View Profile →]                   │
└─────────────────────────────────────┘
```

### Profile Page Layout

```
┌────────────────────────────────────────────┐
│  [Cover Photo - Blue Gradient]            │
│                                            │
│  [Large Avatar] John Doe                   │
│                 Senior Attorney            │
│                 ⭐ Senior Attorney          │
│                                            │
│  🏢 Doe & Associates  📍 Kigali  💼 5 yrs  │
│                                            │
│  [Contact Attorney]                        │
└────────────────────────────────────────────┘

┌─────────────────────┬──────────────────┐
│ Case Statistics     │ Contact Info     │
│                     │                  │
│ ┌──────┬──────┐    │ ✉️ Email         │
│ │  45  │ 88%  │    │ 📞 Phone         │
│ │Cases │Success│   │                  │
│ └──────┴──────┘    │ Quick Facts      │
│                     │ • Member Since   │
│ Status Distribution │ • Languages      │
│ [Progress Bars]     │ • Availability   │
│                     │                  │
│ Expertise Areas     │                  │
│ [Litigation 55%]    │                  │
│ [Corporate 33%]     │                  │
│ [Employment 11%]    │                  │
└─────────────────────┴──────────────────┘
```

---

## 🔒 Privacy & Security

### What's Public:
✅ Attorney name
✅ Job title and firm
✅ Location
✅ Case statistics (counts only, no client info)
✅ Specialization areas
✅ Contact information (email, phone)

### What's Protected:
❌ Client names
❌ Case details
❌ Case descriptions
❌ Documents
❌ Internal notes
❌ Financial information

### Email Obfuscation (Directory Page):
- Only email domain shown: `@example.com`
- Full email revealed on profile page
- Prevents email scraping

---

## 🚀 Usage Guide

### For Residents Looking for Attorneys:

1. **Visit Genzura**: Go to https://genzura.com
2. **Click "Find Attorneys"** in the top navigation
3. **Search/Filter**: 
   - Type attorney name or firm
   - Filter by location if needed
4. **Browse Results**: View attorney cards with key stats
5. **View Profile**: Click "View Profile" for detailed info
6. **Contact**: Click "Contact Attorney" and fill the form

### For Attorneys to Appear in Directory:

Your profile automatically appears if:
- ✅ Your status is "Active"
- ✅ Your role is "Attorney" or "Senior_Attorney"
- ✅ You have at least completed your profile setup

**To improve your listing:**
1. Add a professional profile photo
2. Fill in your company/firm name
3. Add your location
4. Update your job title
5. Handle cases to build statistics!

---

## 📊 Statistics Calculation

### Success Rate
```
Success Rate = (Resolved Cases / Total Cases) × 100
```
- Only counts cases with status "Resolved" as successful
- Higher is better (target: 80%+)

### Specializations
- Calculated from case types you've handled
- Top 3 most frequent case types shown
- Percentage calculated from total cases

### Years of Experience
- Currently simplified: account creation date
- **TODO**: Add explicit `yearsOfExperience` field to User model

---

## 🎯 Future Enhancements

### Phase 1 (Current) ✅
- Basic directory
- Search and filter
- Contact form
- Statistics display

### Phase 2 (Planned) 🚧
- [ ] Attorney ratings/reviews
- [ ] Case type filtering
- [ ] Language filtering
- [ ] Availability calendar
- [ ] Online booking
- [ ] Attorney badges (verified, top-rated)

### Phase 3 (Future) 💡
- [ ] Attorney bio/description field
- [ ] Education & certifications
- [ ] Years of experience (explicit field)
- [ ] Practice areas tags
- [ ] Video consultations
- [ ] Attorney testimonials
- [ ] Bar association verification

---

## 🐛 Troubleshooting

### No Attorneys Showing Up
**Problem**: Directory page is empty

**Solutions:**
1. Check that attorneys exist with `status = 'Active'`
2. Verify role is `Attorney` or `Senior_Attorney`
3. Check API is running: `GET /api/public/attorneys`
4. Look at browser console for errors

### Statistics Not Accurate
**Problem**: Case counts seem wrong

**Solutions:**
1. Statistics are calculated from cases where `attorneyId` matches
2. Check that cases are properly assigned to attorneys
3. Verify case status is correctly set

### Contact Form Not Working
**Problem**: Messages not sending

**Solutions:**
1. Check attorney ID is valid
2. Verify all required fields filled (name, email, message)
3. Check backend logs for errors
4. Ensure Feedback table is accessible

### Profile Images Not Loading
**Problem**: Avatars not displaying

**Solutions:**
1. Check S3 configuration if using S3
2. Verify `avatarUrl` field has valid URL
3. Check CORS settings
4. Fallback to initials avatar if URL fails

---

## 💻 Code Examples

### Adding Attorney Profile Fields

If you want to add more profile fields:

```typescript
// 1. Update Prisma schema
model User {
  // ... existing fields
  bio           String?  @db.Text  // Attorney bio
  education     String?             // Education background
  barNumber     String?             // Bar association number
  languages     String[]            // Languages spoken
}

// 2. Run migration
npx prisma migrate dev --name add_attorney_profile_fields

// 3. Update publicController.ts to include new fields
const attorney = await prisma.user.findFirst({
  select: {
    // ... existing fields
    bio: true,
    education: true,
    barNumber: true,
    languages: true,
  }
});

// 4. Display in AttorneyProfilePage.tsx
<div className="bio-section">
  <h3>About</h3>
  <p>{attorney.bio}</p>
</div>
```

### Customizing Statistics

To add new statistics:

```typescript
// In publicController.ts
const customStats = {
  // Average case duration
  avgCaseDuration: calculateAvgDuration(attorney.cases),
  
  // Win rate (if you track outcomes)
  winRate: calculateWinRate(attorney.cases),
  
  // Client satisfaction (if you have reviews)
  satisfaction: calculateSatisfaction(attorney.reviews),
};
```

---

## 📝 Testing Checklist

### Backend Testing
- [ ] GET /api/public/attorneys returns active attorneys
- [ ] Search parameter works correctly
- [ ] Location filter works
- [ ] Statistics are calculated correctly
- [ ] GET /api/public/attorneys/:id returns details
- [ ] Contact form creates feedback entry
- [ ] Email obfuscation works on directory

### Frontend Testing
- [ ] Directory page loads
- [ ] Search updates results in real-time
- [ ] Location filter shows correct options
- [ ] Attorney cards display correctly
- [ ] Profile page loads with details
- [ ] Contact modal opens and closes
- [ ] Form validation works
- [ ] Success message shows after contact
- [ ] Mobile responsive layout
- [ ] Navigation links work

### User Experience Testing
- [ ] Page loads fast (<3 seconds)
- [ ] Images load properly
- [ ] No console errors
- [ ] Smooth transitions/animations
- [ ] Clear error messages
- [ ] Accessible (keyboard navigation, screen readers)

---

## 🎉 Summary

You now have a **complete public attorney directory** that:

✅ Allows residents to find attorneys
✅ Shows attorney expertise and track record
✅ Provides contact functionality
✅ Automatically calculates statistics
✅ Is fully responsive and beautiful
✅ Requires no authentication (public access)

**Impact:**
- 🎯 Lead generation for attorneys
- 🔍 Easy attorney discovery for clients
- 📊 Transparent track records
- 💼 Professional showcase
- 🌟 Competitive advantage for Genzura

---

**Built for Genzura Legal Management System**
**Date:** 2026-05-29
