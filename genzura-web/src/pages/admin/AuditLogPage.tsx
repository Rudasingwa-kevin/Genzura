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

// ─── Main Page ────────────────────────────────────────────────────────────────

import { toast } from 'react-hot-toast';
import { adminService } from '../../api/services/admin.service';

export default function AuditLogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await adminService.getAuditLogs({ search, limit: 50 });
        setLogs(result.logs || []);
        setTotal(result.total || 0);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [search]);

  const filtered = logs;

  const handleExportCSV = () => {
    try {
      // 1. Define CSV headers
      const headers = ['Event ID', 'Action', 'Initiator', 'Role', 'IP Address', 'Timestamp', 'Status'];

      // 2. Map data to CSV rows
      const csvRows = filtered.map(log =>
        [
          log.id,
          `"${log.description?.replace(/"/g, '""') || 'N/A'}"`, // Escape quotes
          `"${log.userName || 'System'}"`,
          log.userRole || 'System',
          log.ipAddress || 'N/A',
          `"${new Date(log.timestamp).toLocaleString()}"`,
          log.status
        ].join(',')
      );

      // 3. Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // 4. Create Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `audit-log-export-${new Date().toISOString().split('T')[0]}.csv`;

      // 5. Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Audit log exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export audit log');
    }
  };

  return (
    <AdminLayout title="System Audit Trail">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Audit Trail</h1>
          <p className="text-sm text-text-muted mt-1">Detailed immutable log of all administrative and system-wide activities.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all shadow-sm active:scale-95"
        >
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
                {filtered.length > 0 ? (
                  filtered.map((log) => (
                    <tr key={log.id} className="group border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-all cursor-pointer">
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono font-bold text-brand-blue">{log.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            <Activity size={16} />
                          </div>
                          <span className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{log.description}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-bold text-brand-dark">{log.userName || 'System'}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-0.5">
                            {log.userRole || 'System'} • {log.ipAddress || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-text-secondary font-bold">
                          <Clock size={14} className="text-text-muted" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                            log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-text-muted">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
