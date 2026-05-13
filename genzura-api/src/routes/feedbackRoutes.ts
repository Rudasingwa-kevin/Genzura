import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Regular users can submit feedback
router.post('/', FeedbackController.create);

// Only admins can view and manage all feedback
router.get('/', authorize(['Admin']), FeedbackController.getAll);
router.patch('/:id/status', authorize(['Admin']), FeedbackController.updateStatus);

export default router;
