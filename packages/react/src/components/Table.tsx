import type { ReactNode } from 'react';

/**
 * Table — terminal-style tabular display. Column headers uppercase,
 * monospace values, subtle row dividers. Controlled sort: the table
 * emits a sort-change event; the consumer passes a sorted `rows`.
 * Keeps the component decoupled from data semantics — sorting a
 * string column vs. a number column vs. a date column is the app's
 * concern, not Cathode's.
 *
 * Row click is optional. When set, rows render as `<tr tabIndex=0>`
 * with a pointer cursor and a hover highlight.
 */
export interface TableColumn<T> {
  /** Key into each row. Also the sort identifier. */
  key: keyof T & string;
  /** Header text, rendered uppercase. */
  header: string;
  align?: 'left' | 'right' | 'center';
  /** Fixed column width (e.g. "120px", "20%"). Otherwise auto. */
  width?: string | number;
  /** Custom cell renderer; defaults to `String(row[key])`. */
  render?: (row: T, rowIndex: number) => ReactNode;
  sortable?: boolean;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: ReadonlyArray<TableColumn<T>>;
  rows: ReadonlyArray<T>;
  sortBy?: keyof T & string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: keyof T & string, dir: 'asc' | 'desc') => void;
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Shown above the table for screen readers; visible if `showCaption`. */
  caption?: string;
  showCaption?: boolean;
  /** Rendered when `rows` is empty. Default "No data." */
  emptyText?: string;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  sortBy,
  sortDir = 'asc',
  onSortChange,
  onRowClick,
  caption,
  showCaption,
  emptyText = 'NO DATA',
  className,
}: TableProps<T>) {
  const handleHeaderClick = (col: TableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    const nextDir: 'asc' | 'desc' =
      sortBy === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(col.key, nextDir);
  };

  return (
    <table className={['cathode-table', className].filter(Boolean).join(' ')}>
      {caption ? (
        <caption
          className="cathode-table-caption"
          data-visible={showCaption ? 'true' : 'false'}
        >
          {caption}
        </caption>
      ) : null}
      <thead>
        <tr>
          {columns.map((col) => {
            const isSorted = sortBy === col.key;
            const thProps: React.ThHTMLAttributes<HTMLTableCellElement> = {
              className: 'cathode-table-th',
              scope: 'col',
              style: {
                textAlign: col.align ?? 'left',
                width: typeof col.width === 'number' ? `${col.width}px` : col.width,
              },
              'aria-sort': isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined,
            };
            return (
              <th key={col.key} {...thProps}>
                {col.sortable ? (
                  <button
                    type="button"
                    className="cathode-table-sort"
                    onClick={() => handleHeaderClick(col)}
                    data-sorted={isSorted ? 'true' : 'false'}
                  >
                    {col.header}
                    {isSorted ? (
                      <span aria-hidden className="cathode-table-sort-arrow">
                        {sortDir === 'asc' ? '▴' : '▾'}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className="cathode-table-empty" colSpan={columns.length}>
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => {
            const clickable = !!onRowClick;
            return (
              <tr
                key={i}
                className="cathode-table-row"
                data-clickable={clickable ? 'true' : 'false'}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onRowClick!(row, i) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick!(row, i);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="cathode-table-td"
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {col.render ? col.render(row, i) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
