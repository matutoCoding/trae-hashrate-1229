import type { RemediationStatus } from '@/types';
import { getStatusText } from '@/utils/format';
import { Clock, PlayCircle, CheckCircle2, AlertOctagon, ArrowUpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RemediationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    pending: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      icon: Clock,
    },
    in_progress: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: PlayCircle,
    },
    completed: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
    },
    overdue: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: AlertOctagon,
    },
    escalated: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      icon: ArrowUpCircle,
    },
  };
  
  const cfg = config[status];
  const Icon = cfg.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  
  return (
    <span className={`inline-flex items-center ${sizeClass} rounded-md font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      {getStatusText(status)}
    </span>
  );
}
