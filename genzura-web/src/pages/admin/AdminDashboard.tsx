import { 
  Users, 
  Database, 
  Shield,
  Activity, 
  TrendingUp, 
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Server
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { CardSkeleton } from '../../components/Skeleton';
import { useState, useEffect } from 'react';

// ─── Specialized Admin Components ─────────────────────────────────────────────

const AdminKpiCard = ({ label, value, sub, icon: Icon, color, bg, trend }: any) => (
  <div className="bg-white rounded-[2rem] border border-border-base p-7 hover:shadow-lg transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <TrendingUp size={12} /> {trend}
        </div>
      )}
    </div>
    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold text-brand-dark tracking-tight">{value}</p>
    <p className="text-xs text-text-muted mt-1">{sub}</p>
  </div>
);

const LicenseUsage = () => (
  <div className="bg-white rounded-[2.5rem] border border-border-base p-8 shadow-sm h-full">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-xl font-bold text-brand-dark">Workforce Capacity</h3>
        <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-medium">License seat distribution</p>
      </div>
      <button className="text-brand-blue font-bold text-xs hover:underline flex items-center gap-1">
        Manage Seats <ArrowRight size={14} />
      </button>
    </div>
    
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-brand-dark">Enterprise Seats</span>
          <span className="text-sm font-bold text-brand-blue">42 / 50</span>
        </div>
        <div className="h-3 bg-page-bg rounded-full overflow-hidden border border-border-base">
          <div className="h-full bg-brand-blue w-[84%] rounded-full shadow-[0_0_12px_rgba(24,95,165,0.3)]" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-4">
        {[
          { label: 'Attorneys', count: 28, color: 'bg-brand-blue' },
          { label: 'Paralegals', count: 10, color: 'bg-emerald-500' },
          { label: 'Support', count: 4, color: 'bg-amber-500' },
        ].map(item => (
          <div key={item.label} className="p-4 rounded-2xl bg-page-bg border border-border-base text-center">
            <p className="text-lg font-bold text-brand-dark">{item.count}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AuditLogItem = ({ action, user, time, status }: any) => (
  <div className="flex items-center gap-4 py-4 group cursor-pointer">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
      status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
      <Activity size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-brand-dark group-hover:text-brand-blue transition-colors truncate">{action}</p>
      <p className="text-[11px] text-text-muted font-medium mt-0.5">{user} • {time}</p>
    </div>
    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-blue transition-colors" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout title="Admin Command Center">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Admin Command Center</h1>
          <p className="text-sm text-text-muted mt-1">High-fidelity oversight of firm-wide resources and security.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all shadow-sm">
            <Shield size={18} /> Security Audit
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-blue/20">
            <UserPlus size={18} /> Invite Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <AdminKpiCard 
              label="Firm Workforce" 
              value="42" 
              sub="Active team members" 
              icon={Users} 
              color="text-brand-blue" 
              bg="bg-brand-light" 
              trend="+2"
            />
            <AdminKpiCard 
              label="Global Storage" 
              value="1.2 TB" 
              sub="82% capacity used" 
              icon={Database} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
            />
            <AdminKpiCard 
              label="System Health" 
              value="99.9%" 
              sub="All systems operational" 
              icon={Activity} 
              color="text-violet-600" 
              bg="bg-violet-50" 
            />
            <AdminKpiCard 
              label="Security Events" 
              value="0" 
              sub="Critical issues detected" 
              icon={Shield} 
              color="text-rose-500" 
              bg="bg-rose-50" 
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mb-10">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-border-base p-8 shadow-sm">
           <div className="mb-6">
            <h3 className="text-xl font-bold text-brand-dark">Firm Identity</h3>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-medium">Digital presence</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-page-bg border border-border-base">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
                <img src="/Genzura Logo.png" alt="Firm Logo" className="w-full h-auto" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-brand-dark truncate text-sm">Genzura Litigation</p>
                <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest mt-0.5">Enterprise Plan</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-text-muted uppercase">Matter Taxonomy</span>
                <span className="text-brand-dark">6 Active Types</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-text-muted uppercase">Retention Policy</span>
                <span className="text-brand-dark">7 Years (Default)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <LicenseUsage />
        </div>
      </div>

        <div className="bg-white rounded-[2.5rem] border border-border-base p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-brand-dark tracking-tight">Audit Trail</h3>
            <button className="p-2.5 rounded-xl hover:bg-page-bg text-text-muted transition-all"><Activity size={18} /></button>
          </div>
          
          <div className="divide-y divide-border-base">
            <AuditLogItem action="Updated Practice Area Policies" user="Admin (Self)" time="24 mins ago" status="success" />
            <AuditLogItem action="New User Access: David Chen" user="James Wilson" time="2 hours ago" status="success" />
            <AuditLogItem action="Failed Login Attempt (IP: 192.x)" user="System" time="5 hours ago" status="warning" />
            <AuditLogItem action="Bulk Case Export Initiated" user="Sarah Miller" time="Yesterday" status="success" />
            <AuditLogItem action="Storage Expansion Approved" user="Admin (Self)" time="2 days ago" status="success" />
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl bg-page-bg text-sm font-bold text-text-secondary hover:text-brand-blue transition-all border border-transparent hover:border-border-base">
            View Full System Logs
          </button>
        </div>

      {/* System Infrastructure */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {[
          { label: 'Compute Engine', status: 'Stable', icon: Server, color: 'text-brand-blue' },
          { label: 'Database Sync', status: 'In Sync', icon: Database, color: 'text-emerald-500' },
          { label: 'Auth Gateway', status: 'Protected', icon: ShieldAlert, color: 'text-violet-500' },
        ].map((sys) => (
          <div key={sys.label} className="bg-white rounded-2xl border border-border-base p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-page-bg ${sys.color}`}><sys.icon size={20} /></div>
            <div>
              <p className="text-sm font-bold text-brand-dark">{sys.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{sys.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
