export type DocType = 'PDF' | 'DOCX' | 'XLSX' | 'JPG';

export interface DocumentInfo {
  id: string;
  name: string;
  type: DocType;
  size: string; // e.g. "2.4 MB"
  caseId?: string;
  clientName?: string;
  uploadDate: string;
  uploader: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. All document data is now fetched from the API.
// See: genzura-web/src/api/services/document.service.ts
// ──────────────────────────────────────────────────────────────────────────────
