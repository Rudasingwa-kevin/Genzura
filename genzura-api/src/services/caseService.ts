import { PrismaClient, CaseStatus, CasePriority, CaseType } from '@prisma/client';

const prisma = new PrismaClient();

export class CaseService {
  static async getAllCases() {
    return prisma.case.findMany({
      include: {
        attorney: true,
        team: {
          include: { user: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getCaseById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: {
        attorney: true,
        team: {
          include: { user: true }
        },
        timeline: {
          include: { author: true },
          orderBy: { timestamp: 'desc' }
        },
        documents: {
          include: { uploadedBy: true }
        },
        notes: {
          include: { author: true },
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }

  static async createCase(data: any) {
    return prisma.case.create({
      data: {
        ...data,
        filedDate: new Date(),
      }
    });
  }

  static async updateCaseStatus(id: string, status: CaseStatus) {
    return prisma.case.update({
      where: { id },
      data: { status }
    });
  }

  static async addNote(caseId: string, authorId: string, text: string) {
    return prisma.caseNote.create({
      data: {
        caseId,
        authorId,
        text,
      }
    });
  }
}
