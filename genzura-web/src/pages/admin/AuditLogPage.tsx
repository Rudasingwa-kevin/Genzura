import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Download,
  ChevronRight,
  Clock
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { TableSkeleton } from '../../components/Skeleton';
import { useState, useEffect } from 'react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const AUDIT_LOGS = [
  { id: 'LOG-882', action: 'Update System Branding', user: 'Sarah Miller', role: 'Admin', time: '10 mins ago', ip: '192.168.1.1', status: 'Success' },
  { id: 'LOG-881', action: 'Bulk User Invitation', user: 'James Wilson', role: 'Senior Attorney', time: '2 hours ago', ip: '192.168.1.42', status: 'Success' },
  { id: 'LOG-880', action: 'Unauthorized Login Attempt', user: 'Unknown', role: 'External', time: '5 hours ago', ip: '45.12.99.12', status: 'Failed' },
  { id: 'LOG-879', action: 'Exported Financial Records', user: 'David Chen', role: 'Attorney', time: 'Yesterday', ip: '192.168.1.15', status: 'Success' },
  { id: 'LOG-878', action: 'Modified Practice Areas', user: 'Sarah Miller', role: 'Admin', time: '2 days ago', ip: '192.168.1.1', status: 'Success' },
  { id: 'LOG-877', action: 'Delete Document: CZ-102-Final', user: 'Elena Rodriguez', role: 'Paralegal', time: '3 days ago', ip: '192.168.1.8', status: 'Success' },
  { id: 'LOG-876', action: 'System Backup Initiated', user: 'System', role: 'Core', time: '3 days ago', ip: 'Local', status: 'Success' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = AUDIT_LOGS.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="System Audit Trail">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Audit Trail</h1>
          <p className="text-sm text-text-muted mt-1">Detailed immutable log of all administrative and system-wide activities.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all shadow-sm">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border-base shadow-sm overflow-hidden animate-in-fade">
        <div className="p-6 border-b border-border-base flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Filter by action or user..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none text-sm font-bold transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-base font-bold text-xs text-text-secondary hover:bg-page-bg transition-all">
              <Calendar size={14} /> Date Range
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-base font-bold text-xs text-text-secondary hover:bg-page-bg transition-all">
              <Filter size={14} /> Event Type
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-page-bg/30 border-b border-border-base">
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Event ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Action</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Initiator</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="group border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono font-bold text-brand-blue">{log.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <Activity size={16} />
                        </div>
                        <span className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{log.user}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">{log.role} • {log.ip}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-text-secondary font-bold">
                        <Clock size={14} className="text-text-muted" />
                        {log.time}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                          log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
