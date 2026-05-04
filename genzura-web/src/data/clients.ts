export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  industry: string;
  cases: number;
  activeCases: number;
  lastActivity: string;
  initials: string;
  color: string;
  since: string;
  recentCases: { id: string; title: string; status: string; date: string }[];
  notes: { id: string; text: string; author: string; date: string }[];
}

export const CLIENTS: Client[] = [
  {
    id: 1, name: 'Apex Global Inc.', company: 'Apex Global', email: 'contact@apex.com', phone: '+1 (555) 010-2030',
    address: '142 Commerce Ave, New York, NY 10001', industry: 'Corporate', cases: 6, activeCases: 3,
    lastActivity: '2 hours ago', initials: 'AG', color: 'bg-blue-500', since: 'January 2023',
    recentCases: [
      { id: 'CZ-882', title: 'Corporate Restructuring', status: 'Active', date: 'May 1, 2026' },
      { id: 'CZ-870', title: 'IP Licensing Deal', status: 'Resolved', date: 'Mar 15, 2026' },
      { id: 'CZ-855', title: 'Board Governance Review', status: 'Resolved', date: 'Jan 10, 2026' },
    ],
    notes: [
      { id: 'n1', text: 'Client requested urgent update on CZ-882 restructuring timeline.', author: 'James W.', date: 'May 3, 2026' },
      { id: 'n2', text: 'Scheduled Q2 review call for next Tuesday at 10 AM.', author: 'Sarah O.', date: 'Apr 30, 2026' },
    ],
  },
  {
    id: 2, name: 'NextGen Systems', company: 'NextGen Systems', email: 'legal@nextgen.io', phone: '+1 (555) 020-3040',
    address: '500 Tech Blvd, San Francisco, CA 94105', industry: 'Technology', cases: 3, activeCases: 1,
    lastActivity: '5 hours ago', initials: 'NS', color: 'bg-violet-500', since: 'March 2024',
    recentCases: [
      { id: 'CZ-879', title: 'Intellectual Property Audit', status: 'Pending', date: 'Apr 25, 2026' },
      { id: 'CZ-861', title: 'Data Privacy Compliance', status: 'Resolved', date: 'Feb 2, 2026' },
    ],
    notes: [
      { id: 'n3', text: 'Follow up on NDA submission with their legal team.', author: 'Elena R.', date: 'May 2, 2026' },
    ],
  },
  {
    id: 3, name: 'Horizon Partners', company: 'Horizon Partners LLP', email: 'info@horizon.com', phone: '+1 (555) 030-4050',
    address: '88 Finance St, Chicago, IL 60601', industry: 'Finance', cases: 5, activeCases: 2,
    lastActivity: 'Yesterday', initials: 'HP', color: 'bg-emerald-500', since: 'June 2022',
    recentCases: [
      { id: 'CZ-875', title: 'Compliance Verification', status: 'Active', date: 'Apr 15, 2026' },
      { id: 'CZ-860', title: 'Fund Audit', status: 'Resolved', date: 'Feb 28, 2026' },
    ],
    notes: [
      { id: 'n4', text: 'Client is happy with compliance case progress.', author: 'James W.', date: 'Apr 28, 2026' },
    ],
  },
  {
    id: 4, name: 'Silverline Law', company: 'Silverline Law Firm', email: 'partners@silverline.law', phone: '+1 (555) 040-5060',
    address: '22 Legal Row, Boston, MA 02101', industry: 'Legal', cases: 8, activeCases: 0,
    lastActivity: '2 days ago', initials: 'SL', color: 'bg-slate-500', since: 'September 2021',
    recentCases: [
      { id: 'CZ-871', title: 'Litigation Strategy', status: 'Resolved', date: 'Mar 10, 2026' },
      { id: 'CZ-845', title: 'Contract Dispute Resolution', status: 'Resolved', date: 'Jan 20, 2026' },
    ],
    notes: [
      { id: 'n5', text: 'All outstanding cases resolved. No new matters pending.', author: 'Admin', date: 'Apr 1, 2026' },
    ],
  },
  {
    id: 5, name: 'Estate Mgmt Co.', company: 'Estate Management Co.', email: 'ops@estatemgmt.com', phone: '+1 (555) 050-6070',
    address: '37 Property Lane, Miami, FL 33101', industry: 'Real Estate', cases: 4, activeCases: 2,
    lastActivity: '3 days ago', initials: 'EM', color: 'bg-amber-500', since: 'November 2023',
    recentCases: [
      { id: 'CZ-868', title: 'Asset Recovery Plan', status: 'Active', date: 'Apr 10, 2026' },
      { id: 'CZ-852', title: 'Lease Agreement Review', status: 'Resolved', date: 'Feb 14, 2026' },
    ],
    notes: [
      { id: 'n6', text: 'Asset valuation report received. Will review in next session.', author: 'Sarah O.', date: 'Apr 27, 2026' },
    ],
  },
  {
    id: 6, name: 'TechVenture Ltd.', company: 'TechVenture Ltd.', email: 'hello@techventure.co', phone: '+1 (555) 060-7080',
    address: '99 Startup Hub, Austin, TX 73301', industry: 'Technology', cases: 2, activeCases: 1,
    lastActivity: '4 days ago', initials: 'TV', color: 'bg-rose-500', since: 'February 2025',
    recentCases: [
      { id: 'CZ-861', title: 'Merger & Acquisition Review', status: 'Pending', date: 'Apr 5, 2026' },
    ],
    notes: [
      { id: 'n7', text: 'Client onboarding complete. First engagement call scheduled.', author: 'Elena R.', date: 'Feb 20, 2025' },
    ],
  },
];
