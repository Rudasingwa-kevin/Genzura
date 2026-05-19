-- Test data for subscription expiry scenarios
-- Run with: psql -d genzura -f test-subscription-data.sql

-- Scenario 1: Expires in 7 days (should send 7-day warning)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Intango',
  "subscriptionStartDate" = NOW() - INTERVAL '83 days',
  "subscriptionEndDate" = NOW() + INTERVAL '7 days'
WHERE email = 'test7days@example.com';

-- Scenario 2: Expires in 3 days (should send 3-day warning)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Intango',
  "subscriptionStartDate" = NOW() - INTERVAL '87 days',
  "subscriptionEndDate" = NOW() + INTERVAL '3 days'
WHERE email = 'test3days@example.com';

-- Scenario 3: Expires tomorrow (should send 1-day warning)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Intango',
  "subscriptionStartDate" = NOW() - INTERVAL '89 days',
  "subscriptionEndDate" = NOW() + INTERVAL '1 day'
WHERE email = 'test1day@example.com';

-- Scenario 4: In grace period (expired 2 days ago)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Intango',
  "subscriptionStartDate" = NOW() - INTERVAL '92 days',
  "subscriptionEndDate" = NOW() - INTERVAL '2 days'
WHERE email = 'testgrace@example.com';

-- Scenario 5: Should be downgraded (expired 5 days ago)
UPDATE "User" 
SET 
  "subscriptionPlan" = 'Inkingi',
  "subscriptionStartDate" = NOW() - INTERVAL '370 days',
  "subscriptionEndDate" = NOW() - INTERVAL '5 days'
WHERE email = 'testdowngrade@example.com';

-- Check results
SELECT 
  email,
  "subscriptionPlan",
  "subscriptionEndDate",
  CASE 
    WHEN "subscriptionEndDate" IS NULL THEN 'No expiry (free plan)'
    WHEN "subscriptionEndDate" < NOW() THEN 'EXPIRED ' || EXTRACT(DAY FROM NOW() - "subscriptionEndDate") || ' days ago'
    ELSE 'Expires in ' || EXTRACT(DAY FROM "subscriptionEndDate" - NOW()) || ' days'
  END as status
FROM "User"
WHERE email LIKE 'test%@example.com'
ORDER BY "subscriptionEndDate" NULLS LAST;
