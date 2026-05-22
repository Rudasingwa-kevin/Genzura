import express from 'express';
import { InvitationController } from '../controllers/invitationController.js';

const router = express.Router();

// All routes require authentication (handled by parent router)

// Get my pending invitations
router.get('/my-invitations', InvitationController.getMyInvitations);

// Respond to invitations
router.post('/:invitationId/approve', InvitationController.approveInvitation);
router.post('/:invitationId/reject', InvitationController.rejectInvitation);

// Get invitations for a case
router.get('/case/:caseId', InvitationController.getCaseInvitations);

export default router;
