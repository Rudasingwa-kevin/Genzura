import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data
    });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  static async deleteNotification(id: string) {
    return prisma.notification.delete({
      where: { id }
    });
  }
}
