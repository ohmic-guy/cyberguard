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
    if (colorVariant === 'cyan') return 'bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.7)]';
    if (colorVariant === 'danger') return 'bg-[#ff3366] shadow-[0_0_10px_rgba(255,51,102,0.7)]';
    if (colorVariant === 'warning') return 'bg-[#ffb800] shadow-[0_0_10px_rgba(255,184,0,0.7)]';
    if (colorVariant === 'emerald') return 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.7)]';

    // Auto variant
    if (percentage >= 80) return 'bg-[#ff3366] shadow-[0_0_12px_rgba(255,51,102,0.8)]';
    if (percentage >= 50) return 'bg-[#ffb800] shadow-[0_0_10px_rgba(255,184,0,0.7)]';
    if (percentage >= 25) return 'bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.7)]';
    return 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.7)]';
  };

  return (
    <div className={cn('w-full space-y-1.5 font-mono', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs tracking-wider uppercase text-slate-400">
          <span>Confidence Score</span>
          <span className="font-bold text-[#00ff88]">{percentage}%</span>
        </div>
      )}
      <div className="cyber-chamfer-sm h-2.5 w-full overflow-hidden bg-[#12121a] border border-[#2a2a3a]">
        <div
          className={cn('h-full transition-all duration-500', getBarColor())}
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
    if (percentage >= 85) return '#ff3366'; // Critical red
    if (percentage >= 65) return '#ff8800'; // High orange
    if (percentage >= 40) return '#ffb800'; // Medium amber
    return '#00ff88'; // Safe electric green
  };

  const strokeColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center font-mono">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1c1c2e"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress with neon glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease',
              filter: `drop-shadow(0 0 6px ${strokeColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-orbitron font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {percentage}%
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">SCORE</span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</span>}
    </div>
  );
}

