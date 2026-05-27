# Pre-Deployment Recommendations & Checklist

## Overview
Comprehensive list of improvements, security hardening, and features to add/change before deploying Genzura to production.

## Priority Levels
- 🔴 **CRITICAL** - Must fix before deployment (security/data loss risks)
- 🟡 **HIGH** - Should fix before deployment (user experience/stability)
- 🟢 **MEDIUM** - Nice to have (can be added post-launch)
- 🔵 **LOW** - Future enhancement (not urgent)

---

## 🔴 CRITICAL - Must Fix Before Deployment

### 1. Email Service Configuration Verification
**Status**: ⚠️ Needs Testing

**Issue**: Email notifications are configured but need production testing

**Action Items**:
- [ ] Verify Brevo SMTP credentials are correct
- [ ] Test all 3 subscription email templates
- [ ] Verify sender email is verified in Brevo
- [ ] Test email delivery in production environment
- [ ] Check spam folder rates
- [ ] Add email delivery retry logic

**Files to Check**:
```typescript
// genzura-api/src/services/emailService.ts
BREVO_SMTP_USER=your-brevo-email@example.com
BREVO_SMTP_KEY=your-brevo-smtp-key
SENDER_EMAIL=kevincracker02@gmail.com  // Must be verified
SENDER_NAME=Genzura Legal
```

**Test Script**:
```bash
# Test email sending
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","type":"subscription_activated"}'
```

---

### 2. Environment Variables Security
**Status**: ⚠️ Needs Review

**Issue**: Sensitive credentials in .env need proper management

**Action Items**:
- [ ] Create `.env.production` with production values
- [ ] Never commit `.env` files to Git
- [ ] Use secret management (AWS Secrets Manager, etc.)
- [ ] Set up different S3 buckets for dev/prod
- [ ] Rotate all API keys before deployment
- [ ] Set strong JWT_SECRET (not "your-secret-key")

**Critical Environment Variables**:
```bash
# Database
DATABASE_URL=postgresql://...  # Production database

# Security
JWT_SECRET=<generate-strong-random-string>  # MUST change!

# Email
BREVO_SMTP_KEY=<production-key>

# S3
AWS_ACCESS_KEY_ID=<production-key>
AWS_SECRET_ACCESS_KEY=<production-secret>
AWS_S3_BUCKET=genzura-production  # Separate bucket

# Frontend
FRONTEND_URL=https://yourdomain.com  # Production URL
API_URL=https://api.yourdomain.com
```

**Generate Strong JWT Secret**:
```bash
# Run this to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 3. Database Backup & Migration Strategy
**Status**: ❌ Not Implemented

**Issue**: No automated backup system in place

**Action Items**:
- [ ] Set up automated database backups (daily minimum)
- [ ] Test restore procedure
- [ ] Create migration rollback plan
- [ ] Document database recovery process
- [ ] Set up database monitoring alerts

**PostgreSQL Backup Script**:
```bash
#!/bin/bash
# Save as: backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="genzura"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/genzura_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "genzura_*.sql" -mtime +30 -delete

# Upload to S3 for redundancy
aws s3 cp $BACKUP_DIR/genzura_$DATE.sql s3://genzura-backups/
```

**Add to Cron**:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-database.sh
```

---

### 4. Error Monitoring & Logging
**Status**: ⚠️ Basic logging only

**Issue**: No centralized error monitoring in production

**Action Items**:
- [ ] Integrate Sentry or similar error tracking
- [ ] Set up log aggregation (CloudWatch, Datadog)
- [ ] Create error alerting rules
- [ ] Log all critical errors with context
- [ ] Set up uptime monitoring

**Recommended**: Install Sentry
```bash
npm install @sentry/node @sentry/react
```

**Backend Integration**:
```typescript
// genzura-api/src/index.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}

// Add before routes
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add before error handler
app.use(Sentry.Handlers.errorHandler());
```

---

### 5. Rate Limiting & DDoS Protection
**Status**: ❌ Not Implemented

**Issue**: API has no rate limiting (vulnerable to abuse)

**Action Items**:
- [ ] Add rate limiting to all routes
- [ ] Stricter limits on auth endpoints
- [ ] IP-based blocking for repeated failures
- [ ] CAPTCHA on login after X failed attempts

**Install Rate Limiter**:
```bash
npm install express-rate-limit
```

