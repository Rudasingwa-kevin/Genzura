import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { DocumentService } from '../services/documentService.js';
import { SettingsService } from '../services/settingsService.js';
import { SubscriptionService } from '../services/subscriptionService.js';
import { S3Service } from '../services/s3Service.js';

export class DocumentController {
  static async getAll(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const documents = await DocumentService.getAllDocuments(userId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByCase(req: any, res: Response) {
    try {
      const { caseId } = req.params;
      const userId = req.user?.id;
      const documents = await DocumentService.getCaseDocuments(caseId, userId);
      res.json(documents);
    } catch (error: any) {
      // Handle permission errors with 403
      if (error.message.includes('permission')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const { caseId } = req.body;
      const file = req.file;

      if (!caseId) {
        return res.status(400).json({ error: 'Case ID is required' });
      }

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check subscription enforcement
      const subscriptionStatus = await SettingsService.getSubscriptionStatus();

      if (subscriptionStatus === 'ACTIVE') {
        const canUpload = await SubscriptionService.canUploadDocument(req.user.id);
        if (!canUpload.allowed) {
          // If S3 is configured, we might have uploaded file locally in multer middleware.
          // Delete local file to avoid residue.
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          return res.status(403).json({
            error: canUpload.message,
            code: 'SUBSCRIPTION_EXPIRED'
          });
        }
      }

      // Check file size (should be caught by multer, but double-check)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ error: 'File size exceeds 100MB limit' });
      }

      // Map extension to DocumentType
      let type: any = 'PDF';
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.docx' || ext === '.doc') type = 'DOCX';
      if (ext === '.xlsx' || ext === '.xls') type = 'XLSX';
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') type = 'IMG';

      const fileSizeMB = file.size / 1024 / 1024;
      const sizeStr = fileSizeMB >= 1
        ? `${fileSizeMB.toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(2)} KB`;

      // Upload to S3 if configured
      const fileUrl = `/uploads/${file.filename}`;
      if (S3Service.isConfigured()) {
        try {
          await S3Service.uploadFile(file.path, fileUrl, file.mimetype);
        } catch (s3Error) {
          console.error('[DocumentController] S3 upload error, keeping local file as backup:', s3Error);
          // Don't fail the request, fallback to keeping the local file
        }
      }

      const document = await DocumentService.createDocument({
        caseId,
        name: file.originalname,
        type,
        size: sizeStr,
        uploadedById: req.user.id,
        fileUrl
      });
      res.status(201).json(document);
    } catch (error: any) {
      console.error('[DocumentController] Upload error:', error);
      // Clean up local temp file on error if it still exists
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          console.error('[DocumentController] Failed to clean up temp file on error:', cleanupErr);
        }
      }
      res.status(500).json({ error: error.message || 'Failed to upload document' });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedDoc = await DocumentService.deleteDocument(id);
      
      if (deletedDoc && deletedDoc.fileUrl) {
        if (S3Service.isConfigured()) {
          await S3Service.deleteFile(deletedDoc.fileUrl);
        } else {
          const localPath = path.join(process.cwd(), deletedDoc.fileUrl);
          if (fs.existsSync(localPath)) {
            try {
              fs.unlinkSync(localPath);
            } catch (err) {
              console.error('[DocumentController] Failed to delete local file:', err);
            }
          }
        }
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

