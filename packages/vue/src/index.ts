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
 * Framework-mirror of @cathode-ui/react. Same 45 primitives, same
 * manifest. AI coding agents querying @cathode-ui/mcp with
 * `framework: "vue"` get Vue-idiomatic imports + examples.
 */

// Provider + settings + composable
export { default as CathodeProvider } from './CathodeProvider.vue';
export { useCathode } from './useCathode';
export type { CathodeSettings } from './settings';

// AI surface
export type { CathodeAIProvider, ChatMessage } from './ai/provider';
export { useAiSuggest, useAiChat, useAiAction } from './ai/composables';

// Feedback controllers (advanced usage)
export { haptic, hapticAvailable } from './feedback/haptic';
export type { HapticPattern } from './feedback/haptic';
export { sound, soundAvailable } from './feedback/sound';
export type { SoundPattern } from './feedback/sound';

// Components — base.css holds the shared class rules used by every SFC.
import './components/base.css';

export { default as TerminalFrame } from './components/TerminalFrame.vue';
export { default as Card }          from './components/Card.vue';
export { default as Stack }         from './components/Stack.vue';
export { default as Accordion }     from './components/Accordion.vue';
export { default as HazardStripes } from './components/HazardStripes.vue';

export { default as Button }        from './components/Button.vue';
export { default as TextField }     from './components/TextField.vue';
export { default as TextArea }      from './components/TextArea.vue';
export { default as Select }        from './components/Select.vue';
export { default as Checkbox }      from './components/Checkbox.vue';
export { default as RadioGroup }    from './components/RadioGroup.vue';
export { default as Toggle }        from './components/Toggle.vue';
export { default as Counter }       from './components/Counter.vue';
export { default as SearchBar }     from './components/SearchBar.vue';
export { default as FormField }     from './components/FormField.vue';
export { default as Chips }         from './components/Chips.vue';

export { default as Badge }         from './components/Badge.vue';
export { default as Tag }           from './components/Tag.vue';
export { default as Avatar }        from './components/Avatar.vue';
export { default as Kbd }           from './components/Kbd.vue';
export { default as CodeBlock }     from './components/CodeBlock.vue';
export { default as Table }         from './components/Table.vue';
export { default as StatusTile }    from './components/StatusTile.vue';
export { default as DotLeader }     from './components/DotLeader.vue';
export { default as Pill }          from './components/Pill.vue';

export { default as Tabs }          from './components/Tabs.vue';
export { default as Breadcrumbs }   from './components/Breadcrumbs.vue';
export { default as Menu }          from './components/Menu.vue';
export { default as Pagination }    from './components/Pagination.vue';

export { default as ProgressBar }   from './components/ProgressBar.vue';
export { default as Loader }        from './components/Loader.vue';
export { default as Skeleton }      from './components/Skeleton.vue';
export { default as PixelBar }      from './components/PixelBar.vue';
export { default as ActivityBar }   from './components/ActivityBar.vue';
export { default as SignalBars }    from './components/SignalBars.vue';
export { default as PulsingDot }    from './components/PulsingDot.vue';
export { default as Toast }         from './components/Toast.vue';

export { default as Dialog }        from './components/Dialog.vue';
export { default as Drawer }        from './components/Drawer.vue';
export { default as Popover }       from './components/Popover.vue';
export { default as Tooltip }       from './components/Tooltip.vue';

export { default as Chat }          from './components/Chat.vue';

export { default as ScanLine }      from './components/ScanLine.vue';
export { default as TypewriterText } from './components/TypewriterText.vue';
export { default as Countdown }     from './components/Countdown.vue';
