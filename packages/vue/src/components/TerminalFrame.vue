<script setup lang="ts">
/**
 * Bordered box with a tiny all-caps title clipped into the top edge.
 * The "┌─ PEERS ─" look of old terminal UIs. Framework-mirror of
 * @cathode-ui/react's TerminalFrame.
 */
interface Props {
  /** Uppercased and rendered as the inset title. Omit for an untitled box. */
  title?: string;
  /** Semantic border accent. Defaults to neutral. */
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  accent: 'neutral',
});
</script>

<template>
  <div
    class="cathode-frame"
    :data-accent="props.accent === 'neutral' ? undefined : props.accent"
  >
    <div v-if="props.title" class="cathode-frame-title">{{ props.title }}</div>
    <slot />
  </div>
</template>
