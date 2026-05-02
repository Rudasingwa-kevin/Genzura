import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl transition-all duration-300 ${active
    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/25 translate-x-1'
    : 'text-text-secondary hover:bg-brand-light/80 hover:text-brand-blue hover:translate-x-1'
    }`}>
    <Icon size={22} />
    <span className="font-semibold text-[15px]">{label}</span>
  </a>
);

const CaseRow = ({ id, title, client, status, date }: any) => (
  <tr className="border-b border-border-base hover:bg-page-bg/50 transition-colors group">
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
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'Active' ? 'bg-emerald-100/50 text-emerald-700' :
        status === 'Pending' ? 'bg-amber-100/50 text-amber-700' :
          'bg-slate-100/50 text-slate-700'
        }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' :
          status === 'Pending' ? 'bg-amber-500' :
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
    <div className="flex min-h-screen bg-page-bg font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border-base flex flex-col p-8 fixed inset-y-0 left-0 shadow-sm z-40">
        <div className="flex items-center mb-12">
          <img src="/Genzura website header.png" alt="Genzura" className="h-20 w-auto" />
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Briefcase} label="Cases" />
          <SidebarItem icon={Users} label="Clients" />
          <SidebarItem icon={BarChart3} label="Analytics" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-border-base mt-6">
          <div className="bg-brand-light/50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
              JW
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-dark text-sm truncate">James Wilson</p>
              <p className="text-xs text-text-muted truncate underline cursor-pointer hover:text-brand-blue transition-colors">Log out</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px]">
        {/* Top Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-border-base flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <div className="relative w-full group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-blue transition-colors" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-page-bg/80 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-brand-light text-text-secondary relative transition-all">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="bg-brand-blue text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95">
              <Plus size={18} /> New Case
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Active Cases", value: "24", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50/50" },
              { label: "Pending Review", value: "08", icon: Clock, color: "text-amber-600", bg: "bg-amber-50/50" },
              { label: "Resolved", value: "12", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" },
              { label: "System Alerts", value: "02", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50/50" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-7 rounded-[2rem] border border-border-base shadow-sm hover:shadow-md transition-shadow">
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
                  <CaseRow id="CZ-882" title="Corporate Restructuring" client="Apex Global Inc." status="Active" date="2 hours ago" />
                  <CaseRow id="CZ-879" title="Intellectual Property Audit" client="NextGen Systems" status="Pending" date="5 hours ago" />
                  <CaseRow id="CZ-875" title="Compliance Verification" client="Horizon Partners" status="Active" date="Yesterday" />
                  <CaseRow id="CZ-871" title="Litigation Strategy" client="Silverline Law" status="Resolved" date="2 days ago" />
                  <CaseRow id="CZ-868" title="Asset Recovery Plan" client="Estate Mgmt Co." status="Active" date="3 days ago" />
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-page-bg/20 text-center">
              <button className="text-sm font-bold text-brand-blue hover:underline underline-offset-4">View all cases</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
