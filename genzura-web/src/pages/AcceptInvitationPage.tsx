import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Briefcase, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient.get(`/auth/verify-invitation/${token}`);
        setUserInfo(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired invitation');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters', {
        icon: '❌',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        icon: '❌',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/accept-invitation', {
        token,
        password
      });

      // Store auth token
      localStorage.setItem('token', response.data.token);

      toast.success('Welcome to Genzura!', {
        icon: '🎉',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept invitation', {
        icon: '❌',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-dark to-brand-green flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center">
          <Loader2 size={48} className="animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-brand-dark font-bold">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-dark to-brand-green flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Invalid Invitation</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-dark to-brand-green flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-brand-blue" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Welcome to Genzura!</h1>
          <p className="text-text-muted">Set up your account to get started</p>
        </div>

        {/* User Info */}
        <div className="bg-brand-light rounded-2xl p-6 mb-6 border-l-4 border-brand-blue">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-brand-blue" />
            <p className="font-bold text-brand-dark">{userInfo.name}</p>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Mail size={18} className="text-brand-blue" />
            <p className="text-sm text-text-muted">{userInfo.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase size={18} className="text-brand-blue" />
            <p className="text-sm text-text-muted">{userInfo.role.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">
              Create Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                required
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                required
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-500">
            <p className="text-xs text-amber-900 font-bold mb-2">Password Requirements:</p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li className="flex items-center gap-2">
                <span className={password.length >= 8 ? 'text-green-600' : ''}>
                  {password.length >= 8 ? '✓' : '○'}
                </span>
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <span className={password === confirmPassword && password.length > 0 ? 'text-green-600' : ''}>
                  {password === confirmPassword && password.length > 0 ? '✓' : '○'}
                </span>
                Passwords match
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-brand-blue to-brand-dark text-white rounded-2xl font-bold shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            {isSubmitting ? 'Setting up your account...' : 'Complete Setup'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            By accepting this invitation, you agree to Genzura's{' '}
            <a href="/legal" className="text-brand-blue hover:underline font-bold">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
