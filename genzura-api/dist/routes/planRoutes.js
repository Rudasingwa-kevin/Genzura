import { Router } from 'express';
import { PlanController } from '../controllers/planController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
// Public route - get visible plans for pricing page
router.get('/public', PlanController.getPublicPlans);
// Admin routes - require authentication and admin role
router.get('/', authenticate, authorize(['Admin']), PlanController.getAllPlans);
router.post('/', authenticate, authorize(['Admin']), PlanController.upsertPlan);
export default router;
//# sourceMappingURL=planRoutes.js.map