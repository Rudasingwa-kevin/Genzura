import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SettingsService {
  static async getAllSettings() {
    const settings = await prisma.systemSetting.findMany();
    // Convert array to a key-value map for easier frontend consumption
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  }

  static async getSetting(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    return setting?.value || null;
  }

  static async upsertSettings(settingsMap: Record<string, string>) {
    // Run updates in a transaction
    const updatePromises = Object.entries(settingsMap).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, category: 'General' },
      });
    });

    await prisma.$transaction(updatePromises);
    return this.getAllSettings();
  }

  // Subscription system management
  static async getSubscriptionStatus() {
    const status = await this.getSetting('SUBSCRIPTION_STATUS');
    return status || 'PAUSED'; // Default to PAUSED
  }

  static async activateSubscriptionSystem() {
    const activationDate = new Date();
    activationDate.setDate(activationDate.getDate() + 14); // 14 days from now

    await this.upsertSettings({
      'SUBSCRIPTION_STATUS': 'WARNING',
      'SUBSCRIPTION_ACTIVATION_DATE': activationDate.toISOString(),
      'SUBSCRIPTION_WARNING_SENT': 'false'
    });

    return {
      status: 'WARNING',
      activationDate: activationDate.toISOString(),
      daysRemaining: 14
    };
  }

  static async pauseSubscriptionSystem() {
    await this.upsertSettings({
      'SUBSCRIPTION_STATUS': 'PAUSED',
      'SUBSCRIPTION_ACTIVATION_DATE': '',
      'SUBSCRIPTION_WARNING_SENT': 'false'
    });

    return { status: 'PAUSED' };
  }

  static async getSubscriptionInfo() {
    const status = await this.getSubscriptionStatus();
    const activationDateStr = await this.getSetting('SUBSCRIPTION_ACTIVATION_DATE');

    if (!activationDateStr || status === 'PAUSED') {
      return {
        status: 'PAUSED',
        activationDate: null,
        daysRemaining: null
      };
    }

    const activationDate = new Date(activationDateStr);
    const now = new Date();
    const daysRemaining = Math.ceil((activationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Auto-transition to ACTIVE if date has passed
    if (daysRemaining <= 0 && status === 'WARNING') {
      await this.upsertSettings({
        'SUBSCRIPTION_STATUS': 'ACTIVE'
      });
      return {
        status: 'ACTIVE',
        activationDate: activationDateStr,
        daysRemaining: 0
      };
    }

    return {
      status,
      activationDate: activationDateStr,
      daysRemaining: Math.max(0, daysRemaining)
    };
  }
}
