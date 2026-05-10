import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const listRef = useRef<HTMLUListElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position the portaled list below the trigger. Recomputes on
  // window resize + scroll so the panel tracks its anchor. Using
  // viewport coordinates (getBoundingClientRect) + position: fixed
  // so ancestor overflow/transform doesn't affect placement.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const place = () => {
      const r = rootRef.current!.getBoundingClientRect();
      const listW = listRef.current?.offsetWidth ?? 180;
      setPos({
        top: r.bottom + 4,
        left: align === 'end' ? r.right - listW : r.left,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align]);

  // Close on outside click + Escape. Because the list is portaled,
  // check against BOTH the trigger root and the list ref — a click
  // inside the portaled list would otherwise close it immediately.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
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

  const listNode = open && pos ? (
    <ul
      ref={listRef}
      className="cathode-menu-list"
      role="menu"
      data-align={align}
      style={{ position: 'fixed', top: pos.top, left: pos.left }}
    >
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
  ) : null;

  return (
    <div ref={rootRef} className={['cathode-menu', className].filter(Boolean).join(' ')}>
      {triggerEl}
      {typeof document !== 'undefined' && listNode ? createPortal(listNode, document.body) : null}
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
