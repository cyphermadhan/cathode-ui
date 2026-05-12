<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

interface Props {
  /** v-model value */
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'amber' | 'pink' | 'purple' | 'teal';
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'success',
});
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const cathode = useCathode();

function handleClick() {
  if (props.disabled) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound) sound('tick', { enabled: true });
  emit('update:modelValue', !props.modelValue);
}

const knobStyle = computed(() => ({
  transform: `translateX(${props.modelValue ? 16 : 0}px)`,
  transition: cathode.motion === 'none' ? 'none' : 'transform 120ms ease-out',
}));
</script>

<template>
  <label
    class="cathode-toggle"
    :class="{ 'is-disabled': props.disabled }"
    :aria-disabled="props.disabled || undefined"
  >
    <button
      type="button"
      role="switch"
      :aria-checked="props.modelValue"
      :aria-label="props.ariaLabel ?? props.label"
      :disabled="props.disabled"
      class="cathode-toggle-track"
      :data-on="props.modelValue ? 'true' : 'false'"
      :data-accent="props.accent"
      @click="handleClick"
    >
      <span class="cathode-toggle-knob" :style="knobStyle" />
    </button>
    <span v-if="props.label" class="cathode-toggle-label">{{ props.label }}</span>
  </label>
</template>
