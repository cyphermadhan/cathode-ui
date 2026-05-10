/**
 * Select — single-select from an enum of options. Wraps the native
 * <select> element rather than building a custom listbox so keyboard
 * behavior, mobile pickers, and screen readers work without extra
 * code. The chrome is styled with CSS; the chevron is a decorative
 * pseudo-element.
 *
 * Prefer `SearchBar` for command palettes or fuzzy-search over large
 * item sets. `Select` is for a finite list of mutually exclusive
 * values (e.g. choosing a mode, region, unit).
 */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  disabled?: boolean;
  /** Shown as the first disabled option when value is ''. */
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  disabled,
  placeholder,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: SelectProps<T>) {
  return (
    <div
      className={['cathode-select', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ')}
    >
      <select
        className="cathode-select-native"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        {placeholder ? (
          <option value="" disabled>{placeholder}</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="cathode-select-chevron" aria-hidden>▾</span>
    </div>
  );
}
