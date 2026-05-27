# Audit Logging System

## Overview
The audit logging system automatically captures and logs all admin actions and critical operations in the Genzura application. This provides a comprehensive audit trail for compliance, security, and troubleshooting purposes.

## Architecture

### Components

1. **AuditService** (`src/services/auditService.ts`)
   - Core service for creating and querying audit logs
   - Methods: `log()`, `logUserAction()`, `logSystemAction()`, `logSecurityEvent()`
   - Handles database operations with Prisma

2. **AuditMiddleware** (`src/middleware/auditMiddleware.ts`)
   - Two middleware functions:
     - `auditLogger()`: General-purpose middleware for critical operations
     - `auditAdminAction()`: Specialized middleware for admin routes
   - Automatic action detection based on HTTP method and route path
   - Captures request/response metadata

3. **AuditLog Model** (Prisma schema)
   - Database model storing audit log entries
   - Fields: action, description, user info, IP address, timestamps, status, etc.

## Features

### Automatic Logging
The system automatically logs:

- **Admin Actions**
  - Subscription grants, extensions, revocations
  - User management (create, update, delete, invite)
  - System settings changes
  - Plan configuration updates

- **Critical Operations**
  - Case creation, updates, deletions
  - Document uploads, downloads, deletions
  - Client management
  - Case status changes
  - Data exports

- **Security Events**
  - Login/logout
  - Password resets
  - Unauthorized access attempts

### Logged Information
Each audit log entry captures:

- **Action Type**: Specific AuditAction enum value
- **Description**: Human-readable description of what happened
- **User Info**: User ID, name, and role
- **Request Metadata**: HTTP method, endpoint, IP address, user agent
- **Status**: SUCCESS, FAILED, or PENDING
- **Resource Info**: Type and ID of affected resource (if applicable)
- **Additional Metadata**: Request body size, response time, status codes

## Usage

### 1. Automatic Logging via Middleware

#### For Admin Routes
The `auditAdminAction()` middleware is applied to all admin routes:

```typescript
// In adminRoutes.ts
router.use(authenticate);
router.use(auditAdminAction());
```

This logs **every** action on admin routes, regardless of HTTP method.

#### For Critical Operations
The `auditLogger()` middleware is applied globally:

```typescript
// In index.ts
app.use(auditLogger());
```

This selectively logs critical operations based on route patterns.

### 2. Manual Logging in Controllers

For custom logging needs, use the helper function:

```typescript
import { createAuditLog } from '../middleware/auditMiddleware.js';
import { AuditAction } from '@prisma/client';

// Inside a controller method
await createAuditLog(
  req,
  AuditAction.SUBSCRIPTION_ACTIVATED,
  'Custom description of the action',
  { additionalData: 'value' }
);
```

Or use AuditService directly:

```typescript
import { AuditService } from '../services/auditService.js';

await AuditService.logUserAction(
  AuditAction.SUBSCRIPTION_CHANGED,
  'Extended subscription by 30 days',
  user.id,
  user.name,
  user.role,
  req
);
```

## Configuration

### Action Mapping
The middleware automatically maps routes to audit actions in `mapRouteToAuditAction()`:

```typescript
if (normalizedPath.includes('/admin/subscriptions/grant')) {
  return AuditAction.SUBSCRIPTION_ACTIVATED;
}
```

To add new action mappings:
1. Add the route pattern check
2. Return the appropriate `AuditAction` enum value

### Description Generation
Custom descriptions are generated in `generateDescription()`:

```typescript
if (action === AuditAction.SUBSCRIPTION_ACTIVATED) {
  const { plan, durationDays } = req.body;
  return `${userName} granted ${plan} subscription for ${durationDays} days`;
}
```

## Querying Audit Logs

### Via API
```
GET /api/admin/audit?action=USER_CREATED&startDate=2026-01-01&limit=50
GET /api/admin/audit/stats?startDate=2026-01-01&endDate=2026-05-01
```

