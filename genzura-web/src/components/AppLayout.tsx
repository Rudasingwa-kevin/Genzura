import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  BarChart3,
  Calendar as CalendarIcon,
  Folder
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Briefcase,       label: 'Cases',     to: '/cases'     },
  { icon: CalendarIcon,    label: 'Calendar',  to: '/calendar'  },
  { icon: Folder,          label: 'Documents', to: '/documents' },
  { icon: Users,           label: 'Clients',   to: '/clients'   },
  { icon: BarChart3,       label: 'Analytics', to: '/analytics' },
  { icon: Settings,        label: 'Settings',  to: '/settings'  },
];

const SidebarItem = ({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: string }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl transition-all duration-300 no-underline ${
        active
          ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/25 translate-x-1'
          : 'text-text-secondary hover:bg-brand-light/80 hover:text-brand-blue hover:translate-x-1'
      }`}
    >
      <Icon size={22} />
      <span className="font-semibold text-[15px]">{label}</span>
    </Link>
  );
};

interface AppLayoutProps {
  children: ReactNode;
  /** Page title shown in the topbar */
  title?: string;
  /** Optional topbar right-side action button */
  action?: ReactNode;
}

export default function AppLayout({ children, title, action }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-page-bg font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border-base flex flex-col p-8 fixed inset-y-0 left-0 shadow-sm z-40">
        <div className="flex items-center mb-12">
          <img src="/Genzura website header.png" alt="Genzura" className="h-20 w-auto" />
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <SidebarItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="pt-6 border-t border-border-base mt-6">
          <div className="bg-brand-light/50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
              {user?.initials || 'JW'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-dark text-sm truncate">{user ? `${user.firstName} ${user.lastName}` : 'James Wilson'}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-text-muted truncate underline cursor-pointer hover:text-brand-blue transition-colors block text-left"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] min-w-0 overflow-x-hidden">
        {/* Top Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-border-base flex items-center justify-between px-8 sticky top-0 z-30">
          {/* Search */}
          <div className="relative w-64 group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-blue transition-colors" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="p-2 rounded-xl hover:bg-brand-light text-text-secondary relative transition-all">
              <Bell size={20} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            {action ?? (
              <button className="bg-brand-blue text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap">
                <Plus size={18} /> New Case
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 space-y-8">
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
