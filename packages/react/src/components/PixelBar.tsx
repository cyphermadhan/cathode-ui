import { useCathode } from '../CathodeProvider';

/**
 * Discrete-cell level meter — a horizontal row of small squares that
 * fill left-to-right proportional to `level` in [0, 1].
 *
 * The motion profile runs a light cascade fill when `level` changes
 * meaningfully (≥ one cell). Disabled under `motion="none"` or
 * `prefers-reduced-motion: reduce`.
 *
 * Styled by base.css; the active fill color comes from the
 * `--cathode-pixelbar-fill` CSS custom property so apps can theme
 * individual bars without a prop cascade. Default falls back to
 * `--cathode-color-tx`.
 */
export interface PixelBarProps {
  /** 0…1 — clamped inside. */
  level: number;
  /** Number of discrete cells. Default 24. */
  cells?: number;
  /** Explicit fill color override; otherwise the CSS var wins. */
  fill?: string;
  /** Bar height in px — each cell is square. Default 6. */
  cellSize?: number;
  className?: string;
}

export function PixelBar({
  level,
  cells = 24,
  fill,
  cellSize = 6,
  className,
}: PixelBarProps) {
  useCathode(); // subscribe so motion intensity changes trigger re-render
  const clamped = Math.max(0, Math.min(1, level));
  const active = Math.round(clamped * cells);

  return (
    <div
      className={['cathode-pixelbar', className].filter(Boolean).join(' ')}
      style={{
        // Override the CSS var locally when an explicit `fill` was passed.
        ...(fill ? ({ ['--cathode-pixelbar-fill']: fill } as React.CSSProperties) : {}),
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={clamped}
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className="cathode-pixelbar-cell"
          data-lit={i < active ? 'true' : 'false'}
          style={{ width: cellSize, height: cellSize }}
        />
      ))}
    </div>
  );
}
