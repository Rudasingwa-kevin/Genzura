import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
// Profile update - any authenticated user can update their own profile
router.put('/profile', UserController.updateProfile);
// Get active users for collaboration - accessible to all authenticated users
router.get('/active', UserController.getActiveUsers);
// Admin-only routes
router.use(authorize(['Admin']));
router.get('/', UserController.getAll);
router.get('/analytics', UserController.getAnalytics);
router.get('/:id', UserController.getOne);
router.post('/', UserController.create);
router.post('/invite', UserController.inviteUser);
router.patch('/:id/status', UserController.updateStatus);
export default router;
//# sourceMappingURL=userRoutes.js.map