import { useState, useMemo } from 'react';
import { Layout } from '@/components/common/Layout';
import { useAuditStore, type MeetingIssueFilter } from '@/store/useAuditStore';
import { 
  FileBarChart, TrendingUp, TrendingDown, Calendar, Clock, RefreshCw, Award, AlertTriangle,
  Users, ChevronDown, ChevronRight, Presentation, BarChart3, Folder, UserCircle, CheckCircle2, XCircle, AlertOctagon, ListTodo, MessageSquare, Bell, ArrowUpCircle, Copy, Check
} from 'lucide-react';
import { formatNumber } from '@/utils/format';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/date';

type ReportView = 'overview' | 'meeting';

const filterConfig: { key: MeetingIssueFilter; label: string; icon: any; color: string }[] = [
  { key: 'new', label: '本月新增', icon: FileBarChart, color: 'blue' },
  { key: 'closed', label: '本月关闭', icon: CheckCircle2, color: 'emerald' },
  { key: 'overdue', label: '逾期问题', icon: XCircle, color: 'red' },
  { key: 'recurring', label: '复发问题', icon: RefreshCw, color: 'amber' },
];

export function MonthlyReport() {
  const { monthlyReport, folders, departments, toggleDepartmentInReport, expandedDepartmentsInReport, meetingIssueFilterByDept, setMeetingIssueFilter, escalateTask } = useAuditStore();
  const { departmentRankings, topRecurringIssues } = monthlyReport;
  const [activeView, setActiveView] = useState<ReportView>('overview');
  const [copied, setCopied] = useState(false);
  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const filterIssues = (deptFolders: any[], filter: MeetingIssueFilter) => {
    switch (filter) {
      case 'new':
        return deptFolders.filter(f => new Date(f.firstDiscoveredAt) >= monthStart);
      case 'closed':
        return deptFolders.filter(f => f.currentTask?.status === 'completed' && f.currentTask.completedAt && new Date(f.currentTask.completedAt) >= monthStart);
      case 'overdue':
        return deptFolders.filter(f => 
          (f.currentTask?.status === 'overdue') || 
          (f.currentTask?.dueDate && new Date(f.currentTask.dueDate) < now && f.currentTask.status !== 'completed') ||
          (f.nextReviewDue && new Date(f.nextReviewDue) < now)
        );
      case 'recurring':
        return deptFolders.filter(f => f.remediationHistory.length >= 2);
      default:
        return deptFolders;
    }
  };
  
  const deptIssueStats = useMemo(() => {
    return departments.map(dept => {
      const deptFolders = folders.filter(f => f.departmentId === dept.id);
      
      const newRisks = deptFolders.filter(f => new Date(f.firstDiscoveredAt) >= monthStart).length;
      const closed = deptFolders.filter(f => f.currentTask?.status === 'completed' && f.currentTask.completedAt && new Date(f.currentTask.completedAt) >= monthStart).length;
      const overdue = deptFolders.filter(f => 
        (f.currentTask?.status === 'overdue') || 
        (f.currentTask?.dueDate && new Date(f.currentTask.dueDate) < now && f.currentTask.status !== 'completed') ||
        (f.nextReviewDue && new Date(f.nextReviewDue) < now)
      ).length;
      const recurring = deptFolders.filter(f => f.remediationHistory.length >= 2).length;
      const pending = deptFolders.filter(f => f.currentTask?.status === 'pending' || f.currentTask?.status === 'in_progress').length;
      
      return {
        ...dept,
        newRisks,
        closed,
        overdue,
        recurring,
        pending,
        allIssues: deptFolders,
        newIssues: filterIssues(deptFolders, 'new'),
        closedIssues: filterIssues(deptFolders, 'closed'),
        overdueIssues: filterIssues(deptFolders, 'overdue'),
        recurringIssues: filterIssues(deptFolders, 'recurring'),
      };
    }).sort((a, b) => (b.newRisks + b.overdue + b.recurring) - (a.newRisks + a.overdue + a.recurring));
  }, [departments, folders]);
  
  const getNextAction = (folder: any): string => {
    if (!folder.currentTask) return '待分配整改任务';
    if (folder.currentTask.status === 'completed') return '已完成，持续监控';
    if (folder.currentTask.status === 'escalated') return `已升级处理，需上级关注`;
    if (folder.currentTask.status === 'overdue') return `已逾期 ${folder.currentTask.urgeCount || 0} 次催办，建议升级处理`;
    if (folder.currentTask.dueDate) {
      const daysLeft = Math.ceil((new Date(folder.currentTask.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return `已逾期 ${Math.abs(daysLeft)} 天，立即跟进`;
      if (daysLeft <= 3) return `剩余 ${daysLeft} 天，建议提醒确认进度`;
      return `剩余 ${daysLeft} 天，按计划推进`;
    }
    return '跟进整改进度';
  };
  
  const generateMeetingMinutes = (): string => {
    const lines: string[] = [];
    lines.push(`【安全例会纪要草稿】`);
    lines.push(`日期：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
    lines.push('');
    
    for (const dept of deptIssueStats) {
      const isExpanded = expandedDepartmentsInReport.includes(dept.id);
      if (!isExpanded) continue;
      
      const activeFilter: MeetingIssueFilter = meetingIssueFilterByDept[dept.id] || 'new';
      const filteredIssues = 
        activeFilter === 'new' ? dept.newIssues :
        activeFilter === 'closed' ? dept.closedIssues :
        activeFilter === 'overdue' ? dept.overdueIssues :
        dept.recurringIssues;
      
      lines.push(`━━━ ${dept.name} ━━━`);
      lines.push(`口径：${filterConfig.find(f => f.key === activeFilter)?.label || '本月新增'}`);
      lines.push('');
      
      const followUpItems = filteredIssues.filter((f: any) => f.currentTask && f.currentTask.status !== 'completed');
      const urgedItems = filteredIssues.filter((f: any) => f.currentTask?.urgeCount > 0);
      const escalatedItems = filteredIssues.filter((f: any) => f.currentTask?.status === 'escalated');
      const nextFollowers = [...new Set(filteredIssues.map((f: any) => f.currentTask?.assignee || f.owner).filter(Boolean))];
      
      lines.push(`【待追问事项 ${followUpItems.length} 项】`);
      followUpItems.forEach((f: any) => {
        lines.push(`- ${f.name}（${f.departmentName}）：${getNextAction(f)}`);
      });
      
      if (urgedItems.length > 0) {
        lines.push('');
        lines.push(`【已催办问题 ${urgedItems.length} 项】`);
        urgedItems.forEach((f: any) => {
          lines.push(`- ${f.name}：已催办 ${f.currentTask.urgeCount} 次，最近催办 ${f.currentTask.lastUrgedAt ? formatDate(f.currentTask.lastUrgedAt) : '—'}`);
        });
      }
      
      if (escalatedItems.length > 0) {
        lines.push('');
        lines.push(`【已升级处理 ${escalatedItems.length} 项】`);
        escalatedItems.forEach((f: any) => {
          lines.push(`- ${f.name}：需上级关注`);
        });
      }
      
      lines.push('');
      lines.push(`下次跟进人：${nextFollowers.join('、')}`);
      lines.push('');
    }
    
    return lines.join('\n');
  };
  
  const handleCopyMinutes = () => {
    const text = generateMeetingMinutes();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const hasExpandedDept = expandedDepartmentsInReport.length > 0;
  
  return (
    <Layout 
      title="月度治理报告"
      subtitle={`${monthlyReport.month} 月权限治理成效汇总`}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveView('overview')}
            className={`tab-btn flex items-center gap-2 ${activeView === 'overview' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <BarChart3 className="w-4 h-4" />
            总览视角
          </button>
          <button
            onClick={() => setActiveView('meeting')}
            className={`tab-btn flex items-center gap-2 ${activeView === 'meeting' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <Presentation className="w-4 h-4" />
            例会视角
          </button>
        </div>
        
        {activeView === 'overview' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-4">
            <div className="card p-4 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-start gap-3">
                <Presentation className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">安全例会视图</p>
                    {hasExpandedDept && (
                      <button
                        onClick={handleCopyMinutes}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                        }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? '已复制' : '复制会议纪要'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    按部门展开查看本月新增、关闭、逾期和复发问题，点击部门行可展开详细问题清单，并通过标签切换不同口径的问题列表。展开后可一键复制会议纪要草稿。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="card p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  待处理问题
                </div>
                <p className="text-xl font-bold text-white font-mono">
                  {deptIssueStats.reduce((s, d) => s + d.pending, 0)}
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <FileBarChart className="w-3.5 h-3.5 text-blue-400" />
                  本月新增
                </div>
                <p className="text-xl font-bold text-blue-400 font-mono">
                  {deptIssueStats.reduce((s, d) => s + d.newRisks, 0)}
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  本月关闭
                </div>
                <p className="text-xl font-bold text-emerald-400 font-mono">
                  {deptIssueStats.reduce((s, d) => s + d.closed, 0)}
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  已逾期
                </div>
                <p className="text-xl font-bold text-red-400 font-mono">
                  {deptIssueStats.reduce((s, d) => s + d.overdue, 0)}
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  复发问题
                </div>
                <p className="text-xl font-bold text-amber-400 font-mono">
                  {deptIssueStats.reduce((s, d) => s + d.recurring, 0)}
                </p>
              </div>
            </div>
            
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    部门问题清单
                  </h3>
                  <p className="text-xs text-white/50">点击部门名称展开，可切换问题口径</p>
                </div>
              </div>
              
              <div className="divide-y divide-white/5">
                {deptIssueStats.map((dept, deptIndex) => {
                  const isExpanded = expandedDepartmentsInReport.includes(dept.id);
                  const activeFilter: MeetingIssueFilter = meetingIssueFilterByDept[dept.id] || 'new';
                  const filteredIssues = 
                    activeFilter === 'new' ? dept.newIssues :
                    activeFilter === 'closed' ? dept.closedIssues :
                    activeFilter === 'overdue' ? dept.overdueIssues :
                    dept.recurringIssues;
                  
                  return (
                    <div key={dept.id}>
                      <div
                        onClick={() => toggleDepartmentInReport(dept.id)}
                        className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="w-6 flex justify-center">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white/60" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                        
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          deptIndex < 3 
                            ? 'bg-red-500/20 text-red-400' 
                            : deptIndex < 6 
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {deptIndex + 1}
                        </span>
                        
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Users className="w-4 h-4 text-white/50 flex-shrink-0" />
                          <span className="text-sm font-medium text-white">{dept.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-blue-400">
                            <FileBarChart className="w-3 h-3" />
                            新增 <span className="font-mono font-bold">{dept.newRisks}</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            关闭 <span className="font-mono font-bold">{dept.closed}</span>
                          </span>
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-3 h-3" />
                            逾期 <span className="font-mono font-bold">{dept.overdue}</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <RefreshCw className="w-3 h-3" />
                            复发 <span className="font-mono font-bold">{dept.recurring}</span>
                          </span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-white/[0.02] border-t border-white/5 p-4 pl-14 animate-fade-in">
                          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 w-fit mb-4">
                            {filterConfig.map(fc => {
                              const Icon = fc.icon;
                              const isActive = activeFilter === fc.key;
                              return (
                                <button
                                  key={fc.key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMeetingIssueFilter(dept.id, fc.key);
                                  }}
                                  className={`tab-btn text-xs flex items-center gap-1.5 ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {fc.label}
                                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                                  }`}>
                                    {fc.key === 'new' ? dept.newRisks :
                                     fc.key === 'closed' ? dept.closed :
                                     fc.key === 'overdue' ? dept.overdue :
                                     dept.recurring}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          
                          {filteredIssues.length > 0 ? (
                            <div className="space-y-2">
                              {filteredIssues.map((folder: any) => (
                                <div 
                                  key={folder.id}
                                  className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                      <Folder className="w-4 h-4 text-blue-400" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-white">{folder.name}</p>
                                        <RiskBadge level={folder.riskLevel} size="sm" />
                                        {folder.currentTask && <StatusBadge status={folder.currentTask.status} size="sm" />}
                                        {folder.currentTask?.urgeCount > 0 && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] border border-red-500/30">
                                            <Bell className="w-3 h-3" />
                                            已催办 {folder.currentTask.urgeCount} 次
                                          </span>
                                        )}
                                        {folder.currentTask?.status === 'escalated' && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/30">
                                            <ArrowUpCircle className="w-3 h-3" />
                                            已升级
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-white/40 mt-0.5 font-mono truncate">{folder.path}</p>
                                      
                                      <div className="flex items-center gap-4 mt-2.5 text-xs flex-wrap">
                                        <span className="flex items-center gap-1 text-white/60">
                                          <UserCircle className="w-3 h-3" />
                                          责任人: <span className="text-white/80 font-medium">{folder.owner}</span>
                                        </span>
                                        {folder.nextReviewDue && (
                                          <span className="flex items-center gap-1 text-white/60">
                                            <Calendar className="w-3 h-3" />
                                            复核: <span className={new Date(folder.nextReviewDue) < now ? 'text-red-400' : 'text-white/80'}>
                                              {formatDate(folder.nextReviewDue)}
                                            </span>
                                          </span>
                                        )}
                                        {folder.currentTask?.dueDate && (
                                          <span className="flex items-center gap-1 text-white/60">
                                            <ListTodo className="w-3 h-3" />
                                            整改截止: <span className={new Date(folder.currentTask.dueDate) < now ? 'text-red-400' : 'text-white/80'}>
                                              {formatDate(folder.currentTask.dueDate)}
                                            </span>
                                          </span>
                                        )}
                                        {folder.currentTask?.lastUrgedAt && (
                                          <span className="flex items-center gap-1 text-amber-400">
                                            <Bell className="w-3 h-3" />
                                            最近催办: {formatDate(folder.currentTask.lastUrgedAt)}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="mt-3 pt-3 border-t border-white/5">
                                        <div className="flex items-start gap-2">
                                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs text-white/50">下一步追问动作</p>
                                            <p className="text-xs text-white/80 mt-0.5">{getNextAction(folder)}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-white/40 text-sm">
                              该口径下暂无问题 🎉
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