**Implementation**:
```typescript
// genzura-api/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
});

// Apply in index.ts
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

### 6. Security Headers & HTTPS
**Status**: ⚠️ Needs Configuration

**Issue**: Missing security headers, HTTPS not enforced

**Action Items**:
- [ ] Install and configure Helmet.js
- [ ] Force HTTPS in production
- [ ] Set secure cookie flags
- [ ] Configure CORS properly for production domain
- [ ] Add Content Security Policy

**Install Helmet**:
```bash
npm install helmet
```

**Implementation**:
```typescript
// genzura-api/src/index.ts
import helmet from 'helmet';

// Add security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Update CORS for production
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

### 7. Password & Auth Security Hardening
**Status**: ⚠️ Basic security only

**Issue**: Auth security can be strengthened

**Action Items**:
- [ ] Enforce strong password requirements
- [ ] Add password strength indicator
- [ ] Implement account lockout after failed attempts
- [ ] Add 2FA/MFA option for admins
- [ ] Implement password expiry policy (optional)
- [ ] Add login notification emails

**Password Validation**:
```typescript
// genzura-api/src/utils/validation.ts
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain a special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 🟡 HIGH Priority - Should Fix Before Deployment

### 8. User Onboarding Flow
**Status**: ❌ Missing

**Issue**: No guided onboarding for new users

**Action Items**:
- [ ] Create welcome tour for first-time users
- [ ] Add onboarding checklist
- [ ] Create getting started guide
- [ ] Add sample data option
- [ ] Create video tutorials

**Onboarding Checklist Component**:
```typescript
// Show after first login
const onboardingSteps = [
  { id: 1, title: 'Complete your profile', done: false },
  { id: 2, title: 'Create your first case', done: false },
  { id: 3, title: 'Upload a document', done: false },
  { id: 4, title: 'Add a client', done: false },
  { id: 5, title: 'Schedule a calendar event', done: false },
];
```

---

### 9. Data Validation & Sanitization
**Status**: ⚠️ Partial

**Issue**: Input validation needs strengthening

**Action Items**:
- [ ] Add Zod or Joi for schema validation
- [ ] Validate all API inputs
- [ ] Sanitize user inputs (prevent XSS)
- [ ] Add file upload validation (type, size)
- [ ] Validate email formats strictly

**Install Zod**:
```bash
npm install zod
```

**Example Validation**:
```typescript
// genzura-api/src/validation/user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['Admin', 'Senior_Attorney', 'Attorney', 'Paralegal', 'Support']),
  phone: z.string().optional(),
  location: z.string().optional(),
});

// Usage in controller
const validatedData = createUserSchema.parse(req.body);
```

---

### 10. Error Pages & User Feedback
**Status**: ⚠️ Generic errors only

**Issue**: No custom error pages, poor error messages

**Action Items**:
- [ ] Create custom 404 page
- [ ] Create custom 500 page
- [ ] Create custom 403 (unauthorized) page
- [ ] Improve error messages for users
- [ ] Add helpful suggestions in errors

**404 Page Component**:
```typescript
// genzura-web/src/pages/NotFound.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-blue">404</h1>
        <p className="text-xl text-brand-dark mt-4">Page Not Found</p>
        <p className="text-text-muted mt-2">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

---

### 11. Loading States & Skeleton Screens
**Status**: ✅ Partially Implemented

**Issue**: Some pages lack proper loading states

**Action Items**:
- [ ] Add skeleton screens to all data-heavy pages
- [ ] Add loading spinners to all buttons
- [ ] Add optimistic UI updates
- [ ] Show progress for long operations
- [ ] Add retry mechanisms for failed loads

---

### 12. Subscription Email Reminder Cron Job
**Status**: ⚠️ Mentioned but not implemented

**Issue**: Automated email reminders not set up

**Action Items**:
- [ ] Create cron job for subscription reminders
- [ ] Send emails at 14, 7, 3, 1 day marks
- [ ] Track which reminders were sent
- [ ] Handle subscription expiry auto-downgrade

