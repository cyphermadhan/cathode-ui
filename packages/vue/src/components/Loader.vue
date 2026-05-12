<script setup lang="ts">
/**
 * Loader — indeterminate "working" indicator. Four pixel-square cells
 * that rise + brighten on a staggered 1s cycle. Pure CSS animation.
 */
interface Props {
  size?: 'sm' | 'md' | 'lg';
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  accent: 'info',
  ariaLabel: 'Loading',
});
</script>

<template>
  <span
    class="cathode-loader"
    :data-size="props.size"
    :data-accent="props.accent"
    role="status"
    :aria-label="props.ariaLabel"
  >
    <span class="cathode-loader-cell" />
    <span class="cathode-loader-cell" />
    <span class="cathode-loader-cell" />
    <span class="cathode-loader-cell" />
  </span>
</template>
