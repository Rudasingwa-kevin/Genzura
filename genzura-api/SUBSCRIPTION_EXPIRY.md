# Subscription Expiry Automation

## Overview

Automated system for managing subscription lifecycles, sending expiry warnings, and handling downgrades with zero data loss.

## Architecture

### Daily Cron Job
- **Schedule**: Daily at 2:00 AM (Africa/Kigali timezone)
- **Purpose**: Check all paid subscriptions, send warnings, and handle expiries
- **Auto-starts**: Initializes automatically when server boots

### Soft Limit Strategy (No Data Deletion)

When a user's subscription expires:
1. ✅ **All existing data is preserved** (cases, documents, etc.)
2. ✅ **Full access** to all existing content
3. ❌ **Cannot create new** cases/docs if over free tier limits (20 each)
4. 💡 **User can delete excess** or upgrade to regain creation access

**Example**: User with 150 cases gets downgraded
- Keeps all 150 cases (viewable/editable)
- Cannot create new cases until they delete 130 OR upgrade
- Better UX than deleting their work!

## Timeline & Notifications

### Before Expiry
| Days Until Expiry | Action | Email Subject |
|-------------------|--------|---------------|
| 7 days | Warning email | "📅 Your Intango subscription expires in 7 days" |
| 3 days | Warning email | "⚠️ Your Intango subscription expires in 3 days" |
| 1 day | Final warning | "🚨 Your Intango subscription expires in 1 day" |

### Grace Period (0-3 days after expiry)
- Day 0-3: Subscription marked "expired" but features still work
- Daily grace period warnings sent
- User can still renew without losing access

### Auto-Downgrade (Day 4+)
- Account moved to **Genzura (Free)** plan
- Expiry notification email with usage stats
- If over limits: Instructions to delete items or upgrade

## Email Templates

### 1. Expiry Warning
```
Subject: [Emoji] Your [Plan] subscription expires in [N] days

Content:
- Countdown to expiry
- What happens after expiry (list)
- [Renew Now] button
- [View Plans] button
```

### 2. Grace Period Warning
```
Subject: ⚠️ Grace Period: [N] days until downgrade

Content:
- Subscription expired, grace period active
- Days remaining in grace period
- Impact of not renewing
- [Renew Now to Keep Your Plan]
```

### 3. Subscription Expired
```
Subject: 📋 Your subscription has expired - Now on Free Plan

Content:
- Account status (cases count, docs count)
- Overage warnings (if applicable)
- Instructions (delete items OR upgrade)
- [Upgrade Now] [Manage Cases] buttons
```

## API Endpoints

### Manual Trigger (Admin Only)
```bash
POST /api/admin/jobs/run-expiry-check
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "result": {
    "expired": 2,
    "warnings": {
      "7days": 5,
      "3days": 3,
      "1day": 1
    },
    "errors": []
  }
}
```

### Job Status
```bash
GET /api/admin/jobs/status
Authorization: Bearer <admin-token>

Response:
{
  "jobs": [{
    "name": "Subscription Expiry Check",
    "schedule": "Daily at 2:00 AM (Africa/Kigali)",
    "status": "running"
  }],
  "timezone": "Africa/Kigali"
}
```

## Files Created

```
genzura-api/
├── src/
│   ├── jobs/
│   │   └── subscriptionExpiryJob.ts       # Main cron job logic
│   ├── utils/
│   │   └── cronScheduler.ts               # Cron initialization
│   ├── controllers/
│   │   └── adminJobsController.ts         # Admin endpoints
│   ├── routes/
│   │   └── adminJobsRoutes.ts             # Route definitions
│   ├── services/
│   │   └── emailService.ts                # Email templates (updated)
│   └── index.ts                           # Server initialization (updated)
```

## Testing

### 1. Manual Trigger (Recommended for Testing)
```bash
# As admin user
curl -X POST http://localhost:5000/api/admin/jobs/run-expiry-check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Check Job Status
```bash
curl http://localhost:5000/api/admin/jobs/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Test Scenario Setup
```sql
-- Create test user with expiring subscription (expires tomorrow)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Intango',
  "subscriptionEndDate" = NOW() + INTERVAL '1 day'
WHERE email = 'test@example.com';

-- Then trigger manual job to see warning email
```

