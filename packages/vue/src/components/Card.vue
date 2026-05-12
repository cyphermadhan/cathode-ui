<script setup lang="ts">
/**
 * Card — generic bordered container. Same chrome as TerminalFrame
 * minus the inset title. Pass @click to render as a button.
 */
interface Props {
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  surface?: 'flat' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  /** When true, renders as a <button> regardless of parent listener. */
  clickable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'neutral',
  surface: 'flat',
  padding: 'md',
  clickable: false,
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    v-if="props.clickable"
    type="button"
    class="cathode-card is-clickable"
    :data-accent="props.accent"
    :data-surface="props.surface"
    :data-padding="props.padding"
    :aria-label="props.ariaLabel"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </button>
  <div
    v-else
    class="cathode-card"
    :data-accent="props.accent"
    :data-surface="props.surface"
    :data-padding="props.padding"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </div>
</template>
