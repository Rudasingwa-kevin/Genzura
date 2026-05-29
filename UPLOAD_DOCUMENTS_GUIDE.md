# 📎 Upload CV & Certificates Guide

## 📍 Where to Upload

**Settings → Documents & Credentials**

**URL:** `/settings` → Click "Documents & Credentials" tab

---

## 🎯 What You Can Upload

### Document Types:
- 📄 **CV / Resume** - Your curriculum vitae
- 🏆 **Certificate** - Professional certificates
- ⚖️ **Bar License** - Bar association license
- 🎓 **Education** - Degrees and diplomas
- 🏅 **Award** - Awards and recognitions
- 📚 **Publication** - Published articles, papers
- 📎 **Other** - Other professional documents

### File Requirements:
- **Formats:** PDF, JPG, PNG
- **Max Size:** 10 MB per file
- **No limit** on number of documents

---

## 🚀 How to Upload

### Step 1: Navigate to Documents Tab
```
1. Login to Genzura
2. Go to Settings (profile icon → Settings)
3. Click "Documents & Credentials" tab
```

### Step 2: Click Upload
```
Click "Upload Document" button (top right)
```

### Step 3: Fill Upload Form

**Required Fields:**
- ✅ **File** - Select your document (PDF/image)
- ✅ **Document Type** - Choose from dropdown
- ✅ **Title** - Give it a clear name

**Optional Fields:**
- **Description** - Brief description
- **Issuer** - Who issued it (e.g., "Rwanda Bar Association")
- **Issue Date** - When it was issued
- **Public Visibility** - Toggle on/off

### Step 4: Upload
```
Click "Upload Document"
Wait for confirmation
Done!
```

---

## 📋 Example Uploads

### Example 1: CV
```
File: john-doe-cv.pdf
Type: CV / Resume
Title: Curriculum Vitae
Description: Comprehensive CV showcasing 10+ years of legal practice
Issuer: (leave empty)
Issue Date: (leave empty)
Public: ✅ Yes
```

### Example 2: Bar License
```
File: bar-license-scan.pdf
Type: Bar License
Title: Rwanda Bar Association License
Description: Active member of the Rwanda Bar Association
Issuer: Rwanda Bar Association
Issue Date: 2013-06-15
Public: ✅ Yes
```

### Example 3: Certificate
```
File: corporate-law-cert.pdf
Type: Certificate
Title: Advanced Corporate Law Certification
Description: Certification in corporate and commercial law
Issuer: East African Law Society
Issue Date: 2018-09-20
Public: ✅ Yes
```

### Example 4: Degree
```
File: llb-degree.pdf
Type: Education Degree
Title: LLB, University of Rwanda
Description: Bachelor of Laws degree
Issuer: University of Rwanda
Issue Date: 2013-07-01
Public: ✅ Yes
```

---

## 🎨 How It Looks

### Documents Tab (Settings):
```
┌─────────────────────────────────────────┐
│  Professional Documents                 │
│  CV, Certificates, Licenses & Creds     │
│                                         │
│  [Upload Document]                      │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 📄 Curriculum Vitae            │    │
│  │ Uploaded: May 29, 2026         │    │
│  │ 240 KB • Public                │    │
│  │ [⬇] [👁] [🗑]                  │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ ⚖️ Bar Association License      │    │
│  │ Rwanda Bar Association         │    │
│  │ Jun 15, 2013 • 180 KB • Public │    │
│  │ [⬇] [👁] [🗑]                  │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Public Profile Display:
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
└─────────────────────────────────────────┘
```

---

## 🔒 Public vs Private

### Public Documents (👁):
- ✅ Shown on public attorney profile
- ✅ Downloadable by potential clients
- ✅ Builds credibility
- ✅ Recommended for: CV, licenses, certifications

### Private Documents (🔒):
- ❌ NOT shown on public profile
- ❌ Only visible to you
- ✅ Use for: Personal records, internal docs

### Toggle Visibility:
- Click eye icon (👁) to toggle public/private
- Changes immediately
- Can toggle anytime

---

## 🎯 Document Actions

### Download (⬇):
- Click download icon
- Opens in new tab
- Save to your computer

### Toggle Visibility (👁/🔒):
- Click eye icon
- Makes public → private or vice versa
- Instant update

### Delete (🗑):
- Click trash icon
- Confirms before deleting
- Permanently removes document

---

## ⚠️ Current Status

### ✅ What Works:
- Complete UI for upload
- Form validation
- File type/size checks
- Public/private toggle
- Document list display
- Action buttons

