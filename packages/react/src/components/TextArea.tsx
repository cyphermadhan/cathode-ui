/**
 * TextArea — multi-line monospace text input. Shares the TextField
 * chrome but renders <textarea> instead of <input>. Resize handle is
 * disabled by default; callers control sizing via `rows` or CSS so
 * the terminal aesthetic isn't broken by the native corner-grip.
 */
export interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  /** Show a character count at the bottom-right. Default off. */
  maxLength?: number;
  /** Opt out of the default `resize: none`. */
  resizable?: boolean;
  /** Font weight of the typed text. Default 'regular'. */
  weight?: 'regular' | 'bold';
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
  maxLength,
  resizable,
  weight = 'regular',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: TextAreaProps) {
  return (
    <div className={['cathode-textarea', className].filter(Boolean).join(' ')} data-weight={weight}>
      <textarea
        className="cathode-textarea-native"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        spellCheck={false}
        style={resizable ? undefined : { resize: 'none' }}
      />
      {maxLength ? (
        <div className="cathode-textarea-counter" aria-hidden>
          {value.length} / {maxLength}
        </div>
      ) : null}
    </div>
  );
}
