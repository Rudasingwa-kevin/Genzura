# Genzura Subscription System

## Overview

Genzura offers three subscription tiers to meet different user needs:

1. **Genzura (Free)** - Perfect for getting started
2. **Intango (100,000 RWF / 3 months)** - For growing practices
3. **Inkingi (200,000 RWF / 12 months)** - Best value for established firms

## Plan Names

The plan names are in Kinyarwanda:
- **Genzura** - Foundation/Base (Free tier)
- **Intango** - Pillar/Support (Mid-tier)
- **Inkingi** - Excellence/Column (Premium tier)

## Plan Features Comparison

### Genzura (Free Plan)
- ✅ **20 active cases** maximum
- ✅ **20 document uploads** maximum
- ❌ **No document downloads** (viewing only)
- ✅ 1 user account
- ✅ 500 MB storage
- ✅ Basic calendar integration
- ✅ Email notifications only
- ❌ No analytics or reporting
- ❌ No priority support
- ❌ No API access

**Limitations:**
- When the 20 case limit is reached, users must upgrade to create more cases
- When the 20 document limit is reached, users must upgrade to upload more documents
- Documents can be viewed but not downloaded

### Intango (100,000 RWF / 3 months)
- ✅ **Unlimited cases**
- ✅ **Unlimited document uploads**
- ✅ **Full document download** capabilities
- ✅ Up to 5 team members
- ✅ 50 GB storage
- ✅ Advanced calendar integration
- ✅ Email + SMS notifications
- ✅ Analytics and insights
- ✅ Priority email support
- ✅ Export to PDF reports
- ❌ No API access

**Cost per day:** ~1,111 RWF/day

### Inkingi (200,000 RWF / 12 months)
- ✅ **Unlimited cases**
- ✅ **Unlimited document uploads**
- ✅ **Full document download** capabilities
- ✅ **Unlimited team members**
- ✅ 500 GB storage
- ✅ Premium calendar integration
- ✅ Email + SMS + In-App notifications
- ✅ Advanced analytics and insights
- ✅ Priority support with dedicated account manager
- ✅ Export to PDF reports
- ✅ **API access** for integrations
- ✅ **Custom branding** options

**Cost per day:** ~548 RWF/day (50% savings vs. Intango)

## Technical Implementation

### Database Schema

The subscription system extends the User model with:

```prisma
enum SubscriptionPlan {
  Genzura   // Free tier
  Intango   // 100,000 RWF / 3 months
  Inkingi   // 200,000 RWF / 12 months
}

model User {
  // ... other fields
  subscriptionPlan      SubscriptionPlan @default(Genzura)
  subscriptionStartDate DateTime?
  subscriptionEndDate   DateTime?
}
```

### API Endpoints

All endpoints require authentication:

#### GET `/api/subscriptions/limits`
Returns current user's subscription limits and usage:
```json
{
  "plan": "Genzura",
  "subscriptionStartDate": null,
  "subscriptionEndDate": null,
  "cases": {
    "current": 15,
    "limit": 20,
    "canCreate": true
  },
  "documents": {
    "current": 18,
    "limit": 20,
    "canUpload": true,
    "canDownload": false
  }
}
```

#### POST `/api/subscriptions/check/case`
Check if user can create a new case:
```json
{
  "allowed": false,
  "reason": "Free plan limit reached. Upgrade to create unlimited cases.",
  "currentCount": 20,
  "limit": 20
}
```

#### POST `/api/subscriptions/check/document`
Check if user can upload a document:
```json
{
  "allowed": true
}
```

#### POST `/api/subscriptions/check/download`
Check if user can download documents:
```json
{
  "allowed": false,
  "reason": "Document downloads not available on free plan. Upgrade to Intango or Inkingi."
}
```

#### GET `/api/subscriptions/status`
Check if subscription is active:
```json
{
  "active": true
}
```

#### POST `/api/subscriptions/upgrade`
Upgrade subscription (requires payment integration):
```json
// Request
{
  "plan": "Intango"
}

// Response
{
  "success": true,
  "message": "Subscription updated successfully",
  "subscription": {
    "plan": "Intango",
    "startDate": "2026-05-18T10:00:00.000Z",
    "endDate": "2026-08-16T10:00:00.000Z"
  }
}
```

#### GET `/api/subscriptions/features/:plan`
Get features for a specific plan:
```json
{
  "plan": "Intango",
  "features": {
    "cases": "Unlimited",
    "documents": "Unlimited",
    "documentDownload": true,
    "collaborators": 5,
    "storage": "50 GB",
    "analytics": true,
    "prioritySupport": true,
    "apiAccess": false
  }
}
```

### Frontend Integration

#### React Hook: `useSubscription`

