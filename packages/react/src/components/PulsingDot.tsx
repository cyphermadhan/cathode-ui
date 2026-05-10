/**
 * Small square that pulses in place to signal "something is happening"
 * without a full progress indicator. Animation is pure CSS
 * (@keyframes cathode-pulse) — no framer-motion overhead for this
 * simple a case. Respects `prefers-reduced-motion` automatically.
 *
 * Lifted from Klick's PulsingDot (Sources/UI/PeerListView.swift:128).
 */
export interface PulsingDotProps {
  /** CSS color — defaults to current text color via `currentColor`. */
  color?: string;
  /** Edge size in px. Default 8. */
  size?: number;
  className?: string;
}

export function PulsingDot({ color, size = 8, className }: PulsingDotProps) {
  return (
    <span
      className={['cathode-pulsingdot', className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        color: color,
      }}
      aria-hidden
    />
  );
}