**Implementation**:
```typescript
// genzura-api/src/jobs/subscriptionReminderJob.ts
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/emailService.js';

const prisma = new PrismaClient();

export async function sendSubscriptionReminders() {
  const now = new Date();
  const reminderDays = [14, 7, 3, 1];
  
  for (const days of reminderDays) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    // Find subscriptions expiring in X days
    const expiringUsers = await prisma.user.findMany({
      where: {
        subscriptionEndDate: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        },
        subscriptionPlan: {
          not: 'Genzura'
        }
      }
    });
    
    // Send reminder emails
    for (const user of expiringUsers) {
      await EmailService.sendSubscriptionExpiryReminder(
        user.email,
        user.name,
        user.subscriptionPlan,
        days
      );
    }
  }
}

// Schedule in cron
import { CronScheduler } from '../utils/cronScheduler.js';
CronScheduler.addJob('subscription-reminders', '0 9 * * *', sendSubscriptionReminders);
```

---

### 13. Data Export Functionality
**Status**: ❌ Missing

**Issue**: Users can't export their data

**Action Items**:
- [ ] Add export to CSV for cases
- [ ] Add export to PDF for reports
- [ ] Add export for audit logs
- [ ] Add bulk data export for account
- [ ] Implement GDPR-compliant data export

**Export Button Example**:
```typescript
const exportCasesToCSV = async () => {
  const cases = await caseService.getAll();
  const csv = cases.map(c => 
    `${c.caseNumber},${c.title},${c.status},${c.deadline}`
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cases.csv';
  a.click();
};
```

---

## 🟢 MEDIUM Priority - Nice to Have

### 14. Advanced Search & Filtering
**Status**: ⚠️ Basic search only

**Improvements**:
- [ ] Add full-text search across cases
- [ ] Add advanced filter combinations
- [ ] Add saved search/filters
- [ ] Add search history
- [ ] Implement fuzzy matching

---

### 15. Bulk Operations
**Status**: ❌ Missing

**Improvements**:
- [ ] Bulk user status updates
- [ ] Bulk case status changes
- [ ] Bulk document uploads
- [ ] Bulk email sending
- [ ] Bulk delete with confirmation

---

### 16. Activity Timeline & History
**Status**: ⚠️ Partial (audit logs only)

**Improvements**:
- [ ] User activity timeline
- [ ] Case activity timeline
- [ ] Document version history
- [ ] Change tracking for cases
- [ ] Restore previous versions

---

### 17. Mobile Responsiveness Review
**Status**: ⚠️ Needs thorough testing

**Action Items**:
- [ ] Test all pages on mobile
- [ ] Fix responsive issues
- [ ] Optimize touch targets
- [ ] Test on iOS and Android
- [ ] Add mobile-specific features

---

### 18. Performance Optimization
**Status**: ⚠️ Not optimized

**Action Items**:
- [ ] Implement React Query for caching
- [ ] Add lazy loading for routes
- [ ] Optimize images (use WebP)
- [ ] Implement virtual scrolling
- [ ] Add service worker for offline
- [ ] Compress API responses
- [ ] Add database indexes

**Database Indexes to Add**:
```sql
-- Speed up user queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_status ON "User"(status);
CREATE INDEX idx_user_subscription ON "User"("subscriptionPlan");

-- Speed up case queries
CREATE INDEX idx_case_status ON "Case"(status);
CREATE INDEX idx_case_attorney ON "Case"("attorneyId");
CREATE INDEX idx_case_deadline ON "Case"(deadline);

-- Speed up audit log queries (already added in schema)
-- Already exists in schema.prisma

-- Speed up document queries
CREATE INDEX idx_document_case ON "CaseDocument"("caseId");
CREATE INDEX idx_document_uploaded ON "CaseDocument"("uploadedAt");
```

---

### 19. Notification Preferences
**Status**: ✅ Model exists, UI needed

**Action Items**:
- [ ] Build notification settings UI
- [ ] Allow users to opt-in/out
- [ ] Email frequency preferences
- [ ] Push notification support
- [ ] SMS notification toggle

---

### 20. Analytics Dashboard Improvements
**Status**: ⚠️ Basic only

**Improvements**:
- [ ] Add more chart types
- [ ] Add date range selectors
- [ ] Add export charts as images
- [ ] Add comparison views
- [ ] Add predictive analytics

---

## 🔵 LOW Priority - Future Enhancements

### 21. Multi-language Support (i18n)
- [ ] Add translation system
- [ ] Support English, French, Kinyarwanda
- [ ] Translate all UI strings
- [ ] Localize dates and numbers

### 22. Dark Mode
- [ ] Add dark mode toggle
- [ ] Create dark theme colors
- [ ] Persist user preference

