import { PrismaClient, DocumentType } from '@prisma/client';
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

  static async getCaseDocuments(caseId: string) {
    return prisma.caseDocument.findMany({
      where: { caseId },
      include: { uploadedBy: true },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  static async createDocument(data: {
    caseId: string;
    name: string;
    type: DocumentType;
    size: string;
    fileUrl?: string;
    uploadedById: string;
  }) {
    const document = await prisma.caseDocument.create({
      data
    });

    const caseObj = await prisma.case.findUnique({ where: { id: data.caseId } });
    if (caseObj) {
      const notification = await NotificationService.createNotification({
        userId: caseObj.attorneyId,
        type: 'document',
        title: 'New Document Uploaded',
        body: `A new document (${data.name}) was uploaded to case ${caseObj.title}.`,
        link: `/cases/${caseObj.id}`
      });
      emitToAll('new_notification', notification);
    }

    return document;
  }

  static async deleteDocument(id: string) {
    return prisma.caseDocument.delete({
      where: { id }
    });
  }
}
