<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, useId } from 'vue';

interface Props {
  label: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
const props = withDefaults(defineProps<Props>(), { side: 'top', delay: 200 });

const show = ref(false);
const pos = ref<{ top: number; left: number } | null>(null);
const id = useId();
const anchorEl = ref<HTMLSpanElement | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

async function place() {
  if (!show.value || !anchorEl.value) return;
  await nextTick();
  const r = anchorEl.value.getBoundingClientRect();
  const offset = 6;
  const est = { w: Math.max(60, props.label.length * 7 + 16), h: 22 };
  let top = 0, left = 0;
  switch (props.side) {
    case 'top':    top = r.top - est.h - offset; left = r.left + r.width / 2 - est.w / 2; break;
    case 'bottom': top = r.bottom + offset;      left = r.left + r.width / 2 - est.w / 2; break;
    case 'left':   top = r.top + r.height / 2 - est.h / 2; left = r.left - est.w - offset; break;
    case 'right':  top = r.top + r.height / 2 - est.h / 2; left = r.right + offset;        break;
  }
  pos.value = { top, left };
}

function openAfter() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    show.value = true;
    await place();
  }, props.delay);
}
function close() {
  if (timer) clearTimeout(timer);
  show.value = false;
}
function onScroll() { place(); }
onMounted(() => {
  window.addEventListener('resize', place);
  window.addEventListener('scroll', onScroll, true);
});
onUnmounted(() => {
  if (timer) clearTimeout(timer);
  window.removeEventListener('resize', place);
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<template>
  <span
    ref="anchorEl"
    class="cathode-tooltip-anchor"
    :aria-describedby="show ? id : undefined"
    @mouseenter="openAfter"
    @mouseleave="close"
    @focusin="openAfter"
    @focusout="close"
  >
    <slot />
  </span>
  <Teleport to="body">
    <span
      v-if="show && pos"
      :id="id"
      role="tooltip"
      class="cathode-tooltip-body"
      :data-side="props.side"
      :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px` }"
    >{{ props.label }}</span>
  </Teleport>
</template>
