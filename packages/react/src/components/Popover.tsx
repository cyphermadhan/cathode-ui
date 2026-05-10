import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Popover — anchored floating panel, shown on click of the trigger.
 * Closes on outside click or Escape. Use for richer content than
 * Tooltip (which is hover-triggered, text-only) and lighter than
 * Dialog (which is modal and portaled).
 *
 * Positioning is simple: the panel sits directly below the trigger
 * in document flow. If you need viewport-aware flip/shift behavior,
 * wrap a dedicated positioning lib (floating-ui, popperjs).
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

  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternal(v);
    onOpenChange?.(v);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={rootRef} className={['cathode-popover', className].filter(Boolean).join(' ')}>
      {triggerEl}
      {open ? (
        <div className="cathode-popover-panel" role="dialog" data-align={align}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
