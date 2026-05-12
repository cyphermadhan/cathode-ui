<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number;
  totalPages: number;
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { ariaLabel: 'Pagination' });
const emit = defineEmits<{ 'update:modelValue': [page: number] }>();

type Token = number | '…';
function windowedPages(page: number, total: number): Token[] {
  const result: Token[] = [];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  result.push(1);
  if (start > 2) result.push('…');
  for (let p = start; p <= end; p++) result.push(p);
  if (end < total - 1) result.push('…');
  if (total > 1) result.push(total);
  return result;
}

const pages = computed(() => windowedPages(props.modelValue, props.totalPages));

function go(n: number) {
  const clamped = Math.max(1, Math.min(props.totalPages, n));
  if (clamped !== props.modelValue) emit('update:modelValue', clamped);
}
</script>

<template>
  <nav v-if="props.totalPages > 1" class="cathode-pagination" :aria-label="props.ariaLabel">
    <button
      type="button"
      class="cathode-pagination-arrow"
      :disabled="props.modelValue <= 1"
      aria-label="Previous page"
      @click="go(props.modelValue - 1)"
    >‹</button>
    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === '…'" class="cathode-pagination-gap" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        class="cathode-pagination-page"
        :data-on="p === props.modelValue ? 'true' : 'false'"
        :aria-label="`Page ${p}`"
        :aria-current="p === props.modelValue ? 'page' : undefined"
        @click="go(p as number)"
      >{{ p }}</button>
    </template>
    <button
      type="button"
      class="cathode-pagination-arrow"
      :disabled="props.modelValue >= props.totalPages"
      aria-label="Next page"
      @click="go(props.modelValue + 1)"
    >›</button>
  </nav>
</template>
