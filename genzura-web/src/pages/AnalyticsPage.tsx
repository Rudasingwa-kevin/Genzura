import { useState } from 'react';
import { TrendingUp, TrendingDown, Briefcase, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import AppLayout from '../components/AppLayout';

// ─── Types / Mock data ────────────────────────────────────────────────────────
type Range = '7d' | '30d' | '90d' | '1y';

const RANGES: Range[] = ['7d', '30d', '90d', '1y'];

const BAR_DATA: Record<Range, { label: string; value: number }[]> = {
  '7d': [
    { label: 'Mon', value: 4 }, { label: 'Tue', value: 7 }, { label: 'Wed', value: 5 },
    { label: 'Thu', value: 9 }, { label: 'Fri', value: 6 }, { label: 'Sat', value: 3 }, { label: 'Sun', value: 2 },
  ],
  '30d': [
    { label: 'W1', value: 18 }, { label: 'W2', value: 24 }, { label: 'W3', value: 20 }, { label: 'W4', value: 28 },
  ],
  '90d': [
    { label: 'Jan', value: 60 }, { label: 'Feb', value: 75 }, { label: 'Mar', value: 90 },
  ],
  '1y': [
    { label: 'Q1', value: 200 }, { label: 'Q2', value: 260 }, { label: 'Q3', value: 220 }, { label: 'Q4', value: 310 },
  ],
};

const KPI_DATA: Record<Range, { opened: number; closed: number; avgDays: number; winRate: number }> = {
  '7d':  { opened: 36,  closed: 29,  avgDays: 18, winRate: 84 },
  '30d': { opened: 142, closed: 118, avgDays: 22, winRate: 81 },
  '90d': { opened: 430, closed: 390, avgDays: 25, winRate: 79 },
  '1y':  { opened: 990, closed: 870, avgDays: 28, winRate: 77 },
};

const ATTORNEYS = [
  { name: 'James Wilson',  cases: 34, resolved: 28, rate: 82, avatar: 'JW' },
  { name: 'Sarah Owens',   cases: 29, resolved: 25, rate: 86, avatar: 'SO' },
  { name: 'Alex Torres',   cases: 22, resolved: 18, rate: 82, avatar: 'AT' },
  { name: 'Diana Park',    cases: 18, resolved: 14, rate: 78, avatar: 'DP' },
];

// ─── Components ───────────────────────────────────────────────────────────────

const KpiCard = ({
  label, value, sub, icon: Icon, color, bg, trend, trendUp,
}: {
  label: string; value: string; sub: string;
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
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3 h-36 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full relative flex items-end justify-center" style={{ height: '100%' }}>
            <div
              className="w-full rounded-t-lg bg-brand-blue/15 group-hover:bg-brand-blue transition-colors duration-300 cursor-pointer relative"
              style={{ height: `${(d.value / max) * 100}%` }}
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

// Donut via conic-gradient
const DonutChart = () => {
  // Active 55%, Pending 20%, Resolved 25%
  const segments = [
    { label: 'Active',   pct: 55, color: '#185FA5' },
    { label: 'Pending',  pct: 20, color: '#F59E0B' },
    { label: 'Resolved', pct: 25, color: '#10B981' },
  ];
  const gradient = `conic-gradient(${segments.map((s, i) => {
    const start = segments.slice(0, i).reduce((a, b) => a + b.pct, 0);
    return `${s.color} ${start}% ${start + s.pct}%`;
  }).join(', ')})`;

  return (
    <div className="flex items-center gap-8">
      <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
            <span className="text-base font-bold text-brand-dark">44</span>
            <span className="text-[9px] text-text-muted font-semibold">cases</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-text-secondary font-medium">{s.label}</span>
            <span className="text-sm font-bold text-brand-dark ml-auto">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d');
  const kpi = KPI_DATA[range];

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Performance metrics and case insights</p>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 bg-white border border-border-base p-1 rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                range === r ? 'bg-brand-blue text-white shadow-md' : 'text-text-muted hover:text-brand-dark'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <KpiCard label="Cases Opened"    value={kpi.opened.toString()} sub="new cases filed"     icon={Briefcase}    color="text-brand-blue"    bg="bg-brand-light"   trend="+8%"  trendUp />
        <KpiCard label="Cases Closed"    value={kpi.closed.toString()} sub="successfully closed"  icon={CheckCircle2} color="text-emerald-600"  bg="bg-emerald-50"    trend="+12%" trendUp />
        <KpiCard label="Avg. Resolution" value={`${kpi.avgDays}d`}     sub="days to close"        icon={Clock}        color="text-amber-600"   bg="bg-amber-50"      trend="-3%"  trendUp />
        <KpiCard label="Win Rate"         value={`${kpi.winRate}%`}    sub="favorable outcomes"   icon={BarChart3}    color="text-violet-600"  bg="bg-violet-50"     trend="+2%"  trendUp />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-border-base p-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Case Volume</h3>
              <p className="text-xs text-text-muted mt-0.5">Cases opened vs time period</p>
            </div>
          </div>
          <BarChart data={BAR_DATA[range]} />
        </div>

        {/* Donut */}
        <div className="bg-white rounded-[2rem] border border-border-base p-8">
          <h3 className="text-lg font-bold text-brand-dark mb-1">Status Distribution</h3>
          <p className="text-xs text-text-muted mb-6">Current breakdown of all cases</p>
          <DonutChart />
        </div>
      </div>

      {/* Attorney Leaderboard */}
      <div className="bg-white rounded-[2rem] border border-border-base overflow-hidden">
        <div className="p-8 border-b border-border-base">
          <h3 className="text-lg font-bold text-brand-dark">Attorney Performance</h3>
          <p className="text-xs text-text-muted mt-1">Cases handled and resolution rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-page-bg/40 text-text-muted text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border-base">
                <th className="py-4 px-8">Attorney</th>
                <th className="py-4 px-8">Cases Handled</th>
                <th className="py-4 px-8">Resolved</th>
                <th className="py-4 px-8">Win Rate</th>
                <th className="py-4 px-8">Performance</th>
              </tr>
            </thead>
            <tbody>
              {ATTORNEYS.map((a, i) => (
                <tr key={a.name} className="border-b border-border-base hover:bg-page-bg/40 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center">{a.avatar}</div>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm">{a.name}</p>
                        <p className="text-[10px] text-text-muted">#{i + 1} this period</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8 font-bold text-brand-dark">{a.cases}</td>
                  <td className="py-5 px-8 font-bold text-emerald-600">{a.resolved}</td>
                  <td className="py-5 px-8">
                    <span className={`text-sm font-bold ${a.rate >= 85 ? 'text-emerald-600' : a.rate >= 80 ? 'text-amber-600' : 'text-slate-500'}`}>{a.rate}%</span>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${a.rate}%` }} />
                      </div>
                      <span className="text-xs text-text-muted">{a.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
