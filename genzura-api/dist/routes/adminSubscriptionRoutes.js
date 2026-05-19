import { Router } from 'express';
import { AdminSubscriptionController } from '../controllers/adminSubscriptionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['Admin']));
// Grant free access/trial to user
router.post('/grant', AdminSubscriptionController.grantAccess);
// Extend existing subscription
router.post('/extend', AdminSubscriptionController.extendSubscription);
// Revoke subscription (downgrade to free)
router.post('/revoke', AdminSubscriptionController.revokeAccess);
// Get subscription statistics
router.get('/stats', AdminSubscriptionController.getStats);
export default router;
//# sourceMappingURL=adminSubscriptionRoutes.js.map