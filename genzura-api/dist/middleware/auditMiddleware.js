import { AuditService } from '../services/auditService.js';
import { AuditAction, AuditStatus } from '@prisma/client';
/**
 * Extract IP address from request
 */
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress || 'unknown';
    return ip;
};
/**
 * Map HTTP methods and endpoints to audit actions
 */
const mapRouteToAuditAction = (method, path) => {
    const normalizedPath = path.toLowerCase();
    // User management
    if (method === 'POST' && normalizedPath.includes('/users') && !normalizedPath.includes('login')) {
        return AuditAction.USER_CREATED;
    }
    if (method === 'PUT' && normalizedPath.includes('/users/')) {
        return AuditAction.USER_UPDATED;
    }
    if (method === 'DELETE' && normalizedPath.includes('/users/')) {
        return AuditAction.USER_DELETED;
    }
    if (method === 'POST' && normalizedPath.includes('/invite')) {
        return AuditAction.USER_INVITED;
    }
    // Case management
    if (method === 'POST' && normalizedPath.includes('/cases')) {
        return AuditAction.CASE_CREATED;
    }
    if (method === 'PUT' && normalizedPath.includes('/cases/')) {
        return AuditAction.CASE_UPDATED;
    }
    if (method === 'DELETE' && normalizedPath.includes('/cases/')) {
        return AuditAction.CASE_DELETED;
    }
    if (method === 'PATCH' && normalizedPath.includes('/cases/') && normalizedPath.includes('status')) {
        return AuditAction.CASE_STATUS_CHANGED;
    }
    // Document management
    if (method === 'POST' && normalizedPath.includes('/documents')) {
        return AuditAction.DOCUMENT_UPLOADED;
    }
    if (method === 'GET' && normalizedPath.includes('/documents/') && normalizedPath.includes('download')) {
        return AuditAction.DOCUMENT_DOWNLOADED;
    }
    if (method === 'DELETE' && normalizedPath.includes('/documents/')) {
        return AuditAction.DOCUMENT_DELETED;
    }
    // Client management
    if (method === 'POST' && normalizedPath.includes('/clients')) {
        return AuditAction.CLIENT_CREATED;
    }
    if (method === 'PUT' && normalizedPath.includes('/clients/')) {
        return AuditAction.CLIENT_UPDATED;
    }
    if (method === 'DELETE' && normalizedPath.includes('/clients/')) {
        return AuditAction.CLIENT_DELETED;
    }
    // Settings
    if (method === 'PUT' && normalizedPath.includes('/settings')) {
        return AuditAction.SETTINGS_UPDATED;
    }
    // Export operations
    if (method === 'GET' && normalizedPath.includes('/export')) {
        return AuditAction.EXPORT_DATA;
    }
    // Auth events
    if (method === 'POST' && normalizedPath.includes('/login')) {
        return AuditAction.USER_LOGIN;
    }
    if (method === 'POST' && normalizedPath.includes('/logout')) {
        return AuditAction.USER_LOGOUT;
    }
    if (method === 'POST' && normalizedPath.includes('/reset-password')) {
        return AuditAction.USER_PASSWORD_RESET;
    }
    return null;
};
/**
 * Generate description for audit log based on request
 */
const generateDescription = (req, action) => {
    const user = req.user;
    const userName = user?.name || 'Unknown user';
    const method = req.method;
    const path = req.path;
    if (action === AuditAction.USER_CREATED) {
        const { name, email, role } = req.body;
        return `${userName} created user account for ${name} (${email}) with role ${role}`;
    }
    if (action === AuditAction.USER_INVITED) {
        const { email, role } = req.body;
        return `${userName} invited ${email} with role ${role}`;
    }
    if (action === AuditAction.CASE_CREATED) {
        const { title, caseNumber } = req.body;
        return `${userName} created case ${caseNumber}: ${title}`;
    }
    if (action === AuditAction.CLIENT_CREATED) {
        const { name, email } = req.body;
        return `${userName} created client ${name} (${email})`;
    }
    if (action === AuditAction.DOCUMENT_UPLOADED) {
        const { name } = req.body;
        return `${userName} uploaded document: ${name || 'Untitled'}`;
    }
    if (action === AuditAction.SETTINGS_UPDATED) {
        return `${userName} updated system settings`;
    }
    if (action === AuditAction.USER_LOGIN) {
        const { email } = req.body;
        return `User login: ${email}`;
    }
    // Generic descriptions
    return `${userName} performed ${action.toLowerCase().replace(/_/g, ' ')} on ${path}`;
};
/**
 * Extract resource information from request
 */
