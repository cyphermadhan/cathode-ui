/**
 * Pagination — page-jumping control for lists that span multiple pages.
 * Renders prev/next arrows + a windowed set of page buttons around the
 * current page. Controlled: the caller owns `page` and passes an
 * `onChange` handler.
 *
 * Window size is fixed at 5 (2 before + current + 2 after, clipped at
 * the edges). Edge ellipses indicate skipped ranges.
 */
export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. 0 or 1 → component renders nothing. */
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  'aria-label'?: string;
}

export function Pagination({ page, totalPages, onChange, className, 'aria-label': ariaLabel = 'Pagination' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (n: number) => {
    const clamped = Math.max(1, Math.min(totalPages, n));
    if (clamped !== page) onChange(clamped);
  };

  const pages = windowedPages(page, totalPages);

  return (
    <nav className={['cathode-pagination', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <button
        type="button"
        className="cathode-pagination-arrow"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="cathode-pagination-gap" aria-hidden>…</span>
        ) : (
          <button
            key={p}
            type="button"
            className="cathode-pagination-page"
            data-on={p === page ? 'true' : 'false'}
            onClick={() => go(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="cathode-pagination-arrow"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

type Token = number | '…';

function windowedPages(page: number, total: number): Token[] {
  // 5-wide window around the current page, with ellipsis markers
  // showing that the 1/total edges are reachable.
  const result: Token[] = [];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  result.push(1);
  if (start > 2) result.push('…');
  for (let p = start; p <= end; p++) result.push(p);
  if (end < total - 1) result.push('…');
  if (total > 1) result.push(total);
  return result;
}
