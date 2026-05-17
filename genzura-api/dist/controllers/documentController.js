import path from 'path';
import { DocumentService } from '../services/documentService.js';
export class DocumentController {
    static async getAll(req, res) {
        try {
            const documents = await DocumentService.getAllDocuments();
            res.json(documents);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getByCase(req, res) {
        try {
            const { caseId } = req.params;
            const documents = await DocumentService.getCaseDocuments(caseId);
            res.json(documents);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            const { caseId } = req.body;
            const file = req.file;
            if (!caseId) {
                return res.status(400).json({ error: 'Case ID is required' });
            }
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Check file size (should be caught by multer, but double-check)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                return res.status(400).json({ error: 'File size exceeds 100MB limit' });
            }
            // Map extension to DocumentType
            let type = 'PDF';
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext === '.docx' || ext === '.doc')
                type = 'DOCX';
            if (ext === '.xlsx' || ext === '.xls')
                type = 'XLSX';
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg')
                type = 'IMG';
            const fileSizeMB = file.size / 1024 / 1024;
            const sizeStr = fileSizeMB >= 1
                ? `${fileSizeMB.toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(2)} KB`;
            const document = await DocumentService.createDocument({
                caseId,
                name: file.originalname,
                type,
                size: sizeStr,
                uploadedById: req.user.id,
                fileUrl: `/uploads/${file.filename}`
            });
            res.status(201).json(document);
        }
        catch (error) {
            console.error('[DocumentController] Upload error:', error);
            res.status(500).json({ error: error.message || 'Failed to upload document' });
        }
    }
    static async remove(req, res) {
        try {
            const { id } = req.params;
            await DocumentService.deleteDocument(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=documentController.js.map