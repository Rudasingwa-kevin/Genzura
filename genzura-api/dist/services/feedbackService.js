import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class FeedbackService {
    static async createFeedback(userId, data) {
        return prisma.feedback.create({
            data: {
                userId,
                ...data,
                status: 'Pending',
            }
        });
    }
    static async getAllFeedback() {
        return prisma.feedback.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async getUserFeedback(userId) {
        return prisma.feedback.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async updateStatus(id, status) {
        return prisma.feedback.update({
            where: { id },
            data: { status }
        });
    }
}
//# sourceMappingURL=feedbackService.js.map