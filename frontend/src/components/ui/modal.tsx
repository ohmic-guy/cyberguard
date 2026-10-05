import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          'cyber-chamfer relative w-full bg-[#12121a] border border-[#2a2a3a] shadow-[0_0_30px_rgba(0,255,136,0.2)] p-6 z-10 max-h-[90vh] overflow-y-auto font-mono',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Terminal Header Decorator */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff3366] shadow-[0_0_4px_#ff3366]" />
            <span className="h-2 w-2 rounded-full bg-[#ffb800] shadow-[0_0_4px_#ffb800]" />
            <span className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_4px_#00ff88]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest pl-2">
              {'MODAL // INTERCEPTOR'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="cyber-chamfer-sm p-1.5 text-slate-400 hover:text-[#ff3366] hover:bg-[#ff3366]/10 border border-transparent hover:border-[#ff3366]/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-orbitron font-bold text-white tracking-wide uppercase">{title}</h2>
          {description && <p className="text-xs text-slate-400 mt-1 font-mono">{description}</p>}
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [mounted, setMounted] = React.useState(isOpen);
  const [visible, setVisible] = React.useState(false);

  // Mount then animate in; animate out then unmount
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 16);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop fades in/out */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        onClick={onClose}
      />
      {/* Panel slides in from right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-xl bg-[#0a0a0f] border-l border-[#2a2a3a] shadow-2xl flex flex-col font-mono"
          style={{
            transform: visible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="p-5 border-b border-[#2a2a3a] flex items-center justify-between bg-[#12121a]">
            <div className="flex items-center gap-2">
              <span className="text-[#00ff88] font-bold">&gt;</span>
              <h3 className="text-base font-orbitron font-bold text-white tracking-wide uppercase">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="cyber-chamfer-sm p-1.5 text-slate-400 hover:text-[#ff3366] hover:bg-[#ff3366]/10 border border-transparent hover:border-[#ff3366]/40 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
