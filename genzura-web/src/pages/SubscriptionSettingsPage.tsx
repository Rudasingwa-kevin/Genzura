import AppLayout from '../components/AppLayout';
import PricingPage from './PricingPage';

export default function SubscriptionSettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="animate-in-fade">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Subscription & Billing</h1>
          <p className="text-text-secondary font-bold mt-1">Manage your plan and payment methods</p>
        </div>

        <PricingPage variant="settings" />
      </div>
    </AppLayout>
  );
}
