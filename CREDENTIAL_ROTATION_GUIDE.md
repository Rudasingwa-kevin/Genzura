# Credential Rotation Guide for Production Deployment

## ⚠️ CRITICAL: Complete Before Production Deployment

**Date**: May 27, 2026  
**Priority**: 🔴 CRITICAL

---

## Overview

This guide walks through rotating all sensitive credentials before production deployment. All credentials currently in use are development/test credentials that have been exposed in conversation history and MUST be rotated.

---

## Pre-Rotation Checklist

- [ ] Backup current database
- [ ] Document current working configuration
- [ ] Notify team of planned maintenance window
- [ ] Prepare rollback plan
- [ ] Test in staging environment first

---

## 1. JWT Secret Rotation 🔴 CRITICAL

### Current Status
```bash
JWT_SECRET="your_super_secret_jwt_key_here"
```
**Status**: ❌ INSECURE - Placeholder value

### Action Required

**Step 1**: Generate new strong secret
```bash
openssl rand -base64 48
```

**Example Output**:
```
NlLyhOa+JU4JuyILC8b2jQoHnTZsOwm6tOVILNMVMuyMQ43sxGxtbp0l0pqgPpsZ
```

**Step 2**: Update `.env` file
```bash
JWT_SECRET="NlLyhOa+JU4JuyILC8b2jQoHnTZsOwm6tOVILNMVMuyMQ43sxGxtbp0l0pqgPpsZ"
```

**Step 3**: Restart application
```bash
npm run build
npm start
```

### ⚠️ Impact
- **All active user sessions will be invalidated**
- **All users will need to log in again**
- Schedule during low-traffic period
- Send notification email to users beforehand

### Verification
```bash
# Check JWT_SECRET is strong
node scripts/check-env.js
# Should show: ✅ All required environment variables are set
```

---

## 2. Brevo SMTP Credentials Rotation 🔴 CRITICAL

### Current Status
```bash
BREVO_SMTP_USER="ab930a001@smtp-brevo.com"
BREVO_SMTP_KEY="xsmtpsib-5a6a34c9...Z3s"  # EXPOSED
```
**Status**: ❌ COMPROMISED - Exposed in conversation

### Action Required

**Step 1**: Login to Brevo Dashboard
- URL: https://app.brevo.com/settings/keys/smtp
- Navigate to: Settings → SMTP & API

**Step 2**: Create New SMTP Credentials
1. Click "Generate new SMTP key"
2. Name: "Genzura Production"
3. Copy the generated credentials

**Step 3**: Verify Sender Email
- Go to: Settings → Senders
- Add and verify: `noreply@yourdomain.com` (production domain)
- Wait for verification email

**Step 4**: Update Production Environment
```bash
BREVO_SMTP_USER="<new-smtp-user>@smtp-brevo.com"
BREVO_SMTP_KEY="xsmtpsib-<new-production-key>"
SENDER_EMAIL="noreply@yourdomain.com"
SENDER_NAME="Genzura Legal"
```

**Step 5**: Delete Old Credentials
- In Brevo dashboard, revoke old SMTP key: `ab930a001@smtp-brevo.com`

### Verification
```bash
# Test email connection
npm run dev

# In admin panel:
# Navigate to: /admin/email-test
# Click "Test SMTP Connection"
# Should show: ✅ Email service connected successfully!

# Send test email
# Enter your email and click "Send Test Email"
# Check inbox for delivery
```

---

## 3. AWS Credentials Rotation 🔴 CRITICAL

### Current Status
```bash
AWS_ACCESS_KEY_ID="AKIAXCKQDO4ULP6U23UI"  # EXPOSED
AWS_SECRET_ACCESS_KEY="cUvNGHZzu02...eohS"  # EXPOSED
AWS_S3_BUCKET="legal-practice-files-486036174632-eu-north-1-an"
```
**Status**: ❌ COMPROMISED - Exposed in conversation

### Action Required

