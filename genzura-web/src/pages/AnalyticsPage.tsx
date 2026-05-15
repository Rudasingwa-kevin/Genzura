import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ChevronRight
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { caseService } from '../api/services/case.service';
import { CardSkeleton, Skeleton } from '../components/Skeleton';

// ─── Types ────────────────────────────────────────────────────────────────
type Range = '7d' | '30d' | '90d' | '1y';
const RANGES: Range[] = ['7d', '30d', '90d', '1y'];

// ─── Helper Functions ────────────────────────────────────────────────────────
// getToday kept for future date-filtering when range-based API params are added

// ─── Components ───────────────────────────────────────────────────────────────

const KpiCard = ({
  label, value, sub, icon: Icon, color, bg, trend, trendUp, index
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
  trend: string; trendUp: boolean; index: number;
}) => (
  <div className="bg-white rounded-[2rem] border border-border-base p-7 hover:shadow-md transition-shadow animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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

const AreaChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const width = 1000;
  const height = 300;
  const padding = 50;
  
  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - (d.value / (max * 1.2)) * (height - padding * 2);
    return { x, y };
  });

  const pathData = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
  
  const areaData = `${pathData} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full h-full relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={padding} y1={padding + i*(height-padding*2)/3} x2={width-padding} y2={padding + i*(height-padding*2)/3} stroke="#F1F5F9" strokeWidth="1" />
        ))}

        <path d={areaData} fill="url(#areaGradient)" />
        <path d={pathData} fill="none" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} className="group/dot">
            <circle cx={p.x} cy={p.y} r="5" fill="#4F46E5" stroke="#FFF" strokeWidth="2" className="group-hover/dot:r-7 transition-all" />
          </g>
        ))}

        {data.map((d, i) => (
          <text key={i} x={padding + (i * (width - padding * 2)) / (data.length - 1)} y={height - 15} textAnchor="middle" className="text-[10px] font-bold fill-text-muted">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('90d');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const result = await caseService.getAnalytics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  const kpi = useMemo(() => {
    if (!data) return { opened: 0, closed: 0, avgDays: 0, winRate: 0 };
    
    const statusCounts = data.statusCounts || [];
    const closed = statusCounts.find((s: any) => s.status === 'Resolved')?._count || 0;
    
    return {
      opened: data.totalCases || 0,
      closed,
      avgDays: 28, // Hardcoded for now until more complex logic added
      winRate: 85
    };
  }, [data]);

  const velocityData = useMemo(() => {
    if (!data?.volumeByMonth) return [];
    return data.volumeByMonth.map((d: any) => ({
      label: d.month,
      value: d.count
    }));
  }, [data]);

  const leaderboard = useMemo(() => {
    // Keep mock leaderboard for now as we don't have attorney stats in simple analytics yet
    return [
      { name: 'Sarah Miller', cases: 14, resolved: 12, rate: 92, initials: 'SM' },
      { name: 'James Wilson', cases: 22, resolved: 18, rate: 88, initials: 'JW' },
      { name: 'David Chen', cases: 9, resolved: 7, rate: 82, initials: 'DC' },
    ];
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Performance metrics and case insights</p>
        </div>
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

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Cases Opened"    value={kpi.opened}          sub="new cases filed"     icon={Briefcase}    color="text-brand-blue"    bg="bg-brand-light"   trend="+8%"  trendUp index={0} />
            <KpiCard label="Cases Closed"    value={kpi.closed}          sub="successfully closed"  icon={CheckCircle2} color="text-emerald-600"  bg="bg-emerald-50"    trend="+12%" trendUp index={1} />
            <KpiCard label="Avg. Resolution" value={`${kpi.avgDays}d`}     sub="days to close"        icon={Clock}        color="text-amber-600"   bg="bg-amber-50"      trend="-3%"  trendUp index={2} />
            <KpiCard label="Win Rate"         value={`${kpi.winRate}%`}    sub="favorable outcomes"   icon={BarChart3}    color="text-violet-600"  bg="bg-violet-50"     trend="+2%"  trendUp index={3} />
          </>
        )}
      </div>

      {/* Velocity Area Chart */}
      <div className="bg-white rounded-[2rem] border border-border-base p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Case Velocity</h3>
            <p className="text-xs text-text-muted mt-0.5">matters filed over time</p>
          </div>
        </div>
        <div className="h-64">
          {isLoading ? <Skeleton className="w-full h-full rounded-2xl" /> : <AreaChart data={velocityData} />}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-[2rem] border border-border-base overflow-hidden">
        <div className="p-8 border-b border-border-base">
          <h3 className="text-lg font-bold text-brand-dark">Attorney Performance</h3>
          <p className="text-xs text-text-muted mt-1">Cases handled and resolution rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
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
              {leaderboard.map((a) => (
                <tr key={a.name} className="border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center shrink-0">{a.initials}</div>
                      <p className="font-semibold text-brand-dark text-sm">{a.name}</p>
                    </div>
                  </td>
                  <td className="py-5 px-8 font-bold text-brand-dark">{a.cases}</td>
                  <td className="py-5 px-8 font-bold text-emerald-600">{a.resolved}</td>
                  <td className="py-5 px-8 font-bold text-brand-dark">{a.rate}%</td>
                  <td className="py-5 px-8 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue rounded-full" style={{ width: `${a.rate}%` }} />
                      </div>
                      <ChevronRight size={16} className="text-text-muted" />
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
