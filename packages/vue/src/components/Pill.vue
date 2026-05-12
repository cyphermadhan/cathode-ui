<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/** See @cathode-ui/react for full accent semantics. */
export type PillAccent =
  | 'info' | 'success' | 'warning' | 'danger' | 'accent'
  | 'amber' | 'pink' | 'purple' | 'teal' | 'grey';

const ACCENT_VAR: Record<PillAccent, string> = {
  info:    'var(--cathode-color-info)',
  success: 'var(--cathode-color-success)',
  warning: 'var(--cathode-color-warning)',
  danger:  'var(--cathode-color-danger)',
  accent:  'var(--cathode-color-accent)',
  amber:   'var(--cathode-color-amber)',
  pink:    'var(--cathode-color-pink)',
  purple:  'var(--cathode-color-purple)',
  teal:    'var(--cathode-color-teal)',
  grey:    'var(--cathode-color-grey)',
};

interface Props {
  title: string;
  accent?: PillAccent;
  active?: boolean;
  disabled?: boolean;
  feedback?: boolean;
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'info',
  active: false,
  disabled: false,
  feedback: true,
});
const emit = defineEmits<{ click: [] }>();

const cathode = useCathode();
const style = computed(() => ({ ['--cathode-pill-accent' as any]: ACCENT_VAR[props.accent] }));

function onClick() {
  if (props.disabled || props.active) return;
  if (props.feedback && cathode.haptic) haptic('tap');
  if (props.feedback && cathode.sound) sound('click', { enabled: true });
  emit('click');
}
</script>

<template>
  <button
    type="button"
    class="cathode-pill"
    :data-active="props.active ? 'true' : 'false'"
    :data-motion="cathode.motion"
    :disabled="props.disabled || props.active"
    :aria-label="props.ariaLabel ?? props.title"
    :aria-current="props.active ? 'page' : undefined"
    :style="style"
    @click="onClick"
  >
    <slot name="icon" />
    <span>{{ props.title }}</span>
  </button>
</template>

<style scoped>
button[data-motion='strong']:active:not(:disabled) { transform: scale(0.97); }
button[data-motion='subtle']:active:not(:disabled) { transform: scale(0.99); }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
