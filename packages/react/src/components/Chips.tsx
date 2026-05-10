import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Horizontally scrolling row of tappable preset chips. Whichever chip
 * the user taps fires `onSelect(item)` — useful for "insert this
 * phrase into the composer" or "apply this filter" patterns.
 *
 * Groups are optional. When provided, a thin vertical divider is
 * rendered between them. Useful for clustering semantically related
 * chips (e.g. `Emergency | Everyday | Status`).
 *
 * Chips are pure triggers, not toggles — state lives in the parent.
 * If you need on/off chips, wrap your own with `Toggle` behind them.
 */
export interface Chip {
  /** Displayed text. */
  label: string;
  /** Optional value returned to `onSelect`. Defaults to `label`. */
  value?: string;
  /** Disable this specific chip. */
  disabled?: boolean;
}

export interface ChipsProps {
  /** Flat list or array-of-arrays for grouped layouts. */
  groups: Chip[] | Chip[][];
  onSelect: (chip: Chip) => void;
  className?: string;
}

export function Chips({ groups, onSelect, className }: ChipsProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn } = useCathode();
  const whileTap = motionIntensity === 'none' ? {} :
    { scale: motionIntensity === 'subtle' ? 0.99 : 0.97 };

  // Normalize to grouped form so the render path is one code path.
  const isGrouped = Array.isArray(groups[0]);
  const grouped: Chip[][] = isGrouped ? (groups as Chip[][]) : [groups as Chip[]];

  const handle = (chip: Chip) => {
    if (chip.disabled) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('click', { enabled: true });
    onSelect(chip);
  };

  return (
    <div className={['cathode-chips', className].filter(Boolean).join(' ')}>
      {grouped.map((group, gi) => (
        <div key={gi} className="cathode-chips-group">
          {group.map((chip) => (
            <motion.button
              key={chip.label}
              type="button"
              className="cathode-chip"
              onClick={() => handle(chip)}
              disabled={chip.disabled}
              whileTap={chip.disabled ? undefined : whileTap}
            >
              {chip.label}
            </motion.button>
          ))}
          {gi < grouped.length - 1 ? <span className="cathode-chips-divider" aria-hidden /> : null}
        </div>
      ))}
    </div>
  );
}
