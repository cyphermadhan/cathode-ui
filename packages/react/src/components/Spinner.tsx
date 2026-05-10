/**
 * Spinner — indeterminate loading indicator. Pixel-square segments
 * that cycle via CSS animation, in keeping with the Cathode
 * aesthetic (no rounded spinning arcs). Use when duration is
 * unknown. For determinate progress use ProgressBar.
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
  /** Accessible label read by screen readers. Default "Loading". */
  'aria-label'?: string;
}

export function Spinner({
  size = 'md',
  accent = 'info',
  className,
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  return (
    <span
      className={['cathode-spinner', className].filter(Boolean).join(' ')}
      data-size={size}
      data-accent={accent}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="cathode-spinner-cell" />
      <span className="cathode-spinner-cell" />
      <span className="cathode-spinner-cell" />
      <span className="cathode-spinner-cell" />
    </span>
  );
}
