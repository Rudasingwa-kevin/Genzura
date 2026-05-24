import { PrismaClient } from '@prisma/client';
import { DateService } from '../utils/dateUtils.js';
const prisma = new PrismaClient();
export class InvitationService {
    /**
     * Create a pending case invitation (requires approval)
     */
    static async createInvitation(caseId, inviteeId, inviterId, role = 'Team Member', message) {
        // Check if user is already on the team
        const existingMember = await prisma.caseTeam.findUnique({
            where: {
                caseId_userId: {
                    caseId,
                    userId: inviteeId,
                },
            },
        });
        if (existingMember) {
            throw new Error('User is already a team member');
        }
        // Check if there's already a pending invitation
        const pendingInvitation = await prisma.caseInvitation.findFirst({
            where: {
                caseId,
                inviteeId,
                status: 'Pending',
            },
        });
        if (pendingInvitation) {
            throw new Error('User already has a pending invitation for this case');
        }
        // Create the invitation
        const invitation = await prisma.caseInvitation.create({
            data: {
                caseId,
                inviteeId,
                inviterId,
                role,
                message,
                status: 'Pending',
            },
        });
        // Get case and user details for notification
        const caseData = await prisma.case.findUnique({
            where: { id: caseId },
            select: {
                caseNumber: true,
                title: true,
            },
        });
        const inviter = await prisma.user.findUnique({
            where: { id: inviterId },
            select: {
                name: true,
            },
        });
        // Send notification to the invitee
        await prisma.notification.create({
            data: {
                userId: inviteeId,
                type: 'invitation',
                title: 'Case Invitation',
                body: `${inviter?.name} invited you to join case ${caseData?.caseNumber}: ${caseData?.title}`,
                link: `/cases/${caseId}`,
                metadata: {
                    invitationId: invitation.id,
                    caseId,
                    inviterId,
                    role,
                },
            },
        });
        return invitation;
    }
    /**
     * Get all pending invitations for a user
     */
    static async getUserInvitations(userId) {
        const invitations = await prisma.caseInvitation.findMany({
            where: {
                inviteeId: userId,
                status: 'Pending',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Enrich with case and inviter details
        const enrichedInvitations = await Promise.all(invitations.map(async (inv) => {
            const caseData = await prisma.case.findUnique({
                where: { id: inv.caseId },
                select: {
                    caseNumber: true,
                    title: true,
                    client: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            const inviter = await prisma.user.findUnique({
                where: { id: inv.inviterId },
                select: {
                    name: true,
                    email: true,
                    initials: true,
                },
            });
            return {
                ...inv,
                case: caseData,
                inviter,
            };
        }));
        return enrichedInvitations;
    }
    /**
     * Approve an invitation (add user to case team)
     */
    static async approveInvitation(invitationId, userId) {
        const invitation = await prisma.caseInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        if (invitation.inviteeId !== userId) {
            throw new Error('You are not authorized to respond to this invitation');
        }
        if (invitation.status !== 'Pending') {
            throw new Error('This invitation has already been responded to');
        }
        // Update invitation status
        await prisma.caseInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'Approved',
                respondedAt: new Date(),
            },
        });
        // Add user to case team
        const caseTeam = await prisma.caseTeam.create({
            data: {
                caseId: invitation.caseId,
                userId: invitation.inviteeId,
                role: invitation.role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        initials: true,
                    },
                },
            },
        });
        // Create timeline entry for team member added
        if (caseTeam.user) {
            await prisma.timelineEvent.create({
                data: {
                    caseId: invitation.caseId,
                    authorId: invitation.inviterId,
                    type: 'team_added',
                    description: `${caseTeam.user.name} joined the case team`,
                    timestamp: DateService.now()
                }
            });
        }
        // Mark the notification as read
        await prisma.notification.updateMany({
            where: {
                userId,
                metadata: {
                    path: ['invitationId'],
                    equals: invitationId,
                },
            },
            data: {
                read: true,
            },
        });
        // Notify the inviter about approval
        const invitee = await prisma.user.findUnique({
            where: { id: invitation.inviteeId },
            select: { name: true },
        });
        const caseData = await prisma.case.findUnique({
            where: { id: invitation.caseId },
            select: { caseNumber: true, title: true },
        });
        await prisma.notification.create({
            data: {
                userId: invitation.inviterId,
                type: 'case',
                title: 'Invitation Accepted',
                body: `${invitee?.name} accepted your invitation to join case ${caseData?.caseNumber}`,
                link: `/cases/${invitation.caseId}`,
            },
        });
        return caseTeam;
    }
    /**
     * Reject an invitation
     */
    static async rejectInvitation(invitationId, userId) {
        const invitation = await prisma.caseInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        if (invitation.inviteeId !== userId) {
            throw new Error('You are not authorized to respond to this invitation');
        }
        if (invitation.status !== 'Pending') {
            throw new Error('This invitation has already been responded to');
        }
        // Update invitation status
        await prisma.caseInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'Rejected',
                respondedAt: new Date(),
            },
        });
        // Mark the notification as read
        await prisma.notification.updateMany({
            where: {
                userId,
                metadata: {
                    path: ['invitationId'],
                    equals: invitationId,
                },
            },
            data: {
                read: true,
            },
        });
        // Optionally notify the inviter about rejection
        const invitee = await prisma.user.findUnique({
            where: { id: invitation.inviteeId },
            select: { name: true },
        });
        const caseData = await prisma.case.findUnique({
            where: { id: invitation.caseId },
            select: { caseNumber: true, title: true },
        });
        await prisma.notification.create({
            data: {
                userId: invitation.inviterId,
                type: 'alert',
                title: 'Invitation Declined',
                body: `${invitee?.name} declined your invitation to join case ${caseData?.caseNumber}`,
                link: `/cases/${invitation.caseId}`,
            },
        });
        return { success: true };
    }
    /**
     * Get all invitations for a case (for case owner/admin)
     */
    static async getCaseInvitations(caseId) {
        const invitations = await prisma.caseInvitation.findMany({
            where: { caseId },
            orderBy: { createdAt: 'desc' },
        });
        // Enrich with user details
        const enrichedInvitations = await Promise.all(invitations.map(async (inv) => {
            const invitee = await prisma.user.findUnique({
                where: { id: inv.inviteeId },
                select: {
                    name: true,
                    email: true,
                    role: true,
                    initials: true,
                },
            });
            const inviter = await prisma.user.findUnique({
                where: { id: inv.inviterId },
                select: {
                    name: true,
                },
            });
            return {
                ...inv,
                invitee,
                inviter,
            };
        }));
        return enrichedInvitations;
    }
}
//# sourceMappingURL=invitationService.js.map