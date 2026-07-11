import React from 'react';

export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-white/[0.04] rounded-md animate-pulse ${className}`} />
  );
}