```typescript
import { useSubscription } from '../hooks/useSubscription';

function MyComponent() {
  const { limits, checkCaseLimit, upgrade } = useSubscription();

  const handleCreateCase = async () => {
    const result = await checkCaseLimit();
    if (!result.allowed) {
      // Show upgrade modal
      setShowUpgradeModal(true);
      return;
    }
    // Proceed with case creation
  };

  return (
    <div>
      <p>Cases: {limits?.cases.current} / {limits?.cases.limit || '∞'}</p>
      <button onClick={handleCreateCase}>Create Case</button>
    </div>
  );
}
```

#### Pricing Page Component

The pricing page can be used in three contexts:

1. **Public** (`variant="public"`) - Marketing page at `/pricing`
2. **Settings** (`variant="settings"`) - Account management at `/settings/subscription`
3. **Limit Reached** (`variant="limit-reached"`) - Modal when user hits limits

```tsx
import PricingPage from './pages/PricingPage';

// Public page
<Route path="/pricing" element={<PricingPage variant="public" />} />

// Settings page
<Route path="/settings/subscription" element={<PricingPage variant="settings" />} />

// Modal when limit reached
<UpgradeModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
  limitType="cases" 
/>
```

### Service Layer

#### Backend: `SubscriptionService`

Methods:
- `canCreateCase(userId)` - Check case creation permission
- `canUploadDocument(userId)` - Check document upload permission
- `canDownloadDocument(userId)` - Check document download permission
- `getSubscriptionLimits(userId)` - Get all limits and current usage
- `updateSubscription(userId, plan, durationDays)` - Update user's plan
- `isSubscriptionActive(userId)` - Check if subscription is still valid
- `getFeaturesByPlan(plan)` - Get feature list for a plan

#### Frontend: `subscriptionService`

API client methods matching backend endpoints.

## User Flow Examples

### Scenario 1: Free User Hits Case Limit

1. User tries to create 21st case
2. Frontend calls `checkCaseLimit()` before opening modal
3. API returns `{ allowed: false, reason: "...", currentCount: 20, limit: 20 }`
4. Frontend shows `UpgradeModal` with `limitType="cases"`
5. User selects Intango or Inkingi plan
6. User completes payment (to be implemented)
7. Subscription updated via `/api/subscriptions/upgrade`
8. User can now create unlimited cases

### Scenario 2: Free User Tries to Download Document

1. User clicks download button
2. Frontend calls `checkDownloadPermission()`
3. API returns `{ allowed: false, reason: "..." }`
4. Frontend shows tooltip or modal explaining limitation
5. User can upgrade to unlock downloads

### Scenario 3: Paid Subscription Expires

1. Scheduled job checks for expired subscriptions
2. User's `subscriptionEndDate` passes
3. User automatically downgraded to Genzura (free)
4. If user has >20 cases or documents, they can view but not add more
5. Notification sent to user about expiration

## Database Migration

After updating the schema, run:

```bash
cd genzura-api
npx prisma migrate dev --name add_subscription_fields
npx prisma generate
```

## TODO: Payment Integration

The subscription system is ready for payment integration. Recommended gateways:

### Rwanda Payment Options:
1. **MTN Mobile Money** - Most popular in Rwanda
2. **Airtel Money** - Second most popular
3. **Flutterwave** - Supports multiple African payment methods
4. **Paypack** - Rwanda-specific payment gateway

### Integration Steps:
1. Choose payment provider
2. Add payment webhook endpoint
3. Store payment transactions in new `Payment` model
4. Update `subscriptionRoutes.ts` to handle payment confirmation
5. Add payment UI in checkout flow
6. Implement subscription renewal reminders

## Testing

### Manual Testing Checklist:

**Free Plan (Genzura):**
- [ ] Can create up to 20 cases
- [ ] Cannot create 21st case
- [ ] Can upload up to 20 documents
- [ ] Cannot upload 21st document
- [ ] Can view documents but not download
- [ ] Upgrade modal appears when limits reached

**Paid Plans (Intango/Inkingi):**
- [ ] Can create unlimited cases
- [ ] Can upload unlimited documents
- [ ] Can download documents
- [ ] Subscription shows correct expiration date
- [ ] Features match plan tier

### API Testing:

```bash
# Get limits (replace with actual auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscriptions/limits

# Check case creation
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscriptions/check/case

# Upgrade subscription
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"Intango"}' \
  http://localhost:5000/api/subscriptions/upgrade
```

## Support & Documentation

For questions or issues:
- Email: support@genzura.law
- Phone: +250 788 000 000
- Documentation: `/pricing` page with FAQ section

## Future Enhancements

Potential features to add:
- Trial period for paid plans (e.g., 7-day free trial)
- Annual vs monthly pricing for Intango
- Enterprise custom pricing
- Referral discounts
- Usage analytics dashboard
- Automatic subscription renewal
- Proration for mid-cycle upgrades/downgrades
- Gift subscriptions
- Non-profit/student discounts
