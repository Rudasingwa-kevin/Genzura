import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  static async createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    initials: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password || 'Genzura2026!', 10);
    
    return prisma.user.create({
      data: {
        ...data,
        passwordHash,
      },
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(id: string, status: any) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }
}
