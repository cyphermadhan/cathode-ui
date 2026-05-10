/**
 * ProgressBar — continuous horizontal bar. Use for determinate
 * progress (downloads, uploads, task percentages). Distinct from
 * PixelBar, which is a discrete-cell VU meter; use PixelBar for
 * real-time level indication, ProgressBar for completion.
 *
 * Pass `value={undefined}` (or omit) to render an indeterminate
 * shimmer — good for "working, don't know how long".
 */
export interface ProgressBarProps {
  /** 0-1. Omit for indeterminate mode. */
  value?: number;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  /** Visual height in px. Default 6. */
  height?: number;
  /** Show a percentage readout beside the bar. */
  showValue?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function ProgressBar({
  value,
  accent = 'success',
  height = 6,
  showValue,
  className,
  'aria-label': ariaLabel = 'Progress',
}: ProgressBarProps) {
  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(1, value!));
  const pct = Math.round(clamped * 100);

  return (
    <div
      className={['cathode-progress', className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : pct}
      aria-label={ariaLabel}
      data-indeterminate={indeterminate ? 'true' : 'false'}
      data-accent={accent}
    >
      <div className="cathode-progress-track" style={{ height }}>
        <div
          className="cathode-progress-fill"
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {showValue && !indeterminate ? (
        <span className="cathode-progress-value">{pct}%</span>
      ) : null}
    </div>
  );
}
