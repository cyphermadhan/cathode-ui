<script setup lang="ts">
import { useId, inject } from 'vue';
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import { FORM_FIELD_KEY } from './formFieldContext';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  name?: string;
  modelValue: string;
  options: readonly RadioOption[];
  orientation?: 'horizontal' | 'vertical';
  accent?: 'success' | 'info' | 'warning' | 'danger' | 'accent';
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
}
const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  accent: 'info',
});
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const cathode = useCathode();
const formField = inject(FORM_FIELD_KEY, undefined);
const autoName = useId();
const groupName = props.name ?? `cathode-radio-${autoName}`;

function choose(v: string) {
  if (props.disabled) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('tick', { enabled: true });
  emit('update:modelValue', v);
}
</script>

<template>
  <div
    class="cathode-radiogroup"
    :data-orientation="props.orientation"
    role="radiogroup"
    :aria-label="(props.ariaLabelledby || formField?.labelledBy) ? undefined : props.ariaLabel"
    :aria-labelledby="props.ariaLabelledby ?? formField?.labelledBy"
    :aria-describedby="formField?.describedBy"
    :aria-disabled="props.disabled || undefined"
  >
    <label
      v-for="opt in props.options"
      :key="opt.value"
      class="cathode-radio"
      :class="{ 'is-disabled': props.disabled || opt.disabled }"
      :aria-disabled="(props.disabled || opt.disabled) || undefined"
    >
      <input
        type="radio"
        class="cathode-radio-native"
        :name="groupName"
        :value="opt.value"
        :checked="opt.value === props.modelValue"
        :disabled="props.disabled || opt.disabled"
        @change="choose(opt.value)"
      />
      <span
        class="cathode-radio-box"
        :data-on="opt.value === props.modelValue ? 'true' : 'false'"
        :data-accent="props.accent"
        aria-hidden="true"
      >
        <span class="cathode-radio-dot" />
      </span>
      <span class="cathode-radio-label">{{ opt.label }}</span>
    </label>
  </div>
</template>
