export type EventType = 'Court Date' | 'Meeting' | 'Deadline' | 'Filing';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO format or YYYY-MM-DD
  time: string;
  caseId?: string;
  color: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. Calendar events are generated from case deadlines.
// See: genzura-web/src/pages/CalendarPage.tsx
// Tasks feature is currently placeholder-only and not connected to backend.
// ──────────────────────────────────────────────────────────────────────────────
