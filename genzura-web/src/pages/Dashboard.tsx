import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { type CaseStatus } from '../data/cases';
import { caseService } from '../api/services/case.service';
import { CardSkeleton, TableSkeleton, Skeleton } from '../components/Skeleton';

const CaseRow = ({ id, caseNumber, title, client, status, date }: { id: string; caseNumber?: string; title: string; client: string; status: CaseStatus; date: string }) => {
  const navigate = useNavigate();
  const displayNumber = caseNumber || id.substring(id.length - 6).toUpperCase();
  const routeId = caseNumber || id;

  return (
    <tr
      className="border-b border-border-base hover:bg-page-bg/50 transition-colors group animate-in-fade delay-500 cursor-pointer"
      onClick={() => navigate(`/cases/${routeId}`)}
    >
      <td className="py-5 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand-blue font-bold text-[10px] overflow-hidden whitespace-nowrap">
            {displayNumber}
          </div>
          <div>
            <p className="font-bold text-brand-dark text-sm group-hover:text-brand-blue transition-colors">{title}</p>
            <p className="text-xs text-text-muted mt-0.5">{client}</p>
          </div>
        </div>
      </td>
      <td className="py-5 px-8">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          status === 'Active'   ? 'bg-emerald-100/50 text-emerald-700' :
          status === 'Pending'  ? 'bg-amber-100/50 text-amber-700'    :
                                  'bg-slate-100/50 text-slate-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            status === 'Active'  ? 'bg-emerald-500' :
            status === 'Pending' ? 'bg-amber-500'   :
                                   'bg-slate-500'
          }`} />
          {status}
        </div>
      </td>
      <td className="py-5 px-8">
        <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
          <Clock size={14} className="text-text-muted" />
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </td>
      <td className="py-5 px-8 text-center" onClick={(e) => e.stopPropagation()}>
        <button className="p-2 rounded-xl hover:bg-brand-light text-text-muted hover:text-brand-blue transition-all">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [priority, setPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'High'>('Active');
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await caseService.getAll();
        // Transform API response to match expected format
        const transformedCases = data.map((c: any) => ({
          ...c,
          client: c.client?.name || c.clientName || 'Unknown Client',
          attorney: c.attorney?.name || c.attorneyName || 'Unknown Attorney',
        }));
        setCases(transformedCases);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);
  
  const activeCases = cases.filter(c => c.status === 'Active');
  const pendingCases = cases.filter(c => c.status === 'Pending');
  const resolvedCases = cases.filter(c => c.status === 'Resolved');
  const highPriorityCases = cases.filter(c => c.priority === 'High' && c.status !== 'Archived');
  
  const displayCases = cases.filter(c => {
    if (statusFilter === 'High') return c.priority === 'High' && c.status !== 'Archived';
    return c.status === statusFilter;
  });

  const filteredCases = displayCases.filter(c => priority === 'All' || c.priority === priority);
  const recentCases = filteredCases.slice(0, 5);

  const stats = [
    { label: 'Active Cases',    value: activeCases.length,      icon: Briefcase,    color: 'text-blue-600',    bg: 'bg-blue-50/50',    status: 'Active' as const },
    { label: 'Pending Review',  value: pendingCases.length,     icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50/50',   status: 'Pending' as const },
    { label: 'Resolved',        value: resolvedCases.length,    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50', status: 'Resolved' as const },
    { label: 'High Priority',   value: highPriorityCases.length,icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50/50',     status: 'High' as const },
  ];

  return (
    <AppLayout>
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          stats.map((stat, i) => (
            <button 
              key={i} 
              onClick={() => setStatusFilter(stat.status)}
              className={`bg-white p-7 rounded-[2rem] border transition-all text-left animate-in-up delay-${(i + 1) * 100} ${
                statusFilter === stat.status 
                  ? 'border-brand-blue shadow-lg shadow-brand-blue/10 ring-1 ring-brand-blue/50' 
                  : 'border-border-base shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={26} />
                </div>
              </div>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.1em] mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-brand-dark tracking-tighter">{stat.value}</p>
            </button>
          ))
        )}
      </div>

      {/* Case Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border-base flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-dark">
                {statusFilter === 'High' ? 'High Priority Matters' : `${statusFilter} Cases`}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {statusFilter === 'High' 
                  ? 'Matters requiring immediate legal attention and oversight' 
                  : `Showing ${recentCases.length} of ${displayCases.length} ${statusFilter.toLowerCase()} cases`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-base bg-white shadow-sm">
                <Filter size={14} className="text-text-muted" />
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-text-secondary cursor-pointer"
                >
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {displayCases.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-page-bg text-text-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={40} />
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">No Cases Found</h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto">There are currently no cases matching this criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-page-bg/30 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] border-b border-border-base">
                    <th className="py-5 px-8">Case Details</th>
                    <th className="py-5 px-8">Status</th>
                    <th className="py-5 px-8">Last Updated</th>
                    <th className="py-5 px-8 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {recentCases.map((c) => (
                    <CaseRow
                      key={c.id}
                      id={c.id}
                      caseNumber={c.caseNumber}
                      title={c.title}
                      client={c.client}
                      status={c.status}
                      date={c.updatedAt}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-6 bg-page-bg/20 text-center">
            <button 
              onClick={() => navigate('/cases')}
              className="text-sm font-bold text-brand-blue hover:underline underline-offset-4"
            >
              View all {statusFilter === 'High' ? 'priority' : statusFilter.toLowerCase()} cases
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm p-7 col-span-2">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Weekly Activity</h3>
          {isLoading ? (
            <Skeleton className="w-full h-28 rounded-xl" />
          ) : (
            <div className="flex items-end gap-3 h-28">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-brand-blue/20 hover:bg-brand-blue transition-colors cursor-pointer"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-text-muted font-medium">
                    {['M','T','W','T','F','S','S'][i]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm p-7">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Case Status</h3>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="w-16 h-3" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Active',   count: activeCases.length,   pct: Math.round((activeCases.length / (cases.length || 1)) * 100),   color: 'bg-brand-blue'  },
                { label: 'Pending',  count: pendingCases.length,  pct: Math.round((pendingCases.length / (cases.length || 1)) * 100),  color: 'bg-amber-400'   },
                { label: 'Resolved', count: resolvedCases.length, pct: Math.round((resolvedCases.length / (cases.length || 1)) * 100), color: 'bg-emerald-400' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-text-secondary">{s.label}</span>
                    <span className="font-bold text-brand-dark">{s.count}</span>
                  </div>
                  <div className="h-2 bg-page-bg rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
