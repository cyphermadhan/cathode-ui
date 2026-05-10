/**
 * Breadcrumbs — path-style navigation row. The last item is treated
 * as the current location (rendered as static text, not a link) and
 * marked with `aria-current="page"`.
 *
 * Separator defaults to "›" which matches the terminal aesthetic
 * and avoids the cramped "/" slash.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: ReadonlyArray<BreadcrumbItem>;
  separator?: string;
  className?: string;
  'aria-label'?: string;
}

export function Breadcrumbs({
  items,
  separator = '›',
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps) {
  return (
    <nav className={['cathode-breadcrumbs', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ol className="cathode-breadcrumbs-list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="cathode-breadcrumbs-item">
              {item.href && !isLast ? (
                <a className="cathode-breadcrumbs-link" href={item.href}>{item.label}</a>
              ) : (
                <span
                  className="cathode-breadcrumbs-current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="cathode-breadcrumbs-sep" aria-hidden>{separator}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
