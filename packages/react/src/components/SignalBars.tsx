/**
 * SignalBars — cellular/wifi-style ascending bars. Five bars (or
 * configurable), filled progressively from left. Use for signal
 * strength, battery, reception, or any "strength of N" indicator.
 *
 * Distinct from PixelBar (single-row level meter) — SignalBars
 * is vertical-ascending for a specific "signal strength" semantic.
 */
export interface SignalBarsProps {
  /** 0..bars. Fractional values round to the nearest bar. */
  level: number;
  bars?: number;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  /** Overall width in px. Default 24. */
  width?: number;
  /** Overall height in px. Default 16. */
  height?: number;
  className?: string;
  'aria-label'?: string;
}

export function SignalBars({
  level,
  bars = 5,
  accent = 'info',
  width = 24,
  height = 16,
  className,
  'aria-label': ariaLabel,
}: SignalBarsProps) {
  const filled = Math.max(0, Math.min(bars, Math.round(level)));

  return (
    <span
      className={['cathode-signalbars', className].filter(Boolean).join(' ')}
      style={{ width, height }}
      data-accent={accent}
      role="img"
      aria-label={ariaLabel ?? `Signal: ${filled} of ${bars}`}
    >
      {Array.from({ length: bars }, (_, i) => {
        const h = Math.round(((i + 1) / bars) * 100);
        return (
          <span
            key={i}
            className="cathode-signalbars-bar"
            data-lit={i < filled ? 'true' : 'false'}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </span>
  );
}
