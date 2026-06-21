import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuditStore, type TrendRiskType } from '@/store/useAuditStore';
import type { TimeRange } from '@/store/useAuditStore';
import { Link as LinkIcon, Users, Edit3, Clock, ShieldAlert, Layers } from 'lucide-react';

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
];

const riskTypes: { label: string; value: TrendRiskType; icon: any }[] = [
  { label: '全部风险', value: 'all', icon: Layers },
  { label: '外链', value: 'external_link', icon: LinkIcon },
  { label: '外部账号', value: 'external_account', icon: Users },
  { label: '公开编辑', value: 'public_edit', icon: Edit3 },
  { label: '超期未复核', value: 'overdue_review', icon: Clock },
  { label: '权限过大', value: 'excessive_permission', icon: ShieldAlert },
];

const typeColors: Record<TrendRiskType, { total: string; new: string; closed: string }> = {
  all: { total: '#3B82F6', new: '#EF4444', closed: '#10B981' },
  external_link: { total: '#3B82F6', new: '#60A5FA', closed: '#93C5FD' },
  external_account: { total: '#F59E0B', new: '#FBBF24', closed: '#FCD34D' },
  public_edit: { total: '#EF4444', new: '#F87171', closed: '#FCA5A5' },
  overdue_review: { total: '#8B5CF6', new: '#A78BFA', closed: '#C4B5FD' },
  excessive_permission: { total: '#EC4899', new: '#F472B6', closed: '#F9A8D4' },
};

export function TrendChart() {
  const { trendRiskType, trendTimeRange, setTrendRiskType, setTrendTimeRange, getTrendData } = useAuditStore();
  const trendData = getTrendData();
  const colors = typeColors[trendRiskType];
  
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900/95 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-white/60">{entry.name}</span>
              <span className="text-white font-mono ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card p-5">
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">风险趋势分析</h3>
            <p className="text-xs text-white/50 mt-0.5">新增、关闭与存量风险变化趋势</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTrendTimeRange(range.value)}
                className={`tab-btn text-xs ${
                  trendTimeRange === range.value ? 'tab-btn-active' : 'tab-btn-inactive'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {riskTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setTrendRiskType(type.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  trendRiskType === type.value
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="trendColorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.total} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.total} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trendColorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.new} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.new} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trendColorClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.closed} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.closed} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-white/60">{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="totalRisks" 
              name="存量风险"
              stroke={colors.total}
              strokeWidth={2}
              fill="url(#trendColorTotal)" 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#0F172A' }}
            />
            <Area 
              type="monotone" 
              dataKey="newRisks" 
              name="新增风险"
              stroke={colors.new}
              strokeWidth={1.5}
              fill="url(#trendColorNew)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0F172A' }}
            />
            <Area 
              type="monotone" 
              dataKey="closedRisks" 
              name="关闭风险"
              stroke={colors.closed}
              strokeWidth={1.5}
              fill="url(#trendColorClosed)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0F172A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
