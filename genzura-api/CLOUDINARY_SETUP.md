# Cloudinary Setup Guide for Genzura

## Why Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month
- ✅ **Fast CDN delivery**: Images load quickly worldwide
- ✅ **Automatic optimization**: Smart compression & format conversion
- ✅ **Email compatibility**: Works in all email clients
- ✅ **99.99% uptime SLA**: Reliable hosting

---

## Step-by-Step Setup

### 1. Create Cloudinary Account (Free)

1. Go to: **https://cloudinary.com/users/register/free**
2. Sign up with your email (kevincracker02@gmail.com)
3. Verify your email
4. Complete the onboarding

**Time**: ~2 minutes

---

### 2. Get Your Credentials

1. Log in to: **https://cloudinary.com/console**
2. On the dashboard, you'll see:
   ```
   Cloud Name: xxxxxxxxx
   API Key: xxxxxxxxxxxxxxxxx
   API Secret: xxxxxxxxxxxxxxxxxxxxxx
   ```
3. Copy these credentials

---

### 3. Add Credentials to .env File

Open `genzura-api/.env` and add:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=genzura-legal
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

### 4. Upload Logo to Cloudinary

Run the upload script:

```bash
cd genzura-api
node upload-logo-to-cloudinary.js
```

**Expected Output:**
```
🚀 Uploading Genzura logo to Cloudinary...

✅ Logo uploaded successfully!

📸 Image Details:
   Public ID: genzura/genzura-logo
   Format: png
   Size: 245.67 KB
   Width: 500px
   Height: 500px

🔗 Cloudinary URL:
   https://res.cloudinary.com/genzura-legal/image/upload/v1234567890/genzura/genzura-logo.png

📋 Add this to your .env file:
   LOGO_URL=https://res.cloudinary.com/genzura-legal/image/upload/v1234567890/genzura/genzura-logo.png

✅ Mobile version uploaded!
   Size: 85.23 KB
   URL: https://res.cloudinary.com/genzura-legal/image/upload/v1234567890/genzura/genzura-logo-mobile.png

🎉 Upload complete! Your logo is now hosted on Cloudinary CDN.
```

---

### 5. Update .env with Logo URL

Copy the URL from the upload output and add to `.env`:

```env
# Logo URL (Cloudinary CDN)
LOGO_URL=https://res.cloudinary.com/genzura-legal/image/upload/v1234567890/genzura/genzura-logo.png
```

---

### 6. Test Email with Cloudinary Logo

Restart your server and send a test email:

