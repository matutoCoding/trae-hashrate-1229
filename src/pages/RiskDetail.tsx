import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { FolderTable } from '@/components/risk/FolderTable';
import { RiskDetailDrawer } from '@/components/risk/RiskDetailDrawer';
import { useAuditStore } from '@/store/useAuditStore';
import { departments } from '@/data/departments';
import { getFoldersByDepartment } from '@/data/folders';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { RiskBadge } from '@/components/common/RiskBadge';

export function RiskDetail() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { isDetailDrawerOpen } = useAuditStore();
  
  const department = departments.find(d => d.id === departmentId);
  const folders = departmentId ? getFoldersByDepartment(departmentId) : [];
  
  if (!department) {
    return (
      <Layout title="部门未找到" subtitle="请选择有效的部门">
        <div className="text-center py-20">
          <p className="text-white/60">未找到该部门信息</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title={`${department.name} - 风险详情`}
      subtitle={`共 ${department.totalFolders} 个共享文件夹，${department.highRiskCount} 个高危`}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link 
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回总览
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-white/50 mb-1">总文件夹数</p>
            <p className="text-2xl font-bold text-white font-mono">{department.totalFolders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-white/50 mb-1">高危风险</p>
            <p className="text-2xl font-bold text-red-400 font-mono">{department.highRiskCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-white/50 mb-1">中危风险</p>
            <p className="text-2xl font-bold text-amber-400 font-mono">{department.mediumRiskCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-white/50 mb-1">整改完成率</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{department.remediationRate}%</p>
          </div>
        </div>
        
        <FolderTable folders={folders} departmentName={department.name} />
      </div>
      
      <RiskDetailDrawer />
    </Layout>
  );
}