**Step 1**: Create Production S3 Bucket
```bash
# Login to AWS Console or use AWS CLI
aws s3api create-bucket \
  --bucket genzura-production-files \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket genzura-production-files \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket genzura-production-files \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket genzura-production-files \
  --public-access-block-configuration \
    BlockPublicAcls=true,\
    IgnorePublicAcls=true,\
    BlockPublicPolicy=true,\
    RestrictPublicBuckets=true
```

**Step 2**: Create Production IAM User

1. **AWS Console** → IAM → Users → Create User
2. **Username**: `genzura-production-app`
3. **Access type**: Programmatic access only
4. **Permissions**: Attach policy (create inline policy below)

**Minimal IAM Policy** (Principle of Least Privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::genzura-production-files"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::genzura-production-files/*"
    }
  ]
}
```

**Step 3**: Generate Access Keys
1. IAM → Users → `genzura-production-app`
2. Security credentials → Create access key
3. Use case: Application running on AWS compute service
4. **SAVE CREDENTIALS SECURELY** - You cannot retrieve secret key again

**Step 4**: Update Production Environment
```bash
AWS_ACCESS_KEY_ID="<new-production-access-key-id>"
AWS_SECRET_ACCESS_KEY="<new-production-secret-key>"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET="genzura-production-files"
```

**Step 5**: Deactivate Old Credentials
1. IAM → Users → Find user with old key `AKIAXCKQDO4ULP6U23UI`
2. Security credentials → Deactivate old access key
3. Monitor for 24 hours, then delete

**Step 6**: Migrate Existing Files (If Needed)
```bash
# Sync from dev to production bucket
aws s3 sync \
  s3://legal-practice-files-486036174632-eu-north-1-an \
  s3://genzura-production-files \
  --region eu-north-1
```

### Verification
```bash
# Test S3 upload in development
npm run dev

# Upload a test file through the app
# Check it appears in production bucket:
aws s3 ls s3://genzura-production-files/uploads/ --recursive
```

---

## 4. Database Credentials Setup 🔴 CRITICAL

### Current Status
```bash
DATABASE_URL="postgresql://postgres:262626@localhost:5432/genzura_db?schema=public"
```
**Status**: ⚠️ Local development only - Need production database

### Action Required

**Step 1**: Set Up Production Database

Choose a managed PostgreSQL provider:
- **AWS RDS** (Recommended for AWS deployments)
- **DigitalOcean Managed Databases**
- **Heroku Postgres**
- **Supabase**

**Example: AWS RDS Setup**
1. RDS Console → Create database
2. Engine: PostgreSQL 15
3. Template: Production
4. DB instance: db.t3.micro (start small, scale up)
5. Storage: 20 GB SSD
6. **Enable automated backups**: 7-day retention
7. **Enable encryption**: Yes
8. **Public access**: No (unless needed)
9. **Create database**: `genzura_production`

**Step 2**: Create Application Database User

```sql
-- Connect as root user
CREATE USER genzura_app WITH PASSWORD '<strong-random-password>';

-- Grant privileges
GRANT CONNECT ON DATABASE genzura_production TO genzura_app;
GRANT ALL PRIVILEGES ON DATABASE genzura_production TO genzura_app;

-- Connect to database
\c genzura_production

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO genzura_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO genzura_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO genzura_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO genzura_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO genzura_app;
```

**Generate Strong Password**:
```bash
openssl rand -base64 24
# Example output: kX9mP3vN8qW2rT5yL1aC4bH6zD0j
```

**Step 3**: Update Production Environment
```bash
# With SSL (REQUIRED for production)
DATABASE_URL="postgresql://genzura_app:kX9mP3vN8qW2rT5yL1aC4bH6zD0j@prod-db-host.rds.amazonaws.com:5432/genzura_production?schema=public&sslmode=require"
```

**Step 4**: Run Migrations
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npm run migrate:deploy

# Verify
npm run migrate:status
```

