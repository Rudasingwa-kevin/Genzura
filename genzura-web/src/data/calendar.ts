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

// Current month helper for mock data
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

export const EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Initial Hearing - Apex Global',
    type: 'Court Date',
    date: `${currentYear}-${currentMonth}-15`,
    time: '09:00 AM',
    caseId: 'CZ-882',
    color: 'bg-red-500',
    description: 'Federal District Court, Room 4B. Required attendance: James Wilson.',
  },
  {
    id: 'evt-2',
    title: 'Client Strategy Session',
    type: 'Meeting',
    date: `${currentYear}-${currentMonth}-08`,
    time: '02:00 PM',
    caseId: 'CZ-879',
    color: 'bg-brand-blue',
  },
  {
    id: 'evt-3',
    title: 'Submit Briefing Docs',
    type: 'Deadline',
    date: `${currentYear}-${currentMonth}-22`,
    time: '05:00 PM',
    caseId: 'CZ-875',
    color: 'bg-amber-500',
  },
  {
    id: 'evt-4',
    title: 'Deposition Preparation',
    type: 'Meeting',
    date: `${currentYear}-${currentMonth}-15`,
    time: '01:00 PM',
    caseId: 'CZ-882',
    color: 'bg-brand-blue',
  },
  {
    id: 'evt-5',
    title: 'Quarterly Review',
    type: 'Meeting',
    date: `${currentYear}-${currentMonth}-28`,
    time: '10:00 AM',
    color: 'bg-emerald-500',
  },
];

export const TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Draft settlement proposal for Horizon Partners',
    dueDate: 'Today',
    completed: false,
    priority: 'High',
    assignee: 'James W.',
  },
  {
    id: 'tsk-2',
    title: 'Review IP audit findings',
    dueDate: 'Tomorrow',
    completed: false,
    priority: 'Medium',
    assignee: 'Sarah O.',
  },
  {
    id: 'tsk-3',
    title: 'File extension request for CZ-875',
    dueDate: 'Next Week',
    completed: true,
    priority: 'Low',
    assignee: 'James W.',
  },
  {
    id: 'tsk-4',
    title: 'Client onboarding: BlueOak Corporation',
    dueDate: 'Next Week',
    completed: false,
    priority: 'High',
    assignee: 'Elena R.',
  },
];
