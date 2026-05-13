import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/case/:caseId', DocumentController.getByCase);
router.post('/', DocumentController.create);
router.delete('/:id', DocumentController.remove);

export default router;
