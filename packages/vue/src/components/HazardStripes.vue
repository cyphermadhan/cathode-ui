<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

/** Diagonal hazard-stripe overlay. */
interface Props {
  intensity?: number;
  angle?: number;
  width?: number;
  color?: string;
}
const props = withDefaults(defineProps<Props>(), {
  intensity: 0.12,
  angle: 135,
  width: 8,
  color: 'white',
});

function withAlpha(color: string, a: number): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
}

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: `repeating-linear-gradient(${props.angle}deg, ${withAlpha(props.color, props.intensity)} 0 ${props.width}px, transparent ${props.width}px ${props.width * 2}px)`,
}));
</script>

<template>
  <div class="cathode-hazard-wrap" style="position: relative">
    <slot />
    <span :style="overlayStyle" aria-hidden="true" />
  </div>
</template>
