
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

export const MOCK_FEEDBACK_HISTORY: FeedbackSubmission[] = [
  {
    id: 'FB-1001',
    userId: 'u1',
    userName: 'James Wilson',
    subject: 'Dark Mode Support',
    category: 'UI/UX Improvement',
    message: 'It would be great to have a high-contrast dark mode for late-night document reviews.',
    status: 'Planned',
    createdAt: '2026-05-08',
    priority: 'Medium'
  },
  {
    id: 'FB-1002',
    userId: 'u1',
    userName: 'James Wilson',
    subject: 'Bulk Document Export',
    category: 'Feature Request',
    message: 'I need a way to export all documents related to a case in a single zip file.',
    status: 'Implemented',
    createdAt: '2026-05-05',
    priority: 'High'
  },
  {
    id: 'FB-1003',
    userId: 'u1',
    userName: 'James Wilson',
    subject: 'Slow Analytics Loading',
    category: 'Performance',
    message: 'The analytics page takes a few seconds to calculate values when range is set to 1 year.',
    status: 'Under Review',
    createdAt: '2026-05-10',
    priority: 'Low'
  }
];

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  'Pending': 'text-slate-500 bg-slate-100',
  'Under Review': 'text-amber-600 bg-amber-50',
  'Planned': 'text-brand-blue bg-brand-light',
  'Implemented': 'text-emerald-600 bg-emerald-50',
  'Declined': 'text-red-500 bg-red-50'
};
