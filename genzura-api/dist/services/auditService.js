import { PrismaClient, AuditAction, AuditStatus } from '@prisma/client';
const prisma = new PrismaClient();
export class AuditService {
    /**
     * Create a new audit log entry
     */
    static async log(data) {
        try {
            await prisma.auditLog.create({
                data: {
                    action: data.action,
                    description: data.description,
                    userId: data.userId,
                    userName: data.userName,
                    userRole: data.userRole,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    method: data.method,
                    endpoint: data.endpoint,
                    status: data.status || AuditStatus.SUCCESS,
                    errorMessage: data.errorMessage,
                    resourceType: data.resourceType,
                    resourceId: data.resourceId,
                    metadata: data.metadata,
                },
            });
        }
        catch (error) {
            // Don't throw - audit logging should never break the application
            console.error('[AuditService] Failed to create audit log:', error);
        }
    }
    /**
     * Log a user action
     */
    static async logUserAction(action, description, userId, userName, userRole, req) {
        await this.log({
            action,
            description,
            userId,
            userName,
            userRole,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get('user-agent'),
            method: req?.method,
            endpoint: req?.originalUrl || req?.url,
        });
    }
    /**
     * Log a system action
     */
    static async logSystemAction(action, description, metadata) {
        await this.log({
            action,
            description,
            userName: 'System',
            userRole: 'System',
            metadata,
        });
    }
    /**
     * Log a security event
     */
    static async logSecurityEvent(action, description, ipAddress, metadata) {
        await this.log({
            action,
            description,
            status: action === AuditAction.UNAUTHORIZED_ACCESS ? AuditStatus.FAILED : AuditStatus.SUCCESS,
            ipAddress,
            metadata,
        });
    }
    /**
     * Get all audit logs with filtering
     */
    static async getAll(filters) {
        const { action, userId, status, resourceType, startDate, endDate, search, limit = 50, offset = 0, } = filters || {};
        const where = {};
        if (action)
            where.action = action;
        if (userId)
            where.userId = userId;
        if (status)
            where.status = status;
        if (resourceType)
            where.resourceType = resourceType;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { userName: { contains: search, mode: 'insensitive' } },
                { endpoint: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.auditLog.count({ where }),
        ]);
        return {
            logs,
            total,
            limit,
            offset,
            hasMore: offset + logs.length < total,
        };
    }
    /**
     * Get audit log statistics
     */
    static async getStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const [totalLogs, successCount, failedCount, actionBreakdown, recentCritical,] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.count({ where: { ...where, status: AuditStatus.SUCCESS } }),
            prisma.auditLog.count({ where: { ...where, status: AuditStatus.FAILED } }),
            prisma.auditLog.groupBy({
                by: ['action'],
                where,
                _count: true,
                orderBy: { _count: { action: 'desc' } },
                take: 10,
            }),
            prisma.auditLog.findMany({
                where: {
                    ...where,
                    action: {
                        in: [
                            AuditAction.SECURITY_ALERT,
                            AuditAction.UNAUTHORIZED_ACCESS,
                            AuditAction.USER_DELETED,
                            AuditAction.DOCUMENT_DELETED,
                        ],
                    },
                },
                orderBy: { timestamp: 'desc' },
                take: 5,
            }),
        ]);
        return {
            totalLogs,
            successCount,
            failedCount,
            successRate: totalLogs > 0 ? ((successCount / totalLogs) * 100).toFixed(2) : '100',
            actionBreakdown: actionBreakdown.map((item) => ({
                action: item.action,
                count: item._count,
            })),
            recentCritical,
        };
    }
    /**
     * Get logs for a specific user
     */
    static async getUserLogs(userId, limit = 20) {
        return prisma.auditLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
    /**
     * Get recent activity logs (for dashboard)
     */
    static async getRecentActivity(limit = 10) {
        return prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
    /**
     * Delete old audit logs (for cleanup/retention policy)
     */
    static async deleteOlderThan(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
}
//# sourceMappingURL=auditService.js.map