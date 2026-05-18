import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's subscription limits and usage
router.get('/limits', SubscriptionController.getLimits);

// Check specific permissions
router.post('/check/case', SubscriptionController.checkCaseLimit);
router.post('/check/document', SubscriptionController.checkDocumentLimit);
router.post('/check/download', SubscriptionController.checkDownloadPermission);

// Check subscription status
router.get('/status', SubscriptionController.checkStatus);

// Upgrade subscription
router.post('/upgrade', SubscriptionController.upgrade);

// Get features for a plan (public info, but still requires auth)
router.get('/features/:plan', SubscriptionController.getFeatures);

export default router;
