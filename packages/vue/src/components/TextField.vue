<script setup lang="ts">
import { ref, watch, onUnmounted, inject } from 'vue';
import { useCathode } from '../useCathode';
import type { CathodeAIProvider } from '../ai/provider';
import { FORM_FIELD_KEY } from './formFieldContext';

/** Opt-in AI suggest config. Matches TextField's shape in @cathode-ui/react. */
export interface TextFieldAIConfig {
  suggest: boolean;
  provider?: CathodeAIProvider;
  debounceMs?: number;
}

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  ai?: TextFieldAIConfig;
  weight?: 'regular' | 'bold';
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
const props = withDefaults(defineProps<Props>(), { weight: 'regular' });
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();

const cathode = useCathode();
const formField = inject(FORM_FIELD_KEY, undefined);
const suggestion = ref('');
let abort: AbortController | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => [props.modelValue, props.ai?.suggest, props.ai?.debounceMs, props.ai?.provider],
  () => {
    if (timer) clearTimeout(timer);
    const provider = props.ai?.provider ?? cathode.ai;
    abort?.abort();
    suggestion.value = '';
    if (!props.ai?.suggest || !provider || !props.modelValue) return;
    const delay = props.ai.debounceMs ?? 200;
    timer = setTimeout(async () => {
      const ctrl = new AbortController();
      abort = ctrl;
      let acc = '';
      try {
        for await (const chunk of provider.suggest(props.modelValue, ctrl.signal)) {
          if (ctrl.signal.aborted) return;
          acc += chunk;
          suggestion.value = acc;
        }
      } catch { /* silent */ }
    }, delay);
  },
  { immediate: true },
);
onUnmounted(() => {
  if (timer) clearTimeout(timer);
  abort?.abort();
});

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Tab' && suggestion.value) {
    e.preventDefault();
    emit('update:modelValue', props.modelValue + suggestion.value);
    suggestion.value = '';
  }
}
</script>

<template>
  <div class="cathode-textfield" :data-weight="props.weight">
    <input
      type="text"
      class="cathode-textfield-input"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-label="(props.ariaLabelledby || formField?.labelledBy) ? undefined : props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby ?? formField?.labelledBy"
      :aria-describedby="props.ariaDescribedby ?? formField?.describedBy"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @keydown="onKey"
    />
    <div v-if="suggestion" class="cathode-textfield-suggest" aria-hidden="true">
      <span style="opacity: 0">{{ props.modelValue }}</span>{{ suggestion }}
    </div>
  </div>
</template>
