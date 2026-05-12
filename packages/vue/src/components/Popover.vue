<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';

interface Props {
  /** v-model:open */
  open?: boolean;
  defaultOpen?: boolean;
  align?: 'start' | 'end';
}
// `open: undefined` is intentional — without it, Vue auto-coerces
// missing boolean props to `false`, making it impossible to tell
// "uncontrolled mode" apart from "controlled with open=false". The
// explicit undefined default preserves the tri-state we need.
const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  align: 'start',
  defaultOpen: false,
});
const emit = defineEmits<{ 'update:open': [v: boolean] }>();

const internal = ref(props.defaultOpen);
const isOpen = computed(() => props.open ?? internal.value);

function setOpen(v: boolean) {
  if (props.open === undefined) internal.value = v;
  emit('update:open', v);
}

const rootEl  = ref<HTMLDivElement | null>(null);
const panelEl = ref<HTMLDivElement | null>(null);
const pos     = ref<{ top: number; left: number } | null>(null);

async function place() {
  if (!isOpen.value || !rootEl.value) return;
  await nextTick();
  const r = rootEl.value.getBoundingClientRect();
  const panelW = panelEl.value?.offsetWidth ?? 200;
  pos.value = { top: r.bottom + 6, left: props.align === 'end' ? r.right - panelW : r.left };
}

function toggle() {
  const next = !isOpen.value;
  setOpen(next);
  // place() also fires via the `watch(isOpen)` below, but calling it
  // here keeps the trigger-click path identical to Menu's model.
  if (next) place();
}

// Controlled consumers (v-model:open, or :open="true") bypass toggle()
// and set isOpen directly. Without this watch, place() never runs and
// the panel's v-if="isOpen && pos" never satisfies — the panel stays
// invisible even though isOpen is true. We can't use `immediate: true`
// here because template refs aren't bound until after the first render;
// place() reads rootEl.value and would no-op. The onMounted hook below
// handles the "open at mount time" case once refs are guaranteed live.
watch(isOpen, (v) => {
  if (v) place();
  else   pos.value = null;
});

function onDocMouse(e: MouseEvent) {
  if (!isOpen.value) return;
  const t = e.target as Node;
  if (rootEl.value?.contains(t)) return;
  if (panelEl.value?.contains(t)) return;
  setOpen(false);
}
function onKey(e: KeyboardEvent) {
  if (isOpen.value && e.key === 'Escape') setOpen(false);
}
function onScroll() { place(); }

onMounted(() => {
  document.addEventListener('mousedown', onDocMouse);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', onScroll, true);
  // If a consumer mounted the Popover with :open="true" from the
  // first render, the watch above didn't see a state transition —
  // we have to kick off place() ourselves here, now that refs are
  // live, so the panel actually appears.
  if (isOpen.value) place();
});
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocMouse);
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', place);
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<template>
  <div ref="rootEl" class="cathode-popover">
    <span
      role="button"
      :aria-haspopup="'dialog'"
      :aria-expanded="isOpen"
      @click="toggle"
    ><slot name="trigger" /></span>
    <Teleport to="body">
      <div
        v-if="isOpen && pos"
        ref="panelEl"
        class="cathode-popover-panel"
        role="dialog"
        :data-align="props.align"
        :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px` }"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>
