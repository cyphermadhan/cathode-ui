import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCathode } from '../CathodeProvider';

/**
 * Inline status notification. Inert unless passed `visible`; appears
 * with a short fade + 4px lift and exits the same way.
 *
 * This is a low-level primitive — apps typically wrap it in a `Toaster`
 * with their own queuing logic. Cathode UI doesn't ship a queue manager
 * because every app wants subtly different stacking / timing rules.
 */
export interface ToastProps {
  visible: boolean;
  /**
   * Semantic kind drives the border accent and ARIA liveness:
   *   - `info`    — blue border, polite live region
   *   - `success` — green border, polite live region
   *   - `warning` — amber border, polite live region
   *   - `error`   — red border, assertive live region
   */
  kind?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

export function Toast({ visible, kind = 'info', children, className }: ToastProps) {
  const { motion: motionIntensity } = useCathode();
  const duration = motionIntensity === 'none' ? 0 : 0.15;
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={['cathode-toast', className].filter(Boolean).join(' ')}
          data-kind={kind}
          role="status"
          aria-live={kind === 'error' ? 'assertive' : 'polite'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
