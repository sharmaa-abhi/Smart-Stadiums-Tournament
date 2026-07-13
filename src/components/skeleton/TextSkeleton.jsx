import React from 'react';
import Skeleton from './Skeleton';

export default function TextSkeleton({ lines = 1, className = '', lineClassName = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const widthClass = lines > 1 && i === lines - 1 ? 'w-2/3' : 'w-full';
        return (
          <Skeleton
            key={i}
            className={`h-3 ${widthClass} ${lineClassName}`}
          />
        );
      })}
    </div>
  );
}
