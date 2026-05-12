<script setup lang="ts">
import { inject, computed } from 'vue';
import { FORM_FIELD_KEY } from './formFieldContext';

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  resizable?: boolean;
  weight?: 'regular' | 'bold';
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
const props = withDefaults(defineProps<Props>(), { rows: 4, weight: 'regular' });
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
const formField = inject(FORM_FIELD_KEY, undefined);
const resizeStyle = computed(() => (props.resizable ? undefined : { resize: 'none' as const }));
</script>

<template>
  <div class="cathode-textarea" :data-weight="props.weight">
    <textarea
      class="cathode-textarea-native"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :rows="props.rows"
      :maxlength="props.maxLength"
      :aria-label="(props.ariaLabelledby || formField?.labelledBy) ? undefined : props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby ?? formField?.labelledBy"
      :aria-describedby="props.ariaDescribedby ?? formField?.describedBy"
      spellcheck="false"
      :style="resizeStyle"
      @input="(e) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value)"
    />
    <div v-if="props.maxLength" class="cathode-textarea-counter" aria-hidden="true">
      {{ props.modelValue.length }} / {{ props.maxLength }}
    </div>
  </div>
</template>
