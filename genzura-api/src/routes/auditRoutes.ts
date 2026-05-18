import { Router } from 'express';
import { AuditController } from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// All audit routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorize(['Admin']), AuditController.getAll);
router.get('/recent', authorize(['Admin']), AuditController.getRecentActivity);
router.get('/user/:userId', authorize(['Admin']), AuditController.getUserLogs);

export default router;
