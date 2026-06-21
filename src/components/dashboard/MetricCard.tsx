import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '@/utils/format';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: number;
  color: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'pink';
  delay?: number;
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, color, delay = 0, subtitle }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 800;
    const startTime = performance.now();
    const startValue = 0;
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }, [value, isVisible]);
  
  const colorConfig = {
    blue: {
      bg: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      iconGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    },
    red: {
      bg: 'from-red-500/20 to-red-600/5',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      iconGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      iconGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      iconGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      iconGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    },
    pink: {
      bg: 'from-pink-500/20 to-pink-600/5',
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      iconGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    },
  };
  
  const cfg = colorConfig[color];
  const isTrendPositive = trend < 0;
  
  return (
    <div 
      className={`card card-hover p-5 bg-gradient-to-br ${cfg.bg} border ${cfg.border} relative overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-white/60 font-medium">{title}</p>
            {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center ${cfg.iconGlow}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="font-mono text-3xl font-bold text-white tracking-tight">
            {formatNumber(displayValue)}
          </div>
          
          <div className={`flex items-center gap-1 text-xs font-medium ${isTrendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isTrendPositive ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
            <span className="text-white/40">环比</span>
          </div>
        </div>
      </div>
    </div>
  );
}
