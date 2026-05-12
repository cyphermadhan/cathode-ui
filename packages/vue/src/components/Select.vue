<script setup lang="ts">
import { inject } from 'vue';
import { FORM_FIELD_KEY } from './formFieldContext';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue: string;
  options: readonly SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const formField = inject(FORM_FIELD_KEY, undefined);
</script>

<template>
  <div class="cathode-select" :class="{ 'is-disabled': props.disabled }">
    <select
      class="cathode-select-native"
      :value="props.modelValue"
      :disabled="props.disabled"
      :aria-label="(props.ariaLabelledby || formField?.labelledBy) ? undefined : props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby ?? formField?.labelledBy"
      :aria-describedby="props.ariaDescribedby ?? formField?.describedBy"
      @change="(e) => emit('update:modelValue', (e.target as HTMLSelectElement).value)"
    >
      <option v-if="props.placeholder" value="" disabled>{{ props.placeholder }}</option>
      <option
        v-for="opt in props.options"
        :key="opt.value"
        :value="opt.value"
        :disabled="opt.disabled"
      >{{ opt.label }}</option>
    </select>
    <span class="cathode-select-chevron" aria-hidden="true">▾</span>
  </div>
</template>
