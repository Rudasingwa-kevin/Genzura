import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Search as SearchIcon, MoreHorizontal, Clock,
  CheckCircle2, Hourglass, Archive, X, Plus, Briefcase, User, Calendar, Zap, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { CASES, STATUS_STYLES, STATUS_DOT, PRIORITY_STYLES } from '../data/cases';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/Skeleton';
import { caseService } from '../api/services/case.service';

// ─── Sub-components ───────────────────────────────────────────────────────────

// Using Global NewCaseModal from components
import NewCaseModal from '../components/NewCaseModal';

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['All', 'Active', 'Pending', 'Resolved', 'Archived'] as const;
type Tab = typeof TABS[number];

export default function CasesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [localCases, setLocalCases] = useState(CASES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await caseService.getAll();
        setLocalCases(data);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        toast.error('Failed to sync case records.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = localCases.filter((c) => {
    const matchTab = tab === 'All' ? c.status !== 'Archived' : c.status === tab;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchPriority && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  // Action button for AppLayout header
  const headerAction = (
    <button 
      onClick={() => setIsNewModalOpen(true)}
      className="bg-brand-blue text-white px-3 py-2 lg:px-6 lg:py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-brand-blue/20"
    >
      <Plus size={20} /> New Case
    </button>
  );

  return (
    <AppLayout action={headerAction}>
      {isNewModalOpen && (
        <NewCaseModal 
          onClose={() => setIsNewModalOpen(false)} 
        />
      )}

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Case Manager</h1>
            <p className="text-sm text-text-muted mt-1">Manage and track your active litigation portfolio.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-base font-bold text-text-secondary hover:bg-page-bg transition-all">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Matters',  value: localCases.filter(c => c.status !== 'Archived').length,   icon: SearchIcon,   color: 'text-brand-blue',    bg: 'bg-brand-light'  },
            { label: 'Active Litigation',   value: localCases.filter(c => c.status === 'Active').length,   icon: CheckCircle2, color: 'text-emerald-600',  bg: 'bg-emerald-50'   },
            { label: 'Pending Review',  value: localCases.filter(c => c.status === 'Pending').length,  icon: Hourglass,    color: 'text-amber-600',    bg: 'bg-amber-50'     },
            { label: 'Archive Vault', value: localCases.filter(c => c.status === 'Archived').length, icon: Archive,       color: 'text-slate-500',    bg: 'bg-slate-100'    },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[1.5rem] border border-border-base p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon size={20} /></div>
              <div>
                <p className="text-2xl font-bold text-brand-dark tracking-tight">{s.value}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : (
          <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-border-base flex flex-wrap items-center gap-4 bg-white sticky top-0 z-10">
            {/* Tabs */}
            <div className="flex gap-1 bg-page-bg p-1.5 rounded-xl border border-border-base">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === t ? 'bg-white text-brand-blue shadow-sm border border-border-base' : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex flex-1" />

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto ml-auto">
              {/* Search */}
              <div className="relative flex-1 xl:flex-initial">
                <SearchIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search case records..."
                  className="h-11 pl-11 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none text-sm font-bold transition-all w-full xl:w-[240px]"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 px-4 h-11 rounded-xl border border-border-base bg-white shadow-sm">
                <Filter size={14} className="text-text-muted" />
                <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-text-secondary cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border-base bg-white shadow-sm text-xs font-bold text-text-secondary hover:bg-page-bg transition-all whitespace-nowrap"
              >
                <Clock size={14} className="text-text-muted" />
                Sort {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-page-bg/30 border-b border-border-base">
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Case Matter</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Client</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Attorney</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Priority</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Deadline</th>
                  <th className="px-8 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="group border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-all cursor-pointer animate-in-up"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-auto px-3 h-12 rounded-xl bg-brand-light flex items-center justify-center text-[10px] font-bold text-brand-blue border border-brand-blue/5 shadow-inner">
                          {c.caseNumber}
                        </div>
                        <p className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{c.title}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-text-secondary font-bold">{c.client}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-page-bg border border-border-base flex items-center justify-center text-[10px] font-bold text-brand-blue">
                          {typeof c.attorney === 'object' ? (c.attorney?.initials || c.attorney?.name?.split(' ').map((n: string) => n[0]).join('')) : (c.attorney?.split(' ').map((n: string) => n[0]).join(''))}
                        </div>
                        <span className="text-sm text-text-secondary font-bold">{typeof c.attorney === 'object' ? c.attorney?.name : c.attorney}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border border-current/10 shadow-sm ${PRIORITY_STYLES[c.priority]}`}>
                          {c.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current/10 shadow-sm ${STATUS_STYLES[c.status]}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
                          {c.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-text-secondary font-bold">
                        <Clock size={14} className="text-text-muted" />
                        {c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Deadline'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2.5 rounded-xl hover:bg-white text-text-muted hover:text-brand-blue transition-all shadow-sm group-hover:border border-border-base">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <EmptyState 
                illustration="search"
                title="No Matching Records"
                description="We couldn't find any cases matching your current search parameters. Try adjusting your filters or search query."
                action={
                  <button 
                    onClick={() => { setSearch(''); setTab('All'); }} 
                    className="text-sm font-bold text-brand-blue hover:underline underline-offset-4"
                  >
                    Clear all search parameters
                  </button>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  </AppLayout>
  );
}
