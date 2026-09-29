import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse cyber-chamfer-sm bg-[#1c1c2e] border border-[#2a2a3a]/80', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 w-full font-mono">
      <div className="cyber-chamfer flex items-center gap-4 p-4 bg-[#12121a] border border-[#2a2a3a]">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-20 ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="cyber-chamfer-sm flex items-center gap-4 p-3.5 bg-[#12121a]/60 border border-[#2a2a3a]/60"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="cyber-chamfer bg-[#12121a] border border-[#2a2a3a] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

