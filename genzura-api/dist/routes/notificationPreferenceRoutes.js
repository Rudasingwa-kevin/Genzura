import { Router } from 'express';
import { NotificationPreferenceController } from '../controllers/notificationPreferenceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
// All routes require authentication
router.get('/', authenticate, NotificationPreferenceController.getPreferences);
router.put('/', authenticate, NotificationPreferenceController.updatePreferences);
export default router;
//# sourceMappingURL=notificationPreferenceRoutes.js.map