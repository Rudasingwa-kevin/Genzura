import { useState, type FormEvent } from 'react';
import {
  User as UserIcon,
  Building,
  Shield,
  Bell,
  Camera,
  Monitor,
  Loader2,
  Palette,
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Moon,
  Sun,
  Layout,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import PricingPage from './PricingPage';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'organization' | 'security' | 'notifications' | 'appearance' | 'subscription';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'profile',      label: 'Personal Profile',    icon: UserIcon,     color: 'text-brand-blue' },
  { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard, color: 'text-purple-600' },
  { id: 'organization', label: 'Organization Info',   icon: Building,     color: 'text-emerald-600' },
  { id: 'security',     label: 'Security & Access',   icon: Shield,       color: 'text-amber-600' },
  { id: 'notifications',label: 'Notifications',       icon: Bell,         color: 'text-violet-600' },
  { id: 'appearance',   label: 'Interface Design',    icon: Palette,      color: 'text-rose-500' },
];

// ─── Shared form primitives ───────────────────────────────────────────────────
const SectionHeader = ({ title, sub }: { title: string; sub: string }) => (
  <div className="mb-8">
    <h3 className="text-xl font-bold text-brand-dark tracking-tight leading-tight">{title}</h3>
    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.1em] mt-1">{sub}</p>
  </div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between ml-1">
      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-[0.1em]">{label}</label>
      {hint && <span className="text-[9px] font-bold text-text-muted italic">{hint}</span>}
    </div>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all bg-white font-bold text-brand-dark shadow-sm ${props.className ?? ''}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <div className="relative group">
    <select
      {...props}
      className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none font-bold text-brand-dark shadow-sm cursor-pointer group-hover:border-brand-blue/30"
    />
    <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted rotate-90 pointer-events-none" />
  </div>
);