const extractResourceInfo = (req) => {
    const path = req.path;
    if (path.includes('/users/')) {
        return { resourceType: 'User', resourceId: req.params.id || req.params.userId };
    }
    if (path.includes('/cases/')) {
        return { resourceType: 'Case', resourceId: req.params.id || req.params.caseId };
    }
    if (path.includes('/documents/')) {
        return { resourceType: 'Document', resourceId: req.params.id || req.params.documentId };
    }
    if (path.includes('/clients/')) {
        return { resourceType: 'Client', resourceId: req.params.id || req.params.clientId };
    }
    return {};
};
/**
 * Main audit logging middleware
 * Auto-logs admin actions and critical operations
 */
export const auditLogger = () => {
    return async (req, res, next) => {
        const user = req.user;
        const startTime = Date.now();
        // Store original response methods
        const originalJson = res.json.bind(res);
        const originalSend = res.send.bind(res);
        let responseBody = null;
        let responseLogged = false;
        // Intercept response to capture result
        res.json = function (body) {
            responseBody = body;
            return originalJson(body);
        };
        res.send = function (body) {
            if (!responseLogged) {
                responseBody = body;
            }
            return originalSend(body);
        };
        // Log audit after response is sent
        res.on('finish', async () => {
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            // Determine if this action should be logged
            const auditAction = mapRouteToAuditAction(req.method, req.path);
            // Only log specific admin actions and critical operations
            if (!auditAction) {
                return;
            }
            // Skip logging for read-only operations that succeeded (unless they're admin routes)
            const isReadOnly = req.method === 'GET';
            const isAdminRoute = req.path.startsWith('/api/admin/');
            if (isReadOnly && !isAdminRoute && statusCode >= 200 && statusCode < 300) {
                return;
            }
            // Determine status
            let auditStatus;
            let errorMessage;
            if (statusCode >= 200 && statusCode < 300) {
                auditStatus = AuditStatus.SUCCESS;
            }
            else if (statusCode >= 400) {
                auditStatus = AuditStatus.FAILED;
                // Extract error message
                if (typeof responseBody === 'object' && responseBody?.error) {
                    errorMessage = responseBody.error;
                }
                else if (typeof responseBody === 'string') {
                    errorMessage = responseBody;
                }
                else {
                    errorMessage = `Request failed with status ${statusCode}`;
                }
            }
            else {
                auditStatus = AuditStatus.PENDING;
            }
            // Extract resource information
            const { resourceType, resourceId } = extractResourceInfo(req);
            // Generate description
            const description = generateDescription(req, auditAction);
            // Create audit log
            try {
                await AuditService.log({
                    action: auditAction,
                    description,
                    userId: user?.id,
                    userName: user?.name || 'System',
                    userRole: user?.role || 'Unknown',
                    ipAddress: getClientIp(req),
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    endpoint: req.originalUrl || req.url,
                    status: auditStatus,
                    errorMessage,
                    resourceType,
                    resourceId,
                    metadata: {
                        statusCode,
                        duration,
                        bodySize: JSON.stringify(req.body).length,
                    },
                });
            }
            catch (error) {
                console.error('[AuditMiddleware] Failed to create audit log:', error);
            }
        });
        next();
    };
};
/**
 * Middleware specifically for admin routes
 * Logs ALL admin actions regardless of method
 */
export const auditAdminAction = () => {
    return async (req, res, next) => {
        const user = req.user;
        // Store response details
        const originalJson = res.json.bind(res);
        let responseBody = null;
        res.json = function (body) {
            responseBody = body;
            return originalJson(body);
        };
        // Log after response
        res.on('finish', async () => {
            const statusCode = res.statusCode;
            // Determine action from route
            const auditAction = mapRouteToAuditAction(req.method, req.path) || AuditAction.SETTINGS_UPDATED;
            try {
                await AuditService.log({
                    action: auditAction,
                    description: generateDescription(req, auditAction),
                    userId: user?.id,
                    userName: user?.name || 'Admin',
                    userRole: user?.role || 'Admin',
                    ipAddress: getClientIp(req),
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    endpoint: req.originalUrl || req.url,
                    status: statusCode >= 200 && statusCode < 300 ? AuditStatus.SUCCESS : AuditStatus.FAILED,
                    errorMessage: statusCode >= 400 ? responseBody?.error : undefined,
                    resourceType: extractResourceInfo(req).resourceType,
                    resourceId: extractResourceInfo(req).resourceId,
                    metadata: {
                        requestBody: req.body,
                        responseStatus: statusCode,
                    },
                });
            }
            catch (error) {
                console.error('[AuditMiddleware] Failed to log admin action:', error);
            }
        });
        next();
    };
};
/**
 * Manual audit log helper for use in controllers
 */
export const createAuditLog = async (req, action, description, metadata) => {
    try {
        const user = req.user;
        await AuditService.log({
            action,
            description,
            userId: user?.id,
            userName: user?.name || 'System',
            userRole: user?.role || 'System',
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'],
            method: req.method,
            endpoint: req.originalUrl || req.url,
            metadata,
        });
    }
    catch (error) {
        console.error('[AuditMiddleware] Failed to create audit log:', error);
    }
};
//# sourceMappingURL=auditMiddleware.js.map