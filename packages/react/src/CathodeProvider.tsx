import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CathodeAIProvider } from './ai/provider';

/**
 * Runtime settings every Cathode component reads via `useCathode()`.
 *
 * - `motion`: global intensity dial. `'subtle'` minimizes transforms,
 *   `'strong'` leans into them, `'none'` disables movement (also
 *   triggered automatically by `prefers-reduced-motion: reduce`).
 * - `haptic` / `sound`: booleans. Default off for sound (unexpected
 *   audio is hostile); default on for haptic where supported.
 * - `theme`: `'auto'` follows system via CSS media query; `'dark'` /
 *   `'light'` pins via the `data-theme` attribute on the provider's
 *   container div.
 * - `ai`: pluggable provider the app supplies; used by the AI-enabled
 *   components (TextField suggest, SearchBar semantic, Chat, Button
 *   actions). Cathode stays provider-agnostic.
 *
 * Every prop is optional. An app that just wants the visual language
 * can render `<CathodeProvider>{children}</CathodeProvider>` with no
 * props at all.
 */
export interface CathodeSettings {
  motion: 'subtle' | 'strong' | 'none';
  haptic: boolean;
  sound: boolean;
  theme: 'auto' | 'dark' | 'light';
  ai: CathodeAIProvider | null;
}

const DEFAULTS: CathodeSettings = {
  motion: 'strong',
  haptic: true,
  sound: false,
  theme: 'auto',
  ai: null,
};

const CathodeContext = createContext<CathodeSettings>(DEFAULTS);

export interface CathodeProviderProps extends Partial<CathodeSettings> {
  children: ReactNode;
}

export function CathodeProvider({ children, ...overrides }: CathodeProviderProps) {
  const value = useMemo<CathodeSettings>(() => ({ ...DEFAULTS, ...overrides }),
    // Primitives + the AI provider ref make up the identity of this
    // context. Re-memoize only when one actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overrides.motion, overrides.haptic, overrides.sound, overrides.theme, overrides.ai]);

  // Apply `data-theme` to our own wrapper so the CSS variable overrides
  // scoped to `[data-theme="..."]` in tokens.css kick in. `auto` is the
  // empty string so the `@media (prefers-color-scheme: dark)` default
  // path wins.
  const dataTheme = value.theme === 'auto' ? undefined : value.theme;

  return (
    <CathodeContext.Provider value={value}>
      <div data-theme={dataTheme} className="cathode-root">{children}</div>
    </CathodeContext.Provider>
  );
}

/** Access the current Cathode settings from any descendant. */
export function useCathode(): CathodeSettings {
  return useContext(CathodeContext);
}
