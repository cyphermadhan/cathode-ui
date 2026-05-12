<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

export interface Chip {
  label: string;
  value?: string;
  disabled?: boolean;
}

interface Props {
  /** Flat list or array-of-arrays for grouped layouts. */
  groups: Chip[] | Chip[][];
}
const props = defineProps<Props>();
const emit = defineEmits<{ select: [chip: Chip] }>();
const cathode = useCathode();

const grouped = computed<Chip[][]>(() =>
  Array.isArray(props.groups[0]) ? (props.groups as Chip[][]) : [props.groups as Chip[]],
);

function handle(chip: Chip) {
  if (chip.disabled) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('click', { enabled: true });
  emit('select', chip);
}
</script>

<template>
  <div class="cathode-chips">
    <div
      v-for="(group, gi) in grouped"
      :key="gi"
      class="cathode-chips-group"
    >
      <button
        v-for="chip in group"
        :key="chip.label"
        type="button"
        class="cathode-chip"
        :data-motion="cathode.motion"
        :disabled="chip.disabled"
        @click="handle(chip)"
      >{{ chip.label }}</button>
      <span v-if="gi < grouped.length - 1" class="cathode-chips-divider" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
button[data-motion='strong']:active:not(:disabled) { transform: scale(0.97); }
button[data-motion='subtle']:active:not(:disabled) { transform: scale(0.99); }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
