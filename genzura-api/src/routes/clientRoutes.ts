import { Router } from 'express';
import { ClientController } from '../controllers/clientController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getOne);
router.post('/', ClientController.create);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);

export default router;
