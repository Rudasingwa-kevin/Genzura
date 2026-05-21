import { PrismaClient, CaseStatus, CasePriority, CaseType } from '@prisma/client';
import { emitToAll } from '../socket.js';
import { NotificationService } from './notificationService.js';
import { DateService } from '../utils/dateUtils.js';

const prisma = new PrismaClient();

export class CaseService {
  static async getAllCases(userId?: string) {
    // All users (including admins) only see cases they're assigned to
    if (userId) {
      return prisma.case.findMany({
        where: {
          OR: [
            { attorneyId: userId },
            {
              team: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        },
        include: {
          attorney: true,
          client: true,
          team: {
            include: { user: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }

    // If no userId provided, return empty array (no unauthorized access)
    return [];
  }

  static async getCaseById(idOrCaseNumber: string, userId?: string, userRole?: string) {
    // Try to find by caseNumber first (if it matches the pattern), then by ID
    // Flexible pattern: PREFIX-NUMBERS (e.g., CV-2025-003, CV-2026-0482, IP-2024-1234)
    const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);

    const whereClause = isCaseNumber
      ? { caseNumber: idOrCaseNumber }
      : { id: idOrCaseNumber };

    const caseData = await prisma.case.findUnique({
      where: whereClause,
      include: {
        attorney: true,
        client: true,
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

    // If no case found, return null
    if (!caseData) return null;

    // Check if user has access (is attorney or team member)
    // This applies to ALL users including admins
    if (userId) {
      const hasAccess =
        caseData.attorneyId === userId ||
        caseData.team.some(member => member.userId === userId);

      if (!hasAccess) {
        throw new Error('You do not have permission to access this case');
      }
    }

    return caseData;
  }

  static async createCase(data: any) {
    return prisma.case.create({
      data: {
        ...data,
        filedDate: DateService.now(),
      }
    });
  }

  static async updateCaseStatus(idOrCaseNumber: string, status: CaseStatus) {
    // Support updating by case number or ID
    const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);

    const whereClause = isCaseNumber
      ? { caseNumber: idOrCaseNumber }
      : { id: idOrCaseNumber };

    const updatedCase = await prisma.case.update({
      where: whereClause,
      data: { status }
    });

    const notification = await NotificationService.createNotification({
      userId: updatedCase.attorneyId,
      type: 'case',
      title: 'Case Status Updated',
      body: `Case ${updatedCase.title} is now ${status}`,
      link: `/cases/${updatedCase.caseNumber || updatedCase.id}`
    });
    emitToAll('new_notification', notification);

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

    const caseObj = await prisma.case.findUnique({ where: { id: caseId } });
    if (caseObj) {
      const notification = await NotificationService.createNotification({
        userId: caseObj.attorneyId,
        type: 'case',
        title: 'New Case Note',
        body: `A new note was added to case ${caseObj.title}.`,
        link: `/cases/${caseObj.id}`
      });
      emitToAll('new_notification', notification);
    }

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
    // Create the team member
    await prisma.caseTeam.create({
      data: {
        caseId,
        userId,
        role: 'Collaborator' // Default role
      }
    });

    // Return the full updated case with all relationships
    const updatedCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: true,
        attorney: true,
        team: {
          include: {
            user: true
          }
        },
        timeline: {
          include: {
            author: true
          },
          orderBy: { timestamp: 'desc' }
        },
        documents: {
          include: {
            uploadedBy: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        notes: {
          include: {
            author: true
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    emitToAll('case_team_updated', { caseId, case: updatedCase });
    return updatedCase;
  }

  static async updateCase(idOrCaseNumber: string, data: any) {
    // Support updating by case number or ID
    const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);

    const whereClause = isCaseNumber
      ? { caseNumber: idOrCaseNumber }
      : { id: idOrCaseNumber };

    const updatedCase = await prisma.case.update({
      where: whereClause,
      data: {
        ...data,
        updatedAt: DateService.now()
      },
      include: {
        attorney: true,
        client: true,
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
    emitToAll('case_updated', updatedCase);
    return updatedCase;
  }

  static async deleteCase(idOrCaseNumber: string) {
    // Support deleting by case number or ID
    const isCaseNumber = /^[A-Z]+-\d+-\d+$/.test(idOrCaseNumber);

    // First find the case to get its actual ID for related records
    const caseToDelete = await this.getCaseById(idOrCaseNumber);
    if (!caseToDelete) {
      throw new Error('Case not found');
    }

    // Delete related records first if not handled by cascade
    await prisma.caseTeam.deleteMany({ where: { caseId: caseToDelete.id } });
    await prisma.timelineEvent.deleteMany({ where: { caseId: caseToDelete.id } });
    await prisma.caseDocument.deleteMany({ where: { caseId: caseToDelete.id } });
    await prisma.caseNote.deleteMany({ where: { caseId: caseToDelete.id } });

    const whereClause = isCaseNumber
      ? { caseNumber: idOrCaseNumber }
      : { id: idOrCaseNumber };

    const deletedCase = await prisma.case.delete({
      where: whereClause
    });
    emitToAll('case_deleted', { id: caseToDelete.id });
    return deletedCase;
  }
}
