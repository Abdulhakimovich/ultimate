interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export default function Skeleton({ className = '', width, height, rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      style={{
        width:  width  ?? '100%',
        height: height ?? '100%',
        minHeight: typeof height === 'number' ? height : typeof height === 'string' ? height : '20px',
      }}
      aria-hidden="true"
    />
  );
}