### 4. Test Different Expiry States
```sql
-- Expired 5 days ago (should downgrade)
UPDATE "User" SET "subscriptionEndDate" = NOW() - INTERVAL '5 days' WHERE email = 'test1@example.com';

-- Expires in 7 days (should send 7-day warning)
UPDATE "User" SET "subscriptionEndDate" = NOW() + INTERVAL '7 days' WHERE email = 'test2@example.com';

-- In grace period (expired 2 days ago)
UPDATE "User" SET "subscriptionEndDate" = NOW() - INTERVAL '2 days' WHERE email = 'test3@example.com';
```

## Edge Cases Handled

### 1. User Over Free Tier Limits
**Scenario**: User with 50 cases downgraded to free tier (limit: 20)

**Behavior**:
- Keeps all 50 cases (no deletion)
- Can view/edit all cases
- Cannot create new case (blocked by `SubscriptionService.canCreateCase`)
- Email shows: "You have 50 cases (30 over limit)"

### 2. Email Failures
- Logged but don't block downgrade process
- Downgrade happens regardless of email success
- User still downgraded even if notification fails

### 3. Database Transaction Safety
- Each user processed independently
- One user's failure doesn't affect others
- Errors logged and returned in job result

### 4. Timezone Consistency
- All operations use Africa/Kigali timezone
- Consistent with Rwandan business hours
- Runs at 2 AM to avoid peak usage

## Monitoring & Logs

### Console Output
```bash
⏰ Initializing cron scheduler...
✅ Cron scheduler initialized
   📅 Subscription expiry check: Daily at 2:00 AM (Africa/Kigali)
▶️ All cron tasks started

# Daily at 2 AM:
🕐 [CRON] Running scheduled subscription expiry check...
🔄 Running subscription expiry check...
📊 Found 15 paid subscriptions to check
✅ Downgraded user@example.com from Intango to Genzura (45 cases, 30 docs)
📧 Sent 7-day warning to user2@example.com
✅ Subscription expiry check completed
   - Expired & downgraded: 2
   - 7-day warnings sent: 5
   - 3-day warnings sent: 3
   - 1-day warnings sent: 1
```

### Error Handling
```bash
❌ Failed to process user@example.com: Connection timeout
# Job continues processing other users
```

## Configuration

### Environment Variables
```env
# Required for email notifications
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=your-smtp-key
SENDER_EMAIL=kevincracker02@gmail.com
SENDER_NAME=Genzura Legal

# Frontend URLs for email links
FRONTEND_URL=https://genzura.rw
```

### Cron Schedule
Located in: `src/utils/cronScheduler.ts`

```typescript
// Daily at 2:00 AM Africa/Kigali
const expiryJob = cron.schedule('0 2 * * *', async () => {
  await SubscriptionExpiryJob.run();
}, {
  timezone: 'Africa/Kigali'
});
```

To change schedule:
- `0 2 * * *` = 2:00 AM daily
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Weekly on Sunday

## Future Enhancements

### Potential Additions
1. **Payment Integration**: Connect to MTN/Airtel Mobile Money for renewals
2. **Renewal Reminders**: Send reminder emails with payment links
3. **Analytics Dashboard**: Track expiry rates, renewal rates, churn
4. **Webhook Notifications**: Send to external systems (Slack, Discord)
5. **Custom Grace Periods**: Different grace periods per plan
6. **Auto-Archive**: Archive excess cases instead of blocking creation

## Security

- ✅ Admin-only manual trigger endpoint
- ✅ Authentication required for all endpoints
- ✅ Role-based access control (Admin only)
- ✅ No destructive operations (data preserved)
- ✅ Audit logging ready (TODO: when AuditLog model available)

## Support

For issues or questions:
- Check console logs for errors
- Test with manual trigger endpoint
- Review email service logs
- Verify cron is initialized on server start

---

**Status**: ✅ Implemented and Ready
**Last Updated**: 2026-05-19
