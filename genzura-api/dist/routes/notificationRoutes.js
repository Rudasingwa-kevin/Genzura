import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', NotificationController.getAll);
router.patch('/:id/read', NotificationController.markRead);
router.post('/read-all', NotificationController.markAllRead);
router.delete('/:id', NotificationController.dismiss);
export default router;
//# sourceMappingURL=notificationRoutes.js.map