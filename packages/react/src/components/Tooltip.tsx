import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/**
 * Tooltip — short hover/focus-triggered hint. Text-only; if you need
 * rich content use Popover.
 *
 * Wraps children in a plain <span> that owns the ref + hover/focus
 * events. Trying to forward a ref into the child via cloneElement
 * only works for `forwardRef` components — Button / Pill / etc. are
 * plain functions and silently drop a ref prop, so we anchor to our
 * own wrapping element instead.
 *
 * The body is portaled to `document.body` and positioned with
 * `position: fixed` relative to the trigger's viewport rect, so
 * ancestor `overflow: hidden` / `transform` can't clip it.
 */
export interface TooltipProps {
  children: ReactNode;
  label: string;
  /** Position hint. Default "top". */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing, in milliseconds. Default 200. */
  delay?: number;
  className?: string;
}

export function Tooltip({ children, label, side = 'top', delay = 200, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openAfter = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), delay);
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  useEffect(() => {
    if (!show || !anchorRef.current) return;
    const place = () => {
      const r = anchorRef.current!.getBoundingClientRect();
      const offset = 6;
      // Approximate tooltip dims — real measurement would require a
      // two-pass render; for a small hint bubble that's overkill.
      const est = { w: Math.max(60, label.length * 7 + 16), h: 22 };
      let top = 0, left = 0;
      switch (side) {
        case 'top':    top = r.top - est.h - offset; left = r.left + r.width / 2 - est.w / 2; break;
        case 'bottom': top = r.bottom + offset;      left = r.left + r.width / 2 - est.w / 2; break;
        case 'left':   top = r.top + r.height / 2 - est.h / 2; left = r.left - est.w - offset; break;
        case 'right':  top = r.top + r.height / 2 - est.h / 2; left = r.right + offset;        break;
      }
      setPos({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [show, side, label]);

  const body = show && pos && typeof document !== 'undefined'
    ? createPortal(
        <span
          id={id}
          role="tooltip"
          className={['cathode-tooltip-body', className].filter(Boolean).join(' ')}
          data-side={side}
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
        >
          {label}
        </span>,
        document.body,
      )
    : null;

  return (
    <>
      <span
        ref={anchorRef}
        className="cathode-tooltip-anchor"
        aria-describedby={show ? id : undefined}
        onMouseEnter={openAfter}
        onMouseLeave={close}
        onFocus={openAfter}
        onBlur={close}
      >
        {children}
      </span>
      {body}
    </>
  );
}
