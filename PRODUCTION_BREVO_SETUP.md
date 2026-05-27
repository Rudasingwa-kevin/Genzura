# Production Brevo SMTP Setup Guide

## Overview
Step-by-step guide to create production Brevo SMTP credentials for Genzura.

**Estimated Time**: 15 minutes  
**Status**: 🔴 To Do Before Production Deployment

---

## Prerequisites

- [ ] Brevo account (sign up at https://www.brevo.com if you don't have one)
- [ ] Production domain ready (e.g., genzura.com)
- [ ] Access to domain DNS settings

---

## Step 1: Create/Login to Brevo Account

1. Go to https://app.brevo.com
2. Login or create new account for production
3. Complete account verification

**Recommended**: Use a dedicated email for production (e.g., admin@yourdomain.com)

---

## Step 2: Verify Production Sender Email

### Option A: Using Your Domain (Recommended)

1. **Navigate to**: Settings → Senders & IP
2. **Click**: "Add a new sender"
3. **Email**: `noreply@yourdomain.com` or `notifications@yourdomain.com`
4. **Name**: "Genzura Legal"

5. **Verify Domain**:
   - Brevo will provide DNS records
   - Add these records to your domain DNS:
     - TXT record for domain verification
     - DKIM record for email authentication
   - Wait for DNS propagation (5-60 minutes)
   - Click "Verify" in Brevo

### Option B: Using Gmail (Temporary)

If you don't have a domain yet:

1. **Navigate to**: Settings → Senders & IP
2. **Click**: "Add a new sender"
3. **Email**: Your Gmail address (e.g., `kevincracker02@gmail.com`)
4. **Check Gmail** for verification email
5. **Click verification link**

⚠️ **Note**: Using Gmail will work but professional domains look more credible for production.

---

## Step 3: Create Production SMTP Credentials

1. **Navigate to**: Settings → SMTP & API
2. **Find section**: "SMTP"
3. **Click**: "Generate a new SMTP key" or "Create SMTP credentials"

4. **Fill in details**:
   - **Name**: "Genzura Production"
   - **Description**: "Production SMTP for Genzura Legal Platform"

5. **Copy credentials immediately** (you won't see them again):
   ```
   SMTP Server: smtp-relay.brevo.com
   Port: 587
   Username: [will look like: abc123def@smtp-brevo.com]
   Password: [will look like: xsmtpsib-xxxxxxxxxxxxxxxxxx]
   ```

6. **Save these securely** in your password manager

---

## Step 4: Update Production Environment Variables

Create or update `.env.production`:

```bash
# Brevo Email Service - Production
BREVO_SMTP_USER="abc123def@smtp-brevo.com"
BREVO_SMTP_KEY="xsmtpsib-your-production-key-here"

# Verified Sender
SENDER_EMAIL="noreply@yourdomain.com"
SENDER_NAME="Genzura Legal"
```

---

## Step 5: Test Production Email Configuration

### Option 1: Test Locally First

1. **Temporarily update local `.env`** with production credentials:
   ```bash
   cp .env .env.backup  # Backup current
   # Update .env with production credentials
   ```

2. **Start server**:
   ```bash
   npm run dev
   ```

3. **Navigate to**: http://localhost:5173/admin/email-test

4. **Run tests**:
   - Click "Test SMTP Connection" → Should show ✅
   - Enter your email
   - Click "Send Test Email"
   - Check inbox (and spam folder)

5. **Restore development credentials**:
   ```bash
   cp .env.backup .env
   ```

### Option 2: Test in Production After Deployment

After deploying with production credentials:

1. Login as admin
2. Navigate to: `/admin/email-test`
3. Test connection
4. Send test emails

---

## Step 6: Revoke Development Credentials (Optional)

If you want to completely separate dev/prod:

1. **Login to Brevo** with development account
2. **Navigate to**: Settings → SMTP & API
3. **Find old SMTP key**: `ab930a001@smtp-brevo.com`
4. **Click**: Revoke or Delete

Or keep it active for development (recommended).

---

## Brevo Account Limits

### Free Plan
- ✅ 300 emails per day
- ✅ Unlimited contacts
- ✅ SMTP access
- ❌ Daily sending limit

### Lite Plan ($25/month)
- ✅ 10,000 emails per month
- ✅ No daily limit
- ✅ Email support
- ✅ Remove Brevo logo

### Premium Plan ($65/month)
- ✅ 20,000 emails per month
- ✅ Advanced statistics
- ✅ Phone support
- ✅ Marketing automation

**Recommendation**: Start with Free plan, upgrade if you hit limits.

---

## Email Types Sent by Genzura

Current email templates:

1. **Welcome Email** - When new user registers
2. **Invitation Email** - When admin invites team members
3. **Subscription Activated** - When subscription granted
4. **Subscription Extended** - When subscription extended
5. **Subscription Cancelled** - When subscription revoked

**Estimated volume**:
- Small firm (5 users): ~50 emails/month
- Medium firm (20 users): ~200 emails/month
- Large firm (50+ users): ~500 emails/month

Free plan should be sufficient for most use cases initially.

---

## DNS Configuration for Domain Verification

When verifying your domain, Brevo will ask you to add these DNS records:

### Example DNS Records

**Domain**: yourdomain.com

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | brevo-code=xxxxxxxxxx | 3600 |
| TXT | mail._domainkey | k=rsa;p=MIGfMA0GCS... | 3600 |

### How to Add DNS Records

#### Namecheap:
1. Login → Domain List → Manage
2. Advanced DNS
3. Add New Record
4. Type: TXT, Host: (from Brevo), Value: (from Brevo)
5. Save

#### Cloudflare:
1. Login → Select Domain
2. DNS → Add Record
3. Type: TXT, Name: (from Brevo), Content: (from Brevo)
4. Save

#### GoDaddy:
1. Login → My Products → DNS
2. Add → TXT
3. Host: (from Brevo), Value: (from Brevo)
4. Save

**Wait time**: DNS propagation takes 5-60 minutes

---

## Troubleshooting

### Issue: "Sender email not verified"

**Solution**:
- Check spam folder for verification email
- Ensure DNS records are correct
- Wait for DNS propagation (up to 1 hour)
- Use DNS checker: https://mxtoolbox.com/SuperTool.aspx

### Issue: "SMTP connection failed"

**Solution**:
- Verify SMTP credentials are correct
- Check firewall allows port 587
- Ensure `smtp-relay.brevo.com` is accessible
- Check server logs for detailed error

### Issue: "Emails going to spam"

**Solution**:
- Complete domain verification (SPF, DKIM)
- Use professional sender email (not Gmail)
- Add "Unsubscribe" link to emails
- Warm up sender reputation gradually

### Issue: "Daily limit exceeded"

**Solution**:
- Upgrade Brevo plan
- Or spread email sending throughout the day
- Or use multiple sender emails

---

## Security Best Practices

### ✅ Do:
- Use dedicated production SMTP credentials
- Store credentials in environment variables (never in code)
- Use different credentials for dev/staging/prod
- Rotate credentials every 90 days
- Enable 2FA on Brevo account
- Monitor email sending logs

### ❌ Don't:
- Commit `.env.production` to Git
- Share SMTP credentials via Slack/email
- Use same credentials across environments
- Hard-code email credentials
- Send emails without rate limiting

---

## Verification Checklist

After setup, verify:

- [ ] Production Brevo account created
- [ ] Sender email verified (with green checkmark in Brevo)
- [ ] SMTP credentials generated and saved securely
- [ ] `.env.production` updated with production credentials
- [ ] Test email sent successfully
- [ ] Email received (not in spam)
- [ ] Brevo logo appears correctly in email
- [ ] All email templates work
- [ ] Unsubscribe links work (if implemented)

---

## Current Configuration Summary

### Development (Current)
```bash
BREVO_SMTP_USER="ab930a001@smtp-brevo.com"
BREVO_SMTP_KEY="xsmtpsib-5a6a34c9..." (exposed)
SENDER_EMAIL="kevincracker02@gmail.com"
SENDER_NAME="Genzura Legal"
```
✅ Works for development
⚠️ Should not be used in production (exposed in conversation)

### Production (To Be Set Up)
```bash
BREVO_SMTP_USER="<new-production-user>@smtp-brevo.com"
BREVO_SMTP_KEY="xsmtpsib-<new-production-key>"
SENDER_EMAIL="noreply@yourdomain.com"  # Or your domain email
SENDER_NAME="Genzura Legal"
```
🔴 Must create before production deployment

---

## Quick Setup Commands

After getting production credentials from Brevo:

```bash
# 1. Create production environment file
cd genzura-api
cp .env.production.example .env.production

# 2. Edit .env.production and add Brevo credentials
# (Use your text editor)

# 3. Test production config locally (optional)
cp .env .env.dev.backup
cp .env.production .env
npm run dev
# Test at: http://localhost:5173/admin/email-test

# 4. Restore dev config
cp .env.dev.backup .env

# 5. Deploy with production config
# (Your deployment process will use .env.production)
```

---

## Support Resources

- **Brevo Documentation**: https://help.brevo.com/hc/en-us/articles/360000268730
- **SMTP Configuration**: https://help.brevo.com/hc/en-us/articles/209467485
- **Domain Verification**: https://help.brevo.com/hc/en-us/articles/360000991960
- **Email Best Practices**: https://help.brevo.com/hc/en-us/sections/360004520759

---

## Status

**Current Status**: 🔴 Production credentials not created  
**Priority**: CRITICAL  
**Estimated Time**: 15 minutes  
**Blocking**: Production deployment  

**Next Steps**:
1. Create/login to production Brevo account
2. Verify sender email
3. Generate production SMTP credentials
4. Update `.env.production`
5. Test email sending
6. Mark as ✅ complete

---

**Last Updated**: May 27, 2026  
**Created By**: Claude Code Assistant