### 23. Advanced Calendar Features
- [ ] Calendar sync with Google/Outlook
- [ ] Recurring events
- [ ] Event reminders
- [ ] Meeting scheduler

### 24. Document Collaboration
- [ ] Real-time document editing
- [ ] Comments on documents
- [ ] Version comparison
- [ ] Document approval workflow

### 25. API for Third-party Integrations
- [ ] Create REST API documentation
- [ ] Add API key management
- [ ] Add webhook support
- [ ] Create API rate limits per key

---

## Testing Checklist Before Deployment

### Functional Testing
- [ ] All admin screens load correctly
- [ ] User can register and login
- [ ] User can create case
- [ ] User can upload document
- [ ] User can invite team member
- [ ] Admin can grant subscription
- [ ] Email notifications send
- [ ] Audit logs record actions
- [ ] Search functionality works
- [ ] Filters work correctly

### Security Testing
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection works
- [ ] Authentication required on protected routes
- [ ] Authorization checked for admin routes
- [ ] Rate limiting prevents abuse
- [ ] File uploads validated

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Large file uploads work
- [ ] Many users can login simultaneously

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Deployment Checklist

### Pre-Deployment
- [ ] All critical issues fixed
- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Database migrations ready
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Error tracking active
- [ ] SSL certificate installed

### Deployment Steps
1. [ ] Run database migrations
2. [ ] Seed default plans
3. [ ] Build frontend: `npm run build`
4. [ ] Build backend: `npm run build`
5. [ ] Deploy to server
6. [ ] Run smoke tests
7. [ ] Monitor error logs
8. [ ] Test critical user flows

### Post-Deployment
- [ ] Monitor server metrics
- [ ] Check error rates
- [ ] Verify emails sending
- [ ] Test user registration
- [ ] Test admin functions
- [ ] Check database performance
- [ ] Verify S3 uploads working

---

## Recommended Tech Stack Additions

### For Production
1. **PM2** - Process manager for Node.js
2. **Nginx** - Reverse proxy and load balancer
3. **Redis** - Session storage and caching
4. **Sentry** - Error monitoring
5. **CloudWatch** - Log aggregation
6. **Datadog** - Application monitoring

### Installation Commands
```bash
# PM2 for process management
npm install -g pm2

# Redis for caching
# Install via package manager or Docker

# Sentry for error tracking
npm install @sentry/node @sentry/react
```

---

## Cost Estimates (Rwanda Pricing)

### Monthly Operational Costs
- **Hosting**: 50,000 - 200,000 RWF (depending on provider)
- **Database**: 30,000 - 100,000 RWF (PostgreSQL hosting)
- **Email (Brevo)**: Free tier (300 emails/day) or 25,000 RWF/month
- **S3 Storage**: ~10,000 RWF for first 50GB
- **Domain**: ~10,000 RWF/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Monitoring**: Free tier or 30,000 RWF/month

**Total Estimate**: 100,000 - 370,000 RWF/month

---

## Timeline Recommendations

### Week 1: Critical Issues
- Fix all 🔴 CRITICAL items
- Set up production environment
- Configure security

### Week 2: High Priority
- Implement 🟡 HIGH priority items
- Complete testing
- Set up monitoring

### Week 3: Testing & Polish
- Thorough QA testing
- Fix bugs
- Performance optimization

### Week 4: Deployment
- Deploy to production
- Monitor closely
- Fix any issues

---

## Final Recommendations Summary

### Must Do (Before Launch):
1. ✅ Fix email configuration
2. ✅ Secure environment variables
3. ✅ Set up database backups
4. ✅ Add error monitoring (Sentry)
5. ✅ Implement rate limiting
6. ✅ Add security headers
7. ✅ Strengthen auth security

### Should Do (Important):
8. ✅ Create user onboarding
9. ✅ Improve data validation
10. ✅ Add error pages
11. ✅ Implement email reminders
12. ✅ Add data export

### Nice to Have (Can wait):
13. Advanced search
14. Bulk operations
15. Activity timeline
16. Mobile optimization
17. Performance tuning

**Overall Assessment**: 
The application is **80% ready** for deployment. After addressing the 7 critical items and 5 high-priority items, it will be **production-ready** with a solid foundation for growth.

---

**Last Updated**: May 27, 2026
**Status**: 📋 Ready for Implementation
**Priority**: Start with Critical items immediately