### ⏳ What Needs Setup:
- Backend API endpoints (see below)
- S3 or file storage integration
- Database migration (already done!)

### Backend API Endpoints Needed:

```typescript
// Upload document
POST /api/users/documents
Body: FormData with file + metadata
Response: { success: true, data: document }

// Get my documents
GET /api/users/documents
Response: { success: true, data: documents[] }

// Update document (toggle visibility, etc.)
PATCH /api/users/documents/:id
Body: { isPublic: boolean }
Response: { success: true, data: document }

// Delete document
DELETE /api/users/documents/:id
Response: { success: true }
```

---

## 💡 Pro Tips

### 1. Optimize PDF Size
Before uploading:
```
- Use PDF compression tools
- Remove unnecessary pages
- Aim for <1MB per file
- Ensures fast downloads for clients
```

### 2. Name Documents Clearly
Good titles:
```
✅ "Bar Association License 2013"
✅ "LLB Degree, University of Rwanda"
✅ "Corporate Law Certification"
```

Bad titles:
```
❌ "scan001.pdf"
❌ "document.pdf"
❌ "IMG_1234.jpg"
```

### 3. Add Descriptions
Help clients understand what they're looking at:
```
✅ "Active member of the Rwanda Bar Association since 2013"
✅ "Certification in advanced corporate and commercial law"
✅ "Master's degree in International Business Law"
```

### 4. Keep Updated
- Upload new certificates when earned
- Remove expired licenses
- Update CV annually

---

## 🧪 Testing

### Test Upload Flow:

1. **Prepare Test Files:**
   - Create a test PDF (or use existing)
   - Keep under 10MB

2. **Navigate:**
   - Go to Settings
   - Click "Documents & Credentials"

3. **Upload:**
   - Click "Upload Document"
   - Fill form
   - Submit

4. **Verify:**
   - Document appears in list
   - Actions work (download, toggle, delete)

5. **Check Public Profile:**
   - Visit `/attorneys/[your-id]`
   - Verify document shows if public
   - Test download link

---

## 🔧 For Developers

### To Enable Document Uploads:

1. **Backend: Create Document Controller**

```typescript
// src/controllers/documentController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../services/s3Service';

const prisma = new PrismaClient();

export async function uploadDocument(req: Request, res: Response) {
  const userId = req.user?.id;
  const file = req.file; // multer middleware
  const { type, title, description, isPublic, issuedDate, issuer } = req.body;

  try {
    // Upload to S3
    const fileUrl = await S3Service.uploadFile(file, `documents/${userId}/`);

    // Save to database
    const document = await prisma.attorneyDocument.create({
      data: {
        attorneyId: userId,
        type,
        title,
        description,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        isPublic: isPublic === 'true',
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        issuer,
      },
    });

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
}

export async function getMyDocuments(req: Request, res: Response) {
  const userId = req.user?.id;

  const documents = await prisma.attorneyDocument.findMany({
    where: { attorneyId: userId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json({ success: true, data: documents });
}

export async function updateDocument(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const { isPublic } = req.body;

  const document = await prisma.attorneyDocument.update({
    where: { id, attorneyId: userId },
    data: { isPublic },
  });

  res.json({ success: true, data: document });
}

export async function deleteDocument(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;

  // Delete from S3
  const doc = await prisma.attorneyDocument.findUnique({ where: { id } });
  if (doc?.fileUrl) {
    await S3Service.deleteFile(doc.fileUrl);
  }

  // Delete from database
  await prisma.attorneyDocument.delete({
    where: { id, attorneyId: userId },
  });

  res.json({ success: true });
}
```

2. **Backend: Add Routes**

```typescript
// src/routes/documentRoutes.ts
import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import {
  uploadDocument,
  getMyDocuments,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/documents', auth, upload.single('file'), uploadDocument);
router.get('/documents', auth, getMyDocuments);
router.patch('/documents/:id', auth, updateDocument);
router.delete('/documents/:id', auth, deleteDocument);

export default router;
```

3. **Backend: Register Routes**

```typescript
// src/index.ts
import documentRoutes from './routes/documentRoutes';

app.use('/api/users', documentRoutes);
```

---

## ✅ Summary

### Location:
**Settings → Documents & Credentials Tab**

### What to Upload:
- CV, certificates, licenses, degrees, awards

### File Limits:
- PDF, JPG, PNG
- Max 10MB

### Features:
- Public/private toggle
- Download capability
- Edit/delete options
- Automatic display on public profile

### Status:
- ✅ UI Complete
- ⏳ Backend API needed
- ⏳ S3 storage needed

---

**Start building your credibility!** Upload your professional documents today. 📎
