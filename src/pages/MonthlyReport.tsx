import { Layout } from '@/components/common/Layout';
import { useAuditStore } from '@/store/useAuditStore';
import { FileBarChart, TrendingUp, TrendingDown, Calendar, Clock, RefreshCw, Award, AlertTriangle } from 'lucide-react';
import { formatNumber } from '@/utils/format';

export function MonthlyReport() {
  const { monthlyReport } = useAuditStore();
  const { departmentRankings, topRecurringIssues } = monthlyReport;
  
  return (
    <Layout 
      title="月度治理报告"
      subtitle={`${monthlyReport.month} 月权限治理成效汇总`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 bg-gradient-to-br from-blue-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">本月新增风险</p>
                <p className="text-2xl font-bold text-white font-mono">{formatNumber(monthlyReport.newRisks)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-red-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>较上月 +12.5%</span>
            </div>
          </div>
          
          <div className="card p-5 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">本月关闭风险</p>
                <p className="text-2xl font-bold text-white font-mono">{formatNumber(monthlyReport.closedRisks)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>较上月 +8.3%</span>
            </div>
          </div>
          
          <div className="card p-5 bg-gradient-to-br from-amber-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">平均处理时长</p>
                <p className="text-2xl font-bold text-white font-mono">{monthlyReport.avgResolutionDays}<span className="text-sm font-normal text-white/50"> 天</span></p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>较上月 -1.2 天</span>
            </div>
          </div>
          
          <div className="card p-5 bg-gradient-to-br from-red-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">风险复发率</p>
                <p className="text-2xl font-bold text-white font-mono">{monthlyReport.recurrenceRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-red-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>较上月 +3.1%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              反复出现的问题
            </h3>
            <div className="space-y-3">
              {topRecurringIssues.map((issue, index) => (
                <div 
                  key={issue.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        index < 3 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{issue.description}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                      {issue.occurrenceCount} 次
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      影响部门: {issue.affectedDepartments.join('、')}
                    </span>
                    <span className="text-white/40">
                      最近: {issue.lastOccurrence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              部门治理成效排名
            </h3>
            <div className="space-y-2">
              {departmentRankings.map((dept, index) => (
                <div 
                  key={dept.departmentId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-navy-900' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-navy-900' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {index + 1}
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{dept.departmentName}</span>
                      <span className="text-sm font-mono text-white/70">{dept.score} 分</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${dept.score}%`,
                          background: dept.score >= 80 ? 'linear-gradient(90deg, #10B981, #34D399)' :
                                     dept.score >= 60 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' :
                                     'linear-gradient(90deg, #EF4444, #F87171)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${
                    dept.improvement > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {dept.improvement > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {Math.abs(dept.improvement)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            本月治理总结
          </h3>
          <div className="prose prose-invert max-w-none text-sm text-white/70 space-y-3">
            <p>
              本月共发现 <span className="text-white font-medium">{monthlyReport.newRisks}</span> 个新风险，
              完成整改 <span className="text-emerald-400 font-medium">{monthlyReport.closedRisks}</span> 个，
              截止月底存量风险 <span className="text-amber-400 font-medium">{monthlyReport.totalRisks}</span> 个。
            </p>
            <p>
              平均整改处理时长为 <span className="text-white font-medium">{monthlyReport.avgResolutionDays}</span> 天，
              较上月有所改善。风险复发率为 <span className="text-red-400 font-medium">{monthlyReport.recurrenceRate}%</span>，
              需要重点关注反复出现的权限问题。
            </p>
            <p>
              治理成效最佳的三个部门为：法务部、财务部、产品部。
              建议对排名靠后的部门加强权限管理培训和监督。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
