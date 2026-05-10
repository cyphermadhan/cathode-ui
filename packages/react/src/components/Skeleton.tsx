/**
 * Skeleton — placeholder block for content that's still loading. A
 * moving shimmer indicates "something is coming here". Compose
 * multiple Skeletons to mirror the final layout so the page doesn't
 * jump when data arrives.
 *
 * No rounded corners — Cathode prefers pixel squares. Caller sets
 * dimensions via `width`/`height` or CSS.
 */
export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  /** Visual variant — `text` is short + inline-y; `block` fills its container. */
  variant?: 'text' | 'block';
  className?: string;
}

export function Skeleton({ width, height, variant = 'block', className }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  return (
    <span
      className={['cathode-skeleton', className].filter(Boolean).join(' ')}
      data-variant={variant}
      style={style}
      aria-hidden
    />
  );
}
