<script setup lang="ts">
import { computed } from 'vue';

/** Cellular/wifi-style ascending bars; 0..N filled. */
interface Props {
  level: number;
  bars?: number;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  width?: number;
  height?: number;
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  bars: 5,
  accent: 'info',
  width: 24,
  height: 16,
});

const filled = computed(() => Math.max(0, Math.min(props.bars, Math.round(props.level))));
const rootStyle = computed(() => ({ width: `${props.width}px`, height: `${props.height}px` }));
</script>

<template>
  <span
    class="cathode-signalbars"
    :style="rootStyle"
    :data-accent="props.accent"
    role="img"
    :aria-label="props.ariaLabel ?? `Signal: ${filled} of ${props.bars}`"
  >
    <span
      v-for="i in props.bars"
      :key="i"
      class="cathode-signalbars-bar"
      :data-lit="(i - 1) < filled ? 'true' : 'false'"
      :style="{ height: `${Math.round((i / props.bars) * 100)}%` }"
    />
  </span>
</template>
