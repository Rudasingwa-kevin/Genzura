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
}