### Verification
```bash
# Test connection
npm run prisma:studio
# Should connect to production database

# Check tables exist
psql "$DATABASE_URL" -c "\dt"
```

---

## 5. Production URLs Configuration 🟡 HIGH

### Current Status
```bash
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5000  # Missing in current .env
```

### Action Required

**Step 1**: Acquire Production Domain
- Register domain (e.g., `genzura.com`)
- Set up DNS records

**Step 2**: Set Up SSL Certificates
- Use Let's Encrypt (free)
- Or AWS Certificate Manager
- Configure HTTPS

**Step 3**: Update Environment
```bash
FRONTEND_URL=https://genzura.com
API_URL=https://api.genzura.com
```

**Step 4**: Update CORS Configuration

Edit `genzura-api/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://genzura.com'] 
    : ['http://localhost:5173'],
  credentials: true
}));
```

---

## Complete Credential Rotation Checklist

### Before Rotation
- [ ] Backup database: `npm run db:backup`
- [ ] Document current configuration
- [ ] Create `.env.production` file
- [ ] Test in staging environment
- [ ] Schedule maintenance window
- [ ] Notify users of scheduled downtime

### Credential Rotation
- [ ] Generate new JWT_SECRET (64+ chars)
- [ ] Create production Brevo SMTP account
- [ ] Create production S3 bucket
- [ ] Create production IAM user with minimal permissions
- [ ] Set up production PostgreSQL database
- [ ] Generate strong database password
- [ ] Configure production URLs with HTTPS
- [ ] Update all credentials in `.env.production`

### After Rotation
- [ ] Run environment validation: `npm run check:env`
- [ ] Test database connection: `npm run migrate:status`
- [ ] Test email service: Admin → Email Testing
- [ ] Test S3 uploads: Upload avatar/document
- [ ] Test authentication: Login/logout
- [ ] Verify CORS configuration
- [ ] Monitor logs for errors
- [ ] Test all critical user flows

### Decommission Old Credentials
- [ ] Delete old AWS access keys (after 24h monitoring)
- [ ] Revoke old Brevo SMTP credentials
- [ ] Restrict access to development database
- [ ] Update password manager with new credentials

---

## Emergency Rollback Procedure

If something goes wrong after rotation:

### 1. Quick Rollback
```bash
# Stop application
pm2 stop genzura-api

# Restore previous .env
cp .env.backup .env

# Restart with old credentials
pm2 start genzura-api

# Restore database if needed
npm run db:restore
```

### 2. Verify Rollback
- Test user login
- Test email sending
- Test file uploads
- Check database connections

### 3. Debug Issues
```bash
# Check logs
pm2 logs genzura-api

# Test individual services
npm run check:env
npm run migrate:status
```

---

## Security Best Practices Summary

### Credential Storage
- ✅ Store in AWS Secrets Manager (production)
- ✅ Use password manager (team access)
- ❌ Never commit to Git
- ❌ Never share via Slack/email
- ❌ Never store in plaintext documents

### Access Control
- ✅ Principle of least privilege
- ✅ Separate dev/staging/production credentials
- ✅ Enable MFA on AWS accounts
- ✅ Regular access audits
- ✅ Immediate revocation on team changes

### Monitoring
- ✅ CloudWatch logs for AWS
- ✅ Database audit logging
- ✅ Failed authentication alerts
- ✅ Unusual API usage alerts
- ✅ Regular security audits

### Rotation Schedule
- **API Keys**: Every 90 days
- **Database Passwords**: Every 180 days
- **JWT Secrets**: Only on security incidents
- **AWS Access Keys**: Every 90 days
- **SSL Certificates**: Auto-renewal with Let's Encrypt

---

## Credential Storage Template

Use this template in your password manager:

