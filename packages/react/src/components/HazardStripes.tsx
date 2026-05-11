import type { ReactNode } from 'react';

/**
 * Decorative diagonal-stripe overlay — the "armed" / "caution" look.
 *
 * Wraps children and paints the stripes over the top edge as a
 * non-interactive overlay. Pairs well with a solid accent background
 * (e.g. `danger` buttons or "arming" states where a user is holding
 * a control in an active, potentially destructive mode).
 *
 * CSS-only — a `repeating-linear-gradient` with configurable
 * opacity + angle. No canvas, no images, scales forever.
 */
export interface HazardStripesProps {
  children?: ReactNode;
  /** Stripe opacity (0-1). Default 0.12 for a subtle texture. */
  intensity?: number;
  /** Stripe angle in degrees. Default 135° (top-right to bottom-left). */
  angle?: number;
  /** Stripe width in px. Default 8. */
  width?: number;
  /** Stripe color. Default white — the typical hazard-stripe look against a saturated fill. */
  color?: string;
  className?: string;
}

export function HazardStripes({
  children,
  intensity = 0.12,
  angle = 135,
  width = 8,
  color = 'white',
  className,
}: HazardStripesProps) {
  const overlay: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    // Stripes alternate color / transparent so the underlying fill
    // shows through. A bigger `width` + lower `intensity` reads as
    // subtle texture; smaller + higher reads as caution tape.
    backgroundImage: `repeating-linear-gradient(${angle}deg, ${withAlpha(color, intensity)} 0 ${width}px, transparent ${width}px ${width * 2}px)`,
  };
  return (
    <div
      className={['cathode-hazard-wrap', className].filter(Boolean).join(' ')}
      style={{ position: 'relative' }}
    >
      {children}
      <span style={overlay} aria-hidden />
    </div>
  );
}

/** Tack an alpha value onto a color. Tries the obvious formats; falls
 * back to the raw color + `color-mix()` so CSS vars work too. */
function withAlpha(color: string, a: number): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
  }
  // Otherwise lean on color-mix (modern browsers). Fine for `white`,
  // `var(--cathode-*)`, `rgb(...)`, `hsl(...)`.
  return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
}
