<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export interface MenuItem {
  label: string;
  disabled?: boolean;
  shortcut?: string;
  kind?: 'default' | 'danger';
  divider?: boolean;
}

interface Props {
  items: readonly MenuItem[];
  align?: 'start' | 'end';
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { align: 'start' });
const emit = defineEmits<{ select: [item: MenuItem, index: number] }>();

const open = ref(false);
const focus = ref(-1);
const rootEl = ref<HTMLDivElement | null>(null);
const listEl = ref<HTMLUListElement | null>(null);
const pos    = ref<{ top: number; left: number } | null>(null);

function nextEnabled(from: number, dir: 1 | -1): number {
  const n = props.items.length;
  if (n === 0) return -1;
  let idx = from;
  for (let i = 0; i < n; i++) {
    idx = (idx + dir + n) % n;
    if (!props.items[idx]?.disabled) return idx;
  }
  return -1;
}

async function place() {
  if (!open.value || !rootEl.value) return;
  await nextTick();
  const r = rootEl.value.getBoundingClientRect();
  const listW = listEl.value?.offsetWidth ?? 180;
  pos.value = { top: r.bottom + 4, left: props.align === 'end' ? r.right - listW : r.left };
}

function toggle() {
  open.value = !open.value;
  focus.value = -1;
  if (open.value) place();
}
function close() { open.value = false; }
function onItemClick(it: MenuItem, i: number) {
  if (it.disabled) return;
  emit('select', it, i);
  close();
}

function onDocMouse(e: MouseEvent) {
  if (!open.value) return;
  const t = e.target as Node;
  if (rootEl.value?.contains(t)) return;
  if (listEl.value?.contains(t)) return;
  close();
}
function onKey(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'Escape') { close(); return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); focus.value = nextEnabled(focus.value, 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focus.value = nextEnabled(focus.value, -1); }
  else if (e.key === 'Enter' && focus.value >= 0) {
    e.preventDefault();
    const it = props.items[focus.value];
    if (it && !it.disabled) onItemClick(it, focus.value);
  }
}
function onScroll() { place(); }

onMounted(() => {
  document.addEventListener('mousedown', onDocMouse);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', onScroll, true);
});
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocMouse);
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', place);
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<template>
  <div ref="rootEl" class="cathode-menu">
    <span
      role="button"
      :aria-haspopup="'menu'"
      :aria-expanded="open"
      :aria-label="props.ariaLabel"
      @click="toggle"
    ><slot name="trigger" /></span>
    <Teleport to="body">
      <ul
        v-if="open && pos"
        ref="listEl"
        class="cathode-menu-list"
        role="menu"
        :data-align="props.align"
        :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px` }"
      >
        <li
          v-for="(it, i) in props.items"
          :key="i"
          role="none"
        >
          <div v-if="it.divider && i > 0" class="cathode-menu-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            class="cathode-menu-item"
            :data-focus="i === focus ? 'true' : 'false'"
            :data-kind="it.kind ?? 'default'"
            :disabled="it.disabled"
            @mouseenter="focus = i"
            @click="onItemClick(it, i)"
          >
            <span class="cathode-menu-label">{{ it.label }}</span>
            <span v-if="it.shortcut" class="cathode-menu-shortcut">{{ it.shortcut }}</span>
          </button>
        </li>
      </ul>
    </Teleport>
  </div>
</template>
