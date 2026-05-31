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
    static async createPublicFeedback(data) {
        // Store public feedback with metadata in message
        const enrichedMessage = `[Public Submission from ${data.name} (${data.email})]\n\n${data.message}`;
        return prisma.feedback.create({
            data: {
                userId: null, // No user ID for public submissions
                subject: data.subject,
                category: data.category,
                message: enrichedMessage,
                status: 'Pending',
            }
        });
    }
}
//# sourceMappingURL=feedbackService.js.map