# 🚀 Implementation Guide: Replace Mock Data with Real APIs

**Status**: Schema updated, Audit service created  
**Remaining**: API endpoints + Frontend integration  
**Estimated Time**: 2-3 hours

---

## ✅ Completed

1. **Audit Logs Database Schema** ✅
   - Added `AuditLog` model to Prisma schema
   - Added `AuditAction` enum (28 actions)
   - Added `AuditStatus` enum (SUCCESS/FAILED/PENDING)
   - File: `genzura-api/prisma/schema.prisma`

2. **Audit Service Enhanced** ✅
   - Complete `AuditService` with all methods
   - File: `genzura-api/src/services/auditService.ts`

---

## 📋 Next Steps

### Step 1: Run Prisma Migration

```bash
cd genzura-api

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_audit_logs

# Or if interactive doesn't work:
npx prisma db push
```

This will create the `AuditLog` table in your database.

---

### Step 2: Create Admin API Routes

Create file: `genzura-api/src/routes/adminRoutes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { AdminController } from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Audit logs
router.get('/audit', AdminController.getAuditLogs);
router.get('/audit/stats', AdminController.getAuditStats);

// License/seat tracking
router.get('/licenses', AdminController.getLicenses);

// Storage metrics
router.get('/storage', AdminController.getStorageMetrics);

// System health
router.get('/health', AdminController.getSystemHealth);

// Infrastructure status
router.get('/infrastructure', AdminController.getInfrastructure);

export default router;
```

---

### Step 3: Create Admin Controller

Create file: `genzura-api/src/controllers/adminController.ts`

