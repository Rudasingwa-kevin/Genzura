import { PrismaClient, DocumentType } from '@prisma/client';

const prisma = new PrismaClient();

export class DocumentService {
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
    uploadedById: string;
  }) {
    return prisma.caseDocument.create({
      data
    });
  }

  static async deleteDocument(id: string) {
    return prisma.caseDocument.delete({
      where: { id }
    });
  }
}
