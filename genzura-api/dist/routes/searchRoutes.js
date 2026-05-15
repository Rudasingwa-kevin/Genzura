import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.get('/', SearchController.globalSearch);
export default router;
//# sourceMappingURL=searchRoutes.js.map