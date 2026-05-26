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
//# sourceMappingURL=adminRoutes.js.map