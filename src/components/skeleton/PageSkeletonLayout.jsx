import React from 'react';
import TopBarSkeleton from './TopBarSkeleton';

export default function PageSkeletonLayout({ title, subtitle, children, className = '' }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <TopBarSkeleton title={title} subtitle={subtitle} />
      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
