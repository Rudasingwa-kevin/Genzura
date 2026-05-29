# 👨‍⚖️ Attorney Bio & Professional Documents

## 🎯 What Was Added

Enhanced attorney profiles with:
- ✅ **Bio/Description** - Tell your story
- ✅ **Education** - Degrees and qualifications
- ✅ **Bar Number** - License information
- ✅ **Years of Experience** - Explicit field
- ✅ **Specializations** - Practice areas
- ✅ **Professional Documents** - CV, certificates, licenses, awards

---

## 📊 Database Changes

### New User Fields:
```prisma
model User {
  // ... existing fields
  bio                   String?   @db.Text
  education             String?
  barNumber             String?
  yearsOfExperience     Int?
  specializations       String[]
  professionalDocuments AttorneyDocument[]
}
```

### New AttorneyDocument Model:
```prisma
model AttorneyDocument {
  id          String
  attorneyId  String
  type        AttorneyDocumentType  // CV, Certificate, BarLicense, etc.
  title       String
  description String?
  fileUrl     String
  fileName    String
  fileSize    Int?
  isPublic    Boolean  @default(true)
  issuedDate  DateTime?
  expiryDate  DateTime?
  issuer      String?
}
```

### Document Types:
- 📄 **CV** - Curriculum Vitae / Resume
- 🏆 **Certificate** - Professional certificates
- ⚖️ **BarLicense** - Bar association license
- 🎓 **Education** - Degrees, diplomas
- 🏅 **Award** - Awards and recognitions
- 📚 **Publication** - Published articles, papers
- 📎 **Other** - Other professional documents

---

## 🚀 Setup Instructions

### Step 1: Run Migration
```bash
cd genzura-api
npx prisma migrate dev --name add_attorney_bio_and_documents
```

This creates:
- New fields in User table
- AttorneyDocument table
- Indexes for performance

### Step 2: Restart Backend
```bash
npm run dev
```

### Step 3: Test Frontend
```bash
cd genzura-web
npm run dev
# Visit http://localhost:5173/attorneys/[attorney-id]
```

---

## 📝 How Attorneys Can Add Information

### Option 1: Via Settings Page (Recommended)

Add a section in Settings → Profile:

```typescript
// In SettingsPage.tsx
<div className="space-y-4">
  <div>
    <label>Bio</label>
    <textarea
      value={profile.bio}
      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
      rows={6}
      placeholder="Tell clients about yourself, your experience, and what makes you unique..."
    />
  </div>

  <div>
    <label>Education</label>
    <input
      value={profile.education}
      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
      placeholder="e.g., LLB, University of Rwanda, 2015"
    />
  </div>

  <div>
    <label>Bar Number</label>
    <input
      value={profile.barNumber}
      onChange={(e) => setProfile({ ...profile, barNumber: e.target.value })}
      placeholder="Your bar association license number"
    />
  </div>

  <div>
    <label>Years of Experience</label>
    <input
      type="number"
      value={profile.yearsOfExperience}
      onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) })}
    />
  </div>
</div>
```

### Option 2: Direct Database Update (For Testing)

```sql
-- Add bio
UPDATE "User"
SET bio = 'Experienced attorney specializing in corporate law and intellectual property. Over 10 years of practice representing startups and established businesses across Rwanda.'
WHERE email = 'attorney@example.com';

-- Add education
UPDATE "User"
SET education = 'LLB, University of Rwanda (2013); LLM, University of Cape Town (2015)'
WHERE email = 'attorney@example.com';

-- Add bar number
UPDATE "User"
SET "barNumber" = 'RBA-2013-0123',
    "yearsOfExperience" = 10
WHERE email = 'attorney@example.com';

-- Add specializations
UPDATE "User"
SET specializations = ARRAY['Corporate Law', 'Intellectual Property', 'Contract Law']
WHERE email = 'attorney@example.com';
```

---

## 📎 Adding Professional Documents

### Option 1: Via API Endpoint

Create endpoint in your user controller:

```typescript
// POST /api/users/documents
export async function uploadProfessionalDocument(req: Request, res: Response) {
  const userId = req.user?.id;
  const { type, title, description, fileUrl, fileName, fileSize, issuedDate, issuer } = req.body;

  const document = await prisma.attorneyDocument.create({
    data: {
      attorneyId: userId,
      type,
      title,
      description,
      fileUrl,
      fileName,
      fileSize,
      isPublic: true,
      issuedDate: issuedDate ? new Date(issuedDate) : null,
      issuer,
    },
  });

  res.json({ success: true, data: document });
}
```

### Option 2: Direct Database Insert (For Testing)

