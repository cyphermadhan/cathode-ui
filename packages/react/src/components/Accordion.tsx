import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useCathode } from '../CathodeProvider';

/**
 * Accordion — stack of expand/collapse sections. Each item has a
 * header button that toggles visibility of its content.
 *
 * Controlled via `expandedIds` / `onExpandedChange`; unmanaged mode
 * holds its own state when those props are omitted. By default
 * multiple items can be open at once; set `allowMultiple={false}`
 * to enforce exactly-one-open accordion behavior.
 */
export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  /** Right-aligned secondary label, e.g. a count or meta info. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: ReadonlyArray<AccordionItem>;
  /** Controlled: the ids currently expanded. */
  expandedIds?: ReadonlyArray<string>;
  onExpandedChange?: (ids: ReadonlyArray<string>) => void;
  /** Uncontrolled initial state. */
  defaultExpandedIds?: ReadonlyArray<string>;
  /** When false, opening one item closes the others. Default true. */
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  expandedIds: controlled,
  onExpandedChange,
  defaultExpandedIds = [],
  allowMultiple = true,
  className,
}: AccordionProps) {
  const { motion: motionIntensity } = useCathode();
  const [internal, setInternal] = useState<ReadonlyArray<string>>(defaultExpandedIds);
  const expandedIds = controlled ?? internal;

  const setExpanded = (next: ReadonlyArray<string>) => {
    if (controlled === undefined) setInternal(next);
    onExpandedChange?.(next);
  };

  const toggle = (id: string) => {
    const isOpen = expandedIds.includes(id);
    if (isOpen) {
      setExpanded(expandedIds.filter((x) => x !== id));
    } else if (allowMultiple) {
      setExpanded([...expandedIds, id]);
    } else {
      setExpanded([id]);
    }
  };

  const duration = motionIntensity === 'none' ? 0 : 0.18;

  return (
    <div className={['cathode-accordion', className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const open = expandedIds.includes(item.id);
        const panelId = `cathode-accordion-panel-${item.id}`;
        const btnId = `cathode-accordion-btn-${item.id}`;
        return (
          <div key={item.id} className="cathode-accordion-item">
            <button
              id={btnId}
              type="button"
              className="cathode-accordion-header"
              aria-expanded={open}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
              data-open={open ? 'true' : 'false'}
            >
              <span className="cathode-accordion-chevron" aria-hidden data-open={open ? 'true' : 'false'}>▸</span>
              <span className="cathode-accordion-title">{item.title}</span>
              {item.meta ? <span className="cathode-accordion-meta">{item.meta}</span> : null}
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="cathode-accordion-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="cathode-accordion-body">{item.content}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
