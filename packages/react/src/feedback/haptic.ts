/**
 * Haptic feedback controller.
 *
 * Wraps `navigator.vibrate` with a safe no-op fallback so browsers that
 * don't support the Vibration API (notably iOS Safari) silently skip
 * rather than throw.
 *
 * Patterns:
 *   - `tap`         — 10 ms       — any button / pill press
 *   - `confirm`     — 20 ms       — submit, accept, save
 *   - `warn`        — 10-30-10    — a heads-up pulse
 *   - `error`       — 20-40-20    — validation failure
 *   - `destructive` — 35 ms       — single firmer buzz before a
 *                                   destructive action commits
 *   - `long`        — 40 ms       — long-press trigger
 *
 * Apps can disable haptics globally via `<CathodeProvider haptic={false}>`
 * or per-component. The controller respects the disabled flag before
 * ever touching `navigator`.
 */
export type HapticPattern = 'tap' | 'confirm' | 'warn' | 'error' | 'destructive' | 'long';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  confirm: 20,
  warn: [10, 30, 10],
  error: [20, 40, 20],
  destructive: 35,
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
    // Vibration API can reject on rare browser quirks — swallow;
    // haptics are a non-critical nicety.
  }
}
