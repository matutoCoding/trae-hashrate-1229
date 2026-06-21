import { useAuditStore } from '@/store/useAuditStore';
import { RiskBadge } from '@/components/common/RiskBadge';
import { CalendarClock, AlertTriangle, CheckSquare } from 'lucide-react';
import { getRelativeDateString } from '@/utils/date';
import { isOverdue } from '@/utils/date';

const typeConfig = {
  task: { icon: CheckSquare, label: '待处理' },
  risk: { icon: AlertTriangle, label: '新发现' },
  overdue: { icon: CalendarClock, label: '已超期' },
};

export function TodoList() {
  const { todos, setSelectedFolder, setDetailDrawerOpen, folders } = useAuditStore();
  
  const handleItemClick = (todo: typeof todos[0]) => {
    const folder = folders.find(f => f.name === todo.folderName);
    if (folder) {
      setSelectedFolder(folder);
      setDetailDrawerOpen(true);
    }
  };
  
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">待办事项</h3>
          <p className="text-xs text-white/50 mt-0.5">需要关注和处理的风险</p>
        </div>
        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-md">
          {todos.length} 项
        </span>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {todos.map((todo, index) => {
          const TypeIcon = typeConfig[todo.type].icon;
          const isOverdueItem = todo.dueDate && isOverdue(todo.dueDate);
          
          return (
            <div
              key={todo.id}
              onClick={() => handleItemClick(todo)}
              className="group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  todo.type === 'overdue' ? 'bg-red-500/20 text-red-400' :
                  todo.type === 'risk' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {todo.title}
                    </p>
                    {todo.riskLevel && <RiskBadge level={todo.riskLevel} size="sm" />}
                  </div>
                  <p className="text-xs text-white/40 mt-1 truncate">{todo.folderName}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {todo.assignee && (
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                          {todo.assignee[0]}
                        </span>
                        {todo.assignee}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isOverdueItem ? 'text-red-400' : 'text-white/50'
                      }`}>
                        <CalendarClock className="w-3 h-3" />
                        {getRelativeDateString(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
