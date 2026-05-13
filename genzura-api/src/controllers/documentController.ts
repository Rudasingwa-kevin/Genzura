import { Request, Response } from 'express';
import path from 'path';
import { DocumentService } from '../services/documentService.js';

export class DocumentController {
  static async getByCase(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const documents = await DocumentService.getCaseDocuments(caseId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const { caseId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Map extension to DocumentType
      let type: any = 'PDF';
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.docx' || ext === '.doc') type = 'DOCX';
      if (ext === '.xlsx' || ext === '.xls') type = 'XLSX';
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') type = 'IMG';

      const document = await DocumentService.createDocument({
        caseId,
        name: file.originalname,
        type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadedById: req.user.id,
        fileUrl: `/uploads/${file.filename}`
      });
      res.status(201).json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DocumentService.deleteDocument(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
