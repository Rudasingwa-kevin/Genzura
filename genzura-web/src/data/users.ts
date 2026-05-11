export type UserRole = 'Admin' | 'Senior Attorney' | 'Attorney' | 'Paralegal' | 'Support';
export type UserStatus = 'Active' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  initials: string;
}

export const USERS: User[] = [
  { id: 'U-101', name: 'James Wilson', email: 'j.wilson@genzura.law', role: 'Senior Attorney', status: 'Active', lastActive: '2 mins ago', initials: 'JW' },
  { id: 'U-102', name: 'Sarah Miller', email: 's.miller@genzura.law', role: 'Admin', status: 'Active', lastActive: 'Now', initials: 'SM' },
  { id: 'U-103', name: 'David Chen', email: 'd.chen@genzura.law', role: 'Attorney', status: 'Active', lastActive: '3 hours ago', initials: 'DC' },
  { id: 'U-104', name: 'Elena Rodriguez', email: 'e.rodriguez@genzura.law', role: 'Paralegal', status: 'Active', lastActive: 'Yesterday', initials: 'ER' },
  { id: 'U-105', name: 'Marcus Wright', email: 'm.wright@genzura.law', role: 'Attorney', status: 'Invited', lastActive: 'Never', initials: 'MW' },
  { id: 'U-106', name: 'Laura Knight', email: 'l.knight@genzura.law', role: 'Support', status: 'Active', lastActive: '5 hours ago', initials: 'LK' },
  { id: 'U-107', name: 'Kevin Thorne', email: 'k.thorne@genzura.law', role: 'Senior Attorney', status: 'Suspended', lastActive: '2 weeks ago', initials: 'KT' },
];
