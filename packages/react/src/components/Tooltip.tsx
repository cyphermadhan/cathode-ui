import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';
import { cloneElement } from 'react';

/**
 * Tooltip — short hover/focus-triggered hint. Text-only; if you need
 * rich content use Popover. Renders on hover/focus of the wrapped
 * child, hides on blur/mouseleave.
 *
 * The tooltip body is portaled to `document.body` and positioned with
 * `position: fixed` relative to the trigger's viewport rect, so
 * ancestor `overflow: hidden` / `transform` can't clip it.
 *
 * Accessibility: the body is linked to the trigger via
 * aria-describedby so assistive tech reads it when the control is
 * focused.
 */
export interface TooltipProps {
  /** The element the tooltip describes. Must accept a ref + aria-describedby. */
  children: ReactElement<any>;
  label: string;
  /** Position hint. Default "top". */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing, ms. Default 200. */
  delay?: number;
  className?: string;
}

export function Tooltip({ children, label, side = 'top', delay = 200, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
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

  // Attach handlers + describedby + ref to the trigger child. We
  // clone the element so consumers can pass any focusable primitive
  // (Button, Pill, etc.) and the tooltip decorates without wrapping
  // markup.
  const trigger = cloneElement(children, {
    ref: (el: HTMLElement | null) => {
      anchorRef.current = el;
      // Preserve any existing ref on the child.
      const prev = (children as any).ref;
      if (typeof prev === 'function') prev(el);
      else if (prev && typeof prev === 'object') prev.current = el;
    },
    'aria-describedby': show ? id : undefined,
    onMouseEnter: (...args: unknown[]) => { openAfter(); children.props.onMouseEnter?.(...args); },
    onMouseLeave: (...args: unknown[]) => { close(); children.props.onMouseLeave?.(...args); },
    onFocus:      (...args: unknown[]) => { openAfter(); children.props.onFocus?.(...args); },
    onBlur:       (...args: unknown[]) => { close(); children.props.onBlur?.(...args); },
  });

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

  return <>{trigger}{body}</>;
}
