<script setup lang="ts">
import { computed } from 'vue';
import { useCathode } from '../useCathode';

interface Props {
  visible: boolean;
  kind?: 'info' | 'success' | 'warning' | 'error';
}
const props = withDefaults(defineProps<Props>(), { kind: 'info' });

const cathode = useCathode();
const duration = computed(() => (cathode.motion === 'none' ? '0ms' : '150ms'));
</script>

<template>
  <Transition name="cathode-toast">
    <div
      v-if="props.visible"
      class="cathode-toast"
      :data-kind="props.kind"
      role="status"
      :aria-live="props.kind === 'error' ? 'assertive' : 'polite'"
      :style="{ ['--cathode-toast-duration' as any]: duration }"
    >
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
.cathode-toast-enter-active,
.cathode-toast-leave-active {
  transition: opacity var(--cathode-toast-duration) ease, transform var(--cathode-toast-duration) ease;
}
.cathode-toast-enter-from,
.cathode-toast-leave-to { opacity: 0; transform: translateY(4px); }
.cathode-toast-enter-to,
.cathode-toast-leave-from { opacity: 1; transform: translateY(0); }
</style>
