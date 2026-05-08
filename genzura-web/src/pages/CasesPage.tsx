import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Search as SearchIcon, MoreHorizontal, Clock,
  ChevronDown, AlertTriangle, CheckCircle2, Hourglass,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { CASES, STATUS_STYLES, STATUS_DOT, PRIORITY_STYLES } from '../data/cases';



// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['All', 'Active', 'Pending', 'Resolved'] as const;
type Tab = typeof TABS[number];

export default function CasesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');

  const filtered = CASES.filter((c) => {
    const matchTab = tab === 'All' || c.status === tab;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      <AppLayout>
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
            { label: 'Total',    value: CASES.length,                                        icon: SearchIcon,   color: 'text-brand-blue',    bg: 'bg-brand-light'  },
            { label: 'Active',   value: CASES.filter(c => c.status === 'Active').length,   icon: CheckCircle2, color: 'text-emerald-600',  bg: 'bg-emerald-50'   },
            { label: 'Pending',  value: CASES.filter(c => c.status === 'Pending').length,  icon: Hourglass,    color: 'text-amber-600',    bg: 'bg-amber-50'     },
            { label: 'Resolved', value: CASES.filter(c => c.status === 'Resolved').length, icon: AlertTriangle,color: 'text-slate-500',    bg: 'bg-slate-100'    },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border-base p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon size={20} /></div>
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
                ) : filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-border-base hover:bg-page-bg/40 transition-colors group cursor-pointer animate-in-fade"
                    style={{ animationDelay: `${(i % 10) * 50 + 200}ms` }}
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-light text-brand-blue font-bold text-[10px] flex items-center justify-center shrink-0">{c.id}</div>
                        <p className="font-semibold text-brand-dark text-sm group-hover:text-brand-blue transition-colors max-w-[180px] truncate">{c.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">{c.client}</td>
                    <td className="py-4 px-6 text-sm text-text-secondary">{c.attorney}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${PRIORITY_STYLES[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[c.status]}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
                        {c.status}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock size={13} className="text-text-muted" />{c.deadline}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-muted">{c.updated}</td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
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
              {[1, 2, 3].map((p) => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p === 1 ? 'bg-brand-blue text-white' : 'text-text-muted hover:bg-page-bg'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
