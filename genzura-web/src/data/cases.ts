// ─── Types ────────────────────────────────────────────────────────────────────
export type CaseStatus   = 'Active' | 'Pending' | 'Resolved';
export type CasePriority = 'High' | 'Medium' | 'Low';
export type CaseType     = 'Litigation' | 'Corporate' | 'Compliance' | 'IP' | 'Employment' | 'M&A' | 'Real Estate';

export interface TimelineEvent {
  id: number;
  type: 'filed' | 'status' | 'meeting' | 'document' | 'note' | 'milestone';
  description: string;
  author: string;
  timestamp: string;
}

export interface CaseDocument {
  id: number;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'IMG';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CaseNote {
  id: number;
  author: string;
  initials: string;
  color: string;
  text: string;
  timestamp: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

export interface CaseDetail {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  attorney: string;
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

// ─── Shared Mock Data ─────────────────────────────────────────────────────────
export const CASES: CaseDetail[] = [
  {
    id: 'CZ-882',
    title: 'Corporate Restructuring',
    client: 'Apex Global Inc.',
    clientEmail: 'contact@apex.com',
    clientPhone: '+1 (555) 010-2030',
    clientCompany: 'Apex Global',
    attorney: 'James Wilson',
    status: 'Active',
    priority: 'High',
    type: 'Corporate',
    deadline: 'May 20, 2026',
    filedDate: 'Apr 1, 2026',
    updated: '2h ago',
    description:
      'Comprehensive restructuring of Apex Global Inc.\'s corporate entities to optimize tax efficiency and streamline governance. Involves the merger of three subsidiaries into a single holding structure, renegotiation of existing credit facilities, and compliance with updated SEC disclosure requirements.',
    team: [
      { name: 'James Wilson',  role: 'Lead Attorney',       initials: 'JW' },
      { name: 'Sarah Owens',   role: 'Corporate Counsel',   initials: 'SO' },
      { name: 'Diana Park',    role: 'Paralegal',           initials: 'DP' },
    ],
    timeline: [
      { id: 1, type: 'filed',     description: 'Case filed and assigned to J. Wilson',             author: 'System',        timestamp: 'Apr 1, 2026 · 09:00' },
      { id: 2, type: 'meeting',   description: 'Initial client consultation completed',             author: 'James Wilson',  timestamp: 'Apr 3, 2026 · 14:30' },
      { id: 3, type: 'document',  description: 'Articles of Incorporation uploaded',               author: 'Sarah Owens',   timestamp: 'Apr 8, 2026 · 11:00' },
      { id: 4, type: 'status',    description: 'Status changed from Pending → Active',             author: 'James Wilson',  timestamp: 'Apr 10, 2026 · 09:15' },
      { id: 5, type: 'milestone', description: 'Phase 1 complete: Entity analysis finalized',      author: 'James Wilson',  timestamp: 'Apr 22, 2026 · 16:00' },
      { id: 6, type: 'document',  description: 'Draft merger agreement submitted for review',      author: 'Sarah Owens',   timestamp: 'Apr 28, 2026 · 10:30' },
      { id: 7, type: 'meeting',   description: 'Board presentation on restructuring plan',         author: 'James Wilson',  timestamp: 'May 1, 2026 · 13:00'  },
      { id: 8, type: 'note',      description: 'Client requested revision to credit facility terms','author': 'Diana Park', timestamp: 'May 3, 2026 · 08:45'  },
    ],
    documents: [
      { id: 1, name: 'Articles_of_Incorporation.pdf',   type: 'PDF',  size: '1.2 MB', uploadedBy: 'Sarah Owens',  uploadedAt: 'Apr 8, 2026'  },
      { id: 2, name: 'Merger_Agreement_Draft_v1.docx',  type: 'DOCX', size: '880 KB', uploadedBy: 'Sarah Owens',  uploadedAt: 'Apr 28, 2026' },
      { id: 3, name: 'Financial_Projections_Q2.xlsx',   type: 'XLSX', size: '2.4 MB', uploadedBy: 'Diana Park',   uploadedAt: 'Apr 30, 2026' },
      { id: 4, name: 'Board_Presentation_May1.pdf',     type: 'PDF',  size: '5.1 MB', uploadedBy: 'James Wilson', uploadedAt: 'May 1, 2026'  },
    ],
    notes: [
      { id: 1, author: 'James Wilson', initials: 'JW', color: 'bg-brand-blue',   text: 'Client confirmed they want to proceed with a holding company structure rather than a direct merger. Need to update the draft agreement accordingly.',   timestamp: 'Apr 10, 2026' },
      { id: 2, author: 'Sarah Owens',  initials: 'SO', color: 'bg-violet-500',   text: 'SEC disclosure requirements updated in March 2026 — need to verify all filings are compliant with the new Form 8-K timeline rules.',                   timestamp: 'Apr 15, 2026' },
      { id: 3, author: 'Diana Park',   initials: 'DP', color: 'bg-emerald-500',  text: 'Client reached out to revise credit facility interest terms. Scheduling a call with their CFO for next week.',                                          timestamp: 'May 3, 2026'  },
    ],
  },
  {
    id: 'CZ-879',
    title: 'Intellectual Property Audit',
    client: 'NextGen Systems',
    clientEmail: 'legal@nextgen.io',
    clientPhone: '+1 (555) 020-3040',
    clientCompany: 'NextGen Systems',
    attorney: 'Sarah Owens',
    status: 'Pending',
    priority: 'Medium',
    type: 'IP',
    deadline: 'Jun 5, 2026',
    filedDate: 'Apr 15, 2026',
    updated: '5h ago',
    description:
      'Comprehensive audit of NextGen Systems\' intellectual property portfolio including patents, trademarks, and proprietary software assets. The goal is to assess the strength of existing IP protections, identify gaps, and recommend a defensive IP strategy ahead of a planned Series B funding round.',
    team: [
      { name: 'Sarah Owens',  role: 'Lead Attorney', initials: 'SO' },
      { name: 'Alex Torres',  role: 'IP Specialist',  initials: 'AT' },
    ],
    timeline: [
      { id: 1, type: 'filed',    description: 'Case filed and assigned to S. Owens',       author: 'System',       timestamp: 'Apr 15, 2026 · 10:00' },
      { id: 2, type: 'meeting',  description: 'Kick-off call with NextGen legal team',      author: 'Sarah Owens',  timestamp: 'Apr 17, 2026 · 11:00' },
      { id: 3, type: 'document', description: 'IP portfolio inventory spreadsheet uploaded', author: 'Alex Torres',  timestamp: 'Apr 21, 2026 · 09:30' },
      { id: 4, type: 'note',     description: 'Two trademark filings found to be expired',  author: 'Sarah Owens',  timestamp: 'Apr 25, 2026 · 14:00' },
    ],
    documents: [
      { id: 1, name: 'IP_Portfolio_Inventory.xlsx',  type: 'XLSX', size: '1.8 MB', uploadedBy: 'Alex Torres',  uploadedAt: 'Apr 21, 2026' },
      { id: 2, name: 'Trademark_Status_Report.pdf',  type: 'PDF',  size: '640 KB', uploadedBy: 'Sarah Owens',  uploadedAt: 'Apr 25, 2026' },
    ],
    notes: [
      { id: 1, author: 'Sarah Owens', initials: 'SO', color: 'bg-violet-500',  text: 'Two trademarks (TM-2018-041 and TM-2019-107) appear to have lapsed. Need to file renewals urgently before the Series B disclosure.',  timestamp: 'Apr 25, 2026' },
    ],
  },
  {
    id: 'CZ-875',
    title: 'Compliance Verification',
    client: 'Horizon Partners',
    clientEmail: 'info@horizon.com',
    clientPhone: '+1 (555) 030-4050',
    clientCompany: 'Horizon Partners LLP',
    attorney: 'James Wilson',
    status: 'Active',
    priority: 'High',
    type: 'Compliance',
    deadline: 'May 15, 2026',
    filedDate: 'Mar 20, 2026',
    updated: 'Yesterday',
    description:
      'Annual regulatory compliance review for Horizon Partners LLP covering FINRA, SEC, and state-level licensing requirements. Includes review of trading policies, client disclosure documents, and internal audit procedures.',
    team: [
      { name: 'James Wilson',  role: 'Lead Attorney',     initials: 'JW' },
      { name: 'Diana Park',    role: 'Compliance Analyst', initials: 'DP' },
    ],
    timeline: [
      { id: 1, type: 'filed',    description: 'Case filed and assigned to J. Wilson',          author: 'System',       timestamp: 'Mar 20, 2026 · 09:00' },
      { id: 2, type: 'document', description: 'Client compliance questionnaire received',       author: 'Diana Park',   timestamp: 'Mar 25, 2026 · 10:00' },
      { id: 3, type: 'status',   description: 'Status changed from Pending → Active',           author: 'James Wilson', timestamp: 'Mar 28, 2026 · 09:00' },
      { id: 4, type: 'milestone','description': 'FINRA review section complete',                author: 'James Wilson', timestamp: 'Apr 12, 2026 · 16:30' },
    ],
    documents: [
      { id: 1, name: 'Compliance_Questionnaire_2026.pdf', type: 'PDF',  size: '920 KB', uploadedBy: 'Diana Park',   uploadedAt: 'Mar 25, 2026' },
      { id: 2, name: 'FINRA_Review_Report.docx',          type: 'DOCX', size: '760 KB', uploadedBy: 'James Wilson', uploadedAt: 'Apr 12, 2026' },
    ],
    notes: [
      { id: 1, author: 'Diana Park', initials: 'DP', color: 'bg-emerald-500', text: 'Client\'s Form ADV was last updated in 2024 — may need an amendment before May deadline.', timestamp: 'Apr 8, 2026' },
    ],
  },
  {
    id: 'CZ-871',
    title: 'Litigation Strategy',
    client: 'Silverline Law',
    clientEmail: 'partners@silverline.law',
    clientPhone: '+1 (555) 040-5060',
    clientCompany: 'Silverline Law Firm',
    attorney: 'Alex Torres',
    status: 'Resolved',
    priority: 'Low',
    type: 'Litigation',
    deadline: 'Apr 30, 2026',
    filedDate: 'Feb 10, 2026',
    updated: '2 days ago',
    description:
      'Development of a comprehensive litigation strategy for Silverline Law Firm in a complex multi-party commercial dispute. Includes motion practice planning, discovery strategy, and settlement negotiation framework.',
    team: [
      { name: 'Alex Torres', role: 'Lead Attorney', initials: 'AT' },
    ],
    timeline: [
      { id: 1, type: 'filed',     description: 'Case filed and assigned to A. Torres',        author: 'System',      timestamp: 'Feb 10, 2026 · 09:00' },
      { id: 2, type: 'meeting',   description: 'Strategy session with Silverline partners',   author: 'Alex Torres', timestamp: 'Feb 15, 2026 · 14:00' },
      { id: 3, type: 'milestone', description: 'Discovery strategy finalized',                author: 'Alex Torres', timestamp: 'Mar 1, 2026 · 11:00'  },
      { id: 4, type: 'milestone', description: 'Settlement framework presented to client',    author: 'Alex Torres', timestamp: 'Apr 10, 2026 · 15:00' },
      { id: 5, type: 'status',    description: 'Case resolved — settlement reached',          author: 'Alex Torres', timestamp: 'Apr 28, 2026 · 17:00' },
    ],
    documents: [
      { id: 1, name: 'Litigation_Strategy_Document.pdf', type: 'PDF',  size: '2.1 MB', uploadedBy: 'Alex Torres', uploadedAt: 'Feb 20, 2026' },
      { id: 2, name: 'Settlement_Agreement_Final.pdf',   type: 'PDF',  size: '1.4 MB', uploadedBy: 'Alex Torres', uploadedAt: 'Apr 28, 2026' },
    ],
    notes: [
      { id: 1, author: 'Alex Torres', initials: 'AT', color: 'bg-amber-500', text: 'Settlement reached at $2.4M — significantly below client\'s initial exposure of $6.8M. Client extremely satisfied with outcome.', timestamp: 'Apr 28, 2026' },
    ],
  },
  {
    id: 'CZ-868',
    title: 'Asset Recovery Plan',
    client: 'Estate Mgmt Co.',
    clientEmail: 'ops@estatemgmt.com',
    clientPhone: '+1 (555) 050-6070',
    clientCompany: 'Estate Management Co.',
    attorney: 'Sarah Owens',
    status: 'Active',
    priority: 'Medium',
    type: 'Real Estate',
    deadline: 'Jun 12, 2026',
    filedDate: 'Apr 5, 2026',
    updated: '3 days ago',
    description:
      'Structured asset recovery plan for Estate Management Co. following the default of three commercial real estate loans. Involves negotiation with secured creditors, property valuation, and potential foreclosure proceedings on underperforming assets.',
    team: [
      { name: 'Sarah Owens',  role: 'Lead Attorney',    initials: 'SO' },
      { name: 'Diana Park',   role: 'Real Estate Counsel', initials: 'DP' },
    ],
    timeline: [
      { id: 1, type: 'filed',    description: 'Case filed and assigned to S. Owens', author: 'System',      timestamp: 'Apr 5, 2026 · 09:00'  },
      { id: 2, type: 'meeting',  description: 'Creditor negotiation call',           author: 'Sarah Owens', timestamp: 'Apr 12, 2026 · 10:00' },
      { id: 3, type: 'document', description: 'Property valuations uploaded',        author: 'Diana Park',  timestamp: 'Apr 18, 2026 · 14:00' },
    ],
    documents: [
      { id: 1, name: 'Property_Valuations_Q1.pdf', type: 'PDF',  size: '3.2 MB', uploadedBy: 'Diana Park',  uploadedAt: 'Apr 18, 2026' },
      { id: 2, name: 'Creditor_Summary.xlsx',       type: 'XLSX', size: '980 KB', uploadedBy: 'Sarah Owens', uploadedAt: 'Apr 20, 2026' },
    ],
    notes: [
      { id: 1, author: 'Sarah Owens', initials: 'SO', color: 'bg-violet-500', text: 'First creditor has signaled willingness to negotiate a haircut of up to 20% on the principal. Recommend exploring a consensual restructuring before proceeding to foreclosure.', timestamp: 'Apr 30, 2026' },
    ],
  },
  {
    id: 'CZ-861',
    title: 'Merger & Acquisition Review',
    client: 'TechVenture Ltd.',
    clientEmail: 'hello@techventure.co',
    clientPhone: '+1 (555) 060-7080',
    clientCompany: 'TechVenture Ltd.',
    attorney: 'Alex Torres',
    status: 'Pending',
    priority: 'High',
    type: 'M&A',
    deadline: 'Jul 1, 2026',
    filedDate: 'Apr 20, 2026',
    updated: '4 days ago',
    description:
      'Due diligence and legal review for TechVenture Ltd.\'s proposed acquisition of a Series A SaaS company. Covers corporate structure review, IP ownership verification, employment agreements, outstanding liabilities, and regulatory approvals.',
    team: [
      { name: 'Alex Torres',  role: 'Lead Attorney',  initials: 'AT' },
      { name: 'James Wilson', role: 'M&A Counsel',    initials: 'JW' },
    ],
    timeline: [
      { id: 1, type: 'filed',   description: 'Case filed and assigned to A. Torres', author: 'System',      timestamp: 'Apr 20, 2026 · 09:00' },
      { id: 2, type: 'meeting', description: 'Initial due diligence planning call',  author: 'Alex Torres', timestamp: 'Apr 22, 2026 · 14:00' },
    ],
    documents: [
      { id: 1, name: 'Due_Diligence_Checklist.docx', type: 'DOCX', size: '540 KB', uploadedBy: 'Alex Torres', uploadedAt: 'Apr 22, 2026' },
    ],
    notes: [
      { id: 1, author: 'Alex Torres', initials: 'AT', color: 'bg-amber-500', text: 'Target company has three pending patent applications that need to be verified before deal close. Will coordinate with IP team.', timestamp: 'Apr 22, 2026' },
    ],
  },
  {
    id: 'CZ-854',
    title: 'Employment Dispute',
    client: 'BlueOak Corp.',
    clientEmail: 'hr@blueoakcorp.com',
    clientPhone: '+1 (555) 070-8090',
    clientCompany: 'BlueOak Corporation',
    attorney: 'James Wilson',
    status: 'Active',
    priority: 'Low',
    type: 'Employment',
    deadline: 'Jun 20, 2026',
    filedDate: 'Mar 30, 2026',
    updated: '1 week ago',
    description:
      'Defense of BlueOak Corp. against a wrongful termination claim filed by a former senior engineer. Involves review of employment contracts, HR records, performance reviews, and documentation of the termination process.',
    team: [
      { name: 'James Wilson', role: 'Lead Attorney',       initials: 'JW' },
      { name: 'Diana Park',   role: 'Employment Counsel',  initials: 'DP' },
    ],
    timeline: [
      { id: 1, type: 'filed',    description: 'Case filed and assigned to J. Wilson',     author: 'System',       timestamp: 'Mar 30, 2026 · 09:00' },
      { id: 2, type: 'document', description: 'HR records and employment files uploaded', author: 'Diana Park',   timestamp: 'Apr 5, 2026 · 11:00'  },
      { id: 3, type: 'status',   description: 'Status changed from Pending → Active',     author: 'James Wilson', timestamp: 'Apr 7, 2026 · 09:00'  },
    ],
    documents: [
      { id: 1, name: 'Employment_Contract_2023.pdf',  type: 'PDF',  size: '480 KB', uploadedBy: 'Diana Park', uploadedAt: 'Apr 5, 2026' },
      { id: 2, name: 'Performance_Reviews_2024.pdf',  type: 'PDF',  size: '820 KB', uploadedBy: 'Diana Park', uploadedAt: 'Apr 5, 2026' },
    ],
    notes: [
      { id: 1, author: 'James Wilson', initials: 'JW', color: 'bg-brand-blue', text: 'HR documentation is thorough and supports the termination decision. Claimant\'s demand of $450K is excessive — anticipate settling in the $80-120K range.', timestamp: 'Apr 9, 2026' },
    ],
  },
  {
    id: 'CZ-847',
    title: 'Contract Negotiation',
    client: 'Sterling Finance',
    clientEmail: 'legal@sterlingfinance.com',
    clientPhone: '+1 (555) 080-9010',
    clientCompany: 'Sterling Finance Group',
    attorney: 'Sarah Owens',
    status: 'Resolved',
    priority: 'Medium',
    type: 'Corporate',
    deadline: 'Apr 15, 2026',
    filedDate: 'Mar 1, 2026',
    updated: '2 weeks ago',
    description:
      'Negotiation and finalization of a multi-year SaaS licensing agreement between Sterling Finance Group and a tier-1 financial data provider. Covers pricing, SLAs, data ownership, liability caps, and termination clauses.',
    team: [
      { name: 'Sarah Owens', role: 'Lead Attorney', initials: 'SO' },
    ],
    timeline: [
      { id: 1, type: 'filed',     description: 'Case filed and assigned to S. Owens',      author: 'System',      timestamp: 'Mar 1, 2026 · 09:00'  },
      { id: 2, type: 'meeting',   description: 'Initial negotiation session with vendor',   author: 'Sarah Owens', timestamp: 'Mar 8, 2026 · 14:00'  },
      { id: 3, type: 'milestone', description: 'Pricing and SLA terms agreed',              author: 'Sarah Owens', timestamp: 'Mar 20, 2026 · 11:00' },
      { id: 4, type: 'document',  description: 'Final signed agreement uploaded',           author: 'Sarah Owens', timestamp: 'Apr 14, 2026 · 16:00' },
      { id: 5, type: 'status',    description: 'Case resolved — contract executed',         author: 'Sarah Owens', timestamp: 'Apr 14, 2026 · 16:30' },
    ],
    documents: [
      { id: 1, name: 'SaaS_Agreement_Draft_v3.docx', type: 'DOCX', size: '730 KB', uploadedBy: 'Sarah Owens', uploadedAt: 'Apr 10, 2026' },
      { id: 2, name: 'SaaS_Agreement_Executed.pdf',  type: 'PDF',  size: '1.1 MB', uploadedBy: 'Sarah Owens', uploadedAt: 'Apr 14, 2026' },
    ],
    notes: [
      { id: 1, author: 'Sarah Owens', initials: 'SO', color: 'bg-violet-500', text: 'Negotiated liability cap down from 24 months to 6 months of fees. Also secured a data portability clause the client was adamant about.', timestamp: 'Apr 14, 2026' },
    ],
  },
];

// Lookup helpers
export function getCaseById(id: string): CaseDetail | undefined {
  return CASES.find((c) => c.id === id);
}

// Shared style maps used across pages
export const STATUS_STYLES: Record<string, string> = {
  Active:   'bg-emerald-100/60 text-emerald-700',
  Pending:  'bg-amber-100/60 text-amber-700',
  Resolved: 'bg-slate-100/60 text-slate-600',
};
export const STATUS_DOT: Record<string, string> = {
  Active:   'bg-emerald-500',
  Pending:  'bg-amber-500',
  Resolved: 'bg-slate-400',
};
export const PRIORITY_STYLES: Record<string, string> = {
  High:   'text-red-600 bg-red-50',
  Medium: 'text-amber-600 bg-amber-50',
  Low:    'text-slate-500 bg-slate-100',
};
