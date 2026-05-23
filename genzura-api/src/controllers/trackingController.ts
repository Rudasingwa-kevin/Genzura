import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DateService } from '../utils/dateUtils.js';

const prisma = new PrismaClient();

export class TrackingController {
  /**
   * Track document download
   */
  static async trackDocumentDownload(req: any, res: Response) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get document info
      const document = await prisma.caseDocument.findUnique({
        where: { id: documentId },
        include: { case: true }
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Create timeline entry
      await prisma.timelineEvent.create({
        data: {
          caseId: document.caseId,
          authorId: userId,
          type: 'document',
          description: `${user?.name} downloaded "${document.name}"`,
          timestamp: DateService.now()
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking document download:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Track case summary PDF export
   */
  static async trackPDFExport(req: any, res: Response) {
    try {
      const { caseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get case info
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        select: { id: true, title: true }
      });

      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Create timeline entry
      await prisma.timelineEvent.create({
        data: {
          caseId,
          authorId: userId,
          type: 'document',
          description: `${user?.name} exported case summary PDF`,
          timestamp: DateService.now()
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking PDF export:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
