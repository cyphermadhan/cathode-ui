/**
 * Kbd — keyboard shortcut indicator. Each key renders in its own
 * bordered box; keys are joined by a separator (default "+"). Use
 * inline in menu items, hint rows, or anywhere you want to surface a
 * shortcut the user can actually press.
 *
 * Accepts either a string (which is split on "+" or "-") or an array
 * of key names. Arrays are preferred when any key literally contains
 * a "+" (e.g. `['Shift', '+']`).
 */
export interface KbdProps {
  keys: string | ReadonlyArray<string>;
  /** Separator glyph shown between keys. Default "+". */
  separator?: string;
  /** Compact variant — smaller font, tighter padding. */
  size?: 'sm' | 'md';
  className?: string;
}

export function Kbd({
  keys,
  separator = '+',
  size = 'md',
  className,
}: KbdProps) {
  const parts: ReadonlyArray<string> = Array.isArray(keys)
    ? keys
    : (keys as string).split(/\s*[+\-]\s*/).filter(Boolean);

  return (
    <span
      className={['cathode-kbd', className].filter(Boolean).join(' ')}
      data-size={size}
      role="group"
    >
      {parts.map((k: string, i: number) => (
        <span key={i} className="cathode-kbd-group">
          <kbd className="cathode-kbd-key">{k}</kbd>
          {i < parts.length - 1 ? (
            <span className="cathode-kbd-sep" aria-hidden>{separator}</span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
