
export type FeedbackCategory = 'Feature Request' | 'Bug Report' | 'UI/UX Improvement' | 'Performance' | 'General Suggestion';

export type FeedbackStatus = 'Pending' | 'Under Review' | 'Planned' | 'Implemented' | 'Declined';

export interface FeedbackSubmission {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High';
}

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'Feature Request',
  'Bug Report',
  'UI/UX Improvement',
  'Performance',
  'General Suggestion'
];

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  'Pending': 'text-slate-500 bg-slate-100',
  'Under Review': 'text-amber-600 bg-amber-50',
  'Planned': 'text-brand-blue bg-brand-light',
  'Implemented': 'text-emerald-600 bg-emerald-50',
  'Declined': 'text-red-500 bg-red-50'
};

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. All feedback data is now fetched from the API.
// See: genzura-web/src/api/services/feedback.service.ts
// ──────────────────────────────────────────────────────────────────────────────
