import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Binary on/off switch in the Cathode terminal language.
 *
 * Square-cornered track (no pill radius — that breaks the aesthetic).
 * The knob slides from left to right; track fills with the accent
 * color when on. Tap anywhere on the track to toggle. Feedback is a
 * `tick` sound + `tap` haptic by default.
 */
export interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Accent color when on. Defaults to `success`. */
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'amber' | 'pink' | 'purple' | 'teal';
  className?: string;
  'aria-label'?: string;
}

export function Toggle({
  value,
  onChange,
  label,
  disabled,
  accent = 'success',
  className,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn } = useCathode();

  const handleClick = () => {
    if (disabled) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('tick', { enabled: true });
    onChange(!value);
  };

  const duration = motionIntensity === 'none' ? 0 : 0.12;

  return (
    <label
      className={['cathode-toggle', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ')}
      aria-disabled={disabled || undefined}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        className="cathode-toggle-track"
        data-on={value ? 'true' : 'false'}
        data-accent={accent}
        onClick={handleClick}
      >
        <motion.span
          className="cathode-toggle-knob"
          animate={{ x: value ? 16 : 0 }}
          transition={{ duration, ease: 'easeOut' }}
        />
      </button>
      {label ? <span className="cathode-toggle-label">{label}</span> : null}
    </label>
  );
}
