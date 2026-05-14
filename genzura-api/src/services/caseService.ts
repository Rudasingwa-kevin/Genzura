import { PrismaClient, CaseStatus, CasePriority, CaseType } from '@prisma/client';
import { emitToAll } from '../socket.js';

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
    const updatedCase = await prisma.case.update({
      where: { id },
      data: { status }
    });
    emitToAll('case_status_updated', updatedCase);
    return updatedCase;
  }

  static async addNote(caseId: string, authorId: string, text: string) {
    const note = await prisma.caseNote.create({
      data: {
        caseId,
        authorId,
        text,
      }
    });
    emitToAll('new_case_note', { caseId, note });
    return note;
  }

  static async getAnalytics() {
    const totalCases = await prisma.case.count();
    const statusCounts = await prisma.case.groupBy({
      by: ['status'],
      _count: true
    });
    const priorityCounts = await prisma.case.groupBy({
      by: ['priority'],
      _count: true
    });

    // Case volume by month (simplified)
    const cases = await prisma.case.findMany({
      select: { createdAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const volumeByMonth = months.map(month => ({
      month,
      count: cases.filter(c => months[c.createdAt.getMonth()] === month).length
    }));

    return {
      totalCases,
      statusCounts,
      priorityCounts,
      volumeByMonth
    };
  }

  static async addTeamMember(caseId: string, userId: string) {
    const caseItem = await prisma.case.update({
      where: { id: caseId },
      data: {
        team: {
          connect: { id: userId }
        }
      },
      include: {
        team: true
      }
    });

    emitToAll('case_team_updated', { caseId, team: caseItem.team });
    return caseItem;
  }
}
