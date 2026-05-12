import type { InjectionKey } from 'vue';
import type { CathodeAIProvider } from './ai/provider';

/**
 * Runtime settings every Cathode component reads via `useCathode()`.
 * Mirrors `@cathode-ui/react`'s `CathodeSettings` shape so the manifest
 * describes the same prop surface across frameworks.
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
  /** Whether haptic vibration is enabled. Default true. */
  haptic: boolean;
  /** Whether sound effects are enabled. Default false — unexpected audio is hostile. */
  sound: boolean;
  /** Pluggable AI provider; used by AI-enabled primitives. */
  ai: CathodeAIProvider | null;
}

export const DEFAULT_SETTINGS: CathodeSettings = {
  theme: 'auto',
  motion: 'strong',
  haptic: true,
  sound: false,
  ai: null,
};

/** Injection key for Cathode settings. Used by provider + composable. */
export const CATHODE_SETTINGS_KEY = Symbol('cathode.settings') as InjectionKey<CathodeSettings>;
