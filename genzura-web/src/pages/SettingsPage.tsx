import { useState, type FormEvent } from 'react';
import { User as UserIcon, Building, Shield, Bell, Camera, Eye, EyeOff, Monitor, Smartphone, Check, Loader2 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'organization' | 'security' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',      label: 'Profile',       icon: UserIcon },
  { id: 'organization', label: 'Organization',  icon: Building },
  { id: 'security',     label: 'Security',      icon: Shield   },
  { id: 'notifications',label: 'Notifications', icon: Bell     },
];

// ─── Shared form primitives ───────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-brand-dark ml-1">{label}</label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white ${props.className ?? ''}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    {...props}
    className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none"
  />
);

const SaveButton = ({ label = 'Save Changes', isSaving = false }: { label?: string; isSaving?: boolean }) => (
  <button 
    disabled={isSaving}
    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
  >
    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
    {label}
  </button>
);

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, show }: { message: string, show: boolean }) => (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl transition-all duration-500 z-50 flex items-center gap-2 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
    <Check size={18} /> {message}
  </div>
);

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${on ? 'bg-brand-blue' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${on ? 'left-5' : 'left-0.5'}`} />
  </button>
);

// ─── Profile Tab ─────────────────────────────────────────────────────────────
const ProfileTab = ({ onSave }: { onSave: (msg: string) => void }) => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateUser({ firstName, lastName, email });
      setIsSaving(false);
      onSave('Profile updated successfully');
    }, 600);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user.initials}
          </div>
          <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl border border-border-base shadow flex items-center justify-center text-text-secondary hover:text-brand-blue transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <p className="font-bold text-brand-dark text-lg">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-text-muted">Head of Compliance, Apex Group</p>
          <button type="button" className="mt-2 text-xs font-bold text-brand-blue hover:underline">Upload new photo</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="First Name">
          <Input required value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
        </Field>
        <Field label="Last Name">
          <Input required value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
        </Field>
        <Field label="Email Address">
          <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Job Title"><Input defaultValue="Head of Compliance" /></Field>
        <Field label="Phone Number"><Input type="tel" defaultValue="+1 (555) 100-2030" autoComplete="tel" /></Field>
        <Field label="Location"><Input defaultValue="New York, USA" /></Field>
      </div>

      <div className="pt-4 border-t border-border-base flex justify-end">
        <SaveButton isSaving={isSaving} />
      </div>
    </form>
  );
};

// ─── Organization Tab ─────────────────────────────────────────────────────────
const OrganizationTab = ({ onSave }: { onSave: (msg: string) => void }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave('Organization details saved');
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Organization Name"><Input required defaultValue="Apex Group" autoComplete="organization" /></Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Industry">
          <Select defaultValue="Legal">
            <option>Legal</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Technology</option>
            <option>Real Estate</option>
          </Select>
        </Field>
        <Field label="Organization Size">
          <Select defaultValue="51-200">
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000+</option>
          </Select>
        </Field>
        <Field label="Country">
          <Select defaultValue="United States">
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Rwanda</option>
          </Select>
        </Field>
        <Field label="Timezone">
          <Select defaultValue="America/New_York">
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="America/Chicago">Central Time (UTC-6)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Africa/Kigali">Kigali (UTC+2)</option>
          </Select>
        </Field>
      </div>
      <Field label="Website"><Input type="url" defaultValue="https://apexgroup.com" /></Field>
      <div className="pt-4 border-t border-border-base flex justify-end">
        <SaveButton isSaving={isSaving} />
      </div>
    </form>
  );
};

// ─── Security Tab ─────────────────────────────────────────────────────────────
const SecurityTab = ({ onSave }: { onSave: (msg: string) => void }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const sessions = [
    { device: 'MacBook Pro', os: 'macOS 14', location: 'New York, USA', icon: Monitor, current: true,  last: 'Active now'    },
    { device: 'iPhone 15',   os: 'iOS 17',   location: 'New York, USA', icon: Smartphone, current: false, last: '2 hours ago'  },
  ];

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave('Password updated successfully');
      // In a real app we would clear the fields here
    }, 600);
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    onSave(is2FAEnabled ? '2FA disabled' : '2FA enabled');
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="bg-page-bg rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-brand-dark text-lg">Change Password</h3>
        <Field label="Current Password">
          <div className="relative">
            <Input required type={showCurrent ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-blue">
              {showCurrent ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="New Password">
            <div className="relative">
              <Input required minLength={8} type={showNew ? 'text' : 'password'} placeholder="Min. 8 characters" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-blue">
                {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </Field>
          <Field label="Confirm New Password">
            <Input required minLength={8} type="password" placeholder="Re-enter password" autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <SaveButton label="Update Password" isSaving={isSaving} />
        </div>
      </form>

      {/* Two-Factor */}
      <div className="bg-page-bg rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-brand-dark text-lg">Two-Factor Authentication</h3>
          <p className="text-sm text-text-secondary mt-1">Add an extra layer of security to your account</p>
        </div>
        <button 
          onClick={handleToggle2FA}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all shrink-0 ${is2FAEnabled ? 'bg-white text-red-600 border border-border-base hover:bg-red-50' : 'bg-brand-blue text-white hover:shadow-lg'}`}
        >
          {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="font-bold text-brand-dark mb-4 text-lg">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.device} className="bg-white border border-border-base rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue shrink-0"><s.icon size={20}/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-dark text-sm truncate">{s.device}</p>
                  {s.current && <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">Current</span>}
                </div>
                <p className="text-xs text-text-muted truncate">{s.os} · {s.location} · {s.last}</p>
              </div>
              {!s.current && (
                <button className="text-xs font-bold text-red-500 hover:underline shrink-0">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Notifications Tab ────────────────────────────────────────────────────────
interface NotiGroup { group: string; items: { label: string; desc: string; email: boolean; inApp: boolean }[] }

const NOTI_GROUPS: NotiGroup[] = [
  {
    group: 'Case Activity',
    items: [
      { label: 'New case assigned',     desc: 'When a case is assigned to you',          email: true,  inApp: true  },
      { label: 'Case status changed',   desc: 'When any case status is updated',         email: false, inApp: true  },
      { label: 'Deadline approaching',  desc: '48 hours before a case deadline',         email: true,  inApp: true  },
    ],
  },
  {
    group: 'Team & Collaboration',
    items: [
      { label: 'New comment on case',   desc: 'When someone comments on your case',      email: false, inApp: true  },
      { label: 'Document uploaded',     desc: 'When a new document is added',            email: true,  inApp: false },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Security alerts',       desc: 'Unusual login or activity detected',      email: true,  inApp: true  },
      { label: 'Product updates',       desc: 'New features and platform improvements',  email: false, inApp: false },
    ],
  },
];

const NotificationsTab = ({ onSave }: { onSave: (msg: string) => void }) => {
  const [state, setState] = useState(NOTI_GROUPS);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (gi: number, ii: number, channel: 'email' | 'inApp') => {
    setState((prev) =>
      prev.map((g, gIdx) =>
        gIdx !== gi ? g : {
          ...g, items: g.items.map((item, iIdx) =>
            iIdx !== ii ? item : { ...item, [channel]: !item[channel] }
          ),
        }
      )
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave('Notification preferences saved');
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {state.map((g, gi) => (
        <div key={g.group}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">{g.group}</h3>
          <div className="space-y-3">
            {g.items.map((item, ii) => (
              <div key={item.label} className="bg-white border border-border-base rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-dark text-sm">{item.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-6 sm:ml-auto">
                  <div className="flex flex-col items-center gap-1">
                    <Toggle on={item.email} onChange={() => toggle(gi, ii, 'email')} />
                    <span className="text-[9px] font-semibold text-text-muted uppercase">Email</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Toggle on={item.inApp} onChange={() => toggle(gi, ii, 'inApp')} />
                    <span className="text-[9px] font-semibold text-text-muted uppercase">In-App</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-border-base flex justify-end">
        <SaveButton label="Save Preferences" isSaving={isSaving} />
      </div>
    </form>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const TAB_CONTENT: Record<Tab, JSX.Element> = {
    profile:      <ProfileTab onSave={triggerToast} />,
    organization: <OrganizationTab onSave={triggerToast} />,
    security:     <SecurityTab onSave={triggerToast} />,
    notifications:<NotificationsTab onSave={triggerToast} />,
  };

  return (
    <AppLayout>
      <Toast message={toastMsg} show={showToast} />
      
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account and workspace preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Sidebar tabs */}
        <div className="w-full md:w-56 shrink-0 bg-white border border-border-base rounded-[1.5rem] p-3 flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 md:gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap md:whitespace-normal shrink-0 md:shrink ${
                tab === t.id
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-text-secondary hover:bg-page-bg hover:text-brand-dark'
              }`}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 w-full bg-white border border-border-base rounded-[2rem] p-6 lg:p-8 min-w-0">
          {TAB_CONTENT[tab]}
        </div>
      </div>
    </AppLayout>
  );
}
