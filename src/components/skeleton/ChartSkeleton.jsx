import React from 'react';
import Skeleton from './Skeleton';

export default function ChartSkeleton({ className = '', height = 'h-80' }) {
  return (
    <div className={`glass-card rounded-2xl p-5 animate-pulse flex flex-col justify-between ${height} ${className}`}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40 bg-white/[0.04]" />
        <Skeleton className="h-3 w-60 bg-white/[0.04]" />
      </div>
      <div className="flex-1 flex items-end gap-3 mt-6 mb-2">
        <Skeleton className="h-[20%] flex-1 bg-white/[0.02]" />
        <Skeleton className="h-[50%] flex-1 bg-white/[0.02]" />
        <Skeleton className="h-[35%] flex-1 bg-white/[0.02]" />
        <Skeleton className="h-[75%] flex-1 bg-white/[0.02]" />
        <Skeleton className="h-[60%] flex-1 bg-white/[0.02]" />
        <Skeleton className="h-[90%] flex-1 bg-white/[0.02]" />
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-white/[0.04]">
        <Skeleton className="h-3 w-10 bg-white/[0.04]" />
        <Skeleton className="h-3 w-10 bg-white/[0.04]" />
        <Skeleton className="h-3 w-10 bg-white/[0.04]" />
        <Skeleton className="h-3 w-10 bg-white/[0.04]" />
      </div>
    </div>
  );
}
