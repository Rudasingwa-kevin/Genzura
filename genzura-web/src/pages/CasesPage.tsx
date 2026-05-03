import { useState } from 'react';
import {
  Plus, Filter, Search as SearchIcon, MoreHorizontal, Clock, X,
  ChevronDown, AlertTriangle, CheckCircle2, Hourglass,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Case {
  id: string;
  title: string;
  client: string;
  attorney: string;
  status: 'Active' | 'Pending' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  updated: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const CASES: Case[] = [
  { id: 'CZ-882', title: 'Corporate Restructuring',      client: 'Apex Global Inc.',    attorney: 'J. Wilson',    status: 'Active',   priority: 'High',   deadline: 'May 20, 2026',  updated: '2h ago'     },
  { id: 'CZ-879', title: 'Intellectual Property Audit',  client: 'NextGen Systems',     attorney: 'S. Owens',     status: 'Pending',  priority: 'Medium', deadline: 'Jun 5, 2026',   updated: '5h ago'     },
  { id: 'CZ-875', title: 'Compliance Verification',      client: 'Horizon Partners',    attorney: 'J. Wilson',    status: 'Active',   priority: 'High',   deadline: 'May 15, 2026',  updated: 'Yesterday'  },
  { id: 'CZ-871', title: 'Litigation Strategy',          client: 'Silverline Law',      attorney: 'A. Torres',    status: 'Resolved', priority: 'Low',    deadline: 'Apr 30, 2026',  updated: '2 days ago' },
  { id: 'CZ-868', title: 'Asset Recovery Plan',          client: 'Estate Mgmt Co.',     attorney: 'S. Owens',     status: 'Active',   priority: 'Medium', deadline: 'Jun 12, 2026',  updated: '3 days ago' },
  { id: 'CZ-861', title: 'Merger & Acquisition Review',  client: 'TechVenture Ltd.',    attorney: 'A. Torres',    status: 'Pending',  priority: 'High',   deadline: 'Jul 1, 2026',   updated: '4 days ago' },
  { id: 'CZ-854', title: 'Employment Dispute',           client: 'BlueOak Corp.',       attorney: 'J. Wilson',    status: 'Active',   priority: 'Low',    deadline: 'Jun 20, 2026',  updated: '1 week ago' },
  { id: 'CZ-847', title: 'Contract Negotiation',         client: 'Sterling Finance',    attorney: 'S. Owens',     status: 'Resolved', priority: 'Medium', deadline: 'Apr 15, 2026',  updated: '2 weeks ago'},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusStyles: Record<Case['status'], string> = {
  Active:   'bg-emerald-100/50 text-emerald-700',
  Pending:  'bg-amber-100/50 text-amber-700',
  Resolved: 'bg-slate-100/50 text-slate-700',
};
const statusDot: Record<Case['status'], string> = {
  Active:   'bg-emerald-500',
  Pending:  'bg-amber-500',
  Resolved: 'bg-slate-400',
};
const priorityStyles: Record<Case['priority'], string> = {
  High:   'text-red-600 bg-red-50',
  Medium: 'text-amber-600 bg-amber-50',
  Low:    'text-slate-500 bg-slate-100',
};

// ─── New Case Modal ───────────────────────────────────────────────────────────
const NewCaseModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-lg mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-brand-dark">New Case</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg transition-colors text-text-muted">
          <X size={20} />
        </button>
      </div>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-dark ml-1">Case Title</label>
          <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" placeholder="e.g. Corporate Restructuring" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Client Name</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" placeholder="Apex Global Inc." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Priority</label>
            <select className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Assigned Attorney</label>
            <select className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none">
              <option>J. Wilson</option>
              <option>S. Owens</option>
              <option>A. Torres</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Deadline</label>
            <input type="date" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-dark ml-1">Description</label>
          <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none" placeholder="Brief summary of the case..." />
        </div>
        <button type="submit" className="w-full bg-brand-blue text-white h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
          Create Case
        </button>
      </form>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['All', 'Active', 'Pending', 'Resolved'] as const;
type Tab = typeof TABS[number];

export default function CasesPage() {
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = CASES.filter((c) => {
    const matchTab = tab === 'All' || c.status === tab;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const action = (
    <button
      onClick={() => setShowModal(true)}
      className="bg-brand-blue text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
    >
      <Plus size={18} /> New Case
    </button>
  );

  return (
    <>
      {showModal && <NewCaseModal onClose={() => setShowModal(false)} />}
      <AppLayout action={action}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Cases</h1>
            <p className="text-sm text-text-muted mt-1">{CASES.length} total cases</p>
          </div>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total',    value: CASES.length,                          icon: SearchIcon,   color: 'text-brand-blue',    bg: 'bg-brand-light'   },
            { label: 'Active',   value: CASES.filter(c=>c.status==='Active').length,   icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50'    },
            { label: 'Pending',  value: CASES.filter(c=>c.status==='Pending').length,  icon: Hourglass,    color: 'text-amber-600',   bg: 'bg-amber-50'      },
            { label: 'Resolved', value: CASES.filter(c=>c.status==='Resolved').length, icon: AlertTriangle,color: 'text-slate-500',   bg: 'bg-slate-100'     },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border-base p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon size={20}/></div>
              <div>
                <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-border-base flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-page-bg p-1 rounded-xl">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    tab === t ? 'bg-white text-brand-blue shadow-sm' : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases..."
                className="h-9 pl-9 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none text-sm transition-all"
              />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
              <Filter size={15} /> Filter <ChevronDown size={14} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-page-bg/40 text-text-muted text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border-base">
                  <th className="py-4 px-6">Case</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Attorney</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Deadline</th>
                  <th className="py-4 px-6">Updated</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-text-muted text-sm">No cases found.</td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border-base hover:bg-page-bg/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-light text-brand-blue font-bold text-[10px] flex items-center justify-center shrink-0">{c.id}</div>
                        <p className="font-semibold text-brand-dark text-sm group-hover:text-brand-blue transition-colors cursor-pointer max-w-[180px] truncate">{c.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">{c.client}</td>
                    <td className="py-4 px-6 text-sm text-text-secondary">{c.attorney}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${priorityStyles[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[c.status]}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot[c.status]}`} />
                        {c.status}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock size={13} className="text-text-muted" />{c.deadline}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-muted">{c.updated}</td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-1.5 rounded-lg hover:bg-brand-light text-text-muted hover:text-brand-blue transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border-base flex items-center justify-between">
            <p className="text-xs text-text-muted">Showing <span className="font-bold text-brand-dark">{filtered.length}</span> of <span className="font-bold text-brand-dark">{CASES.length}</span> cases</p>
            <div className="flex gap-1">
              {[1,2,3].map((p) => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p === 1 ? 'bg-brand-blue text-white' : 'text-text-muted hover:bg-page-bg'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
