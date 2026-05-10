import type { ReactNode } from 'react';

/**
 * Tag — outlined accent-colored marker, typically used for keywords,
 * filters, or classifications. Optionally removable via `onRemove`
 * (renders a small "×" button). Distinct from `Badge` (solid status
 * marker, display-only) and `Chips` (a horizontally scrolling row of
 * tappable preset chips).
 */
export type TagAccent =
  | 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  | 'amber' | 'pink' | 'purple' | 'teal' | 'grey';

export interface TagProps {
  children: ReactNode;
  accent?: TagAccent;
  /** Render a trailing remove button. Fires when clicked. */
  onRemove?: () => void;
  /** Custom remove button label for screen readers. Default "Remove". */
  removeLabel?: string;
  className?: string;
}

export function Tag({
  children,
  accent = 'neutral',
  onRemove,
  removeLabel = 'Remove',
  className,
}: TagProps) {
  return (
    <span
      className={['cathode-tag', className].filter(Boolean).join(' ')}
      data-accent={accent}
    >
      <span className="cathode-tag-text">{children}</span>
      {onRemove ? (
        <button
          type="button"
          className="cathode-tag-remove"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
