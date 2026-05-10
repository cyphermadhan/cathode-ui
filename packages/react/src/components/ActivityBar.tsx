import { useCathode } from '../CathodeProvider';

/**
 * Pseudo-random "activity" meter — same pixel cells as `PixelBar` but
 * each cell flickers based on a deterministic seed rather than a
 * level value. Gives the VU-meter look of a transmitting walkie or
 * a speech-synth talking head without actually analyzing a signal.
 *
 * Pattern intensity (`0…1`) controls the probability of any given
 * cell being lit. `0` = all cells dim; `1` = all cells lit. The
 * sequence is deterministic per-seed so parent components can drive
 * animation by bumping a seed value on a tick.
 *
 * Lifted from Klick's ActivityBar (Sources/UI/TerminalPrimitives.swift:62).
 */
export interface ActivityBarProps {
  /** Probability a given cell is lit. Clamped to [0, 1]. */
  intensity: number;
  /** Deterministic RNG seed. Advance externally to animate. */
  seed?: number;
  cells?: number;
  fill?: string;
  cellSize?: number;
  className?: string;
}

export function ActivityBar({
  intensity,
  seed = 0,
  cells = 24,
  fill,
  cellSize = 6,
  className,
}: ActivityBarProps) {
  useCathode(); // subscribe (currently unused, reserved for motion intensity)
  const clamped = Math.max(0, Math.min(1, intensity));

  return (
    <div
      className={['cathode-pixelbar', className].filter(Boolean).join(' ')}
      role="presentation"
      style={fill ? ({ ['--cathode-pixelbar-fill']: fill } as React.CSSProperties) : undefined}
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className="cathode-pixelbar-cell"
          data-lit={isLit(i, seed, clamped) ? 'true' : 'false'}
          style={{ width: cellSize, height: cellSize }}
        />
      ))}
    </div>
  );
}

/** Deterministic pseudo-random bit for (cell, seed) pair. Same algorithm
 * as the Klick original so visuals match across platforms. */
function isLit(cell: number, seed: number, intensity: number): boolean {
  // Knuth multiplicative hash for cheap, decent scatter.
  const h = (Math.imul(seed, 2654435761) ^ Math.imul(cell, 11)) >>> 0;
  return (h & 0xff) / 255 < intensity;
}
