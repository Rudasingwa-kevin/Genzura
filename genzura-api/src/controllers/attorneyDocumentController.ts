import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { S3Service } from '../services/s3Service.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export class AttorneyDocumentController {
  /**
   * Upload a professional document (CV, certificate, license, etc.)
   * POST /api/users/documents
   */
  static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user is an attorney
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || !['Attorney', 'Senior_Attorney'].includes(user.role)) {
        return res.status(403).json({ error: 'Only attorneys can upload documents' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { type, title, description, isPublic, issuedDate, issuer } = req.body;

      // Validate required fields
      if (!type || !title) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ error: 'Document type and title are required' });
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ error: 'File size must be less than 10MB' });
      }

      let fileUrl: string;

      // Upload to S3 if configured, otherwise use local storage
      if (S3Service.isConfigured()) {
        try {
          const s3Key = `documents/${userId}/${file.filename}`;
          fileUrl = await S3Service.uploadFile(file.path, s3Key, file.mimetype);

          // Delete local file after successful S3 upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.error('S3 upload failed, using local storage:', error);
          fileUrl = `/uploads/documents/${file.filename}`;
        }
      } else {
        fileUrl = `/uploads/documents/${file.filename}`;
      }

      // Create document record
      const document = await prisma.attorneyDocument.create({
        data: {
          attorneyId: userId,
          type,
          title,
          description: description || null,
          fileUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          isPublic: isPublic === 'true' || isPublic === true,
          issuedDate: issuedDate ? new Date(issuedDate) : null,
          issuer: issuer || null,
        },
      });

      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }

  /**
   * Get all documents for the authenticated user
   * GET /api/users/documents
   */
  static async getMyDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const documents = await prisma.attorneyDocument.findMany({
        where: { attorneyId: userId },
        orderBy: { uploadedAt: 'desc' },
      });

      res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  /**
   * Update document (toggle visibility, etc.)
   * PATCH /api/users/documents/:id
   */
  static async updateDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const { isPublic, title, description, issuer, issuedDate } = req.body;

      // Verify document belongs to user
      const existingDoc = await prisma.attorneyDocument.findUnique({
        where: { id },
      });

      if (!existingDoc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (existingDoc.attorneyId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to update this document' });
      }

      // Update document
      const document = await prisma.attorneyDocument.update({
        where: { id },
        data: {
          ...(typeof isPublic === 'boolean' && { isPublic }),
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(issuer !== undefined && { issuer }),
          ...(issuedDate && { issuedDate: new Date(issuedDate) }),
        },
      });

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }

  /**
   * Delete document
   * DELETE /api/users/documents/:id
   */
  static async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      // Verify document belongs to user
      const document = await prisma.attorneyDocument.findUnique({
        where: { id },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.attorneyId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this document' });
      }

      // Delete file from S3 if it's an S3 URL
      if (document.fileUrl.startsWith('http')) {
        try {
          await S3Service.deleteFile(document.fileUrl);
        } catch (error) {
          console.error('Failed to delete file from S3:', error);
          // Continue with database deletion even if S3 deletion fails
        }
      } else {
        // Delete local file
        const localPath = path.join(process.cwd(), document.fileUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }

      // Delete from database
      await prisma.attorneyDocument.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  /**
   * Download/get document
   * GET /api/users/documents/:id/download
   */
  static async downloadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // Get document
      const document = await prisma.attorneyDocument.findUnique({
        where: { id },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check permissions: owner can always download, others only if public
      if (document.attorneyId !== userId && !document.isPublic) {
        return res.status(403).json({ error: 'You do not have permission to access this document' });
      }

      // If S3 URL, generate presigned URL
      if (document.fileUrl.startsWith('http')) {
        try {
          const presignedUrl = await S3Service.getPresignedUrl(document.fileUrl);
          return res.json({
            success: true,
            data: {
              url: presignedUrl,
              fileName: document.fileName,
              mimeType: document.mimeType,
            },
          });
        } catch (error) {
          console.error('Failed to generate presigned URL:', error);
          return res.status(500).json({ error: 'Failed to generate download URL' });
        }
      }

      // Local file - send file directly
      const localPath = path.join(process.cwd(), document.fileUrl);
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.download(localPath, document.fileName);
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({ error: 'Failed to download document' });
    }
  }
}
