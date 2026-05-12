<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/** Placeholder shimmer while content loads. */
interface Props {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'block';
}
const props = withDefaults(defineProps<Props>(), { variant: 'block' });
const style = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}));
</script>

<template>
  <span class="cathode-skeleton" :data-variant="props.variant" :style="style" aria-hidden="true" />
</template>
