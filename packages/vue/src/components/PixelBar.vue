<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/** Discrete-cell horizontal level meter, 0..1 clamped. */
interface Props {
  level: number;
  cells?: number;
  fill?: string;
  cellSize?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
}
const props = withDefaults(defineProps<Props>(), { cells: 24, cellSize: 6 });

const clamped = computed(() => Math.max(0, Math.min(1, props.level)));
const active  = computed(() => Math.round(clamped.value * props.cells));
const rootStyle = computed<CSSProperties>(() =>
  props.fill ? ({ ['--cathode-pixelbar-fill' as any]: props.fill }) : ({}),
);
</script>

<template>
  <div
    class="cathode-pixelbar"
    :style="rootStyle"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="1"
    :aria-valuenow="clamped"
    :aria-label="props.ariaLabelledby ? undefined : (props.ariaLabel ?? 'Level')"
    :aria-labelledby="props.ariaLabelledby"
  >
    <span
      v-for="i in props.cells"
      :key="i"
      class="cathode-pixelbar-cell"
      :data-lit="(i - 1) < active ? 'true' : 'false'"
      :style="{ width: `${props.cellSize}px`, height: `${props.cellSize}px` }"
    />
  </div>
</template>
