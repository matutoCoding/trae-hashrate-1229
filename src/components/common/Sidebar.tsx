import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, FileBarChart, Settings, Shield } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '总览看板', icon: LayoutDashboard },
  { path: '/risk/dept-001', label: '风险详情', icon: AlertTriangle },
  { path: '/report', label: '月度报告', icon: FileBarChart },
];

export function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-white/5 border-r border-white/10 flex flex-col fixed left-0 top-0">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-glow-blue">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-base">权限审计</h1>
            <p className="text-xs text-white/50">Permission Audit</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-blue-600/20 text-blue-400 shadow-inner' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'}
            `}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all duration-200">
          <Settings className="w-4 h-4" />
          系统设置
        </button>
      </div>
    </aside>
  );
}
