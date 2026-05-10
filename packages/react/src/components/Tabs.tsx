import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Tabs — horizontal row of tabs where exactly one is active. Controlled:
 * the app owns the selected value; `onChange` fires on selection.
 *
 * Use for grouping related views (e.g. "Overview / Logs / Settings").
 * Distinct from `Pill` which is for nav/actions, and `Chips` which
 * is for scrollable preset phrases.
 */
export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  value: T;
  onChange: (v: T) => void;
  items: ReadonlyArray<TabItem<T>>;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
  'aria-label'?: string;
}

export function Tabs<T extends string = string>({
  value,
  onChange,
  items,
  accent = 'info',
  className,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const { haptic: hapticOn, sound: soundOn } = useCathode();

  const pick = (v: T) => {
    if (v === value) return;
    if (hapticOn) haptic('tap');
    if (soundOn) sound('click', { enabled: true });
    onChange(v);
  };

  return (
    <div
      className={['cathode-tabs', className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((it) => {
        const isOn = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={isOn}
            tabIndex={isOn ? 0 : -1}
            disabled={it.disabled}
            className="cathode-tabs-tab"
            data-on={isOn ? 'true' : 'false'}
            data-accent={accent}
            onClick={() => pick(it.value)}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
