import { useEffect, useRef } from 'react';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Checkbox — binary on/off for multi-select form values. Distinct
 * from Toggle (which is a state switch). Supports indeterminate
 * (rendered as a horizontal dash) for parent rows in tree selections.
 *
 * A native <input type="checkbox"> drives accessibility; a styled
 * sibling box provides the Cathode terminal look.
 */
export interface CheckboxProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Tri-state — shows a dash instead of a check. */
  indeterminate?: boolean;
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent';
  className?: string;
  'aria-label'?: string;
}

export function Checkbox({
  value,
  onChange,
  label,
  disabled,
  indeterminate,
  accent = 'success',
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const { haptic: hapticOn, sound: soundOn } = useCathode();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Native checkboxes carry indeterminate as a DOM property, not an
  // attribute. Setting aria-checked="mixed" on <input type=checkbox>
  // fails axe's `aria-conditional-attr` check.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  const handleChange = () => {
    if (disabled) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('tick', { enabled: true });
    onChange(!value);
  };

  return (
    <label
      className={['cathode-checkbox', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ')}
      aria-disabled={disabled || undefined}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className="cathode-checkbox-native"
        checked={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
      />
      <span
        className="cathode-checkbox-box"
        data-on={value ? 'true' : 'false'}
        data-indeterminate={indeterminate ? 'true' : 'false'}
        data-accent={accent}
        aria-hidden
      >
        <span className="cathode-checkbox-mark">
          {indeterminate ? '–' : value ? '✓' : ''}
        </span>
      </span>
      {label ? <span className="cathode-checkbox-label">{label}</span> : null}
    </label>
  );
}
