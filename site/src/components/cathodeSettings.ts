/**
 * Shared Cathode settings for the docs site.
 *
 * Every ComponentDemo island instantiates its own <CathodeProvider>,
 * so we need a way for a single header control to influence every
 * instance on the page. localStorage + a CustomEvent dispatched on
 * `window` does the job: the header writes once, every island reads
 * and subscribes.
 *
 * Theme is also mirrored to the <html data-theme="…"> attribute so
 * tokens.css's [data-theme="…"] overrides apply to the whole page
 * chrome (nav, prose, code blocks) — not just the demo islands.
 */
export type SiteTheme = 'auto' | 'dark' | 'light';
export type SiteMotion = 'none' | 'subtle' | 'strong';

export interface SiteSettings {
  theme: SiteTheme;
  motion: SiteMotion;
  haptic: boolean;
  sound: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  theme: 'auto',
  motion: 'strong',
  haptic: true,
  sound: false,
};

const STORAGE_KEY = 'cathode-site-settings';
const EVENT_NAME = 'cathode-site-settings-changed';

export function readSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(next: SiteSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyThemeToDocument(next.theme);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
}

export function applyThemeToDocument(theme: SiteTheme): void {
  if (typeof document === 'undefined') return;
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function subscribe(callback: (s: SiteSettings) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (ev: Event) => {
    const detail = (ev as CustomEvent<SiteSettings>).detail;
    if (detail) callback(detail);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
