import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['Admin']));

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;
