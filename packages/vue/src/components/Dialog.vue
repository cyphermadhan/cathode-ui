<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import TerminalFrame from './TerminalFrame.vue';

interface Props {
  open: boolean;
  title?: string;
  accent?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  maxWidth?: number;
  /** Prevent backdrop-click close. */
  modal?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  accent: 'neutral',
  maxWidth: 480,
  modal: false,
});
const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent) {
  if (!props.open || props.modal) return;
  if (e.key === 'Escape') emit('close');
}
onMounted(() => document.addEventListener('keydown', onKey));
onUnmounted(() => document.removeEventListener('keydown', onKey));

function onBackdrop(e: MouseEvent) {
  if (props.modal) return;
  if (e.target === e.currentTarget) emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cathode-dialog">
      <div
        v-if="props.open"
        class="cathode-dialog-backdrop"
        @click="onBackdrop"
      >
        <div
          class="cathode-dialog"
          :style="{ maxWidth: `${props.maxWidth}px` }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="props.title ? 'cathode-dialog-title' : undefined"
          @click.stop
        >
          <TerminalFrame :title="props.title" :accent="props.accent">
            <button
              v-if="props.title"
              type="button"
              aria-label="Close"
              class="cathode-dialog-close"
              @click="emit('close')"
            >×</button>
            <div class="cathode-dialog-body">
              <slot />
            </div>
          </TerminalFrame>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cathode-dialog-enter-active,
.cathode-dialog-leave-active { transition: opacity 150ms ease; }
.cathode-dialog-enter-active .cathode-dialog,
.cathode-dialog-leave-active .cathode-dialog { transition: opacity 150ms ease, transform 150ms ease; }
.cathode-dialog-enter-from,
.cathode-dialog-leave-to { opacity: 0; }
.cathode-dialog-enter-from .cathode-dialog,
.cathode-dialog-leave-to   .cathode-dialog { opacity: 0; transform: translateY(8px); }
</style>
