import { Request, Response } from 'express';
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
      const { caseId, name, type, size } = req.body;
      const document = await DocumentService.createDocument({
        caseId,
        name,
        type,
        size,
        uploadedById: req.user.id
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
