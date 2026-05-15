import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class DocumentService {
    static async getCaseDocuments(caseId) {
        return prisma.caseDocument.findMany({
            where: { caseId },
            include: { uploadedBy: true },
            orderBy: { uploadedAt: 'desc' }
        });
    }
    static async createDocument(data) {
        return prisma.caseDocument.create({
            data
        });
    }
    static async deleteDocument(id) {
        return prisma.caseDocument.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=documentService.js.map