import { useId, useState } from 'react';
import type { ReactElement } from 'react';
import { cloneElement } from 'react';

/**
 * Tooltip — short hover/focus-triggered hint. Text-only; if you need
 * rich content use Popover. Renders on hover/focus of the wrapped
 * child, hides on blur/mouseleave.
 *
 * Accessibility: the tooltip body is linked to the trigger via
 * aria-describedby so assistive tech reads it when the control
 * is focused.
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
  const id = useId();
  const timer = useTimer();

  const openAfter = () => timer.set(() => setShow(true), delay);
  const close = () => { timer.clear(); setShow(false); };

  // Attach handlers + describedby to the trigger child. We clone the
  // element so consumers can pass any focusable primitive (Button,
  // Pill, etc.) and the tooltip decorates without wrapping markup.
  const trigger = cloneElement(children, {
    'aria-describedby': show ? id : undefined,
    onMouseEnter: (...args: unknown[]) => { openAfter(); children.props.onMouseEnter?.(...args); },
    onMouseLeave: (...args: unknown[]) => { close(); children.props.onMouseLeave?.(...args); },
    onFocus:      (...args: unknown[]) => { openAfter(); children.props.onFocus?.(...args); },
    onBlur:       (...args: unknown[]) => { close(); children.props.onBlur?.(...args); },
  });

  return (
    <span className={['cathode-tooltip', className].filter(Boolean).join(' ')}>
      {trigger}
      {show ? (
        <span id={id} role="tooltip" className="cathode-tooltip-body" data-side={side}>
          {label}
        </span>
      ) : null}
    </span>
  );
}

function useTimer() {
  const state = { t: undefined as ReturnType<typeof setTimeout> | undefined };
  return {
    set(fn: () => void, ms: number) {
      if (state.t) clearTimeout(state.t);
      state.t = setTimeout(fn, ms);
    },
    clear() {
      if (state.t) clearTimeout(state.t);
      state.t = undefined;
    },
  };
}
