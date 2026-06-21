import { useState } from 'react';
import type { SharedFolder, RiskLevel } from '@/types';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuditStore } from '@/store/useAuditStore';
import { Folder, User, Calendar, ChevronRight, Filter, Search } from 'lucide-react';
import { formatDate, getRelativeDateString } from '@/utils/date';
import { getRiskReasonTypeText } from '@/utils/format';

interface FolderTableProps {
  folders: SharedFolder[];
  departmentName: string;
}

export function FolderTable({ folders, departmentName }: FolderTableProps) {
  const { setSelectedFolder, setDetailDrawerOpen } = useAuditStore();
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFolders = folders.filter(folder => {
    const matchesLevel = filterLevel === 'all' || folder.riskLevel === filterLevel;
    const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });
  
  const handleRowClick = (folder: SharedFolder) => {
    setSelectedFolder(folder);
    setDetailDrawerOpen(true);
  };
  
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">{departmentName} - 共享文件夹</h3>
            <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-md">
              {filteredFolders.length} 个
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索文件夹或项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setFilterLevel('all')}
              className={`tab-btn text-xs ${filterLevel === 'all' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterLevel('high')}
              className={`tab-btn text-xs ${filterLevel === 'high' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              高危
            </button>
            <button
              onClick={() => setFilterLevel('medium')}
              className={`tab-btn text-xs ${filterLevel === 'medium' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              中危
            </button>
            <button
              onClick={() => setFilterLevel('low')}
              className={`tab-btn text-xs ${filterLevel === 'low' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              低危
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                文件夹名称
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                所属项目
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                负责人
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                风险等级
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                风险类型
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                整改状态
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                复核截止
              </th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredFolders.map((folder, index) => (
              <tr
                key={folder.id}
                onClick={() => handleRowClick(folder)}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Folder className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {folder.name}
                      </p>
                      <p className="text-xs text-white/40 font-mono">{folder.path}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white/70">{folder.projectName}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-medium">
                      {folder.owner[0]}
                    </div>
                    <span className="text-sm text-white/70">{folder.owner}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={folder.riskLevel} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {folder.riskReasons.slice(0, 2).map((reason) => (
                    <span
                      key={reason.id}
                      className="text-[10px px-1.5 py-0.5 rounded bg-white/10 text-white/60"
                    >
                      {getRiskReasonTypeText(reason.type)}
                    </span>
                  ))}
                  {folder.riskReasons.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      +{folder.riskReasons.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {folder.currentTask ? (
                  <StatusBadge status={folder.currentTask.status} size="sm" />
                ) : (
                  <span className="text-xs text-white/40">未分配</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  <span className={`text-xs ${
                    new Date(folder.nextReviewDue) < new Date() 
                      ? 'text-red-400' 
                      : 'text-white/60'
                  }`}>
                    {getRelativeDateString(folder.nextReviewDue)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {filteredFolders.length === 0 && (
      <div className="p-8 text-center">
        <Folder className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/50">没有找到匹配的文件夹</p>
      </div>
    )}
  </div>
  );
}
