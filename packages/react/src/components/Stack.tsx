import type { CSSProperties, ReactNode } from 'react';

/**
 * Stack — utility flex wrapper for quick composition. No visual
 * chrome; just a container with direction + gap + alignment.
 *
 * Prefer this over inline `style={{ display: 'flex', gap: … }}`
 * littering the codebase. For multi-column layouts where children
 * are independent units, keep using CSS Grid directly.
 */
export interface StackProps {
  children: ReactNode;
  /** Main-axis direction. Default "column". */
  direction?: 'row' | 'column';
  /** Gap between children — number (px) or CSS length ("8px", "1rem"). */
  gap?: number | string;
  /** `align-items`. */
  align?: CSSProperties['alignItems'];
  /** `justify-content`. */
  justify?: CSSProperties['justifyContent'];
  /** Wrap onto multiple lines when flex direction is row. */
  wrap?: boolean;
  /** Render as `inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Fill the parent's cross-axis (useful in grid cells). */
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Apply `aria-label` if this Stack acts as a semantic group. */
  'aria-label'?: string;
  /** HTML tag to render. Default `div`. */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav' | 'aside';
}

export function Stack({
  children,
  direction = 'column',
  gap,
  align,
  justify,
  wrap,
  inline,
  fullWidth,
  className,
  style,
  'aria-label': ariaLabel,
  as = 'div',
}: StackProps) {
  const Tag = as as any;
  const composedStyle: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : undefined,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };
  return (
    <Tag
      className={['cathode-stack', className].filter(Boolean).join(' ')}
      style={composedStyle}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
