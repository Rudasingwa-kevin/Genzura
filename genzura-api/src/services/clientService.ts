import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientService {
  static async getAllClients() {
    return prisma.client.findMany({
      include: {
        _count: {
          select: { cases: true }
        },
        cases: {
          take: 5,
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getClientById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          include: { attorney: true },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
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
