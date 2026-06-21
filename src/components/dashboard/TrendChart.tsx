import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuditStore } from '@/store/useAuditStore';
import { trendData7Days, trendData30Days, trendData90Days } from '@/data/trends';

const timeRanges = [
  { label: '7天', value: 7, data: trendData7Days },
  { label: '30天', value: 30, data: trendData30Days },
  { label: '90天', value: 90, data: trendData90Days },
];

export function TrendChart() {
  const [activeRange, setActiveRange] = useState(30);
  const trendData = timeRanges.find(r => r.value === activeRange)?.data || [];
  
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">风险趋势分析</h3>
          <p className="text-xs text-white/50 mt-0.5">新增、关闭与存量风险变化趋势</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveRange(range.value)}
              className={`tab-btn text-xs ${
                activeRange === range.value ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
              stroke="#3B82F6" 
              strokeWidth={2}
              fill="url(#colorTotal)" 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#0F172A' }}
            />
            <Area 
              type="monotone" 
              dataKey="newRisks" 
              name="新增风险"
              stroke="#EF4444" 
              strokeWidth={1.5}
              fill="url(#colorNew)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0F172A' }}
            />
            <Area 
              type="monotone" 
              dataKey="closedRisks" 
              name="关闭风险"
              stroke="#10B981" 
              strokeWidth={1.5}
              fill="url(#colorClosed)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0F172A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
