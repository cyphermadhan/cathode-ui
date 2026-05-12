<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useCathode } from '../useCathode';

interface Props {
  text: string;
  speed?: number;
  cursorAfter?: boolean;
  delay?: number;
  color?: string;
  cursorColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  speed: 40,
  cursorAfter: true,
  delay: 0,
});
const emit = defineEmits<{ done: [] }>();

const cathode = useCathode();
const reduced = computed(() => cathode.motion === 'none');
const shown = ref(reduced.value ? props.text : '');

let timers: ReturnType<typeof setTimeout>[] = [];
function clear() { timers.forEach(clearTimeout); timers = []; }

watch(
  () => [props.text, props.speed, props.delay, reduced.value],
  () => {
    clear();
    if (reduced.value) { shown.value = props.text; emit('done'); return; }
    shown.value = '';
    let i = 0;
    const outer = setTimeout(function tickOuter() {
      const tick = () => {
        i += 1;
        shown.value = props.text.slice(0, i);
        if (i < props.text.length) timers.push(setTimeout(tick, props.speed));
        else emit('done');
      };
      timers.push(setTimeout(tick, props.speed));
    }, props.delay);
    timers.push(outer);
  },
  { immediate: true },
);
onUnmounted(clear);

const done = computed(() => shown.value.length === props.text.length);
const rootStyle = computed(() => (props.color ? { color: props.color } : undefined));
const cursorStyle = computed(() => (props.cursorColor ? { color: props.cursorColor } : undefined));
</script>

<template>
  <span class="cathode-typewriter" :style="rootStyle">
    <span class="cathode-typewriter-sr">{{ props.text }}</span>
    <span aria-hidden="true">{{ shown }}</span>
    <span
      v-if="(!done || props.cursorAfter) && !reduced"
      class="cathode-typewriter-cursor"
      :style="cursorStyle"
      aria-hidden="true"
    >▊</span>
  </span>
</template>
