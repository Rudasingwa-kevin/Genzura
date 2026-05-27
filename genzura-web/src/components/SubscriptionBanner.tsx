import { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionBannerProps {
  onDismiss?: () => void;
}

export default function SubscriptionBanner({ onDismiss }: SubscriptionBannerProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [bannerData, setBannerData] = useState<{
    plan: string;
    endDate: Date;
    isNew: boolean;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if user has an active paid subscription
    const hasPaidPlan = user.subscriptionPlan !== 'Genzura';
    const hasEndDate = user.subscriptionEndDate;

    if (!hasPaidPlan || !hasEndDate) {
      setIsVisible(false);
      return;
    }

    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();

    // Check if subscription is still valid
    if (endDate < now) {
      setIsVisible(false);
      return;
    }

    // Check if this is a newly activated subscription (within last 24 hours)
    const startDate = user.subscriptionStartDate ? new Date(user.subscriptionStartDate) : null;
    const isNew = startDate ? (now.getTime() - startDate.getTime()) < 24 * 60 * 60 * 1000 : false;

    // Check if user has dismissed this banner
    const dismissedKey = `subscription-banner-dismissed-${user.id}-${user.subscriptionPlan}`;
    const isDismissed = localStorage.getItem(dismissedKey) === 'true';

    if (!isDismissed) {
      setBannerData({
        plan: user.subscriptionPlan,
        endDate,
        isNew
      });
      setIsVisible(true);
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const dismissedKey = `subscription-banner-dismissed-${user.id}-${user.subscriptionPlan}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible || !bannerData || !user) return null;

  const planNames: Record<string, string> = {
    Intango: 'Intango Professional',
    Inkingi: 'Inkingi Enterprise',
    Genzura: 'Genzura Free'
  };

  const planColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    Intango: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    Inkingi: {
      bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      accent: 'text-purple-600'
    },
    Genzura: {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
      border: 'border-gray-200',
      text: 'text-gray-900',
      accent: 'text-gray-600'
    }
  };

  const colors = planColors[bannerData.plan] || planColors.Genzura;
  const planName = planNames[bannerData.plan] || bannerData.plan;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining(bannerData.endDate);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <Sparkles size={256} className={colors.accent} />
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 ${colors.text} transition-all z-10`}
        aria-label="Dismiss banner"
      >
        <X size={18} />
      </button>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 ${colors.accent}`}>
            {bannerData.isNew ? <Gift size={28} /> : <Sparkles size={28} />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                {bannerData.isNew ? '🎉 Your Subscription is Now Active!' : `${planName} Active`}
              </h3>
              {bannerData.isNew && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white ${colors.accent} shadow-sm`}>
                  NEW
                </span>
              )}
            </div>

            <p className={`text-sm ${colors.text} opacity-90 mb-4`}>
              {bannerData.isNew
                ? `Welcome to ${planName}! You now have access to all premium features.`
                : `You're enjoying all the benefits of ${planName}.`}
            </p>

            {/* Subscription details */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={16} className={colors.accent} />
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Valid Until
                  </p>
                  <p className={`text-sm font-bold ${colors.text}`}>
                    {formatDate(bannerData.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${daysRemaining > 30 ? 'bg-emerald-500' : daysRemaining > 7 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Days Remaining
                  </p>
                  <p className={`text-sm font-bold ${colors.text}`}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {bannerData.isNew && (
              <div className="mt-4">
                <a
                  href="/settings?tab=subscription"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white ${colors.accent} font-bold text-sm hover:shadow-md transition-all`}
                >
                  View Subscription Details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Features highlight for new subscriptions */}
        {bannerData.isNew && (
          <div className="mt-6 pt-6 border-t border-white/40">
            <p className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-60 mb-3`}>
              What's included:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bannerData.plan === 'Intango' && (
                <>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Unlimited Cases</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Unlimited Storage</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Priority Support</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Advanced Analytics</span>
                  </div>
                </>
              )}
              {bannerData.plan === 'Inkingi' && (
                <>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Unlimited Everything</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">24/7 Support</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Custom Integrations</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${colors.text}`}>
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center">
                      <svg className={`w-3 h-3 ${colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Dedicated Manager</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
