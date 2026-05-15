import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/case/:caseId', DocumentController.getByCase);
router.post('/', upload.single('file'), DocumentController.create);
router.delete('/:id', DocumentController.remove);
export default router;
//# sourceMappingURL=documentRoutes.js.map