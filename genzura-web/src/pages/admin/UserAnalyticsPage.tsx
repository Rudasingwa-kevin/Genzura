import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { userService } from '../../api/services/user.service';
import { BarChart3, Activity, Briefcase, FileText, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsData {
  workload: Array<{
    id: string;
    name: string;
    initials: string;
    role: string;
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    docsUploaded: number;
    timelineEvents: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    timestamp: string;
    author: { id: string; name: string; initials: string };
    case: { id: string; title: string } | null;
  }>;
}

export default function UserAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await userService.getAnalytics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch user analytics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="User Analytics">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const maxCases = Math.max(...data.workload.map(w => w.totalCases), 1);

  return (
    <AdminLayout title="Attorney Workload & Activity">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Workload Heatmap / Chart */}
        <div className="bg-white rounded-[2rem] border border-border-base p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-brand-light rounded-xl text-brand-blue">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-dark">Workload Distribution</h2>
              <p className="text-sm text-text-muted">Active vs resolved case load per attorney</p>
            </div>
          </div>

          <div className="space-y-6">
            {data.workload.map((attorney) => (
              <div key={attorney.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {attorney.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{attorney.name}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">{attorney.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-dark">{attorney.totalCases} Total Cases</p>
                    <p className="text-xs text-text-muted">{attorney.activeCases} Active · {attorney.resolvedCases} Resolved</p>
                  </div>
                </div>
                
                {/* Visual Bar */}
                <div className="h-4 w-full bg-page-bg rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-brand-blue transition-all duration-1000 ease-out"
                    style={{ width: `${(attorney.activeCases / maxCases) * 100}%` }}
                    title={`Active: ${attorney.activeCases}`}
                  />
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${(attorney.resolvedCases / maxCases) * 100}%` }}
                    title={`Resolved: ${attorney.resolvedCases}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity & Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-border-base p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-dark">Global Activity Feed</h2>
                <p className="text-sm text-text-muted">Real-time actions across all matters</p>
              </div>
            </div>

            <div className="space-y-6">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-page-bg flex items-center justify-center text-brand-dark text-sm font-bold shrink-0">
                    {activity.author.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-dark">
                      {activity.author.name} <span className="font-normal text-text-muted">added an event</span>
                    </p>
                    <div className="mt-1 p-3 bg-page-bg rounded-xl border border-border-base/50">
                      <p className="text-sm font-bold text-brand-dark">{activity.title}</p>
                      {activity.description && <p className="text-xs text-text-secondary mt-1">{activity.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-text-muted">
                      <span className="flex items-center gap-1"><CalendarIcon size={12} /> {format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                      {activity.case && (
                        <span className="flex items-center gap-1 text-brand-blue bg-brand-light px-2 py-0.5 rounded-md">
                          <Briefcase size={12} /> {activity.case.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <div className="text-center py-8 text-text-muted">No recent activity recorded.</div>
              )}
            </div>
          </div>

          {/* Top Performers / Quick Stats */}
          <div className="space-y-8">
            <div className="bg-brand-dark rounded-[2rem] p-8 text-white shadow-xl shadow-brand-dark/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ArrowUpRight size={20} className="text-brand-light" />
                Most Active
              </h3>
              {data.workload.slice(0, 3).map((w, i) => (
                <div key={w.id} className="flex items-center justify-between mb-4 last:mb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-brand-light text-brand-blue' : 'bg-white/10'}`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{w.name}</p>
                      <p className="text-xs opacity-70">{w.timelineEvents} actions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-border-base p-8 shadow-sm">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <FileText size={20} className="text-emerald-500" />
                Document Leaders
              </h3>
              {data.workload.sort((a, b) => b.docsUploaded - a.docsUploaded).slice(0, 3).map((w) => (
                <div key={w.id} className="flex items-center justify-between mb-4 last:mb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-page-bg text-brand-dark flex items-center justify-center text-xs font-bold">
                      {w.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{w.name}</p>
                      <p className="text-xs text-text-muted">{w.docsUploaded} uploads</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