```typescript
import { Request, Response } from 'express';
import { AuditService } from '../services/auditService.js';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../services/s3Service.js';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * GET /api/admin/audit
   * Get audit logs with filtering
   */
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const {
        action,
        userId,
        status,
        resourceType,
        search,
        limit,
        offset,
        startDate,
        endDate,
      } = req.query;

      const result = await AuditService.getAll({
        action: action as any,
        userId: userId as string,
        status: status as any,
        resourceType: resourceType as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(result);
    } catch (error: any) {
      console.error('[AdminController] Get audit logs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/audit/stats
   * Get audit log statistics
   */
  static async getAuditStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await AuditService.getStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(stats);
    } catch (error: any) {
      console.error('[AdminController] Get audit stats error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/licenses
   * Get license seat usage
   */
  static async getLicenses(req: Request, res: Response) {
    try {
      // Count users by role
      const [
        total,
        attorneys,
        seniorAttorneys,
        paralegals,
        support,
        admins,
      ] = await Promise.all([
        prisma.user.count({ where: { status: 'Active' } }),
        prisma.user.count({ where: { role: 'Attorney', status: 'Active' } }),
        prisma.user.count({ where: { role: 'Senior_Attorney', status: 'Active' } }),
        prisma.user.count({ where: { role: 'Paralegal', status: 'Active' } }),
        prisma.user.count({ where: { role: 'Support', status: 'Active' } }),
        prisma.user.count({ where: { role: 'Admin', status: 'Active' } }),
      ]);

      // Calculate based on real subscription or hardcoded limit
      const maxSeats = 50; // This could come from a subscription setting

      res.json({
        total: maxSeats,
        used: total,
        available: maxSeats - total,
        percentUsed: ((total / maxSeats) * 100).toFixed(1),
        breakdown: {
          attorneys: attorneys + seniorAttorneys,
          paralegals,
          support,
          admins,
        },
      });
    } catch (error: any) {
      console.error('[AdminController] Get licenses error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/storage
   * Get S3 storage metrics
   */
  static async getStorageMetrics(req: Request, res: Response) {
    try {
      if (!S3Service.isConfigured()) {
        return res.json({
          configured: false,
          totalGB: 0,
          usedGB: 0,
          percentUsed: 0,
          fileCount: 0,
        });
      }

      // Count documents in database (as proxy for file count)
      const fileCount = await prisma.caseDocument.count();

      // Calculate total size from database
      const documents = await prisma.caseDocument.findMany({
        select: { size: true },
      });

      // Parse sizes (format: "1.5 MB" or "500 KB")
      let totalBytes = 0;
      documents.forEach((doc) => {
        const match = doc.size.match(/([\\d.]+)\\s*(KB|MB|GB)/i);
        if (match) {
          const value = parseFloat(match[1]);
          const unit = match[2].toUpperCase();
          if (unit === 'KB') totalBytes += value * 1024;
          else if (unit === 'MB') totalBytes += value * 1024 * 1024;
          else if (unit === 'GB') totalBytes += value * 1024 * 1024 * 1024;
        }
      });

      const totalGB = totalBytes / (1024 * 1024 * 1024);
      const maxGB = 100; // Or from subscription settings

      res.json({
        configured: true,
        totalGB: maxGB,
        usedGB: parseFloat(totalGB.toFixed(2)),
        percentUsed: parseFloat(((totalGB / maxGB) * 100).toFixed(1)),
        fileCount,
        bucketName: process.env.AWS_S3_BUCKET,
      });
    } catch (error: any) {
      console.error('[AdminController] Get storage metrics error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/health
   * Get system health metrics
   */
  static async getSystemHealth(req: Request, res: Response) {
    try {
      const startTime = Date.now();

      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - startTime;

      // Calculate uptime (simple version - process uptime)
      const uptimeSeconds = process.uptime();
      const uptimeHours = uptimeSeconds / 3600;
      const uptimeDays = uptimeHours / 24;

      // Mock uptime percentage (in production, use actual monitoring data)
      const uptimePercentage = 99.9;

      // Get user count as health indicator
      const activeUsers = await prisma.user.count({ where: { status: 'Active' } });

      res.json({
        status: 'operational',
        uptime: uptimePercentage,
        uptimeDays: parseFloat(uptimeDays.toFixed(1)),
        services: {
          database: {
            status: dbLatency < 100 ? 'healthy' : 'degraded',
            latency: dbLatency,
            connections: activeUsers, // Simplified
          },
          api: {
            status: 'healthy',
            responseTime: dbLatency,
          },
          storage: {
            status: S3Service.isConfigured() ? 'healthy' : 'not_configured',
          },
        },
      });
    } catch (error: any) {
      console.error('[AdminController] Get system health error:', error);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/infrastructure
   * Get infrastructure status
   */
  static async getInfrastructure(req: Request, res: Response) {
    try {
      // Check database
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbTime = Date.now() - dbStart;

      // Check connections
      const activeConnections = await prisma.user.count({ where: { status: 'Active' } });

      res.json({
        compute: {
          status: 'operational',
          cpu: process.cpuUsage().user / 1000000, // Convert to seconds
          memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        },
        database: {
          status: dbTime < 100 ? 'operational' : 'degraded',
          connections: activeConnections,
          queryTime: dbTime,
        },
        auth: {
          status: 'operational',
          activeTokens: activeConnections, // Simplified
        },
      });
    } catch (error: any) {
      console.error('[AdminController] Get infrastructure error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

### Step 4: Register Admin Routes

In `genzura-api/src/index.ts`, add:

```typescript
// Add import at top
import adminRoutes from './routes/adminRoutes.js';

// Add route registration (around line 90-100, with other routes)
app.use('/api/admin', adminRoutes);
```

---

### Step 5: Update Frontend Services

Create `genzura-web/src/api/services/admin.service.ts`:

```typescript
import api from '../axios';

