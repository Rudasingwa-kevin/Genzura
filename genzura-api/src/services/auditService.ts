import { PrismaClient, AuditAction, AuditStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async createLog(data: {
    action: AuditAction;
    description: string;
    userId?: string;
    userName: string;
    userRole: string;
    ipAddress?: string;
    userAgent?: string;
    status?: AuditStatus;
    metadata?: Record<string, any>;
  }) {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        description: data.description,
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status || AuditStatus.Success,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  }

  /**
   * Get all audit logs with pagination and filters
   */
  static async getAllLogs(filters?: {
    action?: AuditAction;
    userId?: string;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.action) where.action = filters.action;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      total,
    };
  }

  /**
   * Get logs for a specific user
   */
  static async getUserLogs(userId: string, limit = 20) {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  }

  /**
   * Get recent activity logs
   */
  static async getRecentActivity(limit = 50) {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  }
}
