<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import { FORM_FIELD_KEY } from './formFieldContext';

interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent';
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { accent: 'success' });
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const cathode = useCathode();
const formField = inject(FORM_FIELD_KEY, undefined);

const inputEl = ref<HTMLInputElement | null>(null);
watch(
  () => props.indeterminate,
  (v) => { if (inputEl.value) inputEl.value.indeterminate = !!v; },
  { immediate: true },
);

function handleChange() {
  if (props.disabled) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('tick', { enabled: true });
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <label
    class="cathode-checkbox"
    :class="{ 'is-disabled': props.disabled }"
    :aria-disabled="props.disabled || undefined"
  >
    <input
      ref="inputEl"
      type="checkbox"
      class="cathode-checkbox-native"
      :checked="props.modelValue"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel ?? props.label"
      :aria-labelledby="formField?.labelledBy"
      :aria-describedby="formField?.describedBy"
      @change="handleChange"
    />
    <span
      class="cathode-checkbox-box"
      :data-on="props.modelValue ? 'true' : 'false'"
      :data-indeterminate="props.indeterminate ? 'true' : 'false'"
      :data-accent="props.accent"
      aria-hidden="true"
    >
      <span class="cathode-checkbox-mark">{{ props.indeterminate ? '–' : props.modelValue ? '✓' : '' }}</span>
    </span>
    <span v-if="props.label" class="cathode-checkbox-label">{{ props.label }}</span>
  </label>
</template>
