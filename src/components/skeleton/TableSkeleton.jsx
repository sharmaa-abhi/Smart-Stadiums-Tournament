import React from 'react';
import Skeleton from './Skeleton';

export default function TableSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-32 bg-white/[0.04]" />
            <Skeleton className="h-3 w-48 bg-white/[0.04]" />
          </div>
          <Skeleton className="w-20 h-6 bg-white/[0.04] flex-shrink-0" />
          <Skeleton className="w-8 h-8 bg-white/[0.04] flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