```sql
-- Insert CV
INSERT INTO "AttorneyDocument" (
  id,
  "attorneyId",
  type,
  title,
  description,
  "fileUrl",
  "fileName",
  "fileSize",
  "isPublic",
  "issuedDate",
  issuer,
  "uploadedAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'attorney@example.com'),
  'CV',
  'Curriculum Vitae',
  'Comprehensive CV showcasing 10+ years of legal practice',
  'https://your-s3-bucket.com/documents/cv-john-doe.pdf',
  'cv-john-doe.pdf',
  245760, -- 240 KB
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- Insert Bar License
INSERT INTO "AttorneyDocument" (
  id,
  "attorneyId",
  type,
  title,
  description,
  "fileUrl",
  "fileName",
  "isPublic",
  "issuedDate",
  issuer,
  "uploadedAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'attorney@example.com'),
  'BarLicense',
  'Rwanda Bar Association License',
  'Active member of the Rwanda Bar Association',
  'https://your-s3-bucket.com/documents/bar-license.pdf',
  'bar-license.pdf',
  true,
  '2013-06-15',
  'Rwanda Bar Association',
  NOW(),
  NOW()
);

-- Insert Certificate
INSERT INTO "AttorneyDocument" (
  id,
  "attorneyId",
  type,
  title,
  description,
  "fileUrl",
  "fileName",
  "isPublic",
  "issuedDate",
  issuer,
  "uploadedAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'attorney@example.com'),
  'Certificate',
  'Corporate Law Certification',
  'Advanced certification in corporate and commercial law',
  'https://your-s3-bucket.com/documents/cert-corporate-law.pdf',
  'cert-corporate-law.pdf',
  true,
  '2018-09-20',
  'East African Law Society',
  NOW(),
  NOW()
);
```

---

## 🎨 How It Looks on Profile

### Bio Section (Top of Profile)
```
┌─────────────────────────────────────────┐
│  📄 About                               │
│                                         │
│  Experienced attorney specializing in   │
│  corporate law and intellectual         │
│  property. Over 10 years of practice    │
│  representing startups and established  │
│  businesses across Rwanda.              │
└─────────────────────────────────────────┘
```

### Education & Credentials (Sidebar)
```
┌─────────────────────────────────────────┐
│  Education & Credentials                │
│                                         │
│  🎓 Education                           │
│     LLB, University of Rwanda (2013)    │
│     LLM, University of Cape Town (2015) │
│                                         │
│  ✓ Bar Number                           │
│     RBA-2013-0123                       │
└─────────────────────────────────────────┘
```

### Professional Documents (Below Statistics)
```
┌─────────────────────────────────────────┐
│  🎓 Credentials & Documents             │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 📄 Curriculum Vitae            │ ⬇  │
│  │ Comprehensive CV showcasing... │    │
│  │ 240 KB                         │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ ⚖️ Rwanda Bar Association      │ ⬇  │
│  │ Active member of the Rwanda... │    │
│  │ Rwanda Bar Association         │    │
│  │ Jun 2013 • 180 KB             │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 🏆 Corporate Law Certification │ ⬇  │
│  │ Advanced certification in...   │    │
│  │ East African Law Society       │    │
│  │ Sep 2018 • 156 KB             │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🎯 Features

### Bio
- ✅ Multiline text support
- ✅ Up to 5000 characters
- ✅ Markdown formatting (optional)
- ✅ Displays prominently at top of profile

### Documents
- ✅ Multiple document types
- ✅ File size display
- ✅ Issue date and issuer
- ✅ Download button
- ✅ Public/Private toggle
- ✅ Custom order (displayOrder field)
- ✅ Expiry date tracking (for licenses)

### Education & Bar Info
- ✅ Displays in sidebar
- ✅ Easy to scan
- ✅ Professional presentation

---

## 🔒 Privacy Controls

### Public vs Private Documents

```typescript
// Make document private (not shown on public profile)
await prisma.attorneyDocument.update({
  where: { id: documentId },
  data: { isPublic: false },
});

// Only public documents are shown
professionalDocuments: {
  where: { isPublic: true },
  // ...
}
```

---

## 📊 Benefits

### For Attorneys:
- ✅ **Build Trust** - Showcase credentials
- ✅ **Stand Out** - Tell your unique story
- ✅ **Save Time** - Clients can download CV directly
- ✅ **Credibility** - Display licenses and certifications

### For Clients:
- ✅ **Make Informed Decisions** - See full background
- ✅ **Verify Credentials** - Check bar number and licenses
- ✅ **Download Documents** - Get CV for records
- ✅ **Transparency** - Know who you're hiring

---

## 🎨 Customization

### Change Document Colors

In `AttorneyProfilePage.tsx`, update `getDocumentColor`:

```typescript
const getDocumentColor = (type: string) => {
  switch (type) {
    case 'CV':
      return 'bg-blue-50 text-blue-600';  // Your custom colors
    case 'Certificate':
      return 'bg-green-50 text-green-600';
    // ...
  }
};
```

### Add More Document Types

In `schema.prisma`:

```prisma
enum AttorneyDocumentType {
  // ... existing types
  Transcript        // Academic transcripts
  Reference         // Reference letters
  Portfolio         // Work samples
}
```

---

## ✅ Testing Checklist

- [ ] Run migration successfully
- [ ] Add bio to test attorney
- [ ] Add education and bar number
- [ ] Upload test documents (at least 3)
- [ ] View public profile - bio shows
- [ ] Documents are downloadable
- [ ] Document icons match types
- [ ] File sizes display correctly
- [ ] Dates format properly
- [ ] Private documents hidden from public

---

## 🚀 Next Steps

1. **Run migration** - Create new fields and tables
2. **Add sample data** - Test with one attorney
3. **Create upload UI** - Add to Settings page
4. **Test thoroughly** - Make sure everything works
5. **Deploy** - Push to production

---

**Status:** ✅ Ready to Implement
**Impact:** 🎯 Significantly improves attorney profiles
**Effort:** 🕐 30 min setup + data entry per attorney
