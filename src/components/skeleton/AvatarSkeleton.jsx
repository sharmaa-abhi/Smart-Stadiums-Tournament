import Skeleton from './Skeleton';

export default function AvatarSkeleton({ className = '', size = 'w-10 h-10', rounded = 'rounded-full' }) {
  return (
    <Skeleton className={`flex-shrink-0 ${size} ${className}`} rounded={rounded} />
  );
}