const SaveButton = ({ label = 'Save Changes', isSaving = false }: { label?: string; isSaving?: boolean }) => (
  <button 
    disabled={isSaving}
    className="bg-brand-blue text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-70 active:scale-95"
  >
    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
    {label}
  </button>
);

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 shadow-inner ${on ? 'bg-brand-blue' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${on ? 'left-6.5' : 'left-0.5'}`} />
  </button>
);

// ─── Tab Components ───────────────────────────────────────────────────────────

const ProfileTab = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUser({ firstName, lastName });
      setIsSaving(false);
      toast.success('Profile updated successfully!', { icon: '👤' });
    }, 800);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in-fade">
      <SectionHeader title="Profile Settings" sub="Manage your public-facing identity" />
      
      {/* Executive Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-8 bg-page-bg/50 p-8 rounded-[2rem] border border-border-base shadow-inner">
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-[2rem] bg-brand-dark text-white font-bold text-4xl flex items-center justify-center shadow-2xl border-4 border-white transition-transform group-hover:scale-105 duration-500">
            {user.initials}
          </div>
          <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-blue text-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
            <Camera size={18} />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <p className="font-bold text-brand-dark text-2xl tracking-tight">{user.firstName} {user.lastName}</p>
          <p className="text-xs font-bold text-brand-blue uppercase tracking-[0.1em] mt-1">Lead Litigation Counsel</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-6">
            <button type="button" className="text-xs font-bold text-brand-blue uppercase tracking-[0.1em] hover:bg-white px-4 py-2 rounded-xl transition-all border border-brand-blue/10">Upload Photo</button>
            <button type="button" className="text-xs font-bold text-red-500 uppercase tracking-[0.1em] hover:bg-white px-4 py-2 rounded-xl transition-all border border-red-500/10">Remove</button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <Field label="First Name"><Input required value={firstName} onChange={e => setFirstName(e.target.value)} /></Field>
        <Field label="Last Name"><Input required value={lastName} onChange={e => setLastName(e.target.value)} /></Field>
        <Field label="Professional Email" hint="Cannot be changed"><Input readOnly value={user.email} className="bg-page-bg/50 text-text-muted cursor-not-allowed border-dashed" /></Field>
        <Field label="Phone"><Input type="tel" defaultValue="+1 (555) 100-2030" /></Field>
        <Field label="Location"><Input defaultValue="London, UK" /></Field>
        <Field label="Language"><Select defaultValue="EN"><option value="EN">English (US)</option><option value="FR">Français</option></Select></Field>
      </div>

      <div className="pt-8 border-t border-border-base flex justify-end">
        <SaveButton isSaving={isSaving} />
      </div>
    </form>
  );
};

const SecurityTab = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <div className="space-y-12 animate-in-fade">
      <SectionHeader title="Security Controls" sub="Protect your legal data and access" />
      
      <form onSubmit={(e) => { e.preventDefault(); setIsSaving(true); setTimeout(() => { setIsSaving(false); toast.success('Password updated!'); }, 800); }} className="bg-page-bg/50 rounded-[2rem] p-8 border border-border-base space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-inner"><Lock size={20}/></div>
          <h4 className="font-bold text-brand-dark uppercase tracking-[0.1em] text-xs">Update Credentials</h4>
        </div>
        <Field label="Current Password"><Input type="password" placeholder="••••••••" /></Field>
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="New Password"><Input type="password" placeholder="Min. 12 chars" /></Field>
          <Field label="Confirm New Password"><Input type="password" placeholder="••••••••" /></Field>
        </div>
        <div className="flex justify-end pt-4">
          <SaveButton label="Update Password" isSaving={isSaving} />
        </div>
      </form>

      <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <ShieldCheck size={160} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold tracking-tight mb-2">Multi-Factor Authentication</h4>
            <p className="text-sm text-white/60 font-medium max-w-md">Add an extra layer of protection using an authenticator app or biometric key.</p>
          </div>
          <button 
            onClick={() => { setIs2FAEnabled(!is2FAEnabled); toast.success(is2FAEnabled ? '2FA Disabled' : '2FA Enabled'); }}
            className={`px-8 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] transition-all ${is2FAEnabled ? 'bg-white/10 text-white border border-white/20' : 'bg-white text-brand-dark shadow-xl hover:-translate-y-1'}`}
          >
            {is2FAEnabled ? 'Manage 2FA' : 'Activate Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppearanceTab = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  
  return (
    <div className="space-y-10 animate-in-fade">
      <SectionHeader title="Interface Design" sub="Customize the look and feel of Genzura" />
      
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { id: 'light', label: 'Classic Light', icon: Sun,   bg: 'bg-white', text: 'text-brand-dark' },
          { id: 'dark',  label: 'Midnight',      icon: Moon,  bg: 'bg-brand-dark', text: 'text-white' },
          { id: 'auto',  label: 'System Sync',   icon: Monitor, bg: 'bg-page-bg', text: 'text-text-muted' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`relative p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center group ${
              theme === t.id ? 'border-brand-blue bg-brand-light/20' : 'border-border-base hover:border-brand-blue/30'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl ${t.bg} ${t.text} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
              <t.icon size={28} />
            </div>
            <div>
              <p className="font-bold text-brand-dark text-sm tracking-tight">{t.label}</p>
              {theme === t.id && <span className="text-[9px] font-bold text-brand-blue uppercase tracking-[0.1em] mt-1 block">Active</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-[0.1em] ml-1">Sidebar Layout</h4>
        <div className="bg-page-bg/50 rounded-[2rem] p-8 border border-border-base flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-border-base flex items-center justify-center text-brand-blue shadow-sm"><Layout size={24}/></div>
            <div>
              <p className="font-bold text-brand-dark text-sm">Compact Navigation</p>
              <p className="text-xs text-text-muted font-medium">Minimize the sidebar for more focus space</p>
            </div>
          </div>
          <Toggle on={false} onChange={() => {}} />
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const [isSaving] = useState(false);
  
  return (
    <div className="space-y-10 animate-in-fade">
      <SectionHeader title="Smart Notifications" sub="Configure when and how you stay informed" />
      
      <div className="space-y-4">
        {[
          { label: 'Case Assignments', desc: 'When you are added to a new litigation matter', email: true },
          { label: 'Timeline Milestones', desc: 'Upcoming deadlines and status changes', email: true },
          { label: 'Document Activity', desc: 'New uploads or edits to case files', email: false },
          { label: 'Security Alerts', desc: 'Critical login activity and safety reports', email: true },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-border-base rounded-[1.75rem] p-6 flex items-center justify-between group hover:border-brand-blue/20 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-page-bg text-text-muted flex items-center justify-center group-hover:text-brand-blue group-hover:bg-brand-light transition-all">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-brand-dark text-sm leading-tight">{item.label}</p>
                <p className="text-xs text-text-muted font-medium mt-0.5">{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] hidden sm:block">{item.email ? 'Email ON' : 'Email OFF'}</span>
              <Toggle on={item.email} onChange={() => {}} />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-border-base flex justify-end">
        <SaveButton label="Save Preferences" isSaving={isSaving} />
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'subscription': return <PricingPage variant="settings" />;
      case 'security': return <SecurityTab />;
      case 'appearance': return <AppearanceTab />;
      case 'notifications': return <NotificationsTab />;
      default: return <div className="py-20 text-center text-text-muted font-bold uppercase tracking-[0.1em]">Workspace Management (Coming Soon)</div>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-10">
        
        <div className="animate-in-fade">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">System Preferences</h1>
          <p className="text-text-secondary font-bold mt-1">Configure your legal workstation and account security</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-72 shrink-0 bg-white border border-border-base rounded-[2.5rem] p-4 shadow-sm space-y-2 sticky top-24 z-10">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] transition-all group ${
                  activeTab === t.id
                    ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20'
                    : 'text-text-muted hover:text-brand-dark hover:bg-page-bg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <t.icon size={18} className={activeTab === t.id ? 'text-white' : t.color} />
                  {t.label.split(' ')[0]}
                </div>
                <ChevronRight size={14} className={`transition-all ${activeTab === t.id ? 'translate-x-1' : 'opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* Content Card */}
          <div className={`flex-1 w-full bg-white border border-border-base rounded-[3rem] shadow-sm relative overflow-hidden min-h-[600px] ${
            activeTab === 'subscription' ? 'p-6' : 'p-10'
          }`}>
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Zap size={240} />
            </div>
            <div className="relative z-10">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
