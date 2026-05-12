<script setup lang="ts">
import { useId, computed, provide } from 'vue';
import { FORM_FIELD_KEY, type FormFieldContext } from './formFieldContext';

/**
 * FormField — label + input + optional hint/error scaffold.
 *
 * Cathode inputs opt into auto-wired aria via an injection token
 * provided here. React's FormField clones the child to inject props;
 * Vue doesn't do that idiomatically, so we provide the ids and the
 * child reads them via `inject(FORM_FIELD_KEY)`.
 */

interface Props {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}
const props = defineProps<Props>();

const autoId = useId();
const labelId = `${autoId}-label`;
const hintId = computed(() => (props.hint || props.error ? `${autoId}-hint` : undefined));

provide<FormFieldContext>(FORM_FIELD_KEY, {
  get labelledBy() { return labelId; },
  get describedBy() { return hintId.value; },
} as FormFieldContext);
</script>

<template>
  <div
    class="cathode-formfield"
    :class="{ 'has-error': !!props.error }"
  >
    <div :id="labelId" class="cathode-formfield-label">
      {{ props.label }}<span v-if="props.required" class="cathode-formfield-required" aria-hidden="true"> *</span>
    </div>
    <div class="cathode-formfield-control">
      <slot />
    </div>
    <div v-if="props.error" :id="hintId" class="cathode-formfield-error" role="alert">{{ props.error }}</div>
    <div v-else-if="props.hint" :id="hintId" class="cathode-formfield-hint">{{ props.hint }}</div>
  </div>
</template>
