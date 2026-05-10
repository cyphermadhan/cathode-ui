import type { ReactNode } from 'react';

/**
 * Card — generic bordered container. Same chrome as TerminalFrame but
 * without the inset title, so it composes as a panel for arbitrary
 * content (readouts, forms, info blocks, etc.). Use TerminalFrame when
 * you want a labelled group; use Card when the content is self-
 * explanatory or you want to place your own heading inside.
 *
 * The optional `accent` shifts the border to a semantic color — pass
 * `"danger"` for warning/error zones, `"info"` to draw attention, etc.
 * `elevated` uses the panel background; `flat` keeps the bg transparent
 * so the card sits on the page surface.
 */
export interface CardProps {
  children: ReactNode;
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  /** Fill behavior. `elevated` uses panel bg, `flat` is transparent. Default `flat`. */
  surface?: 'flat' | 'elevated';
  /** Padding preset. Default `md`. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Render as a button — fires `onClick` and picks up focus/hover styling. */
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export function Card({
  children,
  accent = 'neutral',
  surface = 'flat',
  padding = 'md',
  onClick,
  className,
  'aria-label': ariaLabel,
}: CardProps) {
  const classes = [
    'cathode-card',
    onClick ? 'is-clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  const props = {
    className: classes,
    'data-accent': accent,
    'data-surface': surface,
    'data-padding': padding,
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} {...props}>
        {children}
      </button>
    );
  }

  return <div {...props} aria-label={ariaLabel}>{children}</div>;
}
