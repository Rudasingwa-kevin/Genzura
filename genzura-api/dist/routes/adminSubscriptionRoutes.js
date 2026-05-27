import { Router } from 'express';
import { AdminSubscriptionController } from '../controllers/adminSubscriptionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { auditAdminAction } from '../middleware/auditMiddleware.js';
const router = Router();
// All routes require authentication, admin role, and audit logging
router.use(authenticate);
router.use(authorize(['Admin']));
router.use(auditAdminAction());
// Grant free access/trial to user
router.post('/grant', AdminSubscriptionController.grantAccess);
// Extend existing subscription
router.post('/extend', AdminSubscriptionController.extendSubscription);
// Revoke subscription (downgrade to free)
router.post('/revoke', AdminSubscriptionController.revokeAccess);
// Cancel subscription (alias for revoke, used by frontend modal)
router.post('/cancel', AdminSubscriptionController.revokeAccess);
// Get subscription statistics
router.get('/stats', AdminSubscriptionController.getStats);
export default router;
//# sourceMappingURL=adminSubscriptionRoutes.js.map