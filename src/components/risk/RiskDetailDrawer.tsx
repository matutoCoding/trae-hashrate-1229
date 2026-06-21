import { useState } from 'react';
import { useAuditStore } from '@/store/useAuditStore';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { X, Folder, User, Calendar, Clock, Users, Edit3, History, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils/date';
import { getRiskReasonTypeText } from '@/utils/format';

export function RiskDetailDrawer() {
  const { selectedFolder, isDetailDrawerOpen, setDetailDrawerOpen, completeTask, assignTask } = useAuditStore();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remark, setRemark] = useState('');
  
  if (!selectedFolder) return null;
  
  const handleClose = () => {
    setDetailDrawerOpen(false);
    setShowAssignForm(false);
  };
  
  const handleAssign = () => {
    if (selectedFolder && assignee && dueDate) {
      assignTask(selectedFolder.id, assignee, dueDate, remark);
      setShowAssignForm(false);
      setAssignee('');
      setDueDate('');
      setRemark('');
    }
  };
  
  const handleComplete = () => {
    if (selectedFolder) {
      completeTask(selectedFolder.id);
    }
  };
  
  const isOverdue = selectedFolder.nextReviewDue && new Date(selectedFolder.nextReviewDue) < new Date();
  
  return (
    <>
      {isDetailDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={handleClose}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-navy-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-white/10 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedFolder.name}</h3>
                <p className="text-xs text-white/50 mt-0.5 font-mono">{selectedFolder.path}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <RiskBadge level={selectedFolder.riskLevel} />
                {selectedFolder.currentTask && (
                  <StatusBadge status={selectedFolder.currentTask.status} />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    所属部门
                  </div>
                  <p className="text-sm text-white font-medium">{selectedFolder.departmentName}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Folder className="w-3.5 h-3.5" />
                    所属项目
                  </div>
                  <p className="text-sm text-white font-medium">{selectedFolder.projectName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <User className="w-3.5 h-3.5" />
                    负责人
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white">
                      {selectedFolder.owner[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{selectedFolder.owner}</p>
                      <p className="text-xs text-white/40">{selectedFolder.ownerEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    首次发现
                  </div>
                  <p className="text-sm text-white font-medium">
                    {formatDate(selectedFolder.firstDiscoveredAt)}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {selectedFolder.lastReviewedAt 
                      ? '上次复核: ' + formatDate(selectedFolder.lastReviewedAt)
                      : '尚未复核'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-xl font-bold text-blue-400 font-mono">{selectedFolder.externalLinks}</p>
                  <p className="text-xs text-white/50 mt-1">外链数量</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-xl font-bold text-amber-400 font-mono">{selectedFolder.externalAccounts}</p>
                  <p className="text-xs text-white/50 mt-1">外部账号</p>
                </div>
                <div className={`p-3 rounded-lg border text-center ${
                  selectedFolder.isPublicEditable 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <p className={`text-xl font-bold font-mono ${
                    selectedFolder.isPublicEditable ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {selectedFolder.isPublicEditable ? '是' : '否'}
                  </p>
                  <p className="text-xs text-white/50 mt-1">公开编辑</p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-400' : 'text-white/50'}`} />
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>复核截止日期</span>
                  </div>
                  <span className={`text-sm font-medium font-mono ${isOverdue ? 'text-red-400' : 'text-white/70'}`}>
                    {formatDate(selectedFolder.nextReviewDue)}
                  </span>
                </div>
                {isOverdue && (
                  <p className="text-xs text-red-400/70 mt-2">
                    该文件夹已超过复核周期，请及时安排权限复核
                  </p>
                )}
              </div>
            </div>
            
            <div className="px-5 pb-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                风险原因
              </h4>
              <div className="space-y-2">
                {selectedFolder.riskReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`p-3 rounded-lg border ${
                      reason.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                      reason.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {getRiskReasonTypeText(reason.type)}
                      </span>
                      <RiskBadge level={reason.severity} size="sm" />
                    </div>
                    <p className="text-xs text-white/60">{reason.description}</p>
                    <p className="text-xs text-white/40 mt-1">
                      发现时间: {formatDate(reason.discoveredAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-5 pb-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                历史整改记录
              </h4>
              <div className="relative">
                {selectedFolder.remediationHistory.map((record, index) => (
                  <div key={record.id} className="relative pl-6 pb-4 last:pb-0">
                    {index < selectedFolder.remediationHistory.length - 1 && (
                      <div className="absolute left-2 top-5 bottom-0 w-px bg-white/10"></div>
                    )}
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{record.action}</span>
                        <span className="text-xs text-white/40">{formatDateTime(record.operatedAt)}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">{record.operator}</p>
                      {record.remark && (
                        <p className="text-xs text-white/40 mt-1">{record.remark}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-white/10">
            {!showAssignForm ? (
              <div className="flex gap-3">
                {selectedFolder.currentTask && selectedFolder.currentTask.status !== 'completed' ? (
                  <>
                    <button
                      onClick={handleComplete}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      标记完成
                    </button>
                    <button
                      onClick={() => setShowAssignForm(true)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      重新分配
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAssignForm(true)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    分配整改任务
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">负责人</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="输入负责人姓名"
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">截止日期</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    备注说明
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="添加整改要求或备注..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAssignForm(false)}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAssign}
                    className="flex-1 btn-primary"
                  >
                    确认分配
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
