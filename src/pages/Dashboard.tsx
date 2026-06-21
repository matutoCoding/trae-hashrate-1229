import { Layout } from '@/components/common/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { RiskRanking } from '@/components/dashboard/RiskRanking';
import { TodoList } from '@/components/dashboard/TodoList';
import { useAuditStore, type TrendRiskType } from '@/store/useAuditStore';
import { Link as LinkIcon, Users, FolderOpen, Clock, AlertOctagon, Layers, ShieldAlert, Folder, UserCircle, Calendar, ListTodo, Bell, X, ArrowUpCircle, ChevronRight } from 'lucide-react';
import { RiskDetailDrawer } from '@/components/risk/RiskDetailDrawer';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getRiskReasonTypeText, getStatusText } from '@/utils/format';
import { formatDate, getRelativeDateString } from '@/utils/date';
import { useState, useMemo } from 'react';

const metricConfigByType: Record<TrendRiskType, {
  title: string;
  icon: any;
  color: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'pink';
  subtitle: string;
  trend: number;
  getValue: (filtered: ReturnType<typeof useAuditStore.getState>['folders']) => number;
}[]> = {
  all: [
    { title: '外链数量', icon: LinkIcon, color: 'blue', subtitle: '公开分享链接总数', trend: 12.5, getValue: (f) => f.reduce((s, x) => s + x.externalLinks, 0) },
    { title: '外部账号', icon: Users, color: 'amber', subtitle: '外部协作者账号数', trend: 8.3, getValue: (f) => f.reduce((s, x) => s + x.externalAccounts, 0) },
    { title: '高危可编辑目录', icon: FolderOpen, color: 'red', subtitle: '公开可编辑的文件夹', trend: -5.2, getValue: (f) => f.filter(x => x.isPublicEditable).length },
    { title: '超期未复核', icon: Clock, color: 'red', subtitle: '超过复核周期的文件夹', trend: 15.7, getValue: (f) => f.filter(x => new Date(x.nextReviewDue) < new Date()).length },
  ],
  external_link: [
    { title: '外链总数', icon: LinkIcon, color: 'blue', subtitle: '所有公开分享链接', trend: 12.5, getValue: (f) => f.reduce((s, x) => s + x.externalLinks, 0) },
    { title: '含外链文件夹', icon: FolderOpen, color: 'blue', subtitle: '包含外链的文件夹数', trend: 9.8, getValue: (f) => f.filter(x => x.externalLinks > 0).length },
    { title: '高危外链目录', icon: AlertOctagon, color: 'red', subtitle: '高危文件夹中的外链', trend: -3.2, getValue: (f) => f.filter(x => x.riskLevel === 'high' && x.externalLinks > 0).length },
    { title: '无密码外链', icon: ShieldAlert, color: 'amber', subtitle: '未设置访问密码的外链', trend: 18.4, getValue: (f) => Math.floor(f.reduce((s, x) => s + x.externalLinks, 0) * 0.6) },
  ],
  external_account: [
    { title: '外部账号总数', icon: Users, color: 'amber', subtitle: '所有外部协作者账号', trend: 8.3, getValue: (f) => f.reduce((s, x) => s + x.externalAccounts, 0) },
    { title: '含外部分享文件夹', icon: FolderOpen, color: 'amber', subtitle: '共享给外部账号的文件夹', trend: 6.7, getValue: (f) => f.filter(x => x.externalAccounts > 0).length },
    { title: '高危外部分享', icon: AlertOctagon, color: 'red', subtitle: '高危文件夹中的外部账号', trend: -2.1, getValue: (f) => f.filter(x => x.riskLevel === 'high' && x.externalAccounts > 0).length },
    { title: '已离职账号', icon: ShieldAlert, color: 'red', subtitle: '疑似已离职的外部账号', trend: 5.5, getValue: (f) => Math.floor(f.reduce((s, x) => s + x.externalAccounts, 0) * 0.15) },
  ],
  public_edit: [
    { title: '公开可编辑目录', icon: FolderOpen, color: 'red', subtitle: '允许公开编辑的文件夹', trend: -5.2, getValue: (f) => f.filter(x => x.isPublicEditable).length },
    { title: '含敏感内容', icon: AlertOctagon, color: 'red', subtitle: '高危且公开可编辑', trend: -8.9, getValue: (f) => f.filter(x => x.isPublicEditable && x.riskLevel === 'high').length },
    { title: '研发类目录', icon: Layers, color: 'amber', subtitle: '研发部门公开编辑目录', trend: -3.5, getValue: (f) => f.filter(x => x.isPublicEditable && x.departmentId === 'dept-001').length },
    { title: '市场类目录', icon: Layers, color: 'amber', subtitle: '市场部门公开编辑目录', trend: -1.2, getValue: (f) => f.filter(x => x.isPublicEditable && x.departmentId === 'dept-002').length },
  ],
  overdue_review: [
    { title: '超期未复核', icon: Clock, color: 'red', subtitle: '超过复核周期的文件夹', trend: 15.7, getValue: (f) => f.filter(x => new Date(x.nextReviewDue) < new Date()).length },
    { title: '超期30天以上', icon: AlertOctagon, color: 'red', subtitle: '严重超期未复核', trend: 22.3, getValue: (f) => Math.floor(f.filter(x => new Date(x.nextReviewDue) < new Date()).length * 0.45) },
    { title: '超期60天以上', icon: ShieldAlert, color: 'red', subtitle: '极度超期需立即处理', trend: 28.6, getValue: (f) => Math.floor(f.filter(x => new Date(x.nextReviewDue) < new Date()).length * 0.2) },
    { title: '本周需复核', icon: Clock, color: 'amber', subtitle: '7天内到期的文件夹', trend: 5.2, getValue: (f) => {
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return f.filter(x => {
        const due = new Date(x.nextReviewDue);
        return due >= now && due <= weekLater;
      }).length;
    }},
  ],
  excessive_permission: [
    { title: '权限过大文件夹', icon: ShieldAlert, color: 'pink', subtitle: '全员拥有管理权限的目录', trend: 7.8, getValue: (f) => f.filter(x => x.riskReasons.some(r => r.type === 'excessive_permission')).length },
    { title: '高危权限过大', icon: AlertOctagon, color: 'red', subtitle: '高危且权限过大的目录', trend: 4.5, getValue: (f) => f.filter(x => x.riskLevel === 'high' && x.riskReasons.some(r => r.type === 'excessive_permission')).length },
    { title: '研发部门', icon: Layers, color: 'pink', subtitle: '研发中心权限过大目录', trend: 9.1, getValue: (f) => f.filter(x => x.departmentId === 'dept-001' && x.riskReasons.some(r => r.type === 'excessive_permission')).length },
    { title: '销售部门', icon: Layers, color: 'pink', subtitle: '销售部权限过大目录', trend: 6.3, getValue: (f) => f.filter(x => x.departmentId === 'dept-007' && x.riskReasons.some(r => r.type === 'excessive_permission')).length },
  ],
};

