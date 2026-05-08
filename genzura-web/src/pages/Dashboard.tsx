import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';

const CaseRow = ({ id, title, client, status, date }: { id: string; title: string; client: string; status: 'Active' | 'Pending' | 'Resolved'; date: string }) => (
  <tr className="border-b border-border-base hover:bg-page-bg/50 transition-colors group animate-in-fade delay-500">
    <td className="py-5 px-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand-blue font-bold text-xs">
          {id}
        </div>
        <div>
          <p className="font-bold text-brand-dark text-sm group-hover:text-brand-blue transition-colors cursor-pointer">{title}</p>
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
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Clock size={14} className="text-text-muted" />
        {date}
      </div>
    </td>
    <td className="py-5 px-8 text-center">
      <button className="p-2 rounded-xl hover:bg-brand-light text-text-muted hover:text-brand-blue transition-all">
        <MoreHorizontal size={18} />
      </button>
    </td>
  </tr>
);

const Dashboard = () => {
  return (
    <AppLayout>
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-8">
        {[
          { label: 'Active Cases',    value: '24', icon: Briefcase,    color: 'text-blue-600',    bg: 'bg-blue-50/50'    },
          { label: 'Pending Review',  value: '08', icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50/50'   },
          { label: 'Resolved',        value: '12', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'System Alerts',   value: '02', icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50/50'     },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-7 rounded-[2rem] border border-border-base shadow-sm hover:shadow-md transition-shadow animate-in-up delay-${(i + 1) * 100}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.1em] mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-brand-dark tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Case Table */}
      <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border-base flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-dark">Active Cases</h2>
            <p className="text-xs text-text-muted mt-1">Showing 5 of 24 active cases</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              <CaseRow id="CZ-882" title="Corporate Restructuring"    client="Apex Global Inc."    status="Active"   date="2 hours ago"  />
              <CaseRow id="CZ-879" title="Intellectual Property Audit" client="NextGen Systems"     status="Pending"  date="5 hours ago"  />
              <CaseRow id="CZ-875" title="Compliance Verification"    client="Horizon Partners"    status="Active"   date="Yesterday"    />
              <CaseRow id="CZ-871" title="Litigation Strategy"        client="Silverline Law"      status="Resolved" date="2 days ago"   />
              <CaseRow id="CZ-868" title="Asset Recovery Plan"        client="Estate Mgmt Co."     status="Active"   date="3 days ago"   />
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-page-bg/20 text-center">
          <button className="text-sm font-bold text-brand-blue hover:underline underline-offset-4">View all cases</button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm p-7 col-span-2">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Weekly Activity</h3>
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
        </div>
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm p-7">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Case Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Active',   count: 24, pct: 60, color: 'bg-brand-blue'  },
              { label: 'Pending',  count: 8,  pct: 20, color: 'bg-amber-400'   },
              { label: 'Resolved', count: 12, pct: 30, color: 'bg-emerald-400' },
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
