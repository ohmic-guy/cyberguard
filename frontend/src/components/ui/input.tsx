import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-semibold text-[#8b949e]">{label}</label>}
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-md bg-[#161b22] border border-[#30363d] px-3 py-1 text-sm text-[#c9d1d9] placeholder:text-[#6e7681] transition-colors duration-150 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-9',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-semibold text-[#8b949e]">{label}</label>}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md bg-[#161b22] border border-[#30363d] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#6e7681] transition-colors duration-150 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
