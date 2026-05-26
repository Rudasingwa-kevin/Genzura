# Genzura S3 Upload Configuration Guide

## What Gets Uploaded to S3

Your Genzura application uploads **2 types of files** to AWS S3:

### 1. 📄 **Legal Documents** (PDFs, DOCX, XLSX, Images)
- **Upload Location**: `POST /api/documents`
- **S3 Path**: `/uploads/{filename}`
- **File Types Allowed**:
  - PDF (application/pdf)
  - Microsoft Word (.doc, .docx)
  - Microsoft Excel (.xls, .xlsx)
  - Images (PNG, JPEG, JPG)
  - Text files (.txt)
- **Max File Size**: 100 MB
- **Controller**: `documentController.ts`
- **Used For**: Case documents, legal files, evidence, contracts, etc.

### 2. 👤 **User Avatars** (Profile Pictures)
- **Upload Location**: `POST /api/users/avatar`
- **S3 Path**: `/uploads/avatars/{filename}`
- **File Types Allowed**:
  - JPEG/JPG
  - PNG
  - GIF
  - WebP
- **Max File Size**: 5 MB
- **Controller**: `userController.ts`
- **Used For**: User profile pictures

---

## How It Works

### Upload Process:
1. **File arrives** → Temporarily saved to local disk by Multer middleware
2. **S3 Check** → System checks if S3 is configured (`S3Service.isConfigured()`)
3. **Upload to S3** → If configured, file is uploaded to S3 bucket
4. **Local Cleanup** → After successful S3 upload, local temp file is deleted
5. **Database** → File URL is saved to database (e.g., `/uploads/filename`)

### Download/Access Process:
1. **Request arrives** → User requests file via `/uploads/...` or `/uploads/avatars/...`
2. **S3 Check** → System checks if S3 is configured
3. **Presigned URL** → If S3, generates temporary presigned URL (valid for 1 hour)
4. **Redirect** → Redirects user to presigned URL for secure download
5. **Fallback** → If S3 fails or not configured, serves from local disk

### Delete Process:
1. **Delete request** → User or system deletes document/avatar
2. **S3 Deletion** → File removed from S3 bucket
3. **Database** → Record removed/updated in database

---

## Configuration Status

### ✅ Your Current Setup:
- **Bucket Name**: `legal-practice-files-486036174632-eu-north-1-an`
- **Region**: `eu-north-1` (Europe - Stockholm)
- **Status**: **ACTIVE** ✅
- **Test Results**: Connection verified, uploads working

### Environment Variables (in `.env`):
```env
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET="your-bucket-name"
```

> **Note**: Replace with your actual AWS credentials. Never commit real credentials to git!

---

## File Storage Structure in S3

Your S3 bucket will have this structure:

```
legal-practice-files-486036174632-eu-north-1-an/
├── uploads/
│   ├── file-1234567890-123456789.pdf          # Legal documents
│   ├── file-1234567891-987654321.docx
│   ├── file-1234567892-111111111.xlsx
│   └── ...
├── uploads/avatars/
│   ├── avatar-1234567890-123456789.jpg        # User avatars
│   ├── avatar-1234567891-987654321.png
│   └── ...
└── test/
    └── connection-test.txt                     # Test file (can be deleted)
```

---

## What Does NOT Get Uploaded to S3

These are stored locally or elsewhere:
- **Static assets** (CSS, JS, images) → Served from `/public` folder
- **Email attachments** → Sent via Brevo/SMTP
- **Database data** → Stored in PostgreSQL
- **Cloudinary images** → Logo/branding stored in Cloudinary
- **Session tokens** → Stored in memory/database

---

## Testing Your S3 Setup

### Test Script Location:
`genzura-api/test-s3-connection.js`

### Run Test:
```bash
cd genzura-api
node test-s3-connection.js
```

### Expected Output:
```
✅ Successfully connected to S3 bucket!
✅ Test file uploaded successfully!
✨ All tests passed! S3 is configured correctly.
```

---

## Troubleshooting

### Files Not Appearing in S3?
1. **Check .env file** → Ensure all AWS variables are set
2. **Restart API server** → Changes require server restart
3. **Check AWS credentials** → Verify access key and secret are correct
4. **Check IAM permissions** → User needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`

### Files Still Local Only?
- Check console logs for S3 errors
- If S3 fails, system falls back to local storage
- Check network connectivity to AWS

### Access Denied Errors?
- Verify IAM user has correct permissions
- Check bucket policy allows your IAM user
- Verify bucket region matches `AWS_REGION`

---

## Security Notes

### File Access:
- Files are **not public** by default
- Access via **presigned URLs** (temporary, secure)
- URLs expire after **1 hour**
- Each download generates new presigned URL

### Credentials:
- Keep `.env` file secure (never commit to git)
- `.env` is already in `.gitignore`
- Rotate AWS credentials periodically
- Use IAM user with minimal required permissions

---

## Next Steps

1. ✅ **S3 is configured** → Ready to use
2. ✅ **Test connection passed** → Verified working
3. 🔄 **Restart API server** → Apply configuration
4. 📤 **Upload test file** → Try uploading a document in your app
5. 🔍 **Check S3 bucket** → Verify file appears in bucket

---

## Support

- **AWS Console**: https://console.aws.amazon.com/s3/
- **Bucket Dashboard**: Search for `legal-practice-files-486036174632-eu-north-1-an`
- **Test Script**: Run `node test-s3-connection.js` anytime to verify

---

Generated: 2026-05-26
Status: ✅ Active and Configured
