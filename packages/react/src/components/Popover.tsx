import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement, ReactNode } from 'react';

/**
 * Popover — anchored floating panel, shown on click of the trigger.
 * Closes on outside click or Escape. Use for richer content than
 * Tooltip (which is hover-triggered, text-only) and lighter than
 * Dialog (which is modal and portaled).
 *
 * The panel is rendered via `createPortal(document.body)` and
 * positioned with `position: fixed` using the trigger's viewport
 * rect, so ancestor `overflow: hidden` / `transform` can't clip it.
 * Recomputes position on window resize + scroll.
 */
export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  /** Start open. Uncontrolled fallback; controlled consumers use `open` + `onOpenChange`. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'end';
  className?: string;
}

export function Popover({
  trigger,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  align = 'start',
  className,
}: PopoverProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlledOpen ?? internal;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternal(v);
    onOpenChange?.(v);
  };

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const place = () => {
      const r = rootRef.current!.getBoundingClientRect();
      const panelW = panelRef.current?.offsetWidth ?? 200;
      setPos({
        top: r.bottom + 6,
        left: align === 'end' ? r.right - panelW : r.left,
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

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ARIA belongs on the actual interactive trigger element — clone
  // the child to inject onClick + aria-haspopup + aria-expanded.
  const triggerEl: ReactNode = isValidElement(trigger)
    ? cloneElement(Children.only(trigger) as ReactElement<any>, {
        onClick: (...args: unknown[]) => {
          (trigger as ReactElement<any>).props.onClick?.(...args);
          setOpen(!open);
        },
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
      })
    : trigger;

  const panel = open && pos ? (
    <div
      ref={panelRef}
      className="cathode-popover-panel"
      role="dialog"
      data-align={align}
      style={{ position: 'fixed', top: pos.top, left: pos.left }}
    >
      {children}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={['cathode-popover', className].filter(Boolean).join(' ')}>
      {triggerEl}
      {typeof document !== 'undefined' && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
