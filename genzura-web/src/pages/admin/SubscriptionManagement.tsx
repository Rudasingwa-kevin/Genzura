import {
  Search,
  Filter,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Crown,
  Zap,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Settings
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { useState, useEffect } from 'react';
import { userService } from '../../api/services/user.service';
import AdminSubscriptionModal from '../../components/AdminSubscriptionModal';

const PLAN_INFO = {
  Genzura: {
    name: 'Genzura',
    price: 0,
    duration: undefined as string | undefined,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    icon: Shield,
    limit: '20 cases, 20 docs'
  },
  Intango: {
    name: 'Intango',
    price: 100000,
    duration: '3 months',
    color: 'text-brand-blue',
    bg: 'bg-blue-50',
    icon: Zap,
    limit: 'Full features'
  },
  Inkingi: {
    name: 'Inkingi',
    price: 250000,
    duration: '1 year',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Crown,
    limit: 'Same features'
  }
};

const AdminKpiCard = ({ label, value, sub, icon: Icon, color, bg, trend }: any) => (
  <div className="bg-white rounded-[2rem] border border-border-base p-7 hover:shadow-lg transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <TrendingUp size={12} /> {trend}
        </div>
      )}
    </div>
    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold text-brand-dark tracking-tight">{value}</p>
    <p className="text-xs text-text-muted mt-1">{sub}</p>
  </div>
);

export default function SubscriptionManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    intango: 0,
    inkingi: 0,
    mrr: 0,
    arr: 0,
    conversionRate: 0
  });

  const fetchData = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);

        // Calculate stats
        const planCounts = data.reduce((acc: any, user: any) => {
          const plan = user.subscriptionPlan || 'Genzura';
          acc[plan.toLowerCase()] = (acc[plan.toLowerCase()] || 0) + 1;
          return acc;
        }, { genzura: 0, intango: 0, inkingi: 0 });

        const mrr = (planCounts.intango * 33333) + (planCounts.inkingi * 20833);
        const arr = (planCounts.intango * 100000 * 4) + (planCounts.inkingi * 250000);
        const paidUsers = planCounts.intango + planCounts.inkingi;
        const conversionRate = data.length > 0 ? ((paidUsers / data.length) * 100).toFixed(1) : 0;

        setStats({
          total: data.length,
          free: planCounts.genzura,
          intango: planCounts.intango,
          inkingi: planCounts.inkingi,
          mrr,
          arr,
          conversionRate: parseFloat(conversionRate as string)
        });
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManageClick = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData(); // Refresh data after admin action
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.subscriptionPlan || 'Genzura').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const daysUntilExpiry = Math.floor((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <AdminLayout title="Subscription Management">
      <AdminSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Subscription Management</h1>
          <p className="text-sm text-text-muted mt-1">Monitor revenue, user plans, and subscription lifecycle</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all shadow-sm">
            <Filter size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <AdminKpiCard
              label="Total Users"
              value={stats.total}
              sub={`${stats.conversionRate}% conversion rate`}
              icon={Users}
              color="text-brand-blue"
              bg="bg-brand-light"
            />
            <AdminKpiCard
              label="Monthly Revenue"
              value={`${Math.round(stats.mrr / 1000)}K`}
              sub="RWF recurring monthly"
              icon={DollarSign}
              color="text-emerald-600"
              bg="bg-emerald-50"
              trend="+12%"
            />
            <AdminKpiCard
              label="Annual Revenue"
              value={`${Math.round(stats.arr / 1000)}K`}
              sub="RWF projected yearly"
              icon={TrendingUp}
              color="text-violet-600"
              bg="bg-violet-50"
            />
            <AdminKpiCard
              label="Paid Users"
              value={stats.intango + stats.inkingi}
              sub={`${stats.free} on free plan`}
              icon={CreditCard}
              color="text-amber-600"
              bg="bg-amber-50"
            />
          </>
        )}
      </div>

      {/* Plan Distribution */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {Object.entries(PLAN_INFO).map(([key, plan]) => {
          const Icon = plan.icon;
          const count = stats[key.toLowerCase() as keyof typeof stats] || 0;
          const percentage = stats.total > 0 ? ((count as number / stats.total) * 100).toFixed(0) : 0;

          return (
            <div key={key} className="bg-white rounded-[2rem] border border-border-base p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${plan.bg} ${plan.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <span className={`text-2xl font-bold ${plan.color}`}>{count}</span>
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-1">{plan.name}</h3>
              <p className="text-xs text-text-muted mb-3">{plan.limit}</p>
              {plan.price > 0 && (
                <p className="text-sm font-bold text-brand-dark mb-3">
                  {plan.price.toLocaleString()} RWF <span className="text-xs text-text-muted">/ {plan.duration}</span>
                </p>
              )}
              <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase">
                <span>{percentage}% of users</span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-border-base shadow-sm overflow-hidden animate-in-fade">
        <div className="p-6 border-b border-border-base flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email or plan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none text-sm font-bold transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="px-4 py-2.5 rounded-xl border border-border-base font-bold text-xs text-text-secondary hover:bg-page-bg transition-all cursor-pointer">
              <option>All Plans</option>
              <option>Genzura (Free)</option>
              <option>Intango</option>
              <option>Inkingi</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-page-bg/30 border-b border-border-base">
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Start Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Expiry Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Revenue</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const plan = user.subscriptionPlan || 'Genzura';
                  const planInfo = PLAN_INFO[plan as keyof typeof PLAN_INFO] || PLAN_INFO.Genzura;
                  const Icon = planInfo.icon;
                  const expiring = isExpiringSoon(user.subscriptionEndDate);
                  const expired = isExpired(user.subscriptionEndDate);

                  return (
                    <tr key={user.id} className="group border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-all cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-xs font-bold text-brand-blue">
                            {user.initials}
                          </div>
                          <div>
                            <p className="font-bold text-brand-dark text-sm group-hover:text-brand-blue transition-colors">
                              {user.name}
                            </p>
                            <p className="text-xs text-text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${planInfo.bg} ${planInfo.color} text-[10px] font-bold uppercase`}>
                          <Icon size={12} />
                          {plan}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                          <Calendar size={14} className="text-text-muted" />
                          {formatDate(user.subscriptionStartDate)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-secondary font-medium">
                            {formatDate(user.subscriptionEndDate)}
                          </span>
                          {expiring && !expired && (
                            <AlertCircle size={14} className="text-amber-500" aria-label="Expiring soon" />
                          )}
                          {expired && (
                            <AlertCircle size={14} className="text-red-500" aria-label="Expired" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {plan === 'Genzura' ? (
                          <span className="text-xs text-text-muted font-medium">Free Plan</span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase">
                            <AlertCircle size={10} />
                            Expired
                          </span>
                        ) : expiring ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase">
                            <AlertCircle size={10} />
                            Expiring
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                            <CheckCircle2 size={10} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-bold text-brand-dark">
                          {planInfo.price > 0 ? `${planInfo.price.toLocaleString()} RWF` : 'Free'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleManageClick(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                          >
                            <Settings size={14} />
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
