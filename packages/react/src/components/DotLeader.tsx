/**
 * `LABEL …………………… VALUE` row, the classic printer/terminal dot-leader.
 *
 * The dots fill the space between label and value via a stretching
 * middle span with `overflow: hidden` + a long string of periods. No
 * font/letter-spacing math at render time — the browser clips what
 * doesn't fit.
 *
 * Lifted from Klick's DotLeader (Sources/UI/TerminalPrimitives.swift:91).
 */
export interface DotLeaderProps {
  label: string;
  value: string;
  /** Accent for the value half. Useful for state-colored readouts (errors, warnings). */
  valueColor?: string;
  className?: string;
}

export function DotLeader({ label, value, valueColor, className }: DotLeaderProps) {
  return (
    <div className={['cathode-dotleader', className].filter(Boolean).join(' ')}>
      <span className="cathode-dotleader-label">{label}</span>
      <span className="cathode-dotleader-dots" aria-hidden>
        {'.'.repeat(200)}
      </span>
      <span className="cathode-dotleader-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}
