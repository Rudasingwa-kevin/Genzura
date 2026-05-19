import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { AdminJobsController } from '../controllers/adminJobsController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['Admin']));

// POST /api/admin/jobs/run-expiry-check - Manually trigger subscription expiry check
router.post('/run-expiry-check', AdminJobsController.runExpiryCheck);

// GET /api/admin/jobs/status - Get status of scheduled jobs
router.get('/status', AdminJobsController.getJobsStatus);

export default router;
