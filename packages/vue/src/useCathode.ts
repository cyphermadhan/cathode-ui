import { inject } from 'vue';
import { CATHODE_SETTINGS_KEY, DEFAULT_SETTINGS, type CathodeSettings } from './settings';

/**
 * Access the current Cathode settings from any descendant component.
 * Returns `DEFAULT_SETTINGS` when called outside a `<CathodeProvider>`
 * — same falls-back-gracefully behavior as the React package.
 */
export function useCathode(): CathodeSettings {
  return inject(CATHODE_SETTINGS_KEY, DEFAULT_SETTINGS);
}
