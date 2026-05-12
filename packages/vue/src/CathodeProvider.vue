<script setup lang="ts">
import { computed, provide } from 'vue';
import {
  CATHODE_SETTINGS_KEY,
  DEFAULT_SETTINGS,
  type CathodeSettings,
} from './settings';

/**
 * Root provider for Cathode UI. Wraps the app, exposes the Cathode
 * settings bundle to every descendant via provide/inject, and pins
 * the data-theme attribute on its container div so the
 * [data-theme="…"] scoped variables in tokens.css kick in.
 *
 * Usage:
 *   <CathodeProvider theme="dark" motion="strong">
 *     <App />
 *   </CathodeProvider>
 *
 * Every prop is optional. Defaults: theme="auto", motion="strong",
 * haptic=true, sound=false. `auto` follows `prefers-color-scheme`.
 */
interface Props {
  theme?: CathodeSettings['theme'];
  motion?: CathodeSettings['motion'];
  haptic?: boolean;
  sound?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  theme: DEFAULT_SETTINGS.theme,
  motion: DEFAULT_SETTINGS.motion,
  haptic: DEFAULT_SETTINGS.haptic,
  sound: DEFAULT_SETTINGS.sound,
});

// Compose the settings object from props. We provide a plain object
// rather than reactive state because Cathode primitives read settings
// synchronously — mirrors the React package's useMemo behavior.
const settings = computed<CathodeSettings>(() => ({
  theme: props.theme,
  motion: props.motion,
  haptic: props.haptic,
  sound: props.sound,
}));

provide(CATHODE_SETTINGS_KEY, settings.value);

// `auto` → undefined so the @media (prefers-color-scheme) default path
// in tokens.css wins. Explicit values pin via data-theme.
const dataTheme = computed(() =>
  props.theme === 'auto' ? undefined : props.theme,
);
</script>

<template>
  <div class="cathode-root" :data-theme="dataTheme">
    <slot />
  </div>
</template>
