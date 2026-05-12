/**
 * Runtime settings every Cathode component reads via `useCathode()`.
 * Mirrors `@cathode-ui/react`'s `CathodeSettings` shape so the manifest
 * describes the same prop surface across frameworks.
 *
 * Phase 4b session 1 ships `theme` + `motion` — these are the subset
 * needed by the first three primitives (Button, Stack, TerminalFrame).
 * `haptic`, `sound`, and `ai` land in subsequent sessions as the
 * components that use them get ported.
 */
export interface CathodeSettings {
  /**
   * `auto` follows system via CSS media query; `dark` / `light` pin via
   * the `data-theme` attribute on the provider's container div.
   */
  theme: 'auto' | 'dark' | 'light';
  /**
   * Global motion intensity dial. `subtle` minimizes transforms,
   * `strong` leans into them, `none` disables movement (also triggered
   * automatically by `prefers-reduced-motion: reduce`).
   */
  motion: 'subtle' | 'strong' | 'none';
  /**
   * Whether haptic vibration is enabled. Defaults to true. (No Cathode
   * Vue component consumes this yet; reserved for Phase 4b session 2.)
   */
  haptic: boolean;
  /**
   * Whether sound effects are enabled. Defaults to false — unexpected
   * audio is hostile. (No Cathode Vue component consumes this yet;
   * reserved for Phase 4b session 2.)
   */
  sound: boolean;
}

export const DEFAULT_SETTINGS: CathodeSettings = {
  theme: 'auto',
  motion: 'strong',
  haptic: true,
  sound: false,
};

/** Injection key for Cathode settings. Used by provider + composable. */
export const CATHODE_SETTINGS_KEY = Symbol('cathode.settings') as import('vue').InjectionKey<CathodeSettings>;
