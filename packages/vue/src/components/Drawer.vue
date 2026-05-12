<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';

interface Props {
  open: boolean;
  title?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: number;
  modal?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  size: 360,
  modal: false,
});
const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent) {
  if (!props.open || props.modal) return;
  if (e.key === 'Escape') emit('close');
}
onMounted(() => document.addEventListener('keydown', onKey));
onUnmounted(() => document.removeEventListener('keydown', onKey));

const isHorizontal = computed(() => props.side === 'left' || props.side === 'right');
const panelStyle = computed(() =>
  isHorizontal.value ? { width: `${props.size}px` } : { height: `${props.size}px` },
);

function onBackdrop(e: MouseEvent) {
  if (props.modal) return;
  if (e.target === e.currentTarget) emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition :name="`cathode-drawer-${props.side}`">
      <div
        v-if="props.open"
        class="cathode-drawer-backdrop"
        @click="onBackdrop"
      >
        <aside
          class="cathode-drawer"
          :data-side="props.side"
          :style="panelStyle"
          role="dialog"
          :aria-modal="props.modal ? 'true' : 'false'"
          :aria-label="props.title"
          @click.stop
        >
          <div v-if="props.title" class="cathode-drawer-header">
            <span class="cathode-drawer-title">{{ props.title }}</span>
            <button
              type="button"
              class="cathode-drawer-close"
              aria-label="Close"
              @click="emit('close')"
            >×</button>
          </div>
          <div class="cathode-drawer-body">
            <slot />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop fade applies to every side. */
.cathode-drawer-right-enter-active,
.cathode-drawer-right-leave-active,
.cathode-drawer-left-enter-active,
.cathode-drawer-left-leave-active,
.cathode-drawer-top-enter-active,
.cathode-drawer-top-leave-active,
.cathode-drawer-bottom-enter-active,
.cathode-drawer-bottom-leave-active { transition: opacity 150ms ease; }
.cathode-drawer-right-enter-from,
.cathode-drawer-right-leave-to,
.cathode-drawer-left-enter-from,
.cathode-drawer-left-leave-to,
.cathode-drawer-top-enter-from,
.cathode-drawer-top-leave-to,
.cathode-drawer-bottom-enter-from,
.cathode-drawer-bottom-leave-to     { opacity: 0; }

/* Per-side panel slide — simple translate on enter/leave. */
.cathode-drawer-right-enter-active .cathode-drawer,
.cathode-drawer-right-leave-active .cathode-drawer { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.cathode-drawer-right-enter-from   .cathode-drawer,
.cathode-drawer-right-leave-to     .cathode-drawer { transform: translateX(100%); }

.cathode-drawer-left-enter-active  .cathode-drawer,
.cathode-drawer-left-leave-active  .cathode-drawer { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.cathode-drawer-left-enter-from    .cathode-drawer,
.cathode-drawer-left-leave-to      .cathode-drawer { transform: translateX(-100%); }

.cathode-drawer-top-enter-active   .cathode-drawer,
.cathode-drawer-top-leave-active   .cathode-drawer { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.cathode-drawer-top-enter-from     .cathode-drawer,
.cathode-drawer-top-leave-to       .cathode-drawer { transform: translateY(-100%); }

.cathode-drawer-bottom-enter-active .cathode-drawer,
.cathode-drawer-bottom-leave-active .cathode-drawer { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.cathode-drawer-bottom-enter-from   .cathode-drawer,
.cathode-drawer-bottom-leave-to     .cathode-drawer { transform: translateY(100%); }
</style>
