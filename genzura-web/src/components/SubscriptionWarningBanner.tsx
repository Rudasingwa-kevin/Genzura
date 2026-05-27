import { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, Clock, CreditCard } from 'lucide-react';
import { settingsService } from '../api/services/settings.service';

export default function SubscriptionWarningBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [activationDate, setActivationDate] = useState<Date | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
    // Check every hour for status updates
    const interval = setInterval(checkSubscriptionStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const info = await settingsService.getSubscriptionInfo();

      // Only show banner if status is WARNING
      if (info.status === 'WARNING' && info.daysRemaining > 0) {
        setIsVisible(true);
        setDaysRemaining(info.daysRemaining);
        setActivationDate(info.activationDate ? new Date(info.activationDate) : null);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    // Don't persist dismissal - this is a critical system warning
    // Users should see it every time until they choose a plan
    setIsVisible(false);
    // But it will come back on next page load
  };

  if (!isVisible) return null;

  // Determine urgency level based on days remaining
  const urgencyLevel =
    daysRemaining <= 3 ? 'critical' :
    daysRemaining <= 7 ? 'high' :
    'medium';

  const urgencyColors = {
    critical: {
      bg: 'bg-gradient-to-r from-red-50 to-orange-50',
      border: 'border-red-300',
      text: 'text-red-900',
      accent: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700'
    },
    high: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      accent: 'text-amber-600',
      iconBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    medium: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const colors = urgencyColors[urgencyLevel];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500`}>
      {/* Animated background pulse */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>

      {/* Close button (temporary) */}
      <button
        onClick={handleDismiss}
        className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 ${colors.text} transition-all z-10 opacity-60 hover:opacity-100`}
        aria-label="Dismiss temporarily"
      >
        <X size={18} />
      </button>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center shrink-0 ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`}>
            <AlertTriangle size={32} className={colors.accent} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-xl font-bold ${colors.text}`}>
                Action Required: Choose Your Subscription Plan
              </h3>
              {daysRemaining <= 3 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white shadow-sm animate-pulse">
                  <Clock size={12} />
                  URGENT
                </span>
              )}
            </div>

            <p className={`text-sm ${colors.text} opacity-90 mb-4 leading-relaxed`}>
              {daysRemaining <= 3
                ? `⚠️ Final warning! You have only ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining to choose a subscription plan before account limitations are enforced.`
                : `The subscription system has been activated. Please choose a subscription plan within the next ${daysRemaining} days to continue enjoying full access to Genzura.`
              }
            </p>

            {/* Countdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Days Remaining */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className={colors.accent} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Days Remaining
                  </span>
                </div>
                <p className={`text-3xl font-bold ${colors.text}`}>
                  {daysRemaining}
                </p>
              </div>

              {/* Enforcement Date */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className={colors.accent} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Enforcement Date
                  </span>
                </div>
                <p className={`text-sm font-bold ${colors.text}`}>
                  {activationDate ? formatDate(activationDate) : 'N/A'}
                </p>
              </div>

              {/* Current Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className={colors.accent} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Your Current Plan
                  </span>
                </div>
                <p className={`text-sm font-bold ${colors.text}`}>
                  Free (Limited)
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/50">
              <h4 className={`text-sm font-bold ${colors.text} mb-3 flex items-center gap-2`}>
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold">
                  ℹ️
                </span>
                What happens after {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}?
              </h4>
              <ul className={`space-y-2 text-sm ${colors.text} opacity-90`}>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Your account will be limited to <strong>20 cases maximum</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Document storage will be <strong>restricted</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Access to <strong>advanced features will be limited</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Choose a paid plan anytime to <strong>unlock unlimited access</strong></span>
                </li>
              </ul>
            </div>

            {/* Email Reminders Notice */}
            {daysRemaining >= 7 && (
              <div className={`text-xs ${colors.text} opacity-75 mb-4 flex items-center gap-2`}>
                <span>📧</span>
                <span>You'll receive email reminders at 7, 3, and 1 day before enforcement</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/settings?tab=subscription"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm ${colors.button} shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95`}
              >
                <CreditCard size={18} />
                View Subscription Plans
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {daysRemaining > 7 && (
                <button
                  onClick={handleDismiss}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm ${colors.text} font-bold text-sm hover:bg-white/70 transition-all border border-white/50`}
                >
                  Remind Me Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
