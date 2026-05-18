import { useState } from 'react';
import {
  Check,
  X,
  Zap,
  Crown,
  Shield,
  FileText,
  Download,
  Users,
  Bell,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Plan configuration
const PLANS = [
  {
    id: 'genzura',
    name: 'Genzura',
    tagline: 'Free Forever',
    nameTranslation: 'Foundation',
    price: 0,
    currency: 'RWF',
    billing: 'Forever Free',
    icon: Shield,
    color: 'bg-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    features: {
      cases: 20,
      documents: 20,
      documentDownload: false,
      collaborators: 1,
      storage: '500 MB',
      calendarIntegration: 'Basic',
      notifications: 'Email only',
      analytics: false,
      prioritySupport: false,
      exportReports: false,
      apiAccess: false,
      customBranding: false
    },
    limitations: [
      'Limited to 20 active cases',
      'Cannot download uploaded documents',
      'Basic email notifications only',
      'No analytics or reporting'
    ]
  },
  {
    id: 'intango',
    name: 'Intango',
    tagline: 'Most Popular',
    nameTranslation: 'Pillar',
    price: 100000,
    currency: 'RWF',
    billing: 'per 3 months',
    duration: 90,
    icon: Zap,
    color: 'bg-brand-blue',
    gradient: 'from-blue-500 to-indigo-600',
    popular: true,
    features: {
      cases: 'Unlimited',
      documents: 'Unlimited',
      documentDownload: true,
      collaborators: 'Unlimited',
      storage: '100 GB',
      calendarIntegration: 'Advanced',
      notifications: 'Email + SMS',
      analytics: true,
      prioritySupport: true,
      exportReports: true,
      apiAccess: true,
      customBranding: true
    },
    benefits: [
      'Unlimited cases and documents',
      'Unlimited team members',
      'Full download capabilities',
      'Advanced calendar & analytics',
      'API access for integrations',
      'Custom branding options'
    ]
  },
  {
    id: 'inkingi',
    name: 'Inkingi',
    tagline: 'Best Value',
    nameTranslation: 'Excellence',
    price: 250000,
    currency: 'RWF',
    billing: 'per year',
    duration: 365,
    savings: '37% savings',
    icon: Crown,
    color: 'bg-amber-500',
    gradient: 'from-amber-400 to-orange-600',
    features: {
      cases: 'Unlimited',
      documents: 'Unlimited',
      documentDownload: true,
      collaborators: 'Unlimited',
      storage: '100 GB',
      calendarIntegration: 'Advanced',
      notifications: 'Email + SMS',
      analytics: true,
      prioritySupport: true,
      exportReports: true,
      apiAccess: true,
      customBranding: true
    },
    benefits: [
      'Same features as Intango',
      'Pay annually, save 37%',
      'Unlimited cases and documents',
      'Unlimited team members',
      'API access & custom branding',
      'Best value for long-term use'
    ]
  }
];

const FEATURE_COMPARISON = [
  { label: 'Active Cases', key: 'cases', icon: FileText },
  { label: 'Document Storage', key: 'documents', icon: FileText },
  { label: 'Document Download', key: 'documentDownload', icon: Download },
  { label: 'Team Members', key: 'collaborators', icon: Users },
  { label: 'Storage Space', key: 'storage', icon: Shield },
  { label: 'Calendar Integration', key: 'calendarIntegration', icon: Calendar },
  { label: 'Notifications', key: 'notifications', icon: Bell },
  { label: 'Analytics & Insights', key: 'analytics', icon: BarChart3 },
  { label: 'Priority Support', key: 'prioritySupport', icon: Mail },
  { label: 'Export Reports', key: 'exportReports', icon: FileText },
  { label: 'API Access', key: 'apiAccess', icon: Zap },
  { label: 'Custom Branding', key: 'customBranding', icon: Sparkles }
];

interface PricingPageProps {
  variant?: 'public' | 'settings' | 'limit-reached';
  limitType?: 'cases' | 'documents';
}

