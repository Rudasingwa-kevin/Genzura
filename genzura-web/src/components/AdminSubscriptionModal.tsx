import { useState } from 'react';
import { X, Calendar, Gift, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export default function AdminSubscriptionModal({ isOpen, onClose, user, onSuccess }: AdminSubscriptionModalProps) {
  const [action, setAction] = useState<'grant' | 'extend' | 'cancel'>('grant');
  const [selectedPlan, setSelectedPlan] = useState<'Intango' | 'Inkingi'>('Intango');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const days = duration === -1 ? parseInt(customDuration) : duration;

      if (action === 'grant') {
        // Grant free access/trial
        const response = await fetch('/api/admin/subscriptions/grant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('genzura_token')}`
          },
          body: JSON.stringify({
            userId: user.id,
            plan: selectedPlan,
            durationDays: days,
            reason: reason || 'Admin granted access'
          })
        });

        if (!response.ok) throw new Error('Failed to grant access');

        toast.success(`${selectedPlan} access granted to ${user.name} for ${days} days!`, {
          icon: '🎁',
          duration: 4000
        });
      } else if (action === 'extend') {
        // Extend existing subscription
        const response = await fetch('/api/admin/subscriptions/extend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('genzura_token')}`
          },
          body: JSON.stringify({
            userId: user.id,
            extensionDays: days,
            reason: reason || 'Admin extended subscription'
          })
        });

        if (!response.ok) throw new Error('Failed to extend subscription');

        toast.success(`Subscription extended by ${days} days for ${user.name}!`, {
          icon: '📅',
          duration: 4000
        });
      } else {
        // Cancel subscription
        const response = await fetch('/api/admin/subscriptions/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('genzura_token')}`
          },
          body: JSON.stringify({
            userId: user.id,
            reason: reason || 'Admin cancelled subscription'
          })
        });

        if (!response.ok) throw new Error('Failed to cancel subscription');

        toast.success(`Subscription cancelled for ${user.name}`, {
          icon: '🚫',
          duration: 4000
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Admin subscription action failed:', error);
      toast.error(error.message || 'Action failed. Please try again.', {
        icon: '❌'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = user.subscriptionPlan || 'Genzura';
  const expiryDate = user.subscriptionEndDate
    ? new Date(user.subscriptionEndDate).toLocaleDateString()
    : 'No expiry (Free plan)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white z-[110] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-brand-dark text-white p-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Manage Subscription</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
                {user.initials}
              </div>
              <div>
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-sm text-white/70">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Current Status */}
          <div className="bg-page-bg rounded-2xl p-6 border border-border-base">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-brand-blue" />
              <h3 className="font-bold text-brand-dark">Current Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted font-medium mb-1">Current Plan</p>
                <p className="font-bold text-brand-dark">{currentPlan}</p>
              </div>
              <div>
                <p className="text-text-muted font-medium mb-1">Expiry Date</p>
                <p className="font-bold text-brand-dark">{expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Action Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider ml-1">
              Action Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAction('grant')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  action === 'grant'
                    ? 'border-brand-blue bg-brand-light text-brand-blue'
                    : 'border-border-base hover:border-brand-blue/30'
                }`}
              >
                <Gift size={20} />
                <div className="text-center">
                  <p className="font-bold text-xs">Grant Access</p>
                  <p className="text-[10px] text-text-muted mt-1">Give free trial</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setAction('extend')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  action === 'extend'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-border-base hover:border-emerald-500/30'
                }`}
              >
                <Calendar size={20} />
                <div className="text-center">
                  <p className="font-bold text-xs">Extend</p>
                  <p className="text-[10px] text-text-muted mt-1">Add more days</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setAction('cancel')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  action === 'cancel'
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-border-base hover:border-rose-500/30'
                }`}
              >
                <X size={20} />
                <div className="text-center">
                  <p className="font-bold text-xs">Cancel</p>
                  <p className="text-[10px] text-text-muted mt-1">End subscription</p>
                </div>
              </button>
            </div>
          </div>

          {/* Plan Selection (only for grant) */}
          {action === 'grant' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider ml-1">
                Plan to Grant
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('Intango')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedPlan === 'Intango'
                      ? 'border-brand-blue bg-brand-light'
                      : 'border-border-base hover:border-brand-blue/30'
                  }`}
                >
                  <p className="font-bold text-brand-dark">Intango</p>
                  <p className="text-xs text-text-muted mt-1">100,000 RWF value</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('Inkingi')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedPlan === 'Inkingi'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border-base hover:border-amber-500/30'
                  }`}
                >
                  <p className="font-bold text-brand-dark">Inkingi</p>
                  <p className="text-xs text-text-muted mt-1">250,000 RWF value</p>
                </button>
              </div>
            </div>
          )}

          {/* Duration (not for cancel) */}
          {action !== 'cancel' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider ml-1">
                Duration
              </label>
            <div className="grid grid-cols-4 gap-3">
              {[7, 30, 90, -1].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    duration === days
                      ? 'border-brand-blue bg-brand-light text-brand-blue'
                      : 'border-border-base text-text-muted hover:border-brand-blue/30'
                  }`}
                >
                  {days === -1 ? 'Custom' : `${days} days`}
                </button>
              ))}
            </div>
            {duration === -1 && (
              <input
                type="number"
                min="1"
                max="9999"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Enter days..."
                className="w-full h-12 px-4 rounded-xl border-2 border-brand-blue bg-white font-bold text-brand-dark outline-none"
                required
              />
            )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider ml-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Compensation for service issues, Marketing promotion, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none font-medium text-brand-dark"
            />
          </div>

          {/* Warning */}
          <div className={`border rounded-2xl p-4 flex items-start gap-3 ${
            action === 'cancel'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
              action === 'cancel' ? 'text-rose-600' : 'text-amber-600'
            }`} />
            <div className="text-sm">
              <p className={`font-bold mb-1 ${
                action === 'cancel' ? 'text-rose-900' : 'text-amber-900'
              }`}>
                {action === 'cancel' ? 'Warning: Permanent Action' : 'Admin Action'}
              </p>
              <p className={action === 'cancel' ? 'text-rose-800' : 'text-amber-800'}>
                {action === 'cancel'
                  ? 'This will immediately revoke access and return user to free plan. This action cannot be undone.'
                  : `This action will be logged in the audit trail. Make sure you have authorization to ${action === 'grant' ? 'grant free access' : 'extend subscriptions'}.`
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-2 border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (action !== 'cancel' && duration === -1 && !customDuration)}
              className={`flex-1 h-12 rounded-xl text-white font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                action === 'cancel' ? 'bg-rose-600' : 'bg-brand-blue'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirm Action
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
