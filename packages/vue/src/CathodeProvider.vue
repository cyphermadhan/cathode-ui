<script setup lang="ts">
import { computed, provide } from 'vue';
import {
  CATHODE_SETTINGS_KEY,
  DEFAULT_SETTINGS,
  type CathodeSettings,
} from './settings';
import type { CathodeAIProvider } from './ai/provider';

/**
 * Root provider for Cathode UI. Wraps the app, exposes the Cathode
 * settings bundle to every descendant via provide/inject, and pins
 * the data-theme attribute on its container div so the
 * [data-theme="…"] scoped variables in tokens.css kick in.
 *
 * Usage:
 *   <CathodeProvider theme="dark" motion="strong" :ai="openaiProvider">
 *     <App />
 *   </CathodeProvider>
 *
 * Every prop is optional. Defaults: theme="auto", motion="strong",
 * haptic=true, sound=false, ai=null. `auto` theme follows
 * `prefers-color-scheme`.
 */
interface Props {
  theme?: CathodeSettings['theme'];
  motion?: CathodeSettings['motion'];
  haptic?: boolean;
  sound?: boolean;
  ai?: CathodeAIProvider | null;
}

const props = withDefaults(defineProps<Props>(), {
  theme: DEFAULT_SETTINGS.theme,
  motion: DEFAULT_SETTINGS.motion,
  haptic: DEFAULT_SETTINGS.haptic,
  sound: DEFAULT_SETTINGS.sound,
  ai: null,
});

provide<CathodeSettings>(CATHODE_SETTINGS_KEY, {
  get theme()  { return props.theme; },
  get motion() { return props.motion; },
  get haptic() { return props.haptic; },
  get sound()  { return props.sound; },
  get ai()     { return props.ai; },
} as CathodeSettings);

const dataTheme = computed(() =>
  props.theme === 'auto' ? undefined : props.theme,
);
</script>

<template>
  <div class="cathode-root" :data-theme="dataTheme">
    <slot />
  </div>
</template>
