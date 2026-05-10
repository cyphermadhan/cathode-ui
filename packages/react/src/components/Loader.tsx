/**
 * Loader — indeterminate "something is working" indicator. Four
 * pixel-square cells that rise + brighten on a staggered 1s cycle.
 * Use when duration is unknown. For determinate progress use
 * ProgressBar.
 *
 * Previously named Spinner — renamed because Cathode loaders don't
 * literally spin (they cycle in place).
 */
export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
  /** Accessible label read by screen readers. Default "Loading". */
  'aria-label'?: string;
}

export function Loader({
  size = 'md',
  accent = 'info',
  className,
  'aria-label': ariaLabel = 'Loading',
}: LoaderProps) {
  return (
    <span
      className={['cathode-loader', className].filter(Boolean).join(' ')}
      data-size={size}
      data-accent={accent}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="cathode-loader-cell" />
      <span className="cathode-loader-cell" />
      <span className="cathode-loader-cell" />
      <span className="cathode-loader-cell" />
    </span>
  );
}
