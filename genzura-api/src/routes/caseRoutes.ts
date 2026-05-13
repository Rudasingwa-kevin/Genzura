import { Router } from 'express';
import { CaseController } from '../controllers/caseController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate); // All case routes require authentication

router.get('/', CaseController.getAll);
router.get('/:id', CaseController.getOne);
router.post('/', CaseController.create);
router.patch('/:id/status', CaseController.updateStatus);
router.post('/:id/notes', CaseController.addNote);

export default router;
