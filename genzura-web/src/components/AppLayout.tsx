import { useState, useRef, useEffect, type ReactNode } from 'react';
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
  Folder,
  X,
  Briefcase as CaseIcon,
  Calendar as CalIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NewCaseModal from './NewCaseModal';
import Breadcrumbs from './Breadcrumbs';
import EmptyState from './EmptyState';
import { CASES } from '../data/cases';

// ─── Notifications Data ────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: 'case' | 'deadline' | 'document' | 'alert' | 'resolved';
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'alert', read: false,
    title: 'Court Date Tomorrow',
    body: 'Initial Hearing for Apex Global (CZ-882) is scheduled for 9:00 AM.',
    time: '2 hours ago', link: '/cases/CZ-882',
  },
  {
    id: 'n2', type: 'deadline', read: false,
    title: 'Filing Deadline in 3 Days',
    body: 'Submit Briefing Docs for Nexus Tech (CZ-875) by May 22.',
    time: '5 hours ago', link: '/cases/CZ-875',
  },
  {
    id: 'n3', type: 'document', read: false,
    title: 'New Document Uploaded',
    body: 'Client Intake Form was uploaded for BlueOak Corp.',
    time: 'Yesterday', link: '/documents',
  },
  {
    id: 'n4', type: 'case', read: true,
    title: 'Case Status Updated',
    body: 'Fund Audit (CZ-860) has been marked as Resolved.',
    time: '2 days ago', link: '/cases/CZ-860',
  },
  {
    id: 'n5', type: 'resolved', read: true,
    title: 'Task Completed',
    body: 'File extension request for CZ-875 was marked complete by James W.',
    time: '3 days ago',
  },
];

const notifIcon: Record<Notification['type'], { icon: React.ElementType; bg: string; color: string }> = {
  alert:    { icon: AlertTriangle, bg: 'bg-red-50',     color: 'text-red-500'      },
  deadline: { icon: CalIcon,       bg: 'bg-amber-50',   color: 'text-amber-500'    },
  document: { icon: FileText,      bg: 'bg-blue-50',    color: 'text-blue-500'     },
  case:     { icon: CaseIcon,      bg: 'bg-brand-light', color: 'text-brand-blue'  },
  resolved: { icon: CheckCircle2,  bg: 'bg-emerald-50', color: 'text-emerald-500'  },
};

// ─── Notification Panel ────────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id: string) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const dismiss = (id: string) => setNotifs(n => n.filter(x => x.id !== id));

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] bg-white rounded-[1.5rem] border border-border-base shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-brand-dark text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-page-bg text-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border-base max-h-[480px] overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="py-8">
            <EmptyState 
              illustration="notifications"
              title="All Caught Up!"
              description="No new notifications at the moment. We'll let you know when something important happens."
            />
          </div>
        ) : (
          notifs.map((notif) => {
            const cfg = notifIcon[notif.type];
            const IconComp = cfg.icon;
            return (
              <div
                key={notif.id}
                className={`flex gap-4 px-5 py-4 hover:bg-page-bg/60 transition-colors group cursor-pointer ${!notif.read ? 'bg-brand-light/20' : ''}`}
                onClick={() => {
                  markRead(notif.id);
                  if (notif.link) { onClose(); navigate(notif.link); }
                }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <IconComp size={18} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${notif.read ? 'font-semibold text-text-secondary' : 'font-bold text-brand-dark'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{notif.body}</p>
                  <p className="text-[10px] text-text-muted mt-1.5 font-medium">{notif.time}</p>
                </div>

                {/* Dismiss */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-border-base text-text-muted transition-all shrink-0 mt-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifs.length > 0 && (
        <div className="border-t border-border-base px-6 py-3 text-center">
          <Link
            to="/settings"
            onClick={onClose}
            className="text-xs font-bold text-text-muted hover:text-brand-blue transition-colors"
          >
            Notification Settings
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
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

// ─── Search Results Dropdown ───────────────────────────────────────────────────
function SearchResultDropdown({
  results,
  onClose,
  onClear
}: {
  results: typeof CASES;
  onClose: () => void;
  onClear: () => void;
}) {
  const navigate = useNavigate();

  if (results.length === 0) return null;

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[320px] bg-white/90 backdrop-blur-xl rounded-[1.5rem] border border-border-base shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-5 py-3 border-b border-border-base bg-page-bg/30">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Search Results ({results.length})</p>
      </div>
      <div className="max-h-[360px] overflow-y-auto divide-y divide-border-base">
        {results.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-brand-blue hover:text-white group cursor-pointer transition-colors"
            onClick={() => {
              navigate(`/cases/${c.id}`);
              onClose();
              onClear();
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue font-bold text-xs group-hover:bg-white/20 group-hover:text-white shrink-0">
              {c.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{c.title}</p>
              <p className="text-xs opacity-70 truncate">{c.client} • {c.attorney}</p>
            </div>
            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
          </div>
        ))}
      </div>
      <div className="px-5 py-3 text-center border-t border-border-base">
        <button
          onClick={onClose}
          className="text-xs font-bold text-text-muted hover:text-brand-blue transition-colors"
        >
          Close Results
        </button>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export default function AppLayout({ children, title, action }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.trim().length > 1
    ? CASES.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const unreadCount = INITIAL_NOTIFICATIONS.filter(n => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Handle click outside and Esc for Search
  useEffect(() => {
    const handleEvents = (e: any) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    };
    if (searchQuery) {
      document.addEventListener('mousedown', handleEvents);
      document.addEventListener('keydown', handleEvents);
    }
    return () => {
      document.removeEventListener('mousedown', handleEvents);
      document.removeEventListener('keydown', handleEvents);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-page-bg font-sans">
      {/* Global New Case Modal */}
      {showNewCase && <NewCaseModal onClose={() => setShowNewCase(false)} />}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] bg-white border-r border-border-base flex flex-col p-8 fixed inset-y-0 left-0 shadow-sm z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12 shrink-0">
          <img src="/Genzura website header.png" alt="Genzura" className="h-20 w-auto" />
          <button 
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-page-bg transition-colors -mr-2"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-3 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => (
            <div key={item.to} onClick={() => setSidebarOpen(false)}>
              <SidebarItem {...item} />
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-border-base mt-6 shrink-0">
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
      <main className="flex-1 lg:ml-[260px] min-w-0 overflow-x-hidden flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-border-base flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-text-secondary hover:bg-page-bg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Search */}
            <div className="relative w-full max-w-[160px] sm:max-w-xs group hidden md:block" ref={searchRef}>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-blue transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-page-bg text-text-muted transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              
              <SearchResultDropdown 
                results={filteredResults} 
                onClose={() => setSearchQuery('')}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bell with notification panel */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell"
                onClick={() => setNotifOpen((prev) => !prev)}
                className={`p-2 rounded-xl transition-all relative ${notifOpen ? 'bg-brand-light text-brand-blue shadow-inner' : 'hover:bg-brand-light text-text-secondary'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {action ?? (
              <button 
                onClick={() => setShowNewCase(true)}
                className="bg-brand-blue text-white px-3 py-2 lg:px-5 lg:py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} /> <span className="hidden sm:inline">New Case</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 flex-1">
          <Breadcrumbs />
          {title && (
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-brand-dark">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
