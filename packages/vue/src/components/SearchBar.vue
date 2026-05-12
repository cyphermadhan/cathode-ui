<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useCathode } from '../useCathode';
import type { CathodeAIProvider } from '../ai/provider';

export interface SearchBarAIConfig {
  semantic: boolean;
  provider?: CathodeAIProvider;
  debounceMs?: number;
}
export interface SearchItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface Props {
  items: SearchItem[];
  placeholder?: string;
  ai?: SearchBarAIConfig;
  limit?: number;
  /** If true, render the default search-glass icon. */
  showIcon?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'SEARCH…',
  limit: 8,
  showIcon: true,
});
const emit = defineEmits<{ select: [item: SearchItem] }>();

const cathode = useCathode();
const query = ref('');
const aiRanking = ref<string[] | null>(null);
let abort: AbortController | null = null;

const results = computed<SearchItem[]>(() => {
  if (!query.value.trim()) return [];
  if (aiRanking.value) {
    const map = new Map(props.items.map((it) => [it.label, it]));
    return aiRanking.value.map((label) => map.get(label)).filter(Boolean) as SearchItem[];
  }
  const q = query.value.toLowerCase();
  return props.items
    .filter((it) => it.label.toLowerCase().includes(q) || (it.subtitle?.toLowerCase().includes(q) ?? false))
    .slice(0, props.limit);
});

function safeParseList(raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) return arr.filter((v) => typeof v === 'string');
    } catch { /* fall through */ }
  }
  return trimmed.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

let timer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => [query.value, props.ai?.semantic, props.ai?.provider, props.ai?.debounceMs],
  () => {
    aiRanking.value = null;
    const provider = props.ai?.provider ?? cathode.ai;
    if (timer) clearTimeout(timer);
    if (!props.ai?.semantic || !provider || !query.value.trim()) return;
    abort?.abort();
    timer = setTimeout(async () => {
      const ctrl = new AbortController();
      abort = ctrl;
      try {
        const raw = await provider.act(
          'search',
          { query: query.value, items: props.items.map((i) => i.label) },
          ctrl.signal,
        );
        if (ctrl.signal.aborted) return;
        aiRanking.value = safeParseList(raw).slice(0, props.limit);
      } catch { /* silent */ }
    }, props.ai.debounceMs ?? 300);
  },
);
onUnmounted(() => { if (timer) clearTimeout(timer); abort?.abort(); });

function pick(it: SearchItem) {
  emit('select', it);
  query.value = '';
  aiRanking.value = null;
}
</script>

<template>
  <div class="cathode-searchbar" :data-has-icon="props.showIcon ? 'true' : 'false'">
    <div class="cathode-searchbar-row-input">
      <span v-if="props.showIcon" class="cathode-searchbar-iconslot" aria-hidden="true">
        <slot name="icon">⌕</slot>
      </span>
      <input
        type="text"
        class="cathode-searchbar-input"
        v-model="query"
        :placeholder="props.placeholder"
        spellcheck="false"
        autocomplete="off"
        aria-label="Search"
      />
    </div>
    <ul v-if="results.length > 0" class="cathode-searchbar-results">
      <li v-for="it in results" :key="it.id">
        <button type="button" class="cathode-searchbar-row" @click="pick(it)">
          <span>{{ it.label }}</span>
          <span v-if="it.subtitle" class="cathode-searchbar-sub">{{ it.subtitle }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
