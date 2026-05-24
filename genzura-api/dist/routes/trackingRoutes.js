import { Router } from 'express';
import { TrackingController } from '../controllers/trackingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
// Track document download
router.post('/document/:documentId/download', TrackingController.trackDocumentDownload);
// Track PDF export
router.post('/case/:caseId/pdf-export', TrackingController.trackPDFExport);
export default router;
//# sourceMappingURL=trackingRoutes.js.map