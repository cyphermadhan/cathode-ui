<script setup lang="ts">
import { computed } from 'vue';

/**
 * Kbd — keyboard shortcut indicator. Accepts a string (split on +/-)
 * or an array of key names. Keys joined by a separator (default "+").
 */
interface Props {
  keys: string | readonly string[];
  separator?: string;
  size?: 'sm' | 'md';
}
const props = withDefaults(defineProps<Props>(), {
  separator: '+',
  size: 'md',
});
const parts = computed<readonly string[]>(() =>
  Array.isArray(props.keys)
    ? (props.keys as readonly string[])
    : (props.keys as string).split(/\s*[+\-]\s*/).filter(Boolean),
);
</script>

<template>
  <span class="cathode-kbd" :data-size="props.size" role="group">
    <span v-for="(k, i) in parts" :key="i" class="cathode-kbd-group">
      <kbd class="cathode-kbd-key">{{ k }}</kbd>
      <span v-if="i < parts.length - 1" class="cathode-kbd-sep" aria-hidden="true">{{ props.separator }}</span>
    </span>
  </span>
</template>
