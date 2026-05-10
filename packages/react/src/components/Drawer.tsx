import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useCathode } from '../CathodeProvider';

/**
 * Drawer — slide-in panel anchored to the viewport edge. Use for
 * settings, filters, inspector panels — anything that needs room
 * but shouldn't fully cover the underlying content the way Dialog
 * does.
 *
 * Not modal by default (click-outside closes). Pass `modal` to
 * force the user to close via the × or an explicit action.
 */
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Edge to anchor to. Default 'right'. */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Panel size — width for left/right, height for top/bottom. Default 360. */
  size?: number;
  /** Prevent click-outside/Escape close. */
  modal?: boolean;
}

export function Drawer({ open, onClose, children, title, side = 'right', size = 360, modal }: DrawerProps) {
  const { motion: motionIntensity } = useCathode();

  // ESC closes (unless modal). Mount only while open to avoid leaks.
  useEffect(() => {
    if (!open || modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, modal, onClose]);

  if (typeof document === 'undefined') return null;

  const isHorizontal = side === 'left' || side === 'right';
  const initial = motionIntensity === 'none' ? {} :
    side === 'right'  ? { x:  '100%' } :
    side === 'left'   ? { x: '-100%' } :
    side === 'bottom' ? { y:  '100%' } :
                        { y: '-100%' };
  const animate = motionIntensity === 'none' ? {} : { x: 0, y: 0 };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cathode-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionIntensity === 'none' ? 0 : 0.15 }}
          onClick={modal ? undefined : onClose}
        >
          <motion.aside
            className="cathode-drawer"
            data-side={side}
            style={isHorizontal ? { width: size } : { height: size }}
            initial={initial}
            animate={animate}
            exit={initial}
            transition={{ duration: motionIntensity === 'none' ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal={modal ? 'true' : 'false'}
            aria-label={title}
          >
            {title ? (
              <div className="cathode-drawer-header">
                <span className="cathode-drawer-title">{title}</span>
                <button
                  type="button"
                  className="cathode-drawer-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            ) : null}
            <div className="cathode-drawer-body">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
