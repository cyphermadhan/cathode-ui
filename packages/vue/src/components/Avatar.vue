<script setup lang="ts">
import { computed } from 'vue';

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type AvatarAccent =
  | 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  | 'amber' | 'pink' | 'purple' | 'teal' | 'grey';

/** Square identity marker. Image or initials fallback; optional status dot. */
interface Props {
  name?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: AvatarStatus;
  accent?: AvatarAccent;
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  accent: 'info',
});

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? '').join('').toUpperCase() || '?';
}
const initials = computed(() => (props.name ? deriveInitials(props.name) : null));
</script>

<template>
  <span class="cathode-avatar" :data-size="props.size">
    <img
      v-if="props.src"
      class="cathode-avatar-image"
      :src="props.src"
      :alt="props.alt ?? props.name ?? ''"
    />
    <span
      v-else
      class="cathode-avatar-fallback"
      :data-accent="props.accent"
      :aria-label="props.name ? undefined : props.alt"
    >
      <slot>{{ initials ?? '?' }}</slot>
    </span>
    <span
      v-if="props.status"
      class="cathode-avatar-status"
      :data-status="props.status"
      role="img"
      :aria-label="`Status: ${props.status}`"
    />
  </span>
</template>