```
Title: Genzura Production - JWT Secret
Category: Application Secrets
Environment: Production
Value: [paste JWT_SECRET here]
Rotation Date: 2026-05-27
Next Rotation: 2026-11-27 (on security incident)
Access: DevOps Team
---

Title: Genzura Production - Database
Category: Database
Environment: Production
Host: prod-db-host.rds.amazonaws.com
Port: 5432
Database: genzura_production
Username: genzura_app
Password: [paste password here]
Rotation Date: 2026-05-27
Next Rotation: 2026-11-27
SSL: Required
Access: Backend Team
---

Title: Genzura Production - Brevo SMTP
Category: Email Service
Environment: Production
SMTP Host: smtp-relay.brevo.com
SMTP Port: 587
Username: [paste username here]
Password: [paste key here]
Sender Email: noreply@yourdomain.com
Rotation Date: 2026-05-27
Next Rotation: 2026-08-27
Access: DevOps Team
---

Title: Genzura Production - AWS IAM
Category: Cloud Infrastructure
Environment: Production
Account: [AWS Account ID]
User: genzura-production-app
Access Key ID: [paste here]
Secret Access Key: [paste here]
Permissions: S3 Read/Write (genzura-production-files)
Rotation Date: 2026-05-27
Next Rotation: 2026-08-27
MFA: Enabled
Access: DevOps Team
```

---

## Validation Commands

Run these after credential rotation:

```bash
# 1. Validate environment variables
npm run check:env

# 2. Test database connection
npm run migrate:status

# 3. Test Prisma client
npm run prisma:studio

# 4. Start application
npm run build
npm start

# 5. Test email service
# Navigate to: http://localhost:5000/admin/email-test
# Click: Test SMTP Connection

# 6. Test S3 upload
# Login to app
# Upload profile picture
# Verify upload in S3:
aws s3 ls s3://genzura-production-files/uploads/avatars/

# 7. Test authentication
# Login/logout multiple times
# Verify JWT tokens are issued correctly

# 8. Check application logs
tail -f logs/app.log  # or pm2 logs
```

---

## Status Report Template

After completing rotation, send this report:

```
Subject: Genzura Production Credential Rotation - Complete

Date: [Date]
Environment: Production
Performed by: [Name]

Credentials Rotated:
✅ JWT_SECRET - New 64-character secret generated
✅ Brevo SMTP - New production credentials
✅ AWS Access Keys - New IAM user created
✅ Database Password - Strong password set
✅ Production URLs - HTTPS configured

Old Credentials Status:
✅ JWT_SECRET - Replaced (all users logged out)
✅ Brevo SMTP - Old key revoked
✅ AWS Keys - Deactivated after 24h monitoring
✅ Dev Database - Access restricted

Verification Results:
✅ Environment validation passed
✅ Database connection successful
✅ Email service connected
✅ S3 uploads working
✅ User authentication working
✅ CORS configured correctly

Next Actions:
- Monitor logs for 24 hours
- Schedule next rotation: [Date + 90 days]
- Update documentation
- Brief team on new credential locations

Issues Encountered: None / [List any issues]

Rollback Plan: Available if needed within 24h
```

---

## Quick Reference

### Generate Strong Secrets
```bash
# JWT Secret (64 chars)
openssl rand -base64 48

# Database Password (32 chars)
openssl rand -base64 24

# API Key (64 chars hex)
openssl rand -hex 32
```

### Check Credential Strength
```bash
# JWT Secret length
echo -n "$JWT_SECRET" | wc -c

# Should be >= 32 characters
```

### Test Services
```bash
# Database
psql "$DATABASE_URL" -c "SELECT version();"

# S3
aws s3 ls s3://$AWS_S3_BUCKET/

# Email (requires running app)
curl -X POST http://localhost:5000/api/test/email/connection \
  -H "Authorization: Bearer $TOKEN"
```

---

## Status

**Document Created**: May 27, 2026  
**Current Status**: 🔴 Rotation Required Before Production  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours  
**Recommended Timing**: During low-traffic period  

**Next Steps**:
1. Schedule maintenance window
2. Complete rotation following this guide
3. Test all services
4. Monitor for 24 hours
5. Mark as ✅ Complete in pre-deployment checklist

