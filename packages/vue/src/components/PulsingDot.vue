<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/** Pulsing square — pure CSS keyframes, no framer-motion dep. */
interface Props {
  color?: string;
  size?: number;
}
const props = withDefaults(defineProps<Props>(), { size: 8 });
const style = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
}));
</script>

<template>
  <span class="cathode-pulsingdot" :style="style" aria-hidden="true" />
</template>
