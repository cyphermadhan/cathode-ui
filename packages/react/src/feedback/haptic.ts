/**
 * Haptic feedback controller.
 *
 * Wraps `navigator.vibrate` with a safe no-op fallback so browsers that
 * don't support the Vibration API (notably iOS Safari) silently skip
 * rather than throw. Pattern durations come from the design tokens.
 *
 * Patterns:
 *   - `tap`     — 10 ms     — any button / pill press
 *   - `confirm` — 20 ms     — submit, accept, save
 *   - `error`   — 20-40-20  — validation fail, reject
 *   - `long`    — 40 ms     — long-press trigger
 *
 * Apps can disable haptics globally via `<CathodeProvider haptic={false}>`
 * or per-component via a `haptic` prop. The controller respects the
 * disabled flag before it even touches `navigator`.
 */
export type HapticPattern = 'tap' | 'confirm' | 'error' | 'long';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  confirm: 20,
  error: [20, 40, 20],
  long: 40,
};

/** True iff the runtime supports `navigator.vibrate`. iOS Safari returns false. */
export function hapticAvailable(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Fire a named pattern. No-op if unsupported or disabled. */
export function haptic(pattern: HapticPattern, { enabled = true } = {}): void {
  if (!enabled || !hapticAvailable()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Vibration API can reject on some rare browser quirks; swallow
    // silently — haptics are a non-critical nicety.
  }
}
