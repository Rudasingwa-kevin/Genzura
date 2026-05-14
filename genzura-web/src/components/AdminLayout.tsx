import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Settings, 
  Activity, 
  LogOut, 
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Admin Overview', to: '/admin' },
  { icon: Users,           label: 'Team Management', to: '/admin/users' },
  { icon: Settings,        label: 'System Config',   to: '/admin/settings' },
  { icon: Activity,        label: 'Audit Trail',     to: '/admin/audit' },
];

const SidebarItem = ({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: string }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 no-underline ${
        active
          ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/25 translate-x-1'
          : 'text-slate-500 hover:bg-slate-100 hover:text-brand-dark hover:translate-x-1'
      }`}
    >
      <Icon size={22} />
      <span className="font-bold text-[15px]">{label}</span>
    </Link>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[280px] bg-white border-r border-slate-200 flex flex-col p-8 fixed inset-y-0 left-0 shadow-sm z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-black text-xl text-brand-dark tracking-tighter leading-none">GENZURA</p>
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mt-1">Admin Command</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-3 min-h-0 [&::-webkit-scrollbar]:hidden">
          <p className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Command Modules</p>
          {adminNavItems.map((item) => (
            <div key={item.to} onClick={() => setSidebarOpen(false)}>
              <SidebarItem {...item} />
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 mt-6 shrink-0">
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 mt-2 font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
            >
              <LayoutDashboard size={20} />
            </button>
            <h2 className="text-sm font-bold text-brand-dark tracking-tight hidden sm:block">
              {title || "Firm Administration"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">System Online</span>
            </div>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-brand-dark leading-none">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-bold text-brand-blue uppercase mt-1 tracking-widest">Superuser</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-dark/20 border border-white/10">
                {user?.initials || 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
