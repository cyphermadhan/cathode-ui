<script setup lang="ts">
/**
 * Tag — outlined accent-colored marker for keywords/filters.
 * Optionally removable via the `remove` event.
 */
export type TagAccent =
  | 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  | 'amber' | 'pink' | 'purple' | 'teal' | 'grey';

interface Props {
  accent?: TagAccent;
  /** Render the trailing remove button. */
  removable?: boolean;
  removeLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'neutral',
  removable: false,
  removeLabel: 'Remove',
});
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <span class="cathode-tag" :data-accent="props.accent">
    <span class="cathode-tag-text"><slot /></span>
    <button
      v-if="props.removable"
      type="button"
      class="cathode-tag-remove"
      :aria-label="props.removeLabel"
      @click="emit('remove')"
    >×</button>
  </span>
</template>
