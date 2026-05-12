<script setup lang="ts">
import { computed } from 'vue';

/** `LABEL …………………… VALUE` terminal-style readout row. */
interface Props {
  label: string;
  value: string;
  valueColor?: string;
}
const props = defineProps<Props>();
const dots = '.'.repeat(200);
const valueStyle = computed(() => (props.valueColor ? { color: props.valueColor } : undefined));
</script>

<template>
  <div class="cathode-dotleader">
    <span class="cathode-dotleader-label">{{ props.label }}</span>
    <span class="cathode-dotleader-dots" aria-hidden="true">{{ dots }}</span>
    <span class="cathode-dotleader-value" :style="valueStyle">{{ props.value }}</span>
  </div>
</template>
