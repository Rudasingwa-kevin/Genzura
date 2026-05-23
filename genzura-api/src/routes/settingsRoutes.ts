import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public route - users need to see subscription status for banner
router.get('/subscription-info', SettingsController.getSubscriptionInfo);

// Admin-only routes
router.use(authenticate);
router.use(authorize(['Admin']));

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

// Subscription system management (admin only)
router.post('/subscription/activate', SettingsController.activateSubscriptionSystem);
router.post('/subscription/pause', SettingsController.pauseSubscriptionSystem);

export default router;
