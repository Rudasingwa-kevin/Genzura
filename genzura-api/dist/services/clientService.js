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
    static async getClientById(id) {
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
    static async createClient(data) {
        return prisma.client.create({
            data
        });
    }
    static async updateClient(id, data) {
        return prisma.client.update({
            where: { id },
            data
        });
    }
    static async deleteClient(id) {
        return prisma.client.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=clientService.js.map