import { Children, cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * FormField — terminal-style wrapper that stacks a label above an
 * input and optionally surfaces a hint or error row below. Useful
 * for composing forms without repeating the "label + input + help
 * text" scaffolding on every field.
 *
 * If the child is a Cathode input (TextField / TextArea / Select /
 * Checkbox / RadioGroup / Toggle), we inject an auto-generated
 * `aria-labelledby` so screen readers announce the visible label.
 * The visible label also has an `htmlFor` pointing at the child's id
 * when the child exposes one natively.
 */
export interface FormFieldProps {
  label: string;
  /** Single Cathode input element. */
  children: ReactNode;
  /** Tertiary helper text below the input. */
  hint?: string;
  /** Error message — swaps the hint row and turns the label danger-red. */
  error?: string;
  /** Visual "* required" marker beside the label. */
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, hint, error, required, className }: FormFieldProps) {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const hintId = hint || error ? `${autoId}-hint` : undefined;

  // Inject aria-labelledby so the child reuses the visible label.
  const child = Children.only(children);
  const enhanced = isValidElement(child)
    ? cloneElement(child as ReactElement<any>, {
        'aria-labelledby': labelId,
        ...(hintId ? { 'aria-describedby': hintId } : {}),
      })
    : child;

  return (
    <div
      className={['cathode-formfield', error ? 'has-error' : '', className].filter(Boolean).join(' ')}
    >
      <div id={labelId} className="cathode-formfield-label">
        {label}
        {required ? <span className="cathode-formfield-required" aria-hidden> *</span> : null}
      </div>
      <div className="cathode-formfield-control">{enhanced}</div>
      {error ? (
        <div id={hintId} className="cathode-formfield-error" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div id={hintId} className="cathode-formfield-hint">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
