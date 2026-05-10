import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Menu — click-triggered dropdown containing a list of actions. Each
 * item is a button with an optional kbd shortcut hint. Keyboard:
 * ArrowDown/ArrowUp navigate, Enter activates, Escape closes.
 *
 * For context menus (right-click), pass the same items and drive
 * `open` + `anchor` imperatively from the parent.
 */
export interface MenuItem {
  /** Display label. */
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Optional keyboard shortcut hint (display only). */
  shortcut?: string;
  /** Danger variant — used for destructive actions like "Delete". */
  kind?: 'default' | 'danger';
  /** Visual divider BEFORE this item. */
  divider?: boolean;
}

export interface MenuProps {
  /** Element (usually a button) that opens the menu. Receives click + aria bindings. */
  trigger: ReactNode;
  items: ReadonlyArray<MenuItem>;
  align?: 'start' | 'end';
  className?: string;
  'aria-label'?: string;
}

export function Menu({ trigger, items, align = 'start', className, 'aria-label': ariaLabel }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape. Mount-time listeners; cheap.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocus((f) => nextEnabled(items, f, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocus((f) => nextEnabled(items, f, -1));
      } else if (e.key === 'Enter' && focus >= 0) {
        e.preventDefault();
        const item = items[focus];
        if (item && !item.disabled) { item.onSelect(); setOpen(false); }
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, focus, items]);

  const toggle = () => {
    setOpen((v) => !v);
    setFocus(-1);
  };

  // ARIA attrs belong on the actual interactive trigger element, not
  // on a wrapper div (axe: aria-allowed-attr). If `trigger` is a valid
  // React element (Button, etc.), we clone it to inject the props.
  const triggerEl: ReactNode = isValidElement(trigger)
    ? cloneElement(Children.only(trigger) as ReactElement<any>, {
        onClick: (...args: unknown[]) => {
          (trigger as ReactElement<any>).props.onClick?.(...args);
          toggle();
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-label': ariaLabel ?? (trigger as ReactElement<any>).props['aria-label'],
      })
    : trigger;

  return (
    <div ref={rootRef} className={['cathode-menu', className].filter(Boolean).join(' ')}>
      {triggerEl}
      {open ? (
        <ul className="cathode-menu-list" role="menu" data-align={align}>
          {items.map((it, i) => (
            <li key={i} role="none">
              {it.divider && i > 0 ? <div className="cathode-menu-divider" role="separator" /> : null}
              <button
                type="button"
                role="menuitem"
                className="cathode-menu-item"
                data-focus={i === focus ? 'true' : 'false'}
                data-kind={it.kind ?? 'default'}
                disabled={it.disabled}
                onMouseEnter={() => setFocus(i)}
                onClick={() => { it.onSelect(); setOpen(false); }}
              >
                <span className="cathode-menu-label">{it.label}</span>
                {it.shortcut ? <span className="cathode-menu-shortcut">{it.shortcut}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function nextEnabled(items: ReadonlyArray<MenuItem>, from: number, dir: 1 | -1): number {
  const n = items.length;
  if (n === 0) return -1;
  let idx = from;
  for (let i = 0; i < n; i++) {
    idx = (idx + dir + n) % n;
    if (!items[idx]?.disabled) return idx;
  }
  return -1;
}