### Via Service
```typescript
const result = await AuditService.getAll({
  action: AuditAction.SUBSCRIPTION_ACTIVATED,
  userId: 'user-id',
  startDate: new Date('2026-01-01'),
  limit: 50,
  offset: 0
});

const stats = await AuditService.getStats(startDate, endDate);
```

## Available Audit Actions

```typescript
enum AuditAction {
  USER_CREATED
  USER_UPDATED
  USER_DELETED
  USER_INVITED
  USER_LOGIN
  USER_LOGOUT
  USER_PASSWORD_RESET
  CASE_CREATED
  CASE_UPDATED
  CASE_DELETED
  CASE_STATUS_CHANGED
  DOCUMENT_UPLOADED
  DOCUMENT_DOWNLOADED
  DOCUMENT_DELETED
  CLIENT_CREATED
  CLIENT_UPDATED
  CLIENT_DELETED
  SETTINGS_UPDATED
  PLAN_UPDATED
  SUBSCRIPTION_ACTIVATED
  SUBSCRIPTION_PAUSED
  SUBSCRIPTION_CHANGED
  SYSTEM_BACKUP
  SECURITY_ALERT
  UNAUTHORIZED_ACCESS
  EXPORT_DATA
  BULK_OPERATION
}
```

## Best Practices

1. **Don't Block Operations**: Audit logging is non-blocking. Failures are logged but don't prevent the operation from completing.

2. **Sensitive Data**: Avoid logging sensitive data (passwords, tokens, etc.) in descriptions or metadata.

3. **Performance**: The middleware is optimized to log after response is sent (`res.on('finish')`), so it doesn't add latency to requests.

4. **Read-Only Operations**: GET requests on non-admin routes are not logged by default to reduce noise.

5. **Retention**: Implement a cleanup policy using `AuditService.deleteOlderThan(days)` to manage database size.

## Monitoring & Alerts

### Critical Actions to Monitor
- `UNAUTHORIZED_ACCESS`: Failed authentication attempts
- `USER_DELETED`: User account deletions
- `SUBSCRIPTION_PAUSED`: Subscription cancellations
- `SECURITY_ALERT`: Security-related events

### Dashboard Integration
The admin dashboard displays:
- Recent audit activity
- Action breakdown by type
- Success/failure rates
- Critical events requiring attention

## Troubleshooting

### Logs Not Appearing
1. Check that middleware is properly registered in route files
2. Verify database connection is working
3. Check console for `[AuditMiddleware]` error messages

### Missing Action Mappings
1. Review `mapRouteToAuditAction()` in `auditMiddleware.ts`
2. Add custom mapping for the route pattern
3. Or use manual logging in the controller

### Performance Issues
1. Ensure audit log table has proper indexes (defined in schema)
2. Implement log retention policy
3. Consider archiving old logs to separate storage

## Example Audit Log Entry

```json
{
  "id": "cm1a2b3c4d5e6f7g8h9i0",
  "action": "SUBSCRIPTION_ACTIVATED",
  "description": "Admin User granted Intango subscription to John Doe for 90 days",
  "userId": "user_123",
  "userName": "Admin User",
  "userRole": "Admin",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "method": "POST",
  "endpoint": "/api/admin/subscriptions/grant",
  "status": "SUCCESS",
  "resourceType": "Subscription",
  "resourceId": "user_456",
  "metadata": {
    "statusCode": 200,
    "duration": 123,
    "bodySize": 256
  },
  "timestamp": "2026-05-27T10:30:00.000Z"
}
```

## Security Considerations

1. **Access Control**: Only admins should access audit logs via API
2. **Immutability**: Audit logs should never be modified after creation
3. **Integrity**: Consider implementing log signing for critical compliance needs
4. **Backup**: Regular backups of audit log data are essential
5. **Privacy**: Be mindful of GDPR/data privacy regulations when logging user actions

## Future Enhancements

- [ ] Real-time audit log streaming via WebSocket
- [ ] Export audit logs to external SIEM systems
- [ ] Configurable alert rules for specific action patterns
- [ ] Audit log integrity verification (cryptographic signatures)
- [ ] Advanced search and filtering UI
