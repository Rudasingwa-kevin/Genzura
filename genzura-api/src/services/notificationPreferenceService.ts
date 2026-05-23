import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationPreferenceService {
  /**
   * Get user notification preferences (create with defaults if not exists)
   */
  static async getPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create with defaults if doesn't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          caseAssignments: true,
          timelineMilestones: true,
          documentActivity: false,
          securityAlerts: true,
        },
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    data: {
      caseAssignments?: boolean;
      timelineMilestones?: boolean;
      documentActivity?: boolean;
      securityAlerts?: boolean;
    }
  ) {
    // Ensure preferences exist first
    await this.getPreferences(userId);

    return prisma.notificationPreference.update({
      where: { userId },
      data,
    });
  }
}
