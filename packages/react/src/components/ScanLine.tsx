import type { ReactNode } from 'react';

/**
 * ScanLine — decorative CRT-era overlay. Renders two thin lines and a
 * scanning beam that sweeps top-to-bottom, layered over children.
 * Pairs well with TerminalFrame / Card for that "vintage display"
 * feel without harming legibility.
 *
 * Purely decorative — `aria-hidden` by default. Respects
 * `prefers-reduced-motion` via the base CSS.
 */
export interface ScanLineProps {
  children?: ReactNode;
  /** Sweep duration, seconds. Default 4. */
  speed?: number;
  /** Sweep line color. Defaults to semi-transparent info. */
  color?: string;
  /** Horizontal scanline pattern opacity 0–1. Default 0.06. */
  patternOpacity?: number;
  className?: string;
}

export function ScanLine({
  children,
  speed = 4,
  color,
  patternOpacity = 0.06,
  className,
}: ScanLineProps) {
  const style: React.CSSProperties = {
    ['--cathode-scanline-speed' as string]: `${speed}s`,
    ['--cathode-scanline-color' as string]: color ?? 'color-mix(in srgb, var(--cathode-color-info) 60%, transparent)',
    ['--cathode-scanline-pattern-opacity' as string]: patternOpacity,
  };
  return (
    <span className={['cathode-scanline', className].filter(Boolean).join(' ')} style={style}>
      {children}
      <span className="cathode-scanline-grid" aria-hidden />
      <span className="cathode-scanline-beam" aria-hidden />
    </span>
  );
}
