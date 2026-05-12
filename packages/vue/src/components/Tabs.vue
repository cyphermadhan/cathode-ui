<script setup lang="ts">
import { useCathode } from '../useCathode';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue: string;
  items: readonly TabItem[];
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { accent: 'info' });
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
const cathode = useCathode();

function pick(v: string) {
  if (v === props.modelValue) return;
  if (cathode.haptic) haptic('tap');
  if (cathode.sound)  sound('click', { enabled: true });
  emit('update:modelValue', v);
}
</script>

<template>
  <div class="cathode-tabs" role="tablist" :aria-label="props.ariaLabel">
    <button
      v-for="it in props.items"
      :key="it.value"
      type="button"
      role="tab"
      :aria-selected="it.value === props.modelValue"
      :tabindex="it.value === props.modelValue ? 0 : -1"
      :disabled="it.disabled"
      class="cathode-tabs-tab"
      :data-on="it.value === props.modelValue ? 'true' : 'false'"
      :data-accent="props.accent"
      @click="pick(it.value)"
    >{{ it.label }}</button>
  </div>
</template>
