import { useId } from 'react';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Radio group — single-select from 2+ options. Owns the rendering of
 * its radios so consumers pass an options array rather than composing
 * children manually. Keyboard arrow-nav + focus is handled by the
 * browser's native radio-group semantics (all inputs share the same
 * `name`).
 */
export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  /** Stable name shared by every radio in the group. Auto-generated if omitted. */
  name?: string;
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<RadioOption<T>>;
  /** Visual layout. Default horizontal row. */
  orientation?: 'horizontal' | 'vertical';
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent';
  disabled?: boolean;
  className?: string;
  /** Labels the whole group (e.g. "Select a mode"). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function RadioGroup<T extends string = string>({
  name,
  value,
  onChange,
  options,
  orientation = 'horizontal',
  accent = 'info',
  disabled,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RadioGroupProps<T>) {
  const { haptic: hapticOn, sound: soundOn } = useCathode();
  const autoName = useId();
  const groupName = name ?? `cathode-radio-${autoName}`;

  const handleChange = (v: T) => {
    if (disabled) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('tick', { enabled: true });
    onChange(v);
  };

  return (
    <div
      className={['cathode-radiogroup', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      role="radiogroup"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
    >
      {options.map((opt) => {
        const isOn = opt.value === value;
        const isDisabled = disabled || opt.disabled;
        return (
          <label
            key={opt.value}
            className={['cathode-radio', isDisabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
            aria-disabled={isDisabled || undefined}
          >
            <input
              type="radio"
              className="cathode-radio-native"
              name={groupName}
              value={opt.value}
              checked={isOn}
              disabled={isDisabled}
              onChange={() => handleChange(opt.value)}
            />
            <span
              className="cathode-radio-box"
              data-on={isOn ? 'true' : 'false'}
              data-accent={accent}
              aria-hidden
            >
              <span className="cathode-radio-dot" />
            </span>
            <span className="cathode-radio-label">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
