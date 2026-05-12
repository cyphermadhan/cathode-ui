<script setup lang="ts">
import { computed } from 'vue';

/** Determinate (or indeterminate) horizontal progress bar. */
interface Props {
  /** 0..1. Omit for indeterminate shimmer. */
  value?: number;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  height?: number;
  showValue?: boolean;
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'success',
  height: 6,
  ariaLabel: 'Progress',
});

const indeterminate = computed(() => props.value === undefined);
const clamped       = computed(() => indeterminate.value ? 0 : Math.max(0, Math.min(1, props.value!)));
const pct           = computed(() => Math.round(clamped.value * 100));
</script>

<template>
  <div
    class="cathode-progress"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="indeterminate ? undefined : pct"
    :aria-label="props.ariaLabel"
    :data-indeterminate="indeterminate ? 'true' : 'false'"
    :data-accent="props.accent"
  >
    <div class="cathode-progress-track" :style="{ height: `${props.height}px` }">
      <div
        class="cathode-progress-fill"
        :style="indeterminate ? undefined : { width: `${pct}%` }"
      />
    </div>
    <span v-if="props.showValue && !indeterminate" class="cathode-progress-value">{{ pct }}%</span>
  </div>
</template>
