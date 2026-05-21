import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientService {
  static async getAllClients(userId?: string) {
    // If no userId, return empty array (no unauthorized access)
    if (!userId) return [];

    // Get all clients that have cases assigned to this user
    return prisma.client.findMany({
      where: {
        cases: {
          some: {
            OR: [
              { attorneyId: userId },
              {
                team: {
                  some: { userId: userId }
                }
              }
            ]
          }
        }
      },
      include: {
        _count: {
          select: { cases: true }
        },
        cases: {
          where: {
            OR: [
              { attorneyId: userId },
              {
                team: {
                  some: { userId: userId }
                }
              }
            ]
          },
          take: 5,
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getClientById(id: string, userId?: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          where: userId ? {
            OR: [
              { attorneyId: userId },
              {
                team: {
                  some: { userId: userId }
                }
              }
            ]
          } : undefined,
          include: { attorney: true },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    // Check if user has access to this client (via at least one case)
    if (userId && client) {
      const hasAccess = client.cases.length > 0;
      if (!hasAccess) {
        throw new Error('You do not have permission to access this client');
      }
    }

    return client;
  }

  static async createClient(data: any) {
    return prisma.client.create({
      data
    });
  }

  static async updateClient(id: string, data: any) {
    return prisma.client.update({
      where: { id },
      data
    });
  }

  static async deleteClient(id: string) {
    return prisma.client.delete({
      where: { id }
    });
  }
}