export const adminService = {
  // Audit logs
  getAuditLogs: (params?: {
    action?: string;
    userId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/audit', { params }).then(res => res.data),

  getAuditStats: () => api.get('/admin/audit/stats').then(res => res.data),

  // License tracking
  getLicenses: () => api.get('/admin/licenses').then(res => res.data),

  // Storage metrics
  getStorageMetrics: () => api.get('/admin/storage').then(res => res.data),

  // System health
  getSystemHealth: () => api.get('/admin/health').then(res => res.data),

  // Infrastructure
  getInfrastructure: () => api.get('/admin/infrastructure').then(res => res.data),
};
```

---

### Step 6: Update AdminDashboard.tsx

Replace mock data with API calls:

```typescript
// Add import
import { adminService } from '../../api/services/admin.service';

// Add state
const [storageMetrics, setStorageMetrics] = useState<any>(null);
const [systemHealth, setSystemHealth] = useState<any>(null);
const [licenses, setLicenses] = useState<any>(null);
const [recentAudit, setRecentAudit] = useState<any[]>([]);
const [infrastructure, setInfrastructure] = useState<any>(null);

// In useEffect, fetch real data
useEffect(() => {
  const fetchAllData = async () => {
    try {
      const [users, storage, health, licenseData, audit, infra] = await Promise.all([
        userService.getAll(),
        adminService.getStorageMetrics(),
        adminService.getSystemHealth(),
        adminService.getLicenses(),
        adminService.getAuditLogs({ limit: 5 }),
        adminService.getInfrastructure(),
      ]);

      setUserCount(users.length);
      setStorageMetrics(storage);
      setSystemHealth(health);
      setLicenses(licenseData);
      setRecentAudit(audit.logs);
      setInfrastructure(infra);

      // Calculate subscriptions...
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchAllData();
}, []);

// Replace hardcoded values:
// Line 217: value={storageMetrics?.usedGB + ' GB'}
// Line 225: value={systemHealth?.uptime + '%'}
// Line 96: value={licenses?.used + ' / ' + licenses?.total}
// Lines 290-294: map over recentAudit array
// Lines 304-319: use infrastructure data
```

---

### Step 7: Update AuditLogPage.tsx

Replace mock array with API:

```typescript
// Add import
import { adminService } from '../../api/services/admin.service';

// Remove AUDIT_LOGS constant

// Add state
const [logs, setLogs] = useState<any[]>([]);
const [total, setTotal] = useState(0);

// Fetch from API
useEffect(() => {
  const fetchLogs = async () => {
    try {
      const result = await adminService.getAuditLogs({ search, limit: 50 });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };
  fetchLogs();
}, [search]);

// Update filtered to use logs state
const filtered = logs;
```

---

## 🎯 Testing Checklist

After implementation:

- [ ] Run Prisma migration successfully
- [ ] Start backend server without errors
- [ ] Test `/api/admin/audit` endpoint (Postman/Thunder Client)
- [ ] Test `/api/admin/licenses` endpoint
- [ ] Test `/api/admin/storage` endpoint
- [ ] Test `/api/admin/health` endpoint
- [ ] Test `/api/admin/infrastructure` endpoint
- [ ] Refresh Admin Dashboard - see real data
- [ ] Refresh Audit Log page - see real logs
- [ ] Verify all metrics update correctly

---

## 📝 Notes

### Audit Logging Auto-Capture

To automatically log all admin actions, create middleware:

`genzura-api/src/middleware/auditMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuditService, AuditAction } from '../services/auditService.js';

export const auditMiddleware = (action: AuditAction, description: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Log after response
    const originalSend = res.send;
    res.send = function (data: any) {
      const user = req.user;
      if (user && res.statusCode < 400) {
        AuditService.logUserAction(
          action,
          description,
          user.id,
          user.name,
          user.role,
          req
        );
      }
      return originalSend.call(this, data);
    };
    next();
  };
};
```

Use it in routes:

```typescript
router.post('/users', auditMiddleware(AuditAction.USER_CREATED, 'Created new user'), UserController.create);
router.patch('/settings', auditMiddleware(AuditAction.SETTINGS_UPDATED, 'Updated system settings'), SettingsController.update);
```

---

## 🚀 Quick Start

```bash
# 1. Run migration
cd genzura-api
npx prisma db push
npx prisma generate

# 2. Create the three files above:
#    - routes/adminRoutes.ts
#    - controllers/adminController.ts
#    - Update index.ts

# 3. Restart backend
npm run dev

# 4. Update frontend:
#    - Create api/services/admin.service.ts
#    - Update AdminDashboard.tsx
#    - Update AuditLogPage.tsx

# 5. Test
# Open admin dashboard and verify real data appears
```

---

**Time Estimate**:
- Backend API creation: 45 minutes
- Frontend integration: 30 minutes
- Testing & fixes: 45 minutes
- **Total: ~2 hours**

---

**Current Status**: ✅ Schema ready, ✅ Service ready, ⏳ Awaiting API + Frontend