export function Dashboard() {
  const state = useAuditStore();
  const { 
    trendRiskType, 
    trendDepartmentId, 
    getFilteredFolders, 
    getEscalatedFolders,
    departments, 
    recentBatchOperations, 
    clearRecentBatchOperations, 
    escalateTask,
    setSelectedBatchOperation,
    setBatchOperationDetailModalOpen,
  } = state;
  const [showEscalationLedger, setShowEscalationLedger] = useState(false);
  const filteredFolders = getFilteredFolders();
  const escalatedFolders = getEscalatedFolders();
  const now = new Date();
  
  const metrics = useMemo(() => {
    return metricConfigByType[trendRiskType] || metricConfigByType.all;
  }, [trendRiskType]);
  
  const riskStats = useMemo(() => {
    const high = filteredFolders.filter(f => f.riskLevel === 'high').length;
    const medium = filteredFolders.filter(f => f.riskLevel === 'medium').length;
    const low = filteredFolders.filter(f => f.riskLevel === 'low').length;
    const total = filteredFolders.length;
    const completed = filteredFolders.filter(f => f.currentTask?.status === 'completed').length;
    const withTask = filteredFolders.filter(f => f.currentTask).length;
    const rate = withTask > 0 ? Math.round((completed / withTask) * 1000) / 10 : 0;
    
    return {
      high, medium, low, total,
      highPct: total > 0 ? Math.round(high / total * 1000) / 10 : 0,
      mediumPct: total > 0 ? Math.round(medium / total * 1000) / 10 : 0,
      lowPct: total > 0 ? Math.round(low / total * 1000) / 10 : 0,
      completionRate: rate,
    };
  }, [filteredFolders]);
  
  const currentDeptName = trendDepartmentId === 'all'
    ? '全部部门'
    : departments.find(d => d.id === trendDepartmentId)?.name || '全部部门';
  
  const handleEscalate = (folderId: string) => {
    escalateTask(folderId, '逾期多次催办，问题升级处理');
  };
  
  return (
    <Layout 
      title="权限审计总览" 
      subtitle="实时监控云盘共享权限安全态势"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <MetricCard
                key={`${trendRiskType}-${trendDepartmentId}-${metric.title}`}
                title={metric.title}
                value={metric.getValue(filteredFolders)}
                icon={Icon}
                trend={metric.trend}
                color={metric.color}
                delay={idx * 80}
                subtitle={metric.subtitle}
              />
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div className="lg:col-span-1">
            <RiskRanking />
          </div>
        </div>
        
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">
                  风险文件夹清单
                </h3>
                <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-md">
                  {filteredFolders.length} 个
                </span>
                <span className="text-xs text-white/40">
                  {currentDeptName} · {trendRiskType === 'all' ? '全部风险' : getRiskReasonTypeText(trendRiskType)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">文件夹</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">部门</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">负责人</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">风险原因</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">整改状态</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">截止日</th>
                </tr>
              </thead>
              <tbody>
                {filteredFolders.slice(0, 20).map((folder) => {
                  const task = folder.currentTask;
                  const taskOverdue = task?.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';
                  const canEscalate = task && task.urgeCount >= 2 && (task.status === 'overdue' || taskOverdue) && task.status !== 'escalated' && task.status !== 'completed';
                  
                  return (
                    <tr
                      key={folder.id}
                      onClick={() => { state.setSelectedFolder(folder); state.setDetailDrawerOpen(true); }}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{folder.name}</p>
                            <p className="text-xs text-white/40 font-mono truncate max-w-[200px]">{folder.path}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-white/60">{folder.departmentName}</span>
                      </td>
                      <td className="px-4 py-3">
                        {task ? (
                          <div className="flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5 text-white/40" />
                            <span className="text-xs text-white/80 font-medium">{task.assignee}</span>
                            {task.urgeCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">
                                <Bell className="w-2.5 h-2.5" />{task.urgeCount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">{folder.owner}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <RiskBadge level={folder.riskLevel} size="sm" />
                          {folder.riskReasons.slice(0, 1).map((r) => (
                            <span key={r.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                              {getRiskReasonTypeText(r.type)}
                            </span>
                          ))}
                          {folder.riskReasons.length > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">+{folder.riskReasons.length - 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task ? (
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={task.status} size="sm" />
                            {canEscalate && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEscalate(folder.id); }}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                                title="升级处理"
                              >
                                <ArrowUpCircle className="w-3 h-3" />升级
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">未分配</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task?.dueDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-white/40" />
                            <span className={`text-xs font-mono ${taskOverdue ? 'text-red-400' : 'text-white/60'}`}>
                              {task.dueDate.split('T')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredFolders.length > 20 && (
            <div className="p-3 border-t border-white/5 text-center">
              <span className="text-xs text-white/40">仅展示前 20 条，共 {filteredFolders.length} 条记录</span>
            </div>
          )}
          
          {filteredFolders.length === 0 && (
            <div className="p-8 text-center">
              <Folder className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">当前筛选条件下无风险文件夹</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodoList />
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">风险分布概览</h3>
                <p className="text-xs text-white/50 mt-0.5">各风险等级占比</p>
              </div>
              <AlertOctagon className="w-5 h-5 text-white/40" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="text-2xl font-bold text-red-400 font-mono">{riskStats.high}</div>
                <div className="text-xs text-white/50 mt-1">高危风险</div>
                <div className="text-xs text-red-400/70 mt-2">占比 {riskStats.highPct}%</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400 font-mono">{riskStats.medium}</div>
                <div className="text-xs text-white/50 mt-1">中危风险</div>
                <div className="text-xs text-amber-400/70 mt-2">占比 {riskStats.mediumPct}%</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400 font-mono">{riskStats.low}</div>
                <div className="text-xs text-white/50 mt-1">低危风险</div>
                <div className="text-xs text-emerald-400/70 mt-2">占比 {riskStats.lowPct}%</div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-white/60">整体整改完成率</span>
                <span className="text-white font-medium">{riskStats.completionRate}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${riskStats.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/40 mt-2">
                <span>已有整改任务 {filteredFolders.filter(f => f.currentTask).length} 项</span>
                <span>目标 85%</span>
              </div>
            </div>
            
            {escalatedFolders.length > 0 && (
              <button
                onClick={() => setShowEscalationLedger(true)}
                className="w-full mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/15 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">升级台账</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                    {escalatedFolders.length} 项
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400/50 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
        
        {recentBatchOperations.length > 0 && (
          <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">最近批量操作记录</h3>
              </div>
              <button
                onClick={clearRecentBatchOperations}
                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {recentBatchOperations.slice(0, 3).map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
                  onClick={() => {
                    setSelectedBatchOperation(record);
                    setBatchOperationDetailModalOpen(true);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{record.action}</span>
                      <span className="text-[11px] text-white/40">{formatDate(record.operatedAt)}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{record.detail}</p>
                    <p className="text-[11px] text-emerald-400/70 mt-1 flex items-center gap-1">
                      <span>点击查看完整影响名单</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showEscalationLedger && escalatedFolders.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">升级问题台账</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                    共 {escalatedFolders.length} 项
                  </span>
                </div>
                <button
                  onClick={() => setShowEscalationLedger(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">文件夹</th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">部门</th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">负责人</th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">催办次数</th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">升级时间</th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-white/50 uppercase tracking-wider">当前状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalatedFolders.map((folder) => {
                        const task = folder.currentTask!;
                        const escalationRecord = folder.remediationHistory.find(r => r.action === '升级处理');
                        return (
                          <tr
                            key={folder.id}
                            onClick={() => {
                              state.setSelectedFolder(folder);
                              state.setDetailDrawerOpen(true);
                              setShowEscalationLedger(false);
                            }}
                            className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">{folder.name}</p>
                                  <p className="text-xs text-white/40 font-mono truncate max-w-[180px]">{folder.path}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs text-white/60">{folder.departmentName}</span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <UserCircle className="w-3.5 h-3.5 text-white/40" />
                                <span className="text-xs text-white/80 font-medium">{task.assignee}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs font-mono text-red-400">{task.urgeCount} 次</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs text-white/60 font-mono">
                                {escalationRecord ? formatDate(escalationRecord.operatedAt) : '—'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={task.status} size="sm" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {state.batchOperationDetailModalOpen && state.selectedBatchOperation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[75vh] flex flex-col shadow-2xl">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">{state.selectedBatchOperation.action}</h3>
                </div>
                <button
                  onClick={() => {
                    setBatchOperationDetailModalOpen(false);
                    setSelectedBatchOperation(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                <div className="p-3 rounded-lg bg-white/5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">操作人</span>
                    <span className="text-white/80 font-medium">{state.selectedBatchOperation.operator}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">操作时间</span>
                    <span className="text-white/80 font-mono">{formatDate(state.selectedBatchOperation.operatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">影响数量</span>
                    <span className="text-emerald-400 font-mono font-medium">{state.selectedBatchOperation.folderIds.length} 个文件夹</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-white/50 mb-1">操作详情</p>
                    <p className="text-sm text-white/80">{state.selectedBatchOperation.detail}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-white/50 mb-2">影响文件夹名单</p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {state.selectedBatchOperation.folderNames.map((name, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-white/5 text-xs">
                        <Folder className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0" />
                        <span className="text-white/70">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <RiskDetailDrawer />
    </Layout>
  );
}
