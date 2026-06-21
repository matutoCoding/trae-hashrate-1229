import { useState } from 'react';
import { useAuditStore } from '@/store/useAuditStore';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  X, Folder, User, Calendar, Clock, Users, Edit3, History, AlertTriangle, 
  CheckCircle, MessageSquare, Bell, CalendarClock, UserCircle, ListTodo 
} from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils/date';
import { getRiskReasonTypeText } from '@/utils/format';

export function RiskDetailDrawer() {
  const { selectedFolder, isDetailDrawerOpen, setDetailDrawerOpen, completeTask, assignTask, urgeTask, rescheduleTask } = useAuditStore();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showUrgeForm, setShowUrgeForm] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [remark, setRemark] = useState('');
  const [urgeRemark, setUrgeRemark] = useState('');
  
  if (!selectedFolder) return null;
  
  const handleClose = () => {
    setDetailDrawerOpen(false);
    setShowAssignForm(false);
    setShowRescheduleForm(false);
    setShowUrgeForm(false);
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
  
  const handleUrge = () => {
    if (selectedFolder) {
      urgeTask(selectedFolder.id, urgeRemark || '请尽快完成整改任务');
      setShowUrgeForm(false);
      setUrgeRemark('');
    }
  };
  
  const handleReschedule = () => {
    if (selectedFolder && newDueDate) {
      rescheduleTask(selectedFolder.id, newDueDate, remark);
      setShowRescheduleForm(false);
      setNewDueDate('');
      setRemark('');
    }
  };
  
  const isOverdue = selectedFolder.nextReviewDue && new Date(selectedFolder.nextReviewDue) < new Date();
  const task = selectedFolder.currentTask;
  const taskDueSoon = task?.dueDate && new Date(task.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'completed';
  const taskOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  return (
    <>
      {isDetailDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={handleClose}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-[520px] bg-navy-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
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
              <div className="flex items-center gap-3 flex-wrap">
                <RiskBadge level={selectedFolder.riskLevel} />
                {task && <StatusBadge status={task.status} />}
                {task?.urgeCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                    <Bell className="w-3.5 h-3.5" />
                    已催办 {task.urgeCount} 次
                  </span>
                )}
              </div>
              
              {task && (
                <div className={`p-4 rounded-xl border ${
                  taskOverdue ? 'bg-red-500/10 border-red-500/30' :
                  taskDueSoon ? 'bg-amber-500/10 border-amber-500/30' :
                  task.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListTodo className={`w-4 h-4 ${
                        taskOverdue ? 'text-red-400' :
                        taskDueSoon ? 'text-amber-400' :
                        task.status === 'completed' ? 'text-emerald-400' :
                        'text-blue-400'
                      }`} />
                      <span className="text-sm font-semibold text-white">当前整改任务</span>
                    </div>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <UserCircle className="w-3.5 h-3.5" />
                        整改负责人
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-medium">
                          {task.assignee[0]}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{task.assignee}</p>
                          <p className="text-[11px] text-white/40">{task.assigneeEmail}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        整改截止日
                      </div>
                      <p className={`text-sm font-semibold font-mono ${
                        taskOverdue ? 'text-red-400' :
                        taskDueSoon ? 'text-amber-400' :
                        'text-white'
                      }`}>
                        {formatDate(task.dueDate)}
                      </p>
                      {taskOverdue && (
                        <p className="text-[11px] text-red-400 mt-0.5">
                          已逾期 {Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} 天
                        </p>
                      )}
                      {taskDueSoon && !taskOverdue && (
                        <p className="text-[11px] text-amber-400 mt-0.5">
                          剩余 {Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <User className="w-3.5 h-3.5" />
                        分配人
                      </div>
                      <p className="text-sm text-white">{task.assigner}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {formatDate(task.assignedAt)}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <Bell className="w-3.5 h-3.5" />
                        催办情况
                      </div>
                      <p className="text-sm text-white font-medium">
                        {task.urgeCount > 0 ? `${task.urgeCount} 次催办` : '暂无催办'}
                      </p>
                      {task.lastUrgedAt && (
                        <p className="text-[11px] text-white/40 mt-0.5">
                          最近: {formatDate(task.lastUrgedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {task.remark && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        整改要求
                      </div>
                      <p className="text-sm text-white/80">{task.remark}</p>
                    </div>
                  )}
                  
                  {task.rescheduleRecords && task.rescheduleRecords.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                        <CalendarClock className="w-3.5 h-3.5" />
                        改期记录 ({task.rescheduleRecords.length})
                      </div>
                      <div className="space-y-1.5">
                        {task.rescheduleRecords.slice().reverse().map((r: any) => (
                          <div key={r.id} className="text-[11px] text-white/60 flex items-start gap-1.5">
                            <span className="text-white/40">{formatDate(r.rescheduledAt)}</span>
                            <span>→</span>
                            <span>从 <span className="font-mono text-white/50">{formatDate(r.oldDueDate)}</span> 调整为 <span className="font-mono text-amber-400">{formatDate(r.newDueDate)}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {task.urgeRecords && task.urgeRecords.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                        <Bell className="w-3.5 h-3.5" />
                        催办记录 ({task.urgeRecords.length})
                      </div>
                      <div className="space-y-1.5">
                        {task.urgeRecords.slice().reverse().map((r: any) => (
                          <div key={r.id} className="text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-white/40">{formatDateTime(r.urgedAt)}</span>
                              <span className="text-white/60">{r.urger}</span>
                            </div>
                            {r.remark && <p className="text-white/50 mt-0.5 ml-0">{r.remark}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
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
                    文件夹负责人
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
                {selectedFolder.remediationHistory.slice().reverse().map((record, index, arr) => (
                  <div key={record.id} className="relative pl-6 pb-4 last:pb-0">
                    {index < arr.length - 1 && (
                      <div className="absolute left-2 top-5 bottom-0 w-px bg-white/10"></div>
                    )}
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      record.action.includes('催办') ? 'bg-red-500/20 border-red-500/40' :
                      record.action.includes('完成') ? 'bg-emerald-500/20 border-emerald-500/40' :
                      record.action.includes('改期') || record.action.includes('调整') ? 'bg-amber-500/20 border-amber-500/40' :
                      'bg-blue-500/20 border-blue-500/40'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        record.action.includes('催办') ? 'bg-red-400' :
                        record.action.includes('完成') ? 'bg-emerald-400' :
                        record.action.includes('改期') || record.action.includes('调整') ? 'bg-amber-400' :
                        'bg-blue-400'
                      }`}></div>
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
            {showUrgeForm ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    催办说明
                  </label>
                  <textarea
                    value={urgeRemark}
                    onChange={(e) => setUrgeRemark(e.target.value)}
                    placeholder="添加催办内容，例如：请在本周五前完成..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowUrgeForm(false); setUrgeRemark(''); }}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUrge}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    确认催办
                  </button>
                </div>
              </div>
            ) : showRescheduleForm ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">新的截止日期</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    改期原因
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="说明改期原因..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowRescheduleForm(false); setNewDueDate(''); setRemark(''); }}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={!newDueDate}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CalendarClock className="w-4 h-4" />
                    确认改期
                  </button>
                </div>
              </div>
            ) : showAssignForm ? (
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
            ) : (
              <div className="flex gap-2 flex-wrap">
                {task && task.status !== 'completed' && (
                  <>
                    <button
                      onClick={handleComplete}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 min-w-[120px]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      标记完成
                    </button>
                    <button
                      onClick={() => setShowUrgeForm(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      催办
                    </button>
                    <button
                      onClick={() => setShowRescheduleForm(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <CalendarClock className="w-4 h-4" />
                      改期
                    </button>
                    <button
                      onClick={() => setShowAssignForm(true)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 min-w-[120px]"
                    >
                      <Edit3 className="w-4 h-4" />
                      重新分配
                    </button>
                  </>
                )}
                {!task && (
                  <button
                    onClick={() => setShowAssignForm(true)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    分配整改任务
                  </button>
                )}
                {task?.status === 'completed' && (
                  <button
                    onClick={() => setShowAssignForm(true)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    重新发起整改
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
