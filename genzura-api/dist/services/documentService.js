import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService.js';
import { emitToAll } from '../socket.js';
const prisma = new PrismaClient();
export class DocumentService {
    static async getAllDocuments(userId) {
        // If no userId, return empty array (no unauthorized access)
        if (!userId)
            return [];
        // Get all documents from cases assigned to this user
        return prisma.caseDocument.findMany({
            where: {
                case: {
                    OR: [
                        { attorneyId: userId },
                        {
                            team: {
                                some: { userId: userId }
                            }
                        }
                    ]
                }
            },
            include: {
                uploadedBy: true,
                case: { select: { caseNumber: true, title: true } }
            },
            orderBy: { uploadedAt: 'desc' }
        });
    }
    static async getCaseDocuments(idOrCaseNumber, userId) {
        // Support lookup by case number or ID
        const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);
        let caseId = idOrCaseNumber;
        // If case number, find the actual case ID
        if (isCaseNumber) {
            const caseObj = await prisma.case.findUnique({
                where: { caseNumber: idOrCaseNumber },
                select: { id: true, attorneyId: true, team: { select: { userId: true } } }
            });
            if (!caseObj) {
                throw new Error('Case not found');
            }
            caseId = caseObj.id;
            // Check if user has access to this case
            if (userId) {
                const hasAccess = caseObj.attorneyId === userId ||
                    caseObj.team.some(member => member.userId === userId);
                if (!hasAccess) {
                    throw new Error('You do not have permission to access documents for this case');
                }
            }
        }
        else {
            // Verify access by case ID
            if (userId) {
                const caseObj = await prisma.case.findUnique({
                    where: { id: caseId },
                    select: { attorneyId: true, team: { select: { userId: true } } }
                });
                if (caseObj) {
                    const hasAccess = caseObj.attorneyId === userId ||
                        caseObj.team.some(member => member.userId === userId);
                    if (!hasAccess) {
                        throw new Error('You do not have permission to access documents for this case');
                    }
                }
            }
        }
        return prisma.caseDocument.findMany({
            where: { caseId },
            include: { uploadedBy: true },
            orderBy: { uploadedAt: 'desc' }
        });
    }
    static async createDocument(data) {
        // Support case number or ID
        const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(data.caseId);
        let actualCaseId = data.caseId;
        // If case number, find the actual case ID
        if (isCaseNumber) {
            const caseObj = await prisma.case.findUnique({
                where: { caseNumber: data.caseId },
                select: { id: true, attorneyId: true, title: true, caseNumber: true }
            });
            if (!caseObj) {
                throw new Error('Case not found');
            }
            actualCaseId = caseObj.id;
            // Create document with actual ID
            const document = await prisma.caseDocument.create({
                data: { ...data, caseId: actualCaseId },
                include: { uploadedBy: true }
            });
            const notification = await NotificationService.createNotification({
                userId: caseObj.attorneyId,
                type: 'document',
                title: 'New Document Uploaded',
                body: `A new document (${data.name}) was uploaded to case ${caseObj.title}.`,
                link: `/cases/${caseObj.caseNumber}`
            });
            emitToAll('new_notification', notification);
            return document;
        }
        // Regular ID path
        const document = await prisma.caseDocument.create({
            data,
            include: { uploadedBy: true }
        });
        const caseObj = await prisma.case.findUnique({
            where: { id: actualCaseId },
            select: { attorneyId: true, title: true, caseNumber: true }
        });
        if (caseObj) {
            const notification = await NotificationService.createNotification({
                userId: caseObj.attorneyId,
                type: 'document',
                title: 'New Document Uploaded',
                body: `A new document (${data.name}) was uploaded to case ${caseObj.title}.`,
                link: `/cases/${caseObj.caseNumber || actualCaseId}`
            });
            emitToAll('new_notification', notification);
        }
        return document;
    }
    static async deleteDocument(id) {
        return prisma.caseDocument.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=documentService.js.map