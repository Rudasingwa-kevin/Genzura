# Quick Email Setup for Production

## 🚀 5-Minute Brevo Setup

### Step 1: Create Brevo Account (2 minutes)

1. Go to: **https://www.brevo.com/**
2. Click **"Sign Up Free"**
3. Fill in your details
4. Verify your email
5. Login to dashboard

### Step 2: Get SMTP Credentials (1 minute)

1. In Brevo dashboard, go to: **Settings** → **SMTP & API**
2. Click **"Generate a new SMTP key"**
3. Give it a name: `Genzura Production`
4. Copy the **SMTP key** (you'll only see it once!)
5. Your login is the email you registered with

### Step 3: Verify Sender Email (2 minutes)

1. Go to: **Senders & IP** → **Senders**
2. Click **"Add a Sender"**
3. Enter:
   - Email: `noreply@yourdomain.com` (or use your personal email for testing)
   - Name: `Genzura Legal`
4. Click **"Add"**
5. Check your email for verification link
6. Click the link to verify

### Step 4: Update `.env` File

Open `genzura-api/.env` and update:

```env
# Replace these with your actual values
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=xkeysib-xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Genzura Legal
```

### Step 5: Test It!

```bash
cd genzura-api
npm run dev
```

Then test OTP sending:
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

Check your email - you should receive a verification code!

---

## ✅ That's It!

Your email service is now configured and ready for production.

### Free Tier Limits (Brevo)
- **300 emails/day** (more than enough for OTP)
- Unlimited contacts
- Real-time statistics
- 99% deliverability

### For Higher Volume
Upgrade to paid plan if you exceed 300 emails/day:
- **Lite Plan**: $25/month (20,000 emails)
- **Premium Plan**: $65/month (100,000 emails)
