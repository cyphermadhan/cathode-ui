<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import type { PillAccent } from './Pill.vue';

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
  subtitle: string;
  accent?: PillAccent;
  active?: boolean;
  /** When true, renders as a <button> and fires click-feedback. */
  clickable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'info',
  active: false,
  clickable: false,
});
const emit = defineEmits<{ click: [] }>();
const cathode = useCathode();
const style = computed(() => ({ ['--cathode-tile-accent' as any]: ACCENT_VAR[props.accent] }));

function onClick() {
  if (!props.clickable) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('click', { enabled: true });
  emit('click');
}
</script>

<template>
  <button
    v-if="props.clickable"
    type="button"
    class="cathode-tile cathode-tile-button"
    :data-active="props.active ? 'true' : 'false'"
    :data-motion="cathode.motion"
    :style="style"
    @click="onClick"
  >
    <div class="cathode-tile-icon"><slot name="icon" /></div>
    <div class="cathode-tile-title">{{ props.title }}</div>
    <div class="cathode-tile-subtitle">{{ props.subtitle }}</div>
  </button>
  <div
    v-else
    class="cathode-tile"
    :data-active="props.active ? 'true' : 'false'"
    :style="style"
  >
    <div class="cathode-tile-icon"><slot name="icon" /></div>
    <div class="cathode-tile-title">{{ props.title }}</div>
    <div class="cathode-tile-subtitle">{{ props.subtitle }}</div>
  </div>
</template>

<style scoped>
button[data-motion='strong']:active { transform: scale(0.97); }
button[data-motion='subtle']:active { transform: scale(0.99); }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
