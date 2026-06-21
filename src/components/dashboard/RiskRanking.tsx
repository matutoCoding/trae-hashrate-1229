import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '@/store/useAuditStore';
import type { RankingDimension } from '@/types';
import { Building2, FolderKanban, User, ChevronRight } from 'lucide-react';

const dimensions: { value: RankingDimension; label: string; icon: any }[] = [
  { value: 'department', label: '按部门', icon: Building2 },
  { value: 'project', label: '按项目', icon: FolderKanban },
  { value: 'owner', label: '按负责人', icon: User },
];

export function RiskRanking() {
  const navigate = useNavigate();
  const { rankingDimension, setRankingDimension, getCurrentRankings, departments } = useAuditStore();
  const rankings = getCurrentRankings();
  
  const maxValue = Math.max(...rankings.map(r => r.totalRisk), 1);
  
  const handleItemClick = (item: any) => {
    if (rankingDimension === 'department') {
      navigate(`/risk/${item.id}`);
    }
  };
  
  const getDepartmentId = (name: string) => {
    const dept = departments.find(d => d.name === name);
    return dept?.id || '';
  };
  
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">风险排行</h3>
          <p className="text-xs text-white/50 mt-0.5">高风险维度分布</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {dimensions.map((dim) => (
            <button
              key={dim.value}
              onClick={() => setRankingDimension(dim.value)}
              className={`tab-btn text-xs flex items-center gap-1.5 ${
                rankingDimension === dim.value ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
              title={dim.label}
            >
              <dim.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{dim.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {rankings.slice(0, 8).map((item, index) => {
          const percentage = (item.totalRisk / maxValue) * 100;
          const isClickable = rankingDimension === 'department';
          
          return (
            <div
              key={item.id}
              onClick={() => isClickable && handleItemClick({ ...item, id: getDepartmentId(item.name) })}
              className={`group relative flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                isClickable ? 'cursor-pointer hover:bg-white/5' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                index < 3 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-navy-900' 
                  : 'bg-white/10 text-white/50'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white truncate">{item.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs font-mono text-white/60">{item.totalRisk}</span>
                    {isClickable && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, 
                        ${item.highRiskCount > 0 ? '#EF4444' : item.mediumRiskCount > 0 ? '#F59E0B' : '#10B981'}, 
                        ${item.highRiskCount > 0 ? '#F87171' : item.mediumRiskCount > 0 ? '#FBBF24' : '#34D399'}
                      )`
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {item.highRiskCount > 0 && (
                    <span className="text-[10px] text-red-400">高危 {item.highRiskCount}</span>
                  )}
                  {item.mediumRiskCount > 0 && (
                    <span className="text-[10px] text-amber-400">中危 {item.mediumRiskCount}</span>
                  )}
                  {item.lowRiskCount > 0 && (
                    <span className="text-[10px] text-emerald-400">低危 {item.lowRiskCount}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
