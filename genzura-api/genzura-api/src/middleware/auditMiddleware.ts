import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService.js';
import { AuditAction } from '@prisma/client';

/**
 * Extract IP address from request
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress || 'unknown';
  return ip;
};

/**
 * Create audit log helper
 */
export const createAuditLog = async (
  req: Request,
  action: AuditAction,
  description: string,
  metadata?: Record<string, any>
) => {
  try {
    const user = (req as any).user;

    await AuditService.createLog({
      action,
      description,
      userId: user?.id,
      userName: user?.name || 'System',
      userRole: user?.role || 'System',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      metadata,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Middleware to auto-log certain actions
 */
export const auditLog = (action: AuditAction, getDescription: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Continue with the request first
    next();

    // Log audit after response is sent
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await createAuditLog(req, action, getDescription(req));
        } catch (error) {
          console.error('Audit log middleware error:', error);
        }
      }
    });
  };
};
