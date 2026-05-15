import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class NotificationService {
    static async getUserNotifications(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async createNotification(data) {
        return prisma.notification.create({
            data
        });
    }
    static async markAsRead(id) {
        return prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    }
    static async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }
    static async deleteNotification(id) {
        return prisma.notification.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=notificationService.js.map