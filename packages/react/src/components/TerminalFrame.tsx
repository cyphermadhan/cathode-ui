import type { ReactNode } from 'react';

/**
 * Bordered box with a tiny all-caps title clipped into the top edge.
 * The "┌─ PEERS ─" look of old terminal UIs. Implemented with a single
 * absolutely-positioned title element that sits astride the top border
 * — no ::before gymnastics, no z-index juggling.
 */
export interface TerminalFrameProps {
  /** Uppercased and rendered as the inset title. Omit for an untitled box. */
  title?: string;
  /** Semantic border accent. Defaults to neutral. */
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  className?: string;
}

export function TerminalFrame({
  title,
  accent = 'neutral',
  children,
  className,
}: TerminalFrameProps) {
  return (
    <div
      className={['cathode-frame', className].filter(Boolean).join(' ')}
      data-accent={accent === 'neutral' ? undefined : accent}
    >
      {title ? <div className="cathode-frame-title">{title}</div> : null}
      {children}
    </div>
  );
}
