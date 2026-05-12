<script setup lang="ts">
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import type { CathodeAIProvider } from '../ai/provider';

/**
 * General-purpose Cathode button — full API parity with
 * @cathode-ui/react's Button.
 *
 * Variants:
 *   - `default`  — panel fill, border text (conservative option)
 *   - `primary`  — ok-green fill, inverted text (go, submit)
 *   - `danger`   — tx-red fill, inverted text (destructive)
 *
 * AI action: pass `:ai="{ action: 'explain-the-chart' }"` and a
 * provider via `<CathodeProvider :ai="..."` and the button will
 * route the click through `provider.act(action, context)` and emit
 * `actionResult` with the resolved string.
 *
 * Haptic/sound defaults: `confirm` for primary, `destructive` for
 * danger, `click`/`tap` for default.
 */
export interface ButtonAIConfig {
  action: string;
  context?: unknown;
  provider?: CathodeAIProvider;
}

interface Props {
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  ai?: ButtonAIConfig | null;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
  ai: null,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  actionResult: [result: string];
}>();

const cathode = useCathode();

async function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  const soundPattern =
    props.variant === 'primary' ? 'confirm'
    : props.variant === 'danger' ? 'destructive'
    : 'click';
  const hapticPattern =
    props.variant === 'primary' ? 'confirm'
    : props.variant === 'danger' ? 'destructive'
    : 'tap';
  if (cathode.haptic) haptic(hapticPattern);
  if (cathode.sound)  sound(soundPattern, { enabled: true });
  emit('click', event);

  if (props.ai) {
    const provider = props.ai.provider ?? cathode.ai;
    if (!provider) return;
    try {
      const result = await provider.act(props.ai.action, props.ai.context);
      emit('actionResult', result);
    } catch {
      // app surfaces errors via its own toast/log; stay quiet here.
    }
  }
}
</script>

<template>
  <button
    type="button"
    class="cathode-button"
    :data-variant="props.variant"
    :data-motion="cathode.motion"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>

<style scoped>
button[data-motion='strong']:active:not(:disabled)   { transform: scale(0.97); }
button[data-motion='subtle']:active:not(:disabled)   { transform: scale(0.99); }
button[data-motion='none']:active:not(:disabled)     { transform: none; }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
