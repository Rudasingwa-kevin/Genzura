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

export const DOCUMENTS: DocumentInfo[] = [
  {
    id: 'doc-1',
    name: 'Motion for Summary Judgment.pdf',
    type: 'PDF',
    size: '1.2 MB',
    caseId: 'CZ-882',
    clientName: 'Apex Global',
    uploadDate: '2026-05-01',
    uploader: 'James W.'
  },
  {
    id: 'doc-2',
    name: 'Settlement Agreement v3.docx',
    type: 'DOCX',
    size: '450 KB',
    caseId: 'CZ-879',
    clientName: 'Horizon Partners',
    uploadDate: '2026-04-28',
    uploader: 'Sarah O.'
  },
  {
    id: 'doc-3',
    name: 'Financial Disclosure Q1.xlsx',
    type: 'XLSX',
    size: '3.4 MB',
    caseId: 'CZ-875',
    clientName: 'Nexus Tech',
    uploadDate: '2026-04-25',
    uploader: 'Elena R.'
  },
  {
    id: 'doc-4',
    name: 'Evidence_Photo_Site_A.jpg',
    type: 'JPG',
    size: '5.8 MB',
    caseId: 'CZ-882',
    clientName: 'Apex Global',
    uploadDate: '2026-04-20',
    uploader: 'James W.'
  },
  {
    id: 'doc-5',
    name: 'Client Intake Form - BlueOak.pdf',
    type: 'PDF',
    size: '800 KB',
    clientName: 'BlueOak Corp',
    uploadDate: '2026-05-02',
    uploader: 'Admin'
  },
  {
    id: 'doc-6',
    name: 'Affidavit of Support.docx',
    type: 'DOCX',
    size: '320 KB',
    caseId: 'CZ-860',
    clientName: 'Starlight Media',
    uploadDate: '2026-04-15',
    uploader: 'Elena R.'
  },
  {
    id: 'doc-7',
    name: 'Court Order - Extension.pdf',
    type: 'PDF',
    size: '1.5 MB',
    caseId: 'CZ-875',
    clientName: 'Nexus Tech',
    uploadDate: '2026-04-10',
    uploader: 'James W.'
  }
];
