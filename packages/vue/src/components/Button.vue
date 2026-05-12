<script setup lang="ts">
import { useCathode } from '../useCathode';

/**
 * General-purpose Cathode button.
 *
 * Variants:
 *   - `default`  — panel fill, border text (the conservative option)
 *   - `primary`  — ok-green fill, inverted text (go, submit)
 *   - `danger`   — tx-red fill, inverted text (destructive)
 *
 * NOTE: Phase 4b session 1 ships Vue Button without the haptic /
 * sound / AI-action surface that @cathode-ui/react's Button carries.
 * The feedback controllers + provider interface port in session 2,
 * at which point `ai`, `onActionResult`, and the haptic/sound cues
 * fire on click. API additions will be non-breaking — all current
 * props keep their meaning.
 *
 * The motion intensity dial is honored already via a small press-scale
 * transform, using a CSS transition (no framer-motion dep in Vue).
 */
interface Props {
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { motion: motionIntensity } = useCathode();

function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<template>
  <button
    type="button"
    class="cathode-button"
    :data-variant="props.variant"
    :data-motion="motionIntensity"
    :disabled="props.disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
/* Press scale, gated on motion intensity. strong=0.97, subtle=0.99,
 * none=1 (no movement). Mirrors the framer-motion whileTap scaling in
 * the React package. Pure CSS so Vue doesn't need motion-one/framer. */
button[data-motion='strong']:active:not(:disabled)   { transform: scale(0.97); }
button[data-motion='subtle']:active:not(:disabled)   { transform: scale(0.99); }
button[data-motion='none']:active:not(:disabled)     { transform: none; }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
