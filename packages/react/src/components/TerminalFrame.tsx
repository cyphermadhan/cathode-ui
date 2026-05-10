import type { ReactNode } from 'react';

/**
 * Bordered box with a tiny all-caps title clipped into the top edge.
 * The "┌─ PEERS ─" look of old terminal UIs.
 *
 * Lifted from Klick's `TerminalFrame` (Sources/UI/TerminalPrimitives.swift:5)
 * but without the SwiftUI ZStack gymnastics — CSS lets us float the title
 * out of the border with a single `::before`-less absolute element.
 */
export interface TerminalFrameProps {
  /** Uppercased and rendered as the inset title. Omit for an untitled box. */
  title?: string;
  /** Semantic border accent. Defaults to neutral. */
  accent?: 'neutral' | 'tx' | 'info' | 'ok' | 'warn';
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
