<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  target: Date | number;
  prefix?: string;
  accent?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
}
const props = withDefaults(defineProps<Props>(), {
  prefix: 'T-',
  accent: 'info',
});
const emit = defineEmits<{ complete: [] }>();

const now = ref(Date.now());
let intervalId: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  intervalId = setInterval(() => { now.value = Date.now(); }, 1000);
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const targetMs    = computed(() => (typeof props.target === 'number' ? props.target : props.target.getTime()));
const remainingMs = computed(() => Math.max(0, targetMs.value - now.value));
const done        = computed(() => remainingMs.value === 0);

let fired = false;
watch(done, (v) => { if (v && !fired) { fired = true; emit('complete'); } });

const display = computed(() => {
  const secs = Math.floor(remainingMs.value / 1000);
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return d > 0 ? `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
});

const effectiveAccent = computed(() =>
  remainingMs.value > 0 && remainingMs.value < 60_000 ? 'danger' : props.accent,
);
</script>

<template>
  <span
    class="cathode-countdown"
    :data-accent="effectiveAccent"
    :data-done="done ? 'true' : 'false'"
    role="timer"
    aria-live="off"
  >
    <span class="cathode-countdown-prefix">{{ props.prefix }}</span>
    <span class="cathode-countdown-value">{{ display }}</span>
  </span>
</template>
