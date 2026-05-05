import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Briefcase, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { CASES } from '../data/cases';

// ─── Types ────────────────────────────────────────────────────────────────
type Range = '7d' | '30d' | '90d' | '1y';
const RANGES: Range[] = ['7d', '30d', '90d', '1y'];

// ─── Helper Functions ────────────────────────────────────────────────────────
// We use a fixed "today" to align with the mock data timeline (May 2026)
const getToday = () => new Date('2026-05-10');

const parseDateStr = (dateStr: string) => new Date(dateStr);

const getDaysDiff = (d1: Date, d2: Date) => Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));

const getCutoffDate = (range: Range): Date => {
  const today = getToday();
  const cutoff = new Date(today);
  if (range === '7d') cutoff.setDate(cutoff.getDate() - 7);
  else if (range === '30d') cutoff.setDate(cutoff.getDate() - 30);
  else if (range === '90d') cutoff.setDate(cutoff.getDate() - 90);
  else if (range === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff;
};

// ─── Components ───────────────────────────────────────────────────────────────

const KpiCard = ({
  label, value, sub, icon: Icon, color, bg, trend, trendUp,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
  trend: string; trendUp: boolean;
}) => (
  <div className="bg-white rounded-[2rem] border border-border-base p-7 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}><Icon size={24}/></div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
        {trendUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {trend}
      </div>
    </div>
    <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.1em] mb-2">{label}</p>
    <p className="text-4xl font-bold text-brand-dark tracking-tighter">{value}</p>
    <p className="text-xs text-text-muted mt-1">{sub}</p>
  </div>
);

const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map((d) => d.value), 1); // fallback to 1 to avoid /0
  return (
    <div className="flex items-end gap-3 h-36 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full relative flex items-end justify-center" style={{ height: '100%' }}>
            <div
              className="w-full rounded-t-lg bg-brand-blue/15 group-hover:bg-brand-blue transition-colors duration-300 cursor-pointer relative"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.value}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-text-muted font-semibold">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('90d');

  // Dynamically calculate KPIs and Chart data based on selected range
  const { kpi, barData, leaderboard } = useMemo(() => {
    const cutoffDate = getCutoffDate(range);
    
    // Filter cases filed within the time range
    const rangeCases = CASES.filter(c => parseDateStr(c.filedDate) >= cutoffDate);
    
    // KPIs
    const opened = rangeCases.length;
    // For closed, we'll look at ALL cases resolved within the range (assuming their updated/timeline puts them in range, 
    // but for simplicity we'll just check if they are resolved and filed in the range)
    const closed = rangeCases.filter(c => c.status === 'Resolved').length;
    
    // Avg Resolution: Mock derived from priority for now since we don't have explicit resolved dates for all
    let totalDays = 0;
    const resolvedCases = CASES.filter(c => c.status === 'Resolved');
    resolvedCases.forEach(c => {
      // Mock days based on priority just to have dynamic-looking data
      const days = c.priority === 'High' ? 14 : c.priority === 'Medium' ? 30 : 45;
      totalDays += days;
    });
    const avgDays = resolvedCases.length > 0 ? Math.round(totalDays / resolvedCases.length) : 0;
    
    const winRate = resolvedCases.length > 0 ? 85 : 0; // Fixed realistic win rate for now

    // Bar Chart Data
    let barData: { label: string; value: number }[] = [];
    if (range === '7d' || range === '30d') {
      // Group by week for 30d, by day for 7d
      const buckets = range === '7d' ? 7 : 4;
      barData = Array.from({ length: buckets }).map((_, i) => ({
        label: range === '7d' ? `Day ${i + 1}` : `Week ${i + 1}`,
        value: 0
      }));
      
      rangeCases.forEach(c => {
        const filed = parseDateStr(c.filedDate);
        const daysAgo = getDaysDiff(filed, getToday());
        if (range === '7d') {
          const idx = 6 - (daysAgo >= 7 ? 6 : daysAgo);
          barData[idx].value++;
        } else {
          const idx = 3 - Math.floor((daysAgo >= 30 ? 29 : daysAgo) / 7.5);
          barData[idx].value++;
        }
      });
    } else {
      // 90d or 1y (group by month)
      const buckets = range === '90d' ? 3 : 12;
      barData = Array.from({ length: buckets }).map((_, i) => {
        const d = new Date(getToday());
        d.setMonth(d.getMonth() - (buckets - 1 - i));
        return { label: d.toLocaleString('default', { month: 'short' }), value: 0 };
      });
      
      rangeCases.forEach(c => {
        const filed = parseDateStr(c.filedDate);
        const monthsAgo = (getToday().getFullYear() - filed.getFullYear()) * 12 + getToday().getMonth() - filed.getMonth();
        const idx = (buckets - 1) - monthsAgo;
        if (idx >= 0 && idx < buckets) barData[idx].value++;
      });
    }

    // Leaderboard (All time)
    const attorneyMap: Record<string, { cases: number; resolved: number; rate: number; avatar: string }> = {};
    CASES.forEach(c => {
      if (!attorneyMap[c.attorney]) {
        const initials = c.attorney.split(' ').map(n => n[0]).join('').toUpperCase();
        attorneyMap[c.attorney] = { cases: 0, resolved: 0, rate: 0, avatar: initials };
      }
      attorneyMap[c.attorney].cases++;
      if (c.status === 'Resolved') attorneyMap[c.attorney].resolved++;
    });
    
    const leaderboard = Object.entries(attorneyMap).map(([name, data]) => {
      // Calculate realistic rate based on resolved/cases, plus a base so it's not 0
      const actualRate = data.resolved > 0 ? Math.round((data.resolved / data.cases) * 100) : 0;
      const rate = actualRate > 0 ? actualRate : 75 + Math.floor(Math.random() * 15); // mock realistic if no resolved yet
      return { name, ...data, rate };
    }).sort((a, b) => b.rate - a.rate);

    return {
      kpi: { opened, closed, avgDays, winRate },
      barData,
      leaderboard
    };
  }, [range]);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Performance metrics and case insights</p>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 bg-white border border-border-base p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                range === r ? 'bg-brand-blue text-white shadow-md' : 'text-text-muted hover:text-brand-dark'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Cases Opened"    value={kpi.opened}          sub="new cases filed"     icon={Briefcase}    color="text-brand-blue"    bg="bg-brand-light"   trend="+8%"  trendUp />
        <KpiCard label="Cases Closed"    value={kpi.closed}          sub="successfully closed"  icon={CheckCircle2} color="text-emerald-600"  bg="bg-emerald-50"    trend="+12%" trendUp />
        <KpiCard label="Avg. Resolution" value={`${kpi.avgDays}d`}     sub="days to close"        icon={Clock}        color="text-amber-600"   bg="bg-amber-50"      trend="-3%"  trendUp />
        <KpiCard label="Win Rate"         value={`${kpi.winRate}%`}    sub="favorable outcomes"   icon={BarChart3}    color="text-violet-600"  bg="bg-violet-50"     trend="+2%"  trendUp />
      </div>

      {/* Charts Row */}
      <div className="w-full">
        {/* Bar Chart */}
        <div className="bg-white rounded-[2rem] border border-border-base p-6 md:p-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Case Volume</h3>
              <p className="text-xs text-text-muted mt-0.5">Cases opened vs time period</p>
            </div>
          </div>
          <div className="min-w-[400px]">
            <BarChart data={barData} />
          </div>
        </div>
      </div>

      {/* Attorney Leaderboard */}
      <div className="bg-white rounded-[2rem] border border-border-base overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-base">
          <h3 className="text-lg font-bold text-brand-dark">Attorney Performance</h3>
          <p className="text-xs text-text-muted mt-1">Cases handled and resolution rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[600px]">
            <thead>
              <tr className="bg-page-bg/40 text-text-muted text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border-base">
                <th className="py-4 px-6 md:px-8">Attorney</th>
                <th className="py-4 px-6 md:px-8">Cases Handled</th>
                <th className="py-4 px-6 md:px-8">Resolved</th>
                <th className="py-4 px-6 md:px-8">Win Rate</th>
                <th className="py-4 px-6 md:px-8">Performance</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((a, i) => (
                <tr key={a.name} className="border-b border-border-base hover:bg-page-bg/40 transition-colors">
                  <td className="py-5 px-6 md:px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center shrink-0">{a.avatar}</div>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm">{a.name}</p>
                        <p className="text-[10px] text-text-muted">#{i + 1} performance</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 md:px-8 font-bold text-brand-dark">{a.cases}</td>
                  <td className="py-5 px-6 md:px-8 font-bold text-emerald-600">{a.resolved}</td>
                  <td className="py-5 px-6 md:px-8">
                    <span className={`text-sm font-bold ${a.rate >= 85 ? 'text-emerald-600' : a.rate >= 80 ? 'text-amber-600' : 'text-slate-500'}`}>{a.rate}%</span>
                  </td>
                  <td className="py-5 px-6 md:px-8 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${a.rate}%` }} />
                      </div>
                      <span className="text-xs text-text-muted shrink-0 w-8">{a.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-text-muted font-medium">No attorney data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
