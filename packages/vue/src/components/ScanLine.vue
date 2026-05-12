<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/** Decorative CRT overlay — scan grid + sweeping beam. */
interface Props {
  speed?: number;
  color?: string;
  patternOpacity?: number;
}
const props = withDefaults(defineProps<Props>(), {
  speed: 4,
  patternOpacity: 0.06,
});
const style = computed<CSSProperties>(() => ({
  ['--cathode-scanline-speed' as any]: `${props.speed}s`,
  ['--cathode-scanline-color' as any]:
    props.color ?? 'color-mix(in srgb, var(--cathode-color-info) 60%, transparent)',
  ['--cathode-scanline-pattern-opacity' as any]: props.patternOpacity,
}));
</script>

<template>
  <span class="cathode-scanline" :style="style">
    <slot />
    <span class="cathode-scanline-grid" aria-hidden="true" />
    <span class="cathode-scanline-beam" aria-hidden="true" />
  </span>
</template>
