import type { RiskLevel } from '@/types';
import { getRiskLevelText } from '@/utils/format';
import { AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = {
    high: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]',
    },
    medium: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: AlertCircle,
      glow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    },
    low: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: ShieldCheck,
      glow: '',
    },
  };
  
  const cfg = config[level];
  const Icon = cfg.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  
  return (
    <span className={`inline-flex items-center ${sizeClass} rounded-md font-medium ${cfg.bg} ${cfg.text} border ${cfg.border} ${cfg.glow}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      {getRiskLevelText(level)}
    </span>
  );
}
