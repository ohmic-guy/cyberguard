import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  showTerminalPrefix?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, showTerminalPrefix = true, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 font-mono">
        {label && (
          <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-normal">[INPUT_FIELD]</span>
          </label>
        )}
        <div className="relative flex items-center">
          {showTerminalPrefix && (
            <span className="pointer-events-none absolute left-3 select-none font-mono text-sm font-bold text-[#00ff88]">
              &gt;
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'cyber-chamfer-sm flex h-10 w-full bg-[#12121a] border border-[#2a2a3a] py-2 text-sm text-[#e0e0e0] placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_12px_rgba(0,255,136,0.35)] disabled:cursor-not-allowed disabled:opacity-40 font-mono',
              showTerminalPrefix ? 'pl-8 pr-3.5' : 'px-3.5',
              error && 'border-[#ff3366] focus:border-[#ff3366] focus:shadow-[0_0_12px_rgba(255,51,102,0.4)]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-[#ff3366] font-mono tracking-wide">⚠ {error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 font-mono">
        {label && (
          <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-normal">[BUFFER_STREAM]</span>
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'cyber-chamfer-sm flex w-full bg-[#12121a] border border-[#2a2a3a] px-3.5 py-2.5 text-sm text-[#e0e0e0] placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_12px_rgba(0,255,136,0.35)] disabled:cursor-not-allowed disabled:opacity-40 font-mono leading-relaxed',
            error && 'border-[#ff3366] focus:border-[#ff3366] focus:shadow-[0_0_12px_rgba(255,51,102,0.4)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-[#ff3366] font-mono tracking-wide">⚠ {error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 font-mono">
        {label && (
          <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-normal">[PARAM_SELECT]</span>
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'cyber-chamfer-sm flex h-10 w-full bg-[#12121a] border border-[#2a2a3a] px-3 py-2 text-sm text-[#e0e0e0] transition-all duration-200 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_12px_rgba(0,255,136,0.35)] disabled:cursor-not-allowed disabled:opacity-40 font-mono cursor-pointer',
            error && 'border-[#ff3366] focus:border-[#ff3366]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#12121a] text-[#e0e0e0] py-1">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-[#ff3366] font-mono tracking-wide">⚠ {error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

