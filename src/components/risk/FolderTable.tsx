import { useState, useMemo } from 'react';
import type { SharedFolder, RiskLevel } from '@/types';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuditStore } from '@/store/useAuditStore';
import { 
  Folder, User, Calendar, ChevronRight, Search, CheckSquare, Square, 
  ListChecks, X, Users, CheckCircle2, Check, Bell, CalendarClock, UserCircle, ListTodo
} from 'lucide-react';
import { getRelativeDateString } from '@/utils/date';
import { getRiskReasonTypeText } from '@/utils/format';

interface FolderTableProps {
  folders: SharedFolder[];
  departmentName: string;
}

function BatchAssignModal() {
  const { 
    batchAssignModalOpen, 
    setBatchAssignModalOpen, 
    selectedFolderIds, 
    batchAssignTask,
    folders
  } = useAuditStore();
  
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remark, setRemark] = useState('');
  
  if (!batchAssignModalOpen) return null;
  
  const selectedFolders = folders.filter(f => selectedFolderIds.includes(f.id));
  
  const handleSubmit = () => {
    if (assignee && dueDate && selectedFolderIds.length > 0) {
      batchAssignTask(selectedFolderIds, assignee, dueDate, remark);
      setAssignee('');
      setDueDate('');
      setRemark('');
    }
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setBatchAssignModalOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div 
          className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">批量分配整改任务</h3>
                <p className="text-xs text-white/50 mt-0.5">已选择 {selectedFolderIds.length} 个文件夹</p>
              </div>
            </div>
            <button
              onClick={() => setBatchAssignModalOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 max-h-32 overflow-y-auto">
              <p className="text-xs text-white/60 mb-2">将分配到以下文件夹：</p>
              <div className="space-y-1">
                {selectedFolders.map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-white/80 truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">负责人 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="输入负责人姓名"
                className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">截止日期 <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">备注说明</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="添加整改要求或备注..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>
          
          <div className="p-5 border-t border-white/10 flex gap-3">
            <button
              onClick={() => setBatchAssignModalOpen(false)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!assignee || !dueDate || selectedFolderIds.length === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认分配 ({selectedFolderIds.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BatchRescheduleModal() {
  const { 
    batchRescheduleModalOpen, 
    setBatchRescheduleModalOpen, 
    selectedFolderIds, 
    batchRescheduleTask,
    folders
  } = useAuditStore();
  
  const [newDueDate, setNewDueDate] = useState('');
  const [remark, setRemark] = useState('');
  
  if (!batchRescheduleModalOpen) return null;
  
  const selectedFolders = folders.filter(f => selectedFolderIds.includes(f.id));
  const reschedulable = selectedFolders.filter(f => f.currentTask && f.currentTask.status !== 'completed');
  
  const handleSubmit = () => {
    if (newDueDate && reschedulable.length > 0) {
      const reschedulableIds = reschedulable.map(f => f.id);
      batchRescheduleTask(reschedulableIds, newDueDate, remark);
      setNewDueDate('');
      setRemark('');
    }
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setBatchRescheduleModalOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div 
          className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">批量调整截止日期</h3>
                <p className="text-xs text-white/50 mt-0.5">可调整 {reschedulable.length} 个进行中的任务</p>
              </div>
            </div>
            <button
              onClick={() => setBatchRescheduleModalOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 max-h-32 overflow-y-auto">
              <p className="text-xs text-white/60 mb-2">将调整以下文件夹的截止日：</p>
              <div className="space-y-1">
                {reschedulable.map(f => (
                  <div key={f.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-white/80 truncate">{f.name}</span>
                    <span className="text-white/40 font-mono flex-shrink-0">
                      当前: {f.currentTask?.dueDate?.split('T')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">新截止日期 <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">改期原因</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="说明改期原因..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
          </div>
          
          <div className="p-5 border-t border-white/10 flex gap-3">
            <button
              onClick={() => setBatchRescheduleModalOpen(false)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newDueDate || reschedulable.length === 0}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认改期 ({reschedulable.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BatchUrgeModal() {
  const { 
    selectedFolderIds, 
    batchUrgeTask,
    folders,
    clearFolderSelection,
    setBatchMode,
    isBatchMode,
  } = useAuditStore();
  
  const [open, setOpen] = useState(false);
  const [urgeRemark, setUrgeRemark] = useState('');
  
  const selectedFolders = folders.filter(f => selectedFolderIds.includes(f.id));
  const urgeable = selectedFolders.filter(f => f.currentTask && f.currentTask.status !== 'completed');
  
  const handleSubmit = () => {
    if (urgeable.length > 0) {
      const urgeableIds = urgeable.map(f => f.id);
      batchUrgeTask(urgeableIds, urgeRemark || '请尽快完成整改任务');
      setUrgeRemark('');
      setOpen(false);
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  if (!isBatchMode) return null;
  
  return (
    <>
      {urgeable.length > 0 && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 !py-1.5 text-xs px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Bell className="w-3.5 h-3.5" />
          批量催办 ({urgeable.length})
        </button>
      )}
      
      {open && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div 
              className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">批量催办整改</h3>
                    <p className="text-xs text-white/50 mt-0.5">将催办 {urgeable.length} 个进行中的任务</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 max-h-32 overflow-y-auto">
                  <p className="text-xs text-white/60 mb-2">将催办以下文件夹的负责人：</p>
                  <div className="space-y-1">
                    {urgeable.map(f => (
                      <div key={f.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-white/80 truncate">{f.name}</span>
                        <span className="text-white/40 flex-shrink-0">
                          <UserCircle className="w-3 h-3 inline mr-1" />
                          {f.currentTask?.assignee}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">催办说明</label>
                  <textarea
                    value={urgeRemark}
                    onChange={(e) => setUrgeRemark(e.target.value)}
                    placeholder="添加催办内容，例如：请在本周五前完成整改..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
              </div>
              
              <div className="p-5 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={urgeable.length === 0}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认催办 ({urgeable.length})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function FolderTable({ folders, departmentName }: FolderTableProps) {
  const { 
    setSelectedFolder, 
    setDetailDrawerOpen,
    isBatchMode,
    setBatchMode,
    selectedFolderIds,
    toggleFolderSelection,
    clearFolderSelection,
    setBatchAssignModalOpen,
    setBatchRescheduleModalOpen,
    batchCompleteTask,
  } = useAuditStore();
  
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => {
      const matchesLevel = filterLevel === 'all' || folder.riskLevel === filterLevel;
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [folders, filterLevel, searchQuery]);
  
  const allSelected = filteredFolders.length > 0 && filteredFolders.every(f => selectedFolderIds.includes(f.id));
  const someSelected = filteredFolders.some(f => selectedFolderIds.includes(f.id)) && !allSelected;
  const selectedCount = selectedFolderIds.filter(id => filteredFolders.some(f => f.id === id)).length;
  const completableCount = selectedFolderIds.filter(id => {
    const f = folders.find(f => f.id === id);
    return f?.currentTask && f.currentTask.status !== 'completed';
  }).length;
  const reschedulableCount = selectedFolderIds.filter(id => {
    const f = folders.find(f => f.id === id);
    return f?.currentTask && f.currentTask.status !== 'completed';
  }).length;
  
  const handleToggleAll = () => {
    if (allSelected) {
      filteredFolders.forEach(f => {
        if (selectedFolderIds.includes(f.id)) {
          toggleFolderSelection(f.id);
        }
      });
    } else {
      filteredFolders.forEach(f => {
        if (!selectedFolderIds.includes(f.id)) {
          toggleFolderSelection(f.id);
        }
      });
    }
  };
  
  const handleRowClick = (folder: SharedFolder) => {
    if (isBatchMode) {
      toggleFolderSelection(folder.id);
    } else {
      setSelectedFolder(folder);
      setDetailDrawerOpen(true);
    }
  };
  
  const handleBatchComplete = () => {
    if (completableCount > 0) {
      const completableIds = selectedFolderIds.filter(id => {
        const f = folders.find(f => f.id === id);
        return f?.currentTask && f.currentTask.status !== 'completed';
      });
      batchCompleteTask(completableIds);
    }
  };
  
  const now = new Date();
  
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
            {isBatchMode && selectedCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-md border border-blue-500/30">
                已选 {selectedCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isBatchMode ? (
              <>
                <button
                  onClick={() => { clearFolderSelection(); setBatchMode(false); }}
                  className="btn-secondary flex items-center gap-1.5 !py-1.5 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  退出批量
                </button>
                {selectedCount > 0 && (
                  <>
                    <button
                      onClick={() => setBatchAssignModalOpen(true)}
                      className="btn-primary flex items-center gap-1.5 !py-1.5 text-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      批量分配
                    </button>
                    {reschedulableCount > 0 && (
                      <button
                        onClick={() => setBatchRescheduleModalOpen(true)}
                        className="flex items-center gap-1.5 !py-1.5 text-xs px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        批量改期 ({reschedulableCount})
                      </button>
                    )}
                    <BatchUrgeModal />
                    {completableCount > 0 && (
                      <button
                        onClick={handleBatchComplete}
                        className="flex items-center gap-1.5 !py-1.5 text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        批量完成 ({completableCount})
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => setBatchMode(true)}
                className="btn-secondary flex items-center gap-1.5 !py-1.5 text-xs"
              >
                <ListChecks className="w-3.5 h-3.5" />
                批量操作
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
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
              {isBatchMode && (
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={handleToggleAll}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : someSelected ? (
                      <div className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-400/30 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-blue-400 rounded"></div>
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                文件夹名称
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                所属项目
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                整改信息
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
              {!isBatchMode && <th className="w-10 px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {filteredFolders.map((folder) => {
              const isSelected = selectedFolderIds.includes(folder.id);
              const task = folder.currentTask;
              const taskOverdue = task?.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';
              const taskDueSoon = task?.dueDate && new Date(task.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'completed';
              
              return (
                <tr
                  key={folder.id}
                  onClick={() => handleRowClick(folder)}
                  className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group ${
                    isSelected && isBatchMode ? 'bg-blue-500/10' : ''
                  }`}
                >
                  {isBatchMode && (
                    <td className="w-12 px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleFolderSelection(folder.id); }}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-white/30 group-hover:text-white/50" />
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Folder className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium transition-colors ${
                          isBatchMode ? 'text-white' : 'text-white group-hover:text-blue-400'
                        }`}>
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
                    {task ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <UserCircle className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/80 font-medium">{task.assignee}</span>
                          {task.urgeCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">
                              <Bell className="w-2.5 h-2.5" />
                              {task.urgeCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ListTodo className="w-3.5 h-3.5 text-white/40" />
                          <span className={`text-xs font-mono ${
                            taskOverdue ? 'text-red-400' :
                            taskDueSoon ? 'text-amber-400' :
                            'text-white/60'
                          }`}>
                            {task.dueDate?.split('T')[0]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white/30">未分配</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={folder.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {folder.riskReasons.slice(0, 2).map((reason) => (
                        <span
                          key={reason.id}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60"
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
                    {task ? (
                      <StatusBadge status={task.status} size="sm" />
                    ) : (
                      <span className="text-xs text-white/40">未分配</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span className={`text-xs ${
                        new Date(folder.nextReviewDue) < now 
                          ? 'text-red-400' 
                          : 'text-white/60'
                      }`}>
                        {getRelativeDateString(folder.nextReviewDue)}
                      </span>
                    </div>
                  </td>
                  {!isBatchMode && (
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredFolders.length === 0 && (
        <div className="p-8 text-center">
          <Folder className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/50">没有找到匹配的文件夹</p>
        </div>
      )}
      
      <BatchAssignModal />
      <BatchRescheduleModal />
    </div>
  );
}
