import { AuditService } from '../services/auditService.js';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../services/s3Service.js';
const prisma = new PrismaClient();
export class AdminController {
    /**
     * GET /api/admin/audit
     * Get audit logs with filtering
     */
    static async getAuditLogs(req, res) {
        try {
            const { action, userId, status, resourceType, search, limit, offset, startDate, endDate, } = req.query;
            const result = await AuditService.getAll({
                action: action,
                userId: userId,
                status: status,
                resourceType: resourceType,
                search: search,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json(result);
        }
        catch (error) {
            console.error('[AdminController] Get audit logs error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/admin/audit/stats
     * Get audit log statistics
     */
    static async getAuditStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const stats = await AuditService.getStats(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.json(stats);
        }
        catch (error) {
            console.error('[AdminController] Get audit stats error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/admin/licenses
     * Get license seat usage
     */
    static async getLicenses(req, res) {
        try {
            // Count users by role
            const [total, attorneys, seniorAttorneys, paralegals, support, admins,] = await Promise.all([
                prisma.user.count({ where: { status: 'Active' } }),
                prisma.user.count({ where: { role: 'Attorney', status: 'Active' } }),
                prisma.user.count({ where: { role: 'Senior_Attorney', status: 'Active' } }),
                prisma.user.count({ where: { role: 'Paralegal', status: 'Active' } }),
                prisma.user.count({ where: { role: 'Support', status: 'Active' } }),
                prisma.user.count({ where: { role: 'Admin', status: 'Active' } }),
            ]);
            // Calculate based on real subscription or hardcoded limit
            const maxSeats = 50; // This could come from a subscription setting
            res.json({
                total: maxSeats,
                used: total,
                available: maxSeats - total,
                percentUsed: ((total / maxSeats) * 100).toFixed(1),
                breakdown: {
                    attorneys: attorneys + seniorAttorneys,
                    paralegals,
                    support,
                    admins,
                },
            });
        }
        catch (error) {
            console.error('[AdminController] Get licenses error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/admin/storage
     * Get S3 storage metrics
     */
    static async getStorageMetrics(req, res) {
        try {
            if (!S3Service.isConfigured()) {
                return res.json({
                    configured: false,
                    totalGB: 0,
                    usedGB: 0,
                    percentUsed: 0,
                    fileCount: 0,
                });
            }
            // Count documents in database (as proxy for file count)
            const fileCount = await prisma.caseDocument.count();
            // Calculate total size from database
            const documents = await prisma.caseDocument.findMany({
                select: { size: true },
            });
            // Parse sizes (format: "1.5 MB" or "500 KB")
            let totalBytes = 0;
            documents.forEach((doc) => {
                const match = doc.size.match(/([\d.]+)\s*(KB|MB|GB)/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2].toUpperCase();
                    if (unit === 'KB')
                        totalBytes += value * 1024;
                    else if (unit === 'MB')
                        totalBytes += value * 1024 * 1024;
                    else if (unit === 'GB')
                        totalBytes += value * 1024 * 1024 * 1024;
                }
            });
            const totalGB = totalBytes / (1024 * 1024 * 1024);
            const maxGB = 100; // Or from subscription settings
            res.json({
                configured: true,
                totalGB: maxGB,
                usedGB: parseFloat(totalGB.toFixed(2)),
                percentUsed: parseFloat(((totalGB / maxGB) * 100).toFixed(1)),
                fileCount,
                bucketName: process.env.AWS_S3_BUCKET,
            });
        }
        catch (error) {
            console.error('[AdminController] Get storage metrics error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /api/admin/health
     * Get system health metrics
     */
    static async getSystemHealth(req, res) {
        try {
            const startTime = Date.now();
            // Test database connection
            await prisma.$queryRaw `SELECT 1`;
            const dbLatency = Date.now() - startTime;
            // Calculate uptime (simple version - process uptime)
            const uptimeSeconds = process.uptime();
            const uptimeHours = uptimeSeconds / 3600;
            const uptimeDays = uptimeHours / 24;
            // Mock uptime percentage (in production, use actual monitoring data)
            const uptimePercentage = 99.9;
            // Get user count as health indicator
            const activeUsers = await prisma.user.count({ where: { status: 'Active' } });
            res.json({
                status: 'operational',
                uptime: uptimePercentage,
                uptimeDays: parseFloat(uptimeDays.toFixed(1)),
                services: {
                    database: {
                        status: dbLatency < 100 ? 'healthy' : 'degraded',
                        latency: dbLatency,
                        connections: activeUsers, // Simplified
                    },
                    api: {
                        status: 'healthy',
                        responseTime: dbLatency,
                    },
                    storage: {
                        status: S3Service.isConfigured() ? 'healthy' : 'not_configured',
                    },
                },
            });
        }
        catch (error) {
            console.error('[AdminController] Get system health error:', error);
            res.status(500).json({
                status: 'error',
                error: error.message,
            });
        }
    }
    /**
     * GET /api/admin/infrastructure
     * Get infrastructure status
     */
    static async getInfrastructure(req, res) {
        try {
            // Check database
            const dbStart = Date.now();
            await prisma.$queryRaw `SELECT 1`;
            const dbTime = Date.now() - dbStart;
            // Check connections
            const activeConnections = await prisma.user.count({ where: { status: 'Active' } });
            res.json({
                compute: {
                    status: 'operational',
                    cpu: process.cpuUsage().user / 1000000, // Convert to seconds
                    memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                },
                database: {
                    status: dbTime < 100 ? 'operational' : 'degraded',
                    connections: activeConnections,
                    queryTime: dbTime,
                },
                auth: {
                    status: 'operational',
                    activeTokens: activeConnections, // Simplified
                },
            });
        }
        catch (error) {
            console.error('[AdminController] Get infrastructure error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=adminController.js.map