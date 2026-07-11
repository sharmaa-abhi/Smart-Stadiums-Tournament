import React from 'react';
import Skeleton from './Skeleton';

export default function StatCardSkeleton({ className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden animate-pulse flex items-start justify-between ${className}`}>
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24 bg-white/[0.04]" />
        <div className="flex items-baseline gap-1.5 mt-2">
          <Skeleton className="h-7 w-16 bg-white/[0.04]" />
        </div>
        <Skeleton className="h-3 w-20 bg-white/[0.04] mt-2" />
      </div>
      <Skeleton className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
    </div>
  );
}
