import { useState, useEffect, type FormEvent } from 'react';
import {
  User as UserIcon,
  Building,
  Shield,
  Bell,
  Camera,
  Loader2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import PricingPage from './PricingPage';
import { authService } from '../api/services/auth.service';
import { notificationPreferencesService, type NotificationPreferences } from '../api/services/notificationPreferences.service';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'organization' | 'security' | 'notifications' | 'subscription';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'profile',      label: 'Personal Profile',    icon: UserIcon,     color: 'text-brand-blue' },
  { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard, color: 'text-purple-600' },
  { id: 'organization', label: 'Organization Info',   icon: Building,     color: 'text-emerald-600' },
  { id: 'security',     label: 'Security & Access',   icon: Shield,       color: 'text-amber-600' },
  { id: 'notifications',label: 'Notifications',       icon: Bell,         color: 'text-violet-600' },
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUser({ firstName, lastName, phone, location, jobTitle });
      setIsSaving(false);
      toast.success('Profile updated successfully!', { icon: '👤' });
    }, 800);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await authService.uploadAvatar(file);
      await updateUser(updatedUser);
      toast.success('Avatar updated successfully!', { icon: '📸' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user?.avatarUrl) return;

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await authService.removeAvatar();
      await updateUser(updatedUser);
      toast.success('Avatar removed', { icon: '🗑️' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in-fade">
      <SectionHeader title="Profile Settings" sub="Manage your public-facing identity" />

      {/* Executive Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-8 bg-page-bg/50 p-8 rounded-[2rem] border border-border-base shadow-inner">
        <div className="relative group shrink-0">
          {user.avatarUrl ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatarUrl}`}
              alt={user.name}
              className="w-28 h-28 rounded-[2rem] object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105 duration-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-[2rem] bg-brand-dark text-white font-bold text-4xl flex items-center justify-center shadow-2xl border-4 border-white transition-transform group-hover:scale-105 duration-500">
              {user.initials}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            ref={(ref) => fileInputRef(ref)}
          />
          <button
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-blue text-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isUploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          </button>
        </div>
        <div className="text-center sm:text-left">
          <p className="font-bold text-brand-dark text-2xl tracking-tight">{user.firstName} {user.lastName}</p>
          <p className="text-xs font-bold text-brand-blue uppercase tracking-[0.1em] mt-1">{jobTitle || user.role}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-6">
            <button
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              disabled={isUploadingAvatar}
              className="text-xs font-bold text-brand-blue uppercase tracking-[0.1em] hover:bg-white px-4 py-2 rounded-xl transition-all border border-brand-blue/10 disabled:opacity-50"
            >
              {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={isUploadingAvatar}
                className="text-xs font-bold text-red-500 uppercase tracking-[0.1em] hover:bg-white px-4 py-2 rounded-xl transition-all border border-red-500/10 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <Field label="First Name"><Input required value={firstName} onChange={e => setFirstName(e.target.value)} /></Field>
        <Field label="Last Name"><Input required value={lastName} onChange={e => setLastName(e.target.value)} /></Field>
        <Field label="Professional Email" hint="Cannot be changed"><Input readOnly value={user.email} className="bg-page-bg/50 text-text-muted cursor-not-allowed border-dashed" /></Field>
        <Field label="Phone"><Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 XXX XXX XXX" /></Field>
        <Field label="Job Title"><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Senior Attorney" /></Field>
        <Field label="Location"><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Kigali, Rwanda" /></Field>
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Account deletion states
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 12) {
      toast.error('New password must be at least 12 characters');
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!', { icon: '🔒' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" exactly as shown');
      return;
    }

    setIsDeleting(true);
    try {
      // First validate password and send deletion request
      await authService.deleteAccount(deletePassword, deleteConfirmText);

      // Only after successful backend validation, show success and redirect
      toast.success('Your account has been deleted', { icon: '👋' });

      // Small delay to show the toast before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error: any) {
      // This will catch password errors from backend
      const errorMessage = error.response?.data?.error || 'Failed to delete account';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#fee',
          color: '#c00',
          fontWeight: 'bold',
        },
      });
      console.error('Delete account error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in-fade">
      <SectionHeader title="Security Controls" sub="Protect your legal data and access" />

      <form onSubmit={handlePasswordChange} className="bg-page-bg/50 rounded-[2rem] p-8 border border-border-base space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-inner"><Lock size={20}/></div>
          <h4 className="font-bold text-brand-dark uppercase tracking-[0.1em] text-xs">Update Credentials</h4>
        </div>
        <Field label="Current Password"><Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></Field>
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="New Password"><Input type="password" placeholder="Min. 12 chars" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
          <Field label="Confirm New Password"><Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Field>
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

      {/* Danger Zone - Account Deletion */}
      <div className="bg-red-50/50 border-2 border-red-200 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5">
          <AlertTriangle size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900 tracking-tight">Danger Zone</h4>
              <p className="text-xs text-red-600 font-medium">Irreversible account actions</p>
            </div>
          </div>

          {!showDeleteSection ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
              <div>
                <p className="font-bold text-red-900 text-sm">Delete Your Account</p>
                <p className="text-xs text-red-600/70 font-medium max-w-md mt-1">
                  Permanently remove your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteSection(true)}
                className="px-8 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 transition-all whitespace-nowrap"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-6 pt-4">
              <div className="bg-red-100 border border-red-300 rounded-2xl p-6 space-y-3">
                <p className="font-bold text-red-900 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Warning: This action is permanent and cannot be reversed
                </p>
                <ul className="text-xs text-red-700 space-y-1 ml-6 list-disc">
                  <li>Your account will be permanently deleted</li>
                  <li>All your data will be anonymized in the system</li>
                  <li>You will lose access to all cases and documents</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <Field label="Enter Your Password">
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </Field>

              <Field label='Type "DELETE MY ACCOUNT" to confirm'>
                <Input
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  required
                  className={deleteConfirmText === 'DELETE MY ACCOUNT' ? 'border-red-500' : ''}
                />
              </Field>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteSection(false);
                    setDeletePassword('');
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] bg-white text-brand-dark border-2 border-border-base hover:bg-page-bg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 bg-red-600 text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      Permanently Delete Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


const NotificationsTab = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await notificationPreferencesService.get();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = async (field: keyof NotificationPreferences) => {
    if (!preferences) return;

    const newValue = !preferences[field];
    setIsSaving(true);

    try {
      const updated = await notificationPreferencesService.update({
        [field]: newValue,
      });
      setPreferences(updated);
      toast.success('Preferences updated', { icon: '🔔' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={32} className="animate-spin text-brand-blue mx-auto" />
      </div>
    );
  }

  if (!preferences) return null;

  const items = [
    { key: 'caseAssignments' as const, label: 'Case Assignments', desc: 'When you are added to a new litigation matter' },
    { key: 'timelineMilestones' as const, label: 'Timeline Milestones', desc: 'Upcoming deadlines and status changes' },
    { key: 'documentActivity' as const, label: 'Document Activity', desc: 'New uploads or edits to case files' },
    { key: 'securityAlerts' as const, label: 'Security Alerts', desc: 'Critical login activity and safety reports' },
  ];

  return (
    <div className="space-y-10 animate-in-fade">
      <SectionHeader title="Smart Notifications" sub="Configure when and how you stay informed" />

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="bg-white border border-border-base rounded-[1.75rem] p-6 flex items-center justify-between group hover:border-brand-blue/20 transition-all shadow-sm">
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
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] hidden sm:block">
                {preferences[item.key] ? 'Email ON' : 'Email OFF'}
              </span>
              <Toggle on={preferences[item.key]} onChange={() => handleToggle(item.key)} />
            </div>
          </div>
        ))}
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
