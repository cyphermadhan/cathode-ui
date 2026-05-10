import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useCathode } from '../CathodeProvider';
import type { CathodeAIProvider } from '../ai/provider';

/**
 * Monospace text input. Ghost-text AI suggestion is opt-in via
 * `ai={{ suggest: true }}`; otherwise it's a plain field.
 *
 * Suggest behavior:
 *   - While the user is typing, we debounce (200ms), then stream the
 *     first chunk of `provider.suggest(prefix)` as ghost text behind
 *     the caret. Subsequent keystrokes cancel the in-flight stream.
 *   - Pressing `Tab` accepts the suggestion (appends to value).
 *   - Any other keypress discards it.
 *
 * The AbortController-per-request pattern ensures we never leak a
 * streaming request from a stale prefix.
 */
export interface TextFieldAIConfig {
  suggest: boolean;
  /** Override the provider from CathodeProvider. */
  provider?: CathodeAIProvider;
  /** Debounce before firing suggest (ms). Default 200. */
  debounceMs?: number;
}

export interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ai?: TextFieldAIConfig;
  /** Font weight of the typed text. Default 'regular'. */
  weight?: 'regular' | 'bold';
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function TextField({
  value,
  onChange,
  placeholder,
  disabled,
  ai,
  weight = 'regular',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: TextFieldProps) {
  const { ai: globalAI } = useCathode();
  const provider = ai?.provider ?? globalAI;
  const [suggestion, setSuggestion] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Any change invalidates the prior suggestion + in-flight request.
  useEffect(() => {
    if (!ai?.suggest || !provider) return;
    abortRef.current?.abort();
    setSuggestion('');
    if (!value) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = ai.debounceMs ?? 200;
    debounceRef.current = setTimeout(() => {
      run();
    }, delay);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };

    async function run() {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        let acc = '';
        for await (const chunk of provider!.suggest(value, ctrl.signal)) {
          if (ctrl.signal.aborted) return;
          acc += chunk;
          setSuggestion(acc);
        }
      } catch {
        // Provider failures just leave the suggestion empty. The main
        // input keeps working — suggestion is a nice-to-have.
      }
    }
  }, [value, ai?.suggest, ai?.debounceMs, provider]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      onChange(value + suggestion);
      setSuggestion('');
    }
  };

  return (
    <div className={['cathode-textfield', className].filter(Boolean).join(' ')} data-weight={weight}>
      <input
        type="text"
        className="cathode-textfield-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        autoComplete="off"
        spellCheck={false}
      />
      {suggestion ? (
        <div className="cathode-textfield-suggest" aria-hidden>
          <span style={{ opacity: 0 }}>{value}</span>
          {suggestion}
        </div>
      ) : null}
    </div>
  );
}
