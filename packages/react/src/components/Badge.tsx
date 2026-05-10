import type { ReactNode } from 'react';

/**
 * Badge — small inline marker for status/state. "NEW", "BETA", "PRO",
 * "v2.1", etc. Distinct from `Pill` (which is a tappable nav button)
 * and `Tag` (which is removable/filterable). A Badge is display-only.
 *
 * Solid: filled bg, inverted text. Outline: transparent bg, color
 * text. Default is solid — more visually anchored for status.
 */
export interface BadgeProps {
  children: ReactNode;
  kind?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  kind = 'neutral',
  variant = 'solid',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={['cathode-badge', className].filter(Boolean).join(' ')}
      data-kind={kind}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </span>
  );
}
