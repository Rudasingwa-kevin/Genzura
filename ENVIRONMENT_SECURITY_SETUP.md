# Environment Variables Security Setup Guide

## Overview
This guide explains how to properly secure environment variables for development and production deployments of Genzura Legal Practice Management System.

**Date**: May 27, 2026  
**Status**: ✅ Implemented

---

## Files Created

### 1. `.env.example` (Development Template)
Template for local development environment variables. Safe to commit to Git.

**Location**: `genzura-api/.env.example`

**Purpose**: 
- Provides structure for team members setting up local environment
- Documents required environment variables
- Shows example format without exposing real credentials

### 2. `.env.production.example` (Production Template)
Template for production environment variables with security notes.

**Location**: `genzura-api/.env.production.example`

**Purpose**:
- Guides production deployment configuration
- Includes security best practices
- Highlights critical security considerations

---

## Current Environment Variable Audit

### ✅ Security Status

| Variable | Current Status | Production Action |
|----------|---------------|-------------------|
| `.env` in `.gitignore` | ✅ Protected | Keep protected |
| `JWT_SECRET` | ⚠️ Weak ("your_super_secret_jwt_key_here") | 🔴 MUST change |
| `DATABASE_URL` | ✅ Local dev only | Change to production DB |
| `BREVO_SMTP_KEY` | ⚠️ Development key exposed | Rotate for production |
| `AWS_ACCESS_KEY_ID` | ⚠️ Development key exposed | Create production IAM user |
| `AWS_SECRET_ACCESS_KEY` | ⚠️ Development key exposed | Create production IAM user |

---

## Security Implementation Steps

### Step 1: Generate Strong JWT Secret

**Current**: `JWT_SECRET="your_super_secret_jwt_key_here"` (INSECURE)

**Action**: Generate cryptographically strong secret

```bash
# Generate new JWT secret (64 characters, base64)
openssl rand -base64 48
```

**Example Output**:
```
NlLyhOa+JU4JuyILC8b2jQoHnTZsOwm6tOVILNMVMuyMQ43sxGxtbp0l0pqgPpsZ
```

**Update .env**:
```bash
JWT_SECRET="NlLyhOa+JU4JuyILC8b2jQoHnTZsOwm6tOVILNMVMuyMQ43sxGxtbp0l0pqgPpsZ"
```

⚠️ **IMPORTANT**: Changing JWT_SECRET will invalidate all existing user sessions. Users will need to log in again.

---

### Step 2: Rotate Brevo SMTP Credentials

**Current Credentials**:
- User: `ab930a001@smtp-brevo.com`
- Key: Exposed in conversation history

**Action**:
1. Login to Brevo dashboard: https://app.brevo.com/settings/keys/smtp
2. Create new SMTP credentials for production
3. Verify production sender email domain
4. Update `.env.production` with new credentials
5. Delete or rotate development credentials

---

### Step 3: Create Production AWS Resources

**Current S3 Bucket**: `legal-practice-files-486036174632-eu-north-1-an` (Development)

**Production Setup**:

1. **Create Production S3 Bucket**:
   ```bash
   aws s3api create-bucket \
     --bucket genzura-production-files \
     --region eu-north-1 \
     --create-bucket-configuration LocationConstraint=eu-north-1
   ```

2. **Create Production IAM User**:
   - User: `genzura-production-app`
   - Policy: S3 read/write access to production bucket only
   - Enable MFA for console access

3. **Minimal IAM Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::genzura-production-files",
           "arn:aws:s3:::genzura-production-files/*"
         ]
       }
     ]
   }
   ```

4. **Generate Access Keys** for production IAM user
5. **Update `.env.production`** with production credentials

---

### Step 4: Set Up Production Database

**Current Database**: Local PostgreSQL on `localhost:5432`

**Production Requirements**:

1. **Managed PostgreSQL** (AWS RDS, DigitalOcean, etc.)
2. **SSL Required**: `sslmode=require` in connection string
3. **Strong Password**: Minimum 16 characters, mix of characters
4. **Separate User**: Don't use root/admin accounts
5. **Backup Strategy**: Automated daily backups

**Example Production DATABASE_URL**:
```
postgresql://genzura_app:STRONG_PASSWORD_HERE@prod-db.xxxxx.eu-north-1.rds.amazonaws.com:5432/genzura_production?schema=public&sslmode=require
```

---

### Step 5: Configure Production URLs

**Current URLs**: Localhost development

**Production Configuration**:
```bash
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

