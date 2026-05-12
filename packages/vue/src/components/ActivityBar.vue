<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/**
 * Pseudo-random "activity" meter. Same pixel cells as PixelBar,
 * lit by a deterministic seed rather than a level value.
 */
interface Props {
  intensity: number;
  seed?: number;
  cells?: number;
  fill?: string;
  cellSize?: number;
}
const props = withDefaults(defineProps<Props>(), {
  seed: 0,
  cells: 24,
  cellSize: 6,
});

const clamped = computed(() => Math.max(0, Math.min(1, props.intensity)));

function isLit(cell: number, seed: number, intensity: number): boolean {
  const h = (Math.imul(seed, 2654435761) ^ Math.imul(cell, 11)) >>> 0;
  return (h & 0xff) / 255 < intensity;
}

const rootStyle = computed<CSSProperties>(() =>
  props.fill ? ({ ['--cathode-pixelbar-fill' as any]: props.fill }) : ({}),
);
</script>

<template>
  <div class="cathode-pixelbar" role="presentation" :style="rootStyle">
    <span
      v-for="i in props.cells"
      :key="i"
      class="cathode-pixelbar-cell"
      :data-lit="isLit(i - 1, props.seed, clamped) ? 'true' : 'false'"
      :style="{ width: `${props.cellSize}px`, height: `${props.cellSize}px` }"
    />
  </div>
</template>
