# Quick Setup Guide: Subscription System

## Step 1: Database Migration

Run these commands in the `genzura-api` directory:

```bash
cd genzura-api

# Create and run the migration
npx prisma migrate dev --name add_subscription_fields

# Regenerate Prisma client with new types
npx prisma generate
```

This will:
- Add `SubscriptionPlan` enum (Genzura, Intango, Inkingi)
- Add subscription fields to User model:
  - `subscriptionPlan` (default: Genzura)
  - `subscriptionStartDate`
  - `subscriptionEndDate`

## Step 2: Restart the API Server

```bash
# In genzura-api directory
npm run dev
```

The subscription routes will now be available at:
- `http://localhost:5000/api/subscriptions/*`

## Step 3: Test the Frontend

```bash
# In genzura-web directory
npm run dev
```

Visit these pages to test:
- **Public Pricing**: `http://localhost:5173/pricing`
- **Settings**: `http://localhost:5173/settings/subscription` (requires login)

## Step 4: Verify the Implementation

### Check API Endpoints:

1. Login first and get your auth token
2. Test subscription endpoints:

```bash
# Get your subscription limits
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscriptions/limits

# Check if you can create a case
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscriptions/check/case
```

### Check Frontend Pages:

1. **Landing Page** → Click "Pricing" in nav bar
   - Should show 3 pricing tiers
   - Compare features table
   - FAQ section

2. **Login** → Go to Settings → "Subscription & Billing"
   - View current plan
   - Upgrade options

3. **Create Case** (when at limit):
   - Try creating 21st case as free user
   - Should show upgrade modal

## What's Been Created

### Backend Files:
```
genzura-api/
├── prisma/
│   └── schema.prisma (updated with subscription fields)
├── src/
│   ├── controllers/
│   │   └── subscriptionController.ts (NEW)
│   ├── services/
│   │   └── subscriptionService.ts (NEW)
│   ├── routes/
│   │   └── subscriptionRoutes.ts (NEW)
│   └── index.ts (updated with subscription routes)
```

### Frontend Files:
```
genzura-web/
├── src/
│   ├── api/
│   │   └── services/
│   │       └── subscription.service.ts (NEW)
│   ├── components/
│   │   └── UpgradeModal.tsx (NEW)
│   ├── hooks/
│   │   └── useSubscription.ts (NEW)
│   ├── pages/
│   │   ├── PricingPage.tsx (NEW)
│   │   └── SubscriptionSettingsPage.tsx (NEW)
│   └── App.tsx (updated with new routes)
```

### Documentation:
```
├── SUBSCRIPTION_GUIDE.md (Complete technical documentation)
└── SETUP_SUBSCRIPTION.md (This file - quick setup)
```

## Features Implemented

✅ **3 Subscription Tiers:**
- Genzura (Free): 20 cases, 20 documents, no downloads
- Intango (100k RWF/3mo): Unlimited cases/docs, full access
- Inkingi (200k RWF/year): Everything + API access + custom branding

✅ **Limit Enforcement:**
- Case creation blocked at 20 for free users
- Document upload blocked at 20 for free users
- Document download blocked for free users

✅ **3 Context Pricing Page:**
- Public marketing page (`/pricing`)
- Settings page (`/settings/subscription`)
- Upgrade modal (appears when limit reached)

✅ **API Endpoints:**
- Check limits and usage
- Verify permissions before actions
- Upgrade subscription

✅ **React Hook:**
- `useSubscription()` for easy frontend integration

## Next Steps (Optional Enhancements)

1. **Payment Integration:**
   - Integrate MTN Mobile Money
   - Add Airtel Money support
   - Implement payment webhooks

2. **Subscription Management:**
   - Auto-downgrade on expiration
   - Email reminders before expiry
   - Subscription cancellation flow

3. **Enhanced UX:**
   - Add "upgrade" button in case/document lists when near limit
   - Show progress bars (e.g., "15/20 cases used")
   - Add subscription badge in user profile

4. **Analytics:**
   - Track upgrade conversion rates
   - Monitor plan usage patterns
   - Revenue dashboard

## Testing Checklist

Before going live:
- [ ] All 3 pricing tiers display correctly
- [ ] Free users hit case limit at 20
- [ ] Free users hit document limit at 20
- [ ] Free users cannot download documents
- [ ] Upgrade modal appears when limit reached
- [ ] Settings page shows current plan
- [ ] API endpoints return correct limits
- [ ] Subscription dates are stored correctly
- [ ] Mobile responsive design works
- [ ] Payment integration tested (when implemented)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check API logs for backend errors
3. Verify database migration completed successfully
4. Ensure environment variables are set correctly

## Quick Commands Reference

```bash
# Restart backend
cd genzura-api && npm run dev

# Restart frontend
cd genzura-web && npm run dev

# Reset database (caution: deletes data)
cd genzura-api && npx prisma migrate reset

# View database in Prisma Studio
cd genzura-api && npx prisma studio
```

---

**Ready to launch! 🚀**

All pricing pages and subscription logic are now in place. The only missing piece is payment gateway integration, which can be added later when you're ready to process real transactions.
