import { Layout } from '@/components/common/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { RiskRanking } from '@/components/dashboard/RiskRanking';
import { TodoList } from '@/components/dashboard/TodoList';
import { useAuditStore } from '@/store/useAuditStore';
import { Link as LinkIcon, Users, FolderOpen, Clock, AlertOctagon } from 'lucide-react';
import { RiskDetailDrawer } from '@/components/risk/RiskDetailDrawer';

export function Dashboard() {
  const {
    externalLinksCount,
    externalAccountsCount,
    publicEditableCount,
    overdueReviewCount,
  } = useAuditStore();
  
  return (
    <Layout 
      title="权限审计总览" 
      subtitle="实时监控云盘共享权限安全态势"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="外链数量"
            value={externalLinksCount}
            icon={LinkIcon}
            trend={12.5}
            color="blue"
            delay={0}
            subtitle="公开分享链接总数"
          />
          <MetricCard
            title="外部账号"
            value={externalAccountsCount}
            icon={Users}
            trend={8.3}
            color="amber"
            delay={80}
            subtitle="外部协作者账号数"
          />
          <MetricCard
            title="高危可编辑目录"
            value={publicEditableCount}
            icon={FolderOpen}
            trend={-5.2}
            color="red"
            delay={160}
            subtitle="公开可编辑的文件夹"
          />
          <MetricCard
            title="超期未复核"
            value={overdueReviewCount}
            icon={Clock}
            trend={15.7}
            color="red"
            delay={240}
            subtitle="超过复核周期的文件夹"
          />
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
                <div className="text-2xl font-bold text-red-400 font-mono">32</div>
                <div className="text-xs text-white/50 mt-1">高危风险</div>
                <div className="text-xs text-red-400/70 mt-2">占比 17.1%</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400 font-mono">78</div>
                <div className="text-xs text-white/50 mt-1">中危风险</div>
                <div className="text-xs text-amber-400/70 mt-2">占比 41.7%</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400 font-mono">77</div>
                <div className="text-xs text-white/50 mt-1">低危风险</div>
                <div className="text-xs text-emerald-400/70 mt-2">占比 41.2%</div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-white/60">整体整改完成率</span>
                <span className="text-white font-medium">68.4%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: '68.4%' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/40 mt-2">
                <span>本月整改 96 项</span>
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