**Requirements**:
- Valid SSL certificates (Let's Encrypt or AWS Certificate Manager)
- HTTPS only (no HTTP)
- Proper CORS configuration in Express.js
- DNS properly configured

---

## Environment Variable Management Best Practices

### For Development

1. ✅ Keep `.env` in `.gitignore`
2. ✅ Use `.env.example` as template
3. ✅ Never commit real credentials
4. ✅ Use separate development keys/buckets
5. ✅ Document all required variables

### For Production

1. **Use Secret Management Service**:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Secret Manager

2. **Rotate Credentials Regularly**:
   - API keys: Every 90 days
   - Database passwords: Every 180 days
   - JWT secrets: On security incidents only

3. **Principle of Least Privilege**:
   - IAM users with minimal required permissions
   - Database users with minimal required grants
   - No wildcard permissions in production

4. **Monitoring & Alerts**:
   - Set up CloudWatch alarms for unusual access patterns
   - Monitor failed authentication attempts
   - Track API key usage

5. **Backup Credentials Securely**:
   - Store in password manager (1Password, LastPass)
   - Encrypted backup location
   - Document recovery procedures

---

## Deployment Checklist

Before deploying to production:

### Critical (Must Do)
- [ ] Generate new strong JWT_SECRET (64+ characters)
- [ ] Create production Brevo SMTP credentials
- [ ] Create production S3 bucket and IAM user
- [ ] Set up production PostgreSQL database with SSL
- [ ] Update all URLs to production domains
- [ ] Verify `.env` is in `.gitignore`
- [ ] Set `NODE_ENV=production`

### High Priority
- [ ] Set up AWS Secrets Manager for credential storage
- [ ] Configure automated database backups
- [ ] Enable S3 bucket versioning
- [ ] Set up CloudWatch logging and monitoring
- [ ] Configure proper CORS policies
- [ ] Enable rate limiting on API
- [ ] Set up SSL certificates

### Security
- [ ] Rotate all development API keys
- [ ] Delete or restrict development IAM users
- [ ] Enable MFA on AWS root and admin accounts
- [ ] Set up security headers (Helmet.js)
- [ ] Configure firewall rules
- [ ] Enable database audit logging
- [ ] Set up intrusion detection

---

## Emergency Procedures

### If Credentials Are Compromised

1. **Immediate Actions**:
   - Rotate compromised credentials immediately
   - Revoke old credentials/keys
   - Review access logs for unauthorized access
   - Notify team and users if data was accessed

2. **JWT Secret Compromise**:
   ```bash
   # Generate new secret
   openssl rand -base64 48
   
   # Update .env
   JWT_SECRET="new-secret-here"
   
   # Restart application
   # All users will be logged out
   ```

3. **AWS Access Key Compromise**:
   - Deactivate compromised keys in IAM console
   - Generate new access keys
   - Update application configuration
   - Review CloudTrail logs for unauthorized actions

4. **Database Credentials Compromise**:
   - Change database password immediately
   - Update application configuration
   - Review database audit logs
   - Consider restoring from backup if data was modified

---

## Testing Environment Variables

### Verify Development Setup

```bash
cd genzura-api

# Check all required variables are set
node -e "
const dotenv = require('dotenv');
dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_KEY',
  'SENDER_EMAIL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log('❌ Missing environment variables:', missing);
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
"
```

### Verify Production Setup

Before deploying, test production environment variables in staging:

```bash
# Load production environment
export $(cat .env.production | xargs)

# Test database connection
npm run prisma:migrate:status

# Test S3 access
npm run test:s3

# Test email service
npm run test:email

# Start application in production mode
NODE_ENV=production npm start
```

---

## Documentation & Team Access

### Credential Storage

**Development Team**:
- Share `.env.example` via Git
- Each developer maintains their own `.env`
- Never share credentials via Slack/email
- Use secure password sharing tools if needed

**Production Team**:
- Store credentials in company password manager
- Document who has access to production credentials
- Implement access request/approval process
- Log all credential access events

### Documentation

Keep this information updated:
- Who has access to production credentials
- When credentials were last rotated
- Recovery procedures contact information
- Escalation procedures for security incidents

---

## Summary

### What Was Done

1. ✅ Created `.env.example` - Development template (safe to commit)
2. ✅ Created `.env.production.example` - Production template with security notes
3. ✅ Verified `.env` is properly gitignored
4. ✅ Documented security best practices
5. ✅ Generated example strong JWT secret
6. ✅ Identified weak credentials that need rotation
7. ✅ Documented production setup procedures

### What Needs to Be Done Before Production

1. 🔴 **CRITICAL**: Change JWT_SECRET to strong random value
2. 🔴 **CRITICAL**: Rotate Brevo SMTP credentials
3. 🔴 **CRITICAL**: Create production AWS resources (S3, IAM)
4. 🔴 **CRITICAL**: Set up production PostgreSQL database
5. 🟡 **HIGH**: Implement AWS Secrets Manager
6. 🟡 **HIGH**: Set up monitoring and alerting

---

## Quick Reference

### Generate Strong Secrets

```bash
# JWT Secret (64 chars)
openssl rand -base64 48

# API Key (32 chars)
openssl rand -hex 32

# Password (24 chars)
openssl rand -base64 24
```

### Check Environment

```bash
# List all environment variables
printenv | grep -E "DATABASE|JWT|BREVO|AWS|SENDER"

# Check .env file exists and is gitignored
git check-ignore -v .env
```

### Security Resources

- [OWASP Environment Variable Security](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Brevo Security Best Practices](https://help.brevo.com/hc/en-us/articles/360000268730)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/ssl-tcp.html)

---

**Status**: ✅ **Security Foundation Implemented**

**Next Steps**: Rotate credentials and set up production infrastructure before deployment.

**Last Updated**: May 27, 2026