```bash
# Restart server
npm run dev

# In another terminal, trigger test email
curl -X POST http://localhost:5000/api/admin/jobs/run-expiry-check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Check your email - the logo should now load from Cloudinary CDN!

---

## Verification Steps

### Check Logo is on Cloudinary:

1. Go to: **https://cloudinary.com/console/media_library**
2. Navigate to `genzura` folder
3. You should see:
   - `genzura-logo` (500px version)
   - `genzura-logo-mobile` (250px version)

### Check Logo URL Works:

Open this URL in your browser (replace with your actual URL):
```
https://res.cloudinary.com/YOUR-CLOUD-NAME/image/upload/genzura/genzura-logo.png
```

You should see the Genzura logo with scales of justice!

---

## Cloudinary Features Used

### 1. **Automatic Optimization**
```javascript
quality: 'auto',
fetch_format: 'auto'
```
- Cloudinary automatically compresses images
- Serves WebP to modern browsers (smaller file size)
- Serves PNG to older email clients

### 2. **Responsive Images**
```javascript
transformation: [
  { width: 500, crop: 'limit' }
]
```
- Desktop: 500px max width
- Mobile: 250px version available
- Scales automatically based on device

### 3. **CDN Delivery**
- Logo served from nearest CDN edge server
- Fast loading worldwide
- 99.99% uptime SLA

---

## Email Client Compatibility

With Cloudinary, your logo will work in:

✅ Gmail (Desktop & Mobile)  
✅ Outlook (Desktop & Web)  
✅ Apple Mail (macOS & iOS)  
✅ Yahoo Mail  
✅ ProtonMail  
✅ Thunderbird  
✅ All major email clients  

**Why?** Cloudinary URLs are trusted by email clients and don't get blocked.

---

## Troubleshooting

### Logo Not Uploading?

**Error: "Cloudinary credentials not found"**
- Check `.env` file has all 3 credentials
- Make sure no extra spaces in credentials
- Restart your terminal after updating .env

**Error: "ENOENT: no such file"**
- Logo must be at: `genzura-api/public/Genzura full logo.png`
- Run: `ls -la public/` to verify

**Error: "401 Unauthorized"**
- Double-check credentials from Cloudinary dashboard
- Make sure you copied the full API secret (it's long!)

### Logo Not Showing in Emails?

**Check 1: Is LOGO_URL set?**
```bash
echo $LOGO_URL
```

**Check 2: Can you access the URL?**
- Open the Cloudinary URL in your browser
- Should show the logo image

**Check 3: Email client blocking images?**
- Click "Show Images" in Gmail
- Check if email is in Spam/Promotions folder

**Check 4: Server using new env variable?**
- Restart the server after updating .env
- Check server logs for the logo URL being used

---

## Cost Breakdown (Free Tier)

Cloudinary Free Tier Includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month

**For Genzura:**
- Logo size: ~1 MB
- Storage used: <0.01 GB
- Estimated emails/month: 10,000
- Bandwidth used: ~10 GB (well within free tier!)

**You won't need to pay anything unless you send 250,000+ emails/month! 🎉**

---

## Production Deployment

When deploying to production:

### Option 1: Use Cloudinary (Recommended) ✅
```env
LOGO_URL=https://res.cloudinary.com/genzura-legal/image/upload/genzura/genzura-logo.png
```

### Option 2: Self-host on your domain
```env
LOGO_URL=https://genzura.rw/assets/logo.png
```

### Option 3: AWS S3
```env
LOGO_URL=https://genzura-assets.s3.amazonaws.com/logo.png
```

**Recommendation**: Stick with Cloudinary - it's free, fast, and reliable!

---

## Advanced: Image Transformations

Cloudinary allows on-the-fly image transformations via URL:

### Different Sizes:
```
https://res.cloudinary.com/.../w_200/genzura-logo.png   (200px wide)
https://res.cloudinary.com/.../w_500/genzura-logo.png   (500px wide)
```

### Different Formats:
```
https://res.cloudinary.com/.../genzura-logo.webp   (WebP format)
https://res.cloudinary.com/.../genzura-logo.jpg    (JPEG format)
```

### Quality Control:
```
https://res.cloudinary.com/.../q_80/genzura-logo.png   (80% quality)
```

**For emails, we use the default optimized version - no need to customize!**

---

## Monitoring & Analytics

Cloudinary Dashboard shows:
- How many times logo was viewed
- Bandwidth usage
- Storage usage
- Geographic distribution of requests

Access at: **https://cloudinary.com/console/reports**

---

## Support & Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Image Upload Guide**: https://cloudinary.com/documentation/image_upload_api_reference
- **Email Best Practices**: https://cloudinary.com/documentation/email_delivery
- **Support**: support@cloudinary.com

---

## Summary Checklist

- [ ] Sign up for Cloudinary free account
- [ ] Copy credentials from dashboard
- [ ] Add credentials to `.env` file
- [ ] Run `node upload-logo-to-cloudinary.js`
- [ ] Copy LOGO_URL to `.env`
- [ ] Restart server
- [ ] Send test email
- [ ] Verify logo shows in email

**Time to complete**: ~10 minutes  
**Cost**: $0 (Free tier)  
**Benefit**: Professional, fast-loading emails worldwide! 🚀

---

**Need Help?** Check the troubleshooting section or contact Cloudinary support!
