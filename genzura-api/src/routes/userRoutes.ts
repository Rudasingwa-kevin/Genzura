import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { AttorneyDocumentController } from '../controllers/attorneyDocumentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { uploadAvatar, uploadDocument } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

// Profile update - any authenticated user can update their own profile
router.put('/profile', UserController.updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), UserController.uploadAvatar);
router.delete('/avatar', UserController.removeAvatar);

// Document management - accessible to attorneys only (checked in controller)
router.post('/documents', uploadDocument.single('file'), AttorneyDocumentController.uploadDocument);
router.get('/documents', AttorneyDocumentController.getMyDocuments);
router.get('/documents/:id/download', AttorneyDocumentController.downloadDocument);
router.patch('/documents/:id', AttorneyDocumentController.updateDocument);
router.delete('/documents/:id', AttorneyDocumentController.deleteDocument);

// Get active users for collaboration - accessible to all authenticated users
router.get('/active', UserController.getActiveUsers);

// Get own subscription info - accessible to all authenticated users
router.get('/me/subscription', UserController.getMySubscription);

// Admin-only routes
router.use(authorize(['Admin']));
router.get('/', UserController.getAll);
router.get('/analytics', UserController.getAnalytics);
router.get('/:id', UserController.getOne);
router.post('/', UserController.create);
router.post('/invite', UserController.inviteUser);
router.patch('/:id/status', UserController.updateStatus);

export default router;
