import { Layout } from '@/components/common/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { RiskRanking } from '@/components/dashboard/RiskRanking';
import { TodoList } from '@/components/dashboard/TodoList';
import { useAuditStore, type TrendRiskType } from '@/store/useAuditStore';
import { Link as LinkIcon, Users, FolderOpen, Clock, AlertOctagon, Layers, ShieldAlert } from 'lucide-react';
import { RiskDetailDrawer } from '@/components/risk/RiskDetailDrawer';
import { useMemo } from 'react';

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
  const { trendRiskType, trendDepartmentId, getFilteredFolders } = state;
  const filteredFolders = getFilteredFolders();
  
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
          </div>
        </div>
      </div>
      
      <RiskDetailDrawer />
    </Layout>
  );
}
