import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
export class UserService {
    static async createUser(data) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(data.password || 'Genzura2026!', 10);
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                initials: data.initials,
                passwordHash,
            },
        });
    }
    static async getUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    static async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
    static async getAllUsers() {
        return prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    static async updateStatus(id, status) {
        return prisma.user.update({
            where: { id },
            data: { status },
        });
    }
    static async getUserAnalytics() {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { cases: true, teamMemberships: true, uploadedDocs: true, timelineEvents: true }
                },
                cases: {
                    select: { id: true, title: true, status: true, priority: true }
                }
            }
        });
        const recentActivity = await prisma.timelineEvent.findMany({
            take: 20,
            orderBy: { timestamp: 'desc' },
            include: { author: { select: { id: true, name: true, initials: true } }, case: { select: { id: true, title: true } } }
        });
        return {
            workload: users.map(u => ({
                id: u.id,
                name: u.name,
                initials: u.initials,
                role: u.role,
                totalCases: u._count.cases + u._count.teamMemberships,
                activeCases: u.cases.filter(c => c.status === 'Active' || c.status === 'Pending').length,
                resolvedCases: u.cases.filter(c => c.status === 'Resolved' || c.status === 'Archived').length,
                docsUploaded: u._count.uploadedDocs,
                timelineEvents: u._count.timelineEvents
            })).sort((a, b) => b.totalCases - a.totalCases),
            recentActivity
        };
    }
    static async updatePassword(id, passwordHash) {
        return prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
}
//# sourceMappingURL=userService.js.map