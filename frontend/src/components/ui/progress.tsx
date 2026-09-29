import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  colorVariant?: 'auto' | 'cyan' | 'danger' | 'warning' | 'emerald';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  colorVariant = 'auto',
  showLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const getBarColor = () => {
    if (colorVariant === 'cyan') return 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]';
    if (colorVariant === 'danger') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    if (colorVariant === 'warning') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    if (colorVariant === 'emerald') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';

    // Auto variant
    if (percentage >= 80) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    if (percentage >= 50) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (percentage >= 25) return 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]';
    return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
  };

  return (
    <div className={cn('w-full space-y-1', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Confidence Score</span>
          <span className="font-semibold text-white">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/50">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ConfidenceGaugeProps {
  confidence: number; // 0.0 to 1.0
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
}

export function ConfidenceGauge({
  confidence,
  size = 110,
  strokeWidth = 9,
  label = 'AI Confidence',
}: ConfidenceGaugeProps) {
  const percentage = Math.round(Math.min(Math.max(confidence, 0), 1) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 85) return '#EF4444'; // Critical red
    if (percentage >= 65) return '#F97316'; // High orange
    if (percentage >= 40) return '#F59E0B'; // Medium amber
    return '#10B981'; // Safe green
  };

  const strokeColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono tracking-tight text-white">{percentage}%</span>
          <span className="text-[10px] uppercase font-mono text-slate-400">Score</span>
        </div>
      </div>
      {label && <span className="mt-1.5 text-xs font-medium text-slate-400 font-mono">{label}</span>}
    </div>
  );
}
