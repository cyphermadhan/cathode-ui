import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Numeric rocker — `[−]  LABEL VALUE  [+]`. Replaces the generic HTML
 * `<input type="number">` (bad on mobile) and the SwiftUI-style layout
 * where +/- buttons are detached from their label.
 *
 * Here the label + current value are welded into the same bordered
 * container as the two buttons, which reads as one control. Ideal for
 * values the user nudges frequently (volume, speed, count).
 *
 * Feedback: `tick` sound + `tap` haptic on every step. At the edges
 * (min reached / max reached) the button dims; no feedback fires.
 */
export interface CounterProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Caption shown before the value, e.g. "WPM". Optional. */
  label?: string;
  /** Formatter for the shown value. Default: `String`. */
  format?: (v: number) => string;
  disabled?: boolean;
  className?: string;
}

export function Counter({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  format,
  disabled,
  className,
}: CounterProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn } = useCathode();

  const canDec = !disabled && value - step >= min;
  const canInc = !disabled && value + step <= max;
  const fmt = format ?? String;

  const fire = (direction: -1 | 1) => {
    const next = value + direction * step;
    if (next < min || next > max) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('tick', { enabled: true });
    onChange(next);
  };

  const whileTap = motionIntensity === 'none' ? {} :
    { scale: motionIntensity === 'subtle' ? 0.99 : 0.97 };

  return (
    <div className={['cathode-counter', className].filter(Boolean).join(' ')}>
      <motion.button
        type="button"
        className="cathode-counter-btn"
        onClick={() => fire(-1)}
        disabled={!canDec}
        whileTap={canDec ? whileTap : undefined}
        aria-label="Decrease"
      >
        −
      </motion.button>
      <div className="cathode-counter-display">
        {label ? <span className="cathode-counter-label">{label}</span> : null}
        <span className="cathode-counter-value">{fmt(value)}</span>
      </div>
      <motion.button
        type="button"
        className="cathode-counter-btn"
        onClick={() => fire(1)}
        disabled={!canInc}
        whileTap={canInc ? whileTap : undefined}
        aria-label="Increase"
      >
        +
      </motion.button>
    </div>
  );
}
