// ─── Types ────────────────────────────────────────────────────────────────────
export type CaseStatus   = 'Active' | 'Pending' | 'Resolved' | 'Archived';
export type CasePriority = 'High' | 'Medium' | 'Low';
export type CaseType     = 'Litigation' | 'Corporate' | 'Compliance' | 'IP' | 'Employment' | 'M&A' | 'Real Estate';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface TimelineEvent {
  id: string | number;
  type: 'filed' | 'status' | 'meeting' | 'document' | 'note' | 'milestone';
  description: string;
  author: User | string;
  timestamp: string;
}

export interface CaseDocument {
  id: string | number;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'IMG';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CaseNote {
  id: string | number;
  author: User | string;
  initials?: string;
  color?: string;
  text: string;
  timestamp: string;
}

export interface TeamMember {
  user?: User;
  name?: string;
  role: string;
  initials?: string;
}

export interface CaseDetail {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  attorney: User | string;
  status: CaseStatus;
  priority: CasePriority;
  type: CaseType;
  deadline: string;
  filedDate: string;
  updated: string;
  description: string;
  team: TeamMember[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  notes: CaseNote[];
}

// ─── Style Constants ──────────────────────────────────────────────────────────

export const STATUS_STYLES: Record<CaseStatus, string> = {
  Active: 'bg-emerald-100/60 text-emerald-700',
  Pending: 'bg-amber-100/60 text-amber-700',
  Resolved: 'bg-slate-100/60 text-slate-600',
  Archived: 'bg-slate-100/60 text-slate-500',
};

export const STATUS_DOT: Record<CaseStatus, string> = {
  Active: 'bg-emerald-500',
  Pending: 'bg-amber-500',
  Resolved: 'bg-slate-400',
  Archived: 'bg-slate-400',
};

export const PRIORITY_STYLES: Record<CasePriority, string> = {
  High: 'bg-red-50 text-red-600 border-red-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. All case data is now fetched from the API.
// See: genzura-web/src/api/services/case.service.ts
// ──────────────────────────────────────────────────────────────────────────────
