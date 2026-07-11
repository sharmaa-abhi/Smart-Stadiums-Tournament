import React from 'react';
import TopBar from '../TopBar';

export default function PageSkeletonLayout({ title, subtitle, children, className = '' }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <TopBar title={title} subtitle={subtitle} />
      <div className="p-6 space-y-6 animate-pulse">
        {children}
      </div>
    </div>
  );
}
