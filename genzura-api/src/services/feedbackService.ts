import { PrismaClient, FeedbackStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class FeedbackService {
  static async createFeedback(userId: string, data: {
    subject: string;
    category: string;
    message: string;
  }) {
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

  static async getUserFeedback(userId: string) {
    return prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(id: string, status: FeedbackStatus) {
    return prisma.feedback.update({
      where: { id },
      data: { status }
    });
  }
}