export default function PricingPage({ variant = 'public', limitType }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'yearly'>('yearly');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname, selectedPlan: planId } });
      return;
    }

    if (planId === 'genzura') {
      toast.success('You are already on the free plan!');
      return;
    }

    // Navigate to payment/checkout page (to be implemented)
    toast.success(`Redirecting to checkout for ${planId}...`);
    // navigate(`/checkout?plan=${planId}`);
  };

  const renderFeatureValue = (feature: any) => {
    if (typeof feature === 'boolean') {
      return feature ? (
        <Check className="text-green-500 mx-auto" size={20} />
      ) : (
        <X className="text-red-400 mx-auto" size={16} />
      );
    }
    return <span className="text-sm font-bold text-brand-dark">{feature}</span>;
  };

  // Show limit reached banner for settings/limit context
  const LimitBanner = () => {
    if (variant !== 'limit-reached') return null;

    return (
      <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <AlertCircle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-1">
            {limitType === 'cases' ? 'Case Limit Reached' : 'Document Limit Reached'}
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            You've reached the {limitType === 'cases' ? '20 case' : '20 document'} limit for the free Genzura plan.
            Upgrade to Intango or Inkingi to unlock unlimited {limitType} and access premium features.
          </p>
        </div>
      </div>
    );
  };

  const PageHeader = () => {
    if (variant === 'settings') {
      return (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Manage Your Subscription</h2>
          <p className="text-sm text-text-secondary">
            {user?.subscriptionPlan ? (
              <>Currently on <span className="font-bold text-brand-blue">{user.subscriptionPlan}</span> plan</>
            ) : (
              'Choose the plan that best fits your needs'
            )}
          </p>
        </div>
      );
    }

    if (variant === 'limit-reached') {
      return (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-3">Upgrade Your Plan</h1>
          <p className="text-text-secondary font-medium">
            Unlock unlimited access and premium features
          </p>
        </div>
      );
    }

    // Public variant
    return (
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-light text-brand-blue text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles size={14} />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
          Choose Your <span className="gradient-text">Success Path</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
          Start with our free plan and upgrade as you grow. All plans include core case management features
          with flexible options to match your firm's needs.
        </p>
      </div>
    );
  };

  const PlanCard = ({ plan, index }: { plan: typeof PLANS[0]; index: number }) => {
    const Icon = plan.icon;
    const isCurrentPlan = user?.subscriptionPlan?.toLowerCase() === plan.id;

    return (
      <div
        className={`relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
          plan.popular
            ? 'border-brand-blue shadow-2xl scale-105 z-10'
            : 'border-border-base shadow-lg'
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {plan.tagline}
          </div>
        )}

        {plan.savings && (
          <div className="absolute -top-4 right-8 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {plan.savings}
          </div>
        )}

        <div className={variant === 'settings' ? 'p-6' : 'p-8'}>
          {/* Plan Header */}
          <div className={`text-center ${variant === 'settings' ? 'mb-6' : 'mb-8'}`}>
            <div className={`${variant === 'settings' ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl ${plan.color} bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center mx-auto mb-4 shadow-xl`}>
              <Icon size={variant === 'settings' ? 28 : 32} />
            </div>
            <h3 className={`${variant === 'settings' ? 'text-xl' : 'text-2xl'} font-bold text-brand-dark mb-1`}>{plan.name}</h3>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{plan.nameTranslation}</p>
          </div>

          {/* Pricing */}
          <div className={`text-center pb-6 border-b border-border-base ${variant === 'settings' ? 'mb-6' : 'mb-8'}`}>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className={`${variant === 'settings' ? 'text-4xl' : 'text-5xl'} font-bold text-brand-dark`}>
                {plan.price === 0 ? 'Free' : plan.price.toLocaleString()}
              </span>
              {plan.price > 0 && (
                <span className="text-sm font-bold text-text-muted uppercase">{plan.currency}</span>
              )}
            </div>
            <p className="text-sm text-text-secondary font-medium">{plan.billing}</p>
            {plan.price > 0 && variant !== 'settings' && (
              <p className="text-xs text-text-muted mt-1">
                ~{Math.round(plan.price / (plan.duration || 1)).toLocaleString()} RWF/day
              </p>
            )}
          </div>

          {/* Key Features */}
          <div className={`space-y-2 ${variant === 'settings' ? 'mb-6' : 'mb-8'}`}>
            {Object.entries(plan.features).slice(0, variant === 'settings' ? 5 : 6).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {typeof value === 'boolean' ? (
                  value ? (
                    <CheckCircle2 className="text-green-500 shrink-0" size={16} />
                  ) : (
                    <X className="text-red-400 shrink-0" size={14} />
                  )
                ) : (
                  <CheckCircle2 className="text-green-500 shrink-0" size={16} />
                )}
                <span className={`${variant === 'settings' ? 'text-xs' : 'text-sm'} text-brand-dark font-medium`}>
                  {key === 'cases' && `${value} cases`}
                  {key === 'documents' && `${value} documents`}
                  {key === 'collaborators' && `${value} team members`}
                  {key === 'storage' && `${value} storage`}
                  {key === 'calendarIntegration' && `${value} calendar`}
                  {key === 'notifications' && `${value} alerts`}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {isCurrentPlan ? (
            <button
              disabled
              className={`w-full bg-page-bg text-text-muted ${variant === 'settings' ? 'py-3' : 'py-4'} rounded-2xl font-bold text-xs uppercase tracking-wider cursor-not-allowed border-2 border-border-base`}
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full ${variant === 'settings' ? 'py-3' : 'py-4'} rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group ${
                plan.popular
                  ? 'bg-brand-blue text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'bg-brand-dark text-white hover:bg-brand-blue'
              }`}
            >
              {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {plan.id === 'genzura' && variant === 'public' && (
            <p className="text-xs text-center text-text-muted mt-3">No credit card required</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={variant === 'public' ? 'min-h-screen bg-page-bg py-20' : ''}>
      <div className={variant === 'public' ? 'section-container' : ''}>
        <LimitBanner />
        <PageHeader />

        {/* Pricing Cards */}
        <div className={`grid md:grid-cols-3 gap-6 ${variant === 'settings' ? 'mb-12' : 'mb-20'}`}>
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className={`bg-white rounded-[3rem] border border-border-base shadow-xl ${variant === 'settings' ? 'p-8' : 'p-12'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-3">Detailed Comparison</h2>
            <p className="text-text-secondary">See exactly what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border-base">
                  <th className="text-left py-4 px-6 text-sm font-bold text-brand-dark uppercase tracking-wider">
                    Features
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl ${plan.color} bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center`}>
                          <plan.icon size={20} />
                        </div>
                        <span className="text-sm font-bold text-brand-dark">{plan.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <tr
                      key={feature.key}
                      className={`border-b border-border-base ${idx % 2 === 0 ? 'bg-page-bg/30' : ''}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <FeatureIcon size={18} className="text-text-muted" />
                          <span className="text-sm font-medium text-brand-dark">{feature.label}</span>
                        </div>
                      </td>
                      {PLANS.map((plan) => (
                        <td key={`${plan.id}-${feature.key}`} className="text-center py-4 px-6">
                          {renderFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        {variant === 'public' && (
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-dark mb-3">Frequently Asked Questions</h2>
              <p className="text-text-secondary">Everything you need to know about our plans</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I upgrade or downgrade my plan at any time?',
                  a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you will only pay the prorated difference. Downgrades take effect at the end of your current billing cycle.'
                },
                {
                  q: 'What happens to my data if I downgrade to the free plan?',
                  a: 'Your data remains safe and accessible. However, if you exceed the free plan limits (20 cases, 20 documents), you will need to archive or delete items to stay within the limits, or upgrade again.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team for a full refund.'
                },
                {
                  q: 'Can I pay with mobile money?',
                  a: 'Yes! We accept MTN Mobile Money, Airtel Money, and all major credit/debit cards for your convenience.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-border-base p-6 hover:shadow-lg transition-all">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-light text-brand-blue flex items-center justify-center shrink-0 mt-1">
                      <Info size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark mb-2">{faq.q}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        {variant === 'public' && (
          <div className="mt-20 bg-brand-dark rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                For enterprises or firms with specific requirements, we offer custom plans with tailored features,
                dedicated support, and flexible pricing.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:sales@genzura.law"
                  className="bg-white text-brand-dark px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <Mail size={18} />
                  Email Sales
                </a>
                <a
                  href="tel:+250788000000"
                  className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <Phone size={18} />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
