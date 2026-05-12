/**
 * @cathode-ui/vue — public entry point.
 *
 * Consumer setup:
 *   import '@cathode-ui/vue/tokens.css';
 *   import '@cathode-ui/vue/fonts.css';    // optional — loads JetBrains Mono
 *   import '@cathode-ui/vue/styles.css';   // compiled component rules
 *
 *   import { CathodeProvider, Button } from '@cathode-ui/vue';
 *
 * Phase 4b is in progress — this package ships a subset of the 45
 * primitives. The manifest at `cathode.manifest.json` lists every
 * component with a `vue` adapter block; components without that block
 * fall back to the React adapter for discovery purposes but are not
 * yet implemented in Vue. Check the top-level `adapters` array to
 * know which adapter keys this build supports.
 */

// Provider + settings + composable
export { default as CathodeProvider } from './CathodeProvider.vue';
export { useCathode } from './useCathode';
export type { CathodeSettings } from './settings';

// Components — base.css must be imported so the shared class rules
// are pulled into any consumer's bundle via `@cathode-ui/vue/styles.css`.
import './components/base.css';

export { default as Button } from './components/Button.vue';
export { default as Stack } from './components/Stack.vue';
export { default as TerminalFrame } from './components/TerminalFrame.vue';
