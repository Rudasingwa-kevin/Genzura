import { PrismaClient } from '@prisma/client';
import { emitToAll } from '../socket.js';
const prisma = new PrismaClient();
export class CaseService {
    static async getAllCases() {
        return prisma.case.findMany({
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
    static async getCaseById(id) {
        return prisma.case.findUnique({
            where: { id },
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
    }
    static async createCase(data) {
        return prisma.case.create({
            data: {
                ...data,
                filedDate: new Date(),
            }
        });
    }
    static async updateCaseStatus(id, status) {
        const updatedCase = await prisma.case.update({
            where: { id },
            data: { status }
        });
        emitToAll('case_status_updated', updatedCase);
        return updatedCase;
    }
    static async addNote(caseId, authorId, text) {
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
    static async addTeamMember(caseId, userId) {
        const caseTeam = await prisma.caseTeam.create({
            data: {
                caseId,
                userId,
                role: 'Collaborator' // Default role
            },
            include: {
                user: true
            }
        });
        emitToAll('case_team_updated', { caseId, teamMember: caseTeam });
        return caseTeam;
    }
    static async updateCase(id, data) {
        const updatedCase = await prisma.case.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
        emitToAll('case_updated', updatedCase);
        return updatedCase;
    }
    static async deleteCase(id) {
        // Delete related records first if not handled by cascade
        await prisma.caseTeam.deleteMany({ where: { caseId: id } });
        await prisma.timelineEvent.deleteMany({ where: { caseId: id } });
        await prisma.caseDocument.deleteMany({ where: { caseId: id } });
        await prisma.caseNote.deleteMany({ where: { caseId: id } });
        const deletedCase = await prisma.case.delete({
            where: { id }
        });
        emitToAll('case_deleted', { id });
        return deletedCase;
    }
}
//# sourceMappingURL=caseService.js.map