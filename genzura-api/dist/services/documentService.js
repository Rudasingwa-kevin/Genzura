import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService.js';
import { emitToAll } from '../socket.js';
const prisma = new PrismaClient();
export class DocumentService {
    static async getAllDocuments() {
        return prisma.caseDocument.findMany({
            include: {
                uploadedBy: true,
                case: { select: { caseNumber: true, title: true } }
            },
            orderBy: { uploadedAt: 'desc' }
        });
    }
    static async getCaseDocuments(idOrCaseNumber) {
        // Support lookup by case number or ID
        const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);
        let caseId = idOrCaseNumber;
        // If case number, find the actual case ID
        if (isCaseNumber) {
            const caseObj = await prisma.case.findUnique({
                where: { caseNumber: idOrCaseNumber },
                select: { id: true }
            });
            if (!caseObj) {
                throw new Error('Case not found');
            }
            caseId = caseObj.id;
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