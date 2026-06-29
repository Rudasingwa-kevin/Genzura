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
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Trash2,
  Award,
  GraduationCap,
  Eye,
  EyeOff,
  Calendar,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../api/services/auth.service';
import { resolveAssetUrl } from '../utils/assetUrl';
import { notificationPreferencesService, type NotificationPreferences } from '../api/services/notificationPreferences.service';
import { attorneyDocumentService, type AttorneyDocument } from '../api/services/attorneyDocument.service';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'documents' | 'organization' | 'security' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'profile',      label: 'Personal Profile',    icon: UserIcon,     color: 'text-brand-blue' },
  { id: 'documents',    label: 'Documents & Credentials', icon: FileText, color: 'text-indigo-600' },
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
  const { user, updateUser, setUserDirectly } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [education, setEducation] = useState(user?.education || '');
  const [barNumber, setBarNumber] = useState(user?.barNumber || '');
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];

  const [avatarError, setAvatarError] = useState(false);

  const isAttorney = user?.role === 'Attorney' || user?.role === 'Senior_Attorney';

  // Reset avatar error when avatarUrl changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatarUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUser({
        firstName,
        lastName,
        phone,
        location,
        jobTitle,
        bio,
        education,
        barNumber,
      });
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
      // Directly set the user state with the response from avatar upload
      setUserDirectly(updatedUser);
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
      // Directly set the user state with the response from avatar removal
      setUserDirectly(updatedUser);
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
          {user.avatarUrl && !avatarError ? (
            <img
              src={resolveAssetUrl(user.avatarUrl)}
              alt={user.name}
              onError={() => setAvatarError(true)}
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

      {/* Attorney-Specific Fields */}
      {isAttorney && (
        <>
          <div className="pt-8 mt-8 border-t border-border-base">
            <SectionHeader title="Professional Profile" sub="Information shown on public attorney directory" />
          </div>

          <div className="space-y-8">
            <Field label="Professional Bio" hint="Tell clients about yourself">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={6}
                placeholder="e.g., Experienced attorney specializing in corporate law and intellectual property. Over 10 years of practice representing startups and established businesses across Rwanda..."
                className="w-full px-5 py-4 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all bg-white font-medium text-brand-dark shadow-sm resize-none"
              />
              <p className="text-xs text-text-muted mt-2 ml-1">{bio.length}/2000 characters</p>
            </Field>

            <div className="grid sm:grid-cols-2 gap-8">
              <Field label="Education" hint="Degrees & qualifications">
                <Input
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g., LLB, University of Rwanda (2013)"
                />
              </Field>

              <Field label="Bar Number" hint="Bar association license">
                <Input
                  value={barNumber}
                  onChange={e => setBarNumber(e.target.value)}
                  placeholder="e.g., RBA-2013-0123"
                />
              </Field>
            </div>

            <div className="bg-info-bg border border-brand-blue/20 rounded-2xl p-6">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-dark text-sm">Public Profile Visibility</p>
                  <p className="text-xs text-text-secondary mt-1">
                    These fields will be displayed on your public attorney profile at{' '}
                    <span className="font-mono text-brand-blue">genzura.com/attorneys/{user.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

// ─── Documents Tab (Attorney-only) ────────────────────────────────────────────

const DocumentsTab = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AttorneyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isAttorney = user?.role === 'Attorney' || user?.role === 'Senior_Attorney';

  useEffect(() => {
    if (isAttorney) {
      fetchDocuments();
    }
  }, [isAttorney]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await attorneyDocumentService.getMyDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await attorneyDocumentService.deleteDocument(docId);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const toggleVisibility = async (docId: string, currentlyPublic: boolean) => {
    try {
      await attorneyDocumentService.updateDocument(docId, { isPublic: !currentlyPublic });
      toast.success(currentlyPublic ? 'Document hidden from public' : 'Document now public');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (!isAttorney) {
    return (
      <div className="py-20 text-center">
        <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary font-bold">
          Professional documents are only available for attorneys
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in-fade">
      <SectionHeader
        title="Professional Documents"
        sub="CV, Certificates, Licenses & Credentials"
      />

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-text-secondary">
          Upload professional documents to display on your public attorney profile
        </p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-page-bg rounded-2xl border-2 border-dashed border-border-base">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-brand-dark font-bold mb-2">No documents uploaded yet</p>
          <p className="text-sm text-text-secondary mb-4">
            Upload your CV, certificates, and licenses to build credibility
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.1em] inline-flex items-center gap-2"
          >
            <Upload size={14} />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-border-base rounded-2xl p-5 flex items-start gap-4 hover:border-brand-blue/30 transition-all group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-blue flex items-center justify-center flex-shrink-0">
                {doc.type === 'CV' && <FileText size={20} />}
                {doc.type === 'Certificate' && <Award size={20} />}
                {doc.type === 'BarLicense' && <ShieldCheck size={20} />}
                {doc.type === 'Education' && <GraduationCap size={20} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-brand-dark">{doc.title}</h4>
                {doc.description && (
                  <p className="text-sm text-text-secondary mt-1">{doc.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                  {doc.fileSize && (
                    <span>
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 ${doc.isPublic ? 'text-brand-green' : 'text-text-muted'}`}>
                    {doc.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                    {doc.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-brand-light rounded-lg transition-colors text-text-secondary hover:text-brand-blue"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => toggleVisibility(doc.id, doc.isPublic)}
                  className="p-2 hover:bg-page-bg rounded-lg transition-colors text-text-secondary hover:text-brand-dark"
                  title={doc.isPublic ? 'Hide from public' : 'Make public'}
                >
                  {doc.isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-text-secondary hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};

// ─── Upload Document Modal ────────────────────────────────────────────────────

const UploadDocumentModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: 'CV',
    title: '',
    description: '',
    isPublic: true,
    issuedDate: '',
    issuer: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10MB');
      return;
    }

    setFile(selectedFile);

    // Auto-set title from filename if empty
    if (!formData.title) {
      setFormData({ ...formData, title: selectedFile.name.replace(/\.[^/.]+$/, '') });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', formData.type);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('isPublic', formData.isPublic.toString());
      if (formData.issuedDate) uploadFormData.append('issuedDate', formData.issuedDate);
      if (formData.issuer) uploadFormData.append('issuer', formData.issuer);

      const response = await attorneyDocumentService.upload(uploadFormData);

      if (response.success) {
        toast.success('Document uploaded successfully!');
        onSuccess();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border-base px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">Upload Document</h2>
            <p className="text-sm text-text-secondary mt-1">Add professional credentials to your profile</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-brand-dark transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-[0.1em]">
              File *
            </label>
            <div className="border-2 border-dashed border-border-base rounded-2xl p-8 text-center hover:border-brand-blue/30 transition-all">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-10 h-10 text-text-muted mb-3" />
                {file ? (
                  <div>
                    <p className="font-bold text-brand-dark">{file.name}</p>
                    <p className="text-sm text-text-secondary mt-1">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-brand-dark mb-1">Click to upload</p>
                    <p className="text-sm text-text-secondary">PDF or images, max 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Document Type */}
          <Field label="Document Type">
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="CV">CV / Resume</option>
              <option value="Certificate">Certificate</option>
              <option value="BarLicense">Bar License</option>
              <option value="Education">Education Degree</option>
              <option value="Award">Award</option>
              <option value="Publication">Publication</option>
              <option value="Other">Other</option>
            </Select>
          </Field>

          {/* Title */}
          <Field label="Title *">
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Bar Association License"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of this document..."
              className="w-full px-5 py-3 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white font-medium text-brand-dark"
            />
          </Field>

          {/* Optional Fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Issuer" hint="Optional">
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g., Rwanda Bar Association"
              />
            </Field>

            <Field label="Issue Date" hint="Optional">
              <Input
                type="date"
                value={formData.issuedDate}
                onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
              />
            </Field>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-5 bg-page-bg rounded-2xl">
            <div>
              <p className="font-bold text-brand-dark text-sm">Public Visibility</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Show this document on your public attorney profile
              </p>
            </div>
            <Toggle
              on={formData.isPublic}
              onChange={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-border-base text-text-secondary rounded-2xl font-bold text-xs uppercase tracking-[0.1em] hover:bg-page-bg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 bg-brand-blue text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-xl transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const NotificationsTab = () => {
  const [, setIsSaving] = useState(false);
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
      case 'documents': return <DocumentsTab />;
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
          <div className="flex-1 w-full bg-white border border-border-base rounded-[3rem] shadow-sm relative overflow-hidden min-h-[600px] p-10">
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
