import express from 'express';
import { InvitationController } from '../controllers/invitationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { invitationLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
// All routes require authentication
router.use(authenticate);
// Apply rate limiting to invitation creation
router.use(invitationLimiter);
// Get my pending invitations
router.get('/my-invitations', InvitationController.getMyInvitations);
// Respond to invitations
router.post('/:invitationId/approve', InvitationController.approveInvitation);
router.post('/:invitationId/reject', InvitationController.rejectInvitation);
// Get invitations for a case
router.get('/case/:caseId', InvitationController.getCaseInvitations);
export default router;
//# sourceMappingURL=invitationRoutes.js.map