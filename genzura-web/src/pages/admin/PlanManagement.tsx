import { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Crown,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';

interface PlanConfig {
  id?: string;
  plan: 'Genzura' | 'Intango' | 'Inkingi';
  price: number;
  duration: number;
  displayName: string;
  tagline: string;
  description: string;
  maxCases: number | null;
  maxDocuments: number | null;
  maxTeamMembers: number | null;
  storageGB: number | null;
  features: {
    documentDownload: boolean;
    calendarIntegration: string;
    notifications: string;
    analytics: boolean;
    prioritySupport: boolean;
    exportReports: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
  isActive: boolean;
  isVisible: boolean;
}

const PLAN_ICONS = {
  Genzura: Shield,
  Intango: Zap,
  Inkingi: Crown
};

const PLAN_COLORS = {
  Genzura: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-300' },
  Intango: { bg: 'bg-blue-50', text: 'text-brand-blue', border: 'border-blue-300' },
  Inkingi: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-300' }
};

export default function PlanManagement() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzura_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        // If no plans exist yet, use defaults
        setPlans(getDefaultPlans());
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans(getDefaultPlans());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPlans = (): PlanConfig[] => [
    {
      plan: 'Genzura',
      price: 0,
      duration: 0,
      displayName: 'Genzura',
      tagline: 'Free Forever',
      description: 'Foundation tier for getting started',
      maxCases: 20,
      maxDocuments: 20,
      maxTeamMembers: 1,
      storageGB: 0.5,
      features: {
        documentDownload: false,
        calendarIntegration: 'Basic',
        notifications: 'Email only',
        analytics: false,
        prioritySupport: false,
        exportReports: false,
        apiAccess: false,
        customBranding: false
      },
      isActive: true,
      isVisible: true
    },
    {
      plan: 'Intango',
      price: 100000,
      duration: 90,
      displayName: 'Intango',
      tagline: 'Most Popular',
      description: 'Full-featured professional tier - quarterly billing',
      maxCases: null,
      maxDocuments: null,
      maxTeamMembers: null,
      storageGB: 100,
      features: {
        documentDownload: true,
        calendarIntegration: 'Advanced',
        notifications: 'Email + SMS',
        analytics: true,
        prioritySupport: true,
        exportReports: true,
        apiAccess: true,
        customBranding: true
      },
      isActive: true,
      isVisible: true
    },
    {
      plan: 'Inkingi',
      price: 250000,
      duration: 365,
      displayName: 'Inkingi',
      tagline: 'Best Value',
      description: 'Same features as Intango - save 37% with annual billing',
      maxCases: null,
      maxDocuments: null,
      maxTeamMembers: null,
      storageGB: 100,
      features: {
        documentDownload: true,
        calendarIntegration: 'Advanced',
        notifications: 'Email + SMS',
        analytics: true,
        prioritySupport: true,
        exportReports: true,
        apiAccess: true,
        customBranding: true
      },
      isActive: true,
      isVisible: true
    }
  ];

  const handleSave = async (plan: PlanConfig) => {
    setIsSaving(plan.plan);

    try {
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('genzura_token')}`
        },
        body: JSON.stringify(plan)
      });

      if (!response.ok) throw new Error('Failed to save plan');

      toast.success(`${plan.displayName} plan updated successfully!`, {
        icon: '✅',
        duration: 3000
      });

      setEditingPlan(null);
      fetchPlans(); // Refresh
    } catch (error: any) {
      console.error('Failed to save plan:', error);
      toast.error('Failed to save plan. Please try again.', {
        icon: '❌'
      });
    } finally {
      setIsSaving(null);
    }
  };

  const updatePlan = (planName: string, field: string, value: any) => {
    setPlans(prev => prev.map(p =>
      p.plan === planName ? { ...p, [field]: value } : p
    ));
  };

  const updateFeature = (planName: string, feature: string, value: any) => {
    setPlans(prev => prev.map(p =>
      p.plan === planName
        ? { ...p, features: { ...p.features, [feature]: value } }
        : p
    ));
  };

  const PlanCard = ({ plan }: { plan: PlanConfig }) => {
    const Icon = PLAN_ICONS[plan.plan];
    const colors = PLAN_COLORS[plan.plan];
    const isEditing = editingPlan === plan.plan;
    const saving = isSaving === plan.plan;

    return (
      <div className={`bg-white rounded-[2.5rem] border-2 ${colors.border} p-8 shadow-lg hover:shadow-xl transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-dark">{plan.displayName}</h3>
              <p className="text-xs text-text-muted">{plan.plan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updatePlan(plan.plan, 'isVisible', !plan.isVisible)}
              className={`p-2 rounded-lg transition-all ${plan.isVisible ? 'text-brand-blue bg-brand-light' : 'text-text-muted bg-page-bg'}`}
              title={plan.isVisible ? 'Visible on pricing page' : 'Hidden from pricing page'}
            >
              {plan.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-page-bg rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                Price (RWF)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={plan.price}
                  onChange={(e) => updatePlan(plan.plan, 'price', parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border-2 border-brand-blue font-bold text-brand-dark outline-none"
                  disabled={plan.plan === 'Genzura'}
                />
              ) : (
                <p className="text-2xl font-bold text-brand-dark">
                  {plan.price === 0 ? 'Free' : plan.price.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                Duration (Days)
              </label>
              {isEditing && plan.plan !== 'Genzura' ? (
                <input
                  type="number"
                  value={plan.duration}
                  onChange={(e) => updatePlan(plan.plan, 'duration', parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border-2 border-brand-blue font-bold text-brand-dark outline-none"
                />
              ) : (
                <p className="text-2xl font-bold text-brand-dark">
                  {plan.duration === 0 ? '∞' : plan.duration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tagline & Description */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
              Tagline
            </label>
            {isEditing ? (
              <input
                type="text"
                value={plan.tagline}
                onChange={(e) => updatePlan(plan.plan, 'tagline', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border-base font-medium text-brand-dark outline-none focus:border-brand-blue"
                placeholder="e.g., Most Popular"
              />
            ) : (
              <p className="font-medium text-brand-dark">{plan.tagline}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={plan.description}
                onChange={(e) => updatePlan(plan.plan, 'description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-base font-medium text-brand-dark outline-none focus:border-brand-blue resize-none"
                rows={2}
                placeholder="Brief description..."
              />
            ) : (
              <p className="text-sm text-text-secondary">{plan.description}</p>
            )}
          </div>
        </div>

        {/* Limits */}
        <div className="bg-page-bg rounded-2xl p-6 mb-6">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4">Limits</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block flex items-center gap-1">
                <FileText size={12} /> Cases
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={plan.maxCases || ''}
                  onChange={(e) => updatePlan(plan.plan, 'maxCases', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-8 px-2 rounded-lg border border-border-base text-sm font-bold outline-none focus:border-brand-blue"
                  placeholder="Unlimited"
                />
              ) : (
                <p className="font-bold text-brand-dark">{plan.maxCases || 'Unlimited'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block flex items-center gap-1">
                <FileText size={12} /> Documents
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={plan.maxDocuments || ''}
                  onChange={(e) => updatePlan(plan.plan, 'maxDocuments', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-8 px-2 rounded-lg border border-border-base text-sm font-bold outline-none focus:border-brand-blue"
                  placeholder="Unlimited"
                />
              ) : (
                <p className="font-bold text-brand-dark">{plan.maxDocuments || 'Unlimited'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block flex items-center gap-1">
                <Users size={12} /> Team Members
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={plan.maxTeamMembers || ''}
                  onChange={(e) => updatePlan(plan.plan, 'maxTeamMembers', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-8 px-2 rounded-lg border border-border-base text-sm font-bold outline-none focus:border-brand-blue"
                  placeholder="Unlimited"
                />
              ) : (
                <p className="font-bold text-brand-dark">{plan.maxTeamMembers || 'Unlimited'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block flex items-center gap-1">
                <Database size={12} /> Storage (GB)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.5"
                  value={plan.storageGB || ''}
                  onChange={(e) => updatePlan(plan.plan, 'storageGB', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full h-8 px-2 rounded-lg border border-border-base text-sm font-bold outline-none focus:border-brand-blue"
                  placeholder="Unlimited"
                />
              ) : (
                <p className="font-bold text-brand-dark">{plan.storageGB || 'Unlimited'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">Features</h4>
          {Object.entries(plan.features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-page-bg transition-all">
              <span className="text-sm text-text-secondary capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {isEditing ? (
                typeof value === 'boolean' ? (
                  <button
                    onClick={() => updateFeature(plan.plan, key, !value)}
                    className={`w-10 h-5 rounded-full transition-all ${value ? 'bg-brand-blue' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                ) : (
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => updateFeature(plan.plan, key, e.target.value)}
                    className="w-32 h-7 px-2 rounded border border-border-base text-xs font-medium outline-none focus:border-brand-blue"
                  />
                )
              ) : typeof value === 'boolean' ? (
                value ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <AlertCircle size={16} className="text-red-400" />
                )
              ) : (
                <span className="text-xs font-bold text-brand-dark">{value as string}</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border-base">
          {isEditing ? (
            <>
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 h-10 rounded-xl border-2 border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(plan)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-brand-blue text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingPlan(plan.plan)}
              className="flex-1 h-10 rounded-xl bg-brand-dark text-white font-bold hover:shadow-lg transition-all"
            >
              Edit Plan
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="Plan Management">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Plan Management</h1>
        <p className="text-sm text-text-muted mt-1">Configure pricing, features, and limits for all subscription plans</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <AlertCircle size={24} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-900 mb-2">Important Notice</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            Changes to plan pricing and features will affect <strong>all new subscriptions</strong> immediately.
            Existing active subscriptions will retain their original terms until renewal.
            All modifications are logged for audit purposes.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-border-base p-8 animate-pulse">
              <div className="h-48 bg-page-bg rounded-xl mb-4" />
              <div className="h-4 bg-page-bg rounded mb-2 w-2/3" />
              <div className="h-4 bg-page-bg rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <PlanCard key={plan.plan} plan={plan} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
