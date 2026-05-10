import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { TerminalFrame } from './TerminalFrame';

/**
 * Modal with TerminalFrame chrome. Uses a React portal to escape
 * layout contexts; renders into `document.body` so stacking order
 * never conflicts with transforms / overflow / position up the tree.
 *
 * Escape key and backdrop click both close. The close button is
 * rendered in the top-right of the title row, matching the terminal
 * "┌─ TITLE ─────[X]" look. Focus is returned to the triggering
 * element on close via React's natural flow (no focus-trap library
 * dependency — most Cathode dialogs are short-lived confirmations).
 *
 * Motion: fade + 8px lift on enter, reverse on exit. Reduced-motion
 * disables both.
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Dialog accent — drives the frame border. */
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  /** Max width in px. Default 480. */
  maxWidth?: number;
  /** Disable click-outside-to-close. Useful for required choices. */
  modal?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  accent = 'neutral',
  children,
  maxWidth = 480,
  modal = false,
  className,
}: DialogProps) {
  const { motion: motionIntensity } = useCathode();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape-to-close. Bound on the document so the dialog catches the
  // key regardless of which descendant has focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null; // SSR guard

  const duration = motionIntensity === 'none' ? 0 : 0.15;
  const dy = motionIntensity === 'none' ? 0 : 8;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cathode-dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          onClick={(e) => {
            // Only close on backdrop clicks, not bubbling from children.
            if (modal) return;
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            className={['cathode-dialog', className].filter(Boolean).join(' ')}
            style={{ maxWidth }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'cathode-dialog-title' : undefined}
            initial={{ opacity: 0, y: dy }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dy }}
            transition={{ duration }}
            onClick={(e) => e.stopPropagation()}
          >
            <TerminalFrame title={title} accent={accent}>
              {title ? (
                // Secondary close pill that sits at the far right of the
                // title — matches the "[X]" on the classic terminal
                // window chrome. Click hit area is 28px square.
                <button
                  type="button"
                  aria-label="Close"
                  className="cathode-dialog-close"
                  onClick={onClose}
                >
                  ×
                </button>
              ) : null}
              <div className="cathode-dialog-body">{children}</div>
            </TerminalFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
