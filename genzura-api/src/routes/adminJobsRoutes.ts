import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { auditAdminAction } from '../middleware/auditMiddleware.js';
import { AdminJobsController } from '../controllers/adminJobsController.js';

const router = express.Router();

// All routes require authentication, admin role, and audit logging
router.use(authenticate);
router.use(authorize(['Admin']));
router.use(auditAdminAction());


// POST /api/admin/jobs/run-deadline-check - Manually trigger case deadline check
router.post('/run-deadline-check', AdminJobsController.runDeadlineCheck);

// GET /api/admin/jobs/status - Get status of scheduled jobs
router.get('/status', AdminJobsController.getJobsStatus);

export default router;
