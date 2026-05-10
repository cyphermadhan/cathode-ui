import { useEffect, useState } from 'react';

/**
 * Countdown — terminal-style T-minus display. Pass a target Date
 * and Countdown renders `HH:MM:SS` (or `DD:HH:MM:SS` when > 24h)
 * that ticks down in real time. Optional prefix (default "T-") and
 * accent color that flips to `danger` inside the last minute.
 *
 * When the target is reached, an `onComplete` callback fires and
 * the display holds at `00:00:00`.
 */
export interface CountdownProps {
  target: Date | number;
  /** Text prefix before the digits. Default "T-". */
  prefix?: string;
  /** Accent color for the digits. Default `info`. Auto-flipped to danger in last minute. */
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  /** Fired once, when the timer reaches zero. */
  onComplete?: () => void;
  className?: string;
}

export function Countdown({ target, prefix = 'T-', accent = 'info', onComplete, className }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetMs = typeof target === 'number' ? target : target.getTime();
  const remainingMs = Math.max(0, targetMs - now);
  const done = remainingMs === 0;

  // Fire onComplete exactly once when we cross zero.
  useEffect(() => {
    if (done) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const secs = Math.floor(remainingMs / 1000);
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const display = d > 0
    ? `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(h)}:${pad(m)}:${pad(s)}`;

  const effectiveAccent = remainingMs > 0 && remainingMs < 60_000 ? 'danger' : accent;

  return (
    <span
      className={['cathode-countdown', className].filter(Boolean).join(' ')}
      data-accent={effectiveAccent}
      data-done={done ? 'true' : 'false'}
      role="timer"
      aria-live="off"
    >
      <span className="cathode-countdown-prefix">{prefix}</span>
      <span className="cathode-countdown-value">{display}</span>
    </span>
  );
}
