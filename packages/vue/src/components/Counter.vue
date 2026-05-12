<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  format?: (v: number) => string;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
});
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
const cathode = useCathode();

const canDec = computed(() => !props.disabled && props.modelValue - props.step >= props.min);
const canInc = computed(() => !props.disabled && props.modelValue + props.step <= props.max);
const shown  = computed(() => props.format ? props.format(props.modelValue) : String(props.modelValue));

function fire(dir: -1 | 1) {
  const next = props.modelValue + dir * props.step;
  if (next < props.min || next > props.max) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('tick', { enabled: true });
  emit('update:modelValue', next);
}
</script>

<template>
  <div class="cathode-counter">
    <button
      type="button"
      class="cathode-counter-btn"
      :data-motion="cathode.motion"
      :disabled="!canDec"
      aria-label="Decrease"
      @click="fire(-1)"
    >−</button>
    <div class="cathode-counter-display">
      <span v-if="props.label" class="cathode-counter-label">{{ props.label }}</span>
      <span class="cathode-counter-value">{{ shown }}</span>
    </div>
    <button
      type="button"
      class="cathode-counter-btn"
      :data-motion="cathode.motion"
      :disabled="!canInc"
      aria-label="Increase"
      @click="fire(1)"
    >+</button>
  </div>
</template>

<style scoped>
button[data-motion='strong']:active:not(:disabled) { transform: scale(0.97); }
button[data-motion='subtle']:active:not(:disabled) { transform: scale(0.99); }
button { transition: transform 80ms cubic-bezier(0.4, 0, 0.2, 1); }
</style>
