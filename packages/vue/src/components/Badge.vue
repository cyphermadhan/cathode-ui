<script setup lang="ts">
/**
 * Badge — small inline marker for status/state. Display-only.
 * Distinct from Pill (tappable) and Tag (removable/filterable).
 */
interface Props {
  kind?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md';
}
const props = withDefaults(defineProps<Props>(), {
  kind: 'neutral',
  variant: 'solid',
  size: 'md',
});
</script>

<template>
  <span
    class="cathode-badge"
    :data-kind="props.kind"
    :data-variant="props.variant"
    :data-size="props.size"
  >
    <slot />
  </span>
</template>
