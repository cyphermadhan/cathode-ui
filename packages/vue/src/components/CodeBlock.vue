<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  code?: string;
  html?: string;
  language?: string;
  showCopy?: boolean;
  maxHeight?: number;
}
const props = withDefaults(defineProps<Props>(), { showCopy: true });

const copied = ref(false);
const preStyle = computed(() => (props.maxHeight ? { maxHeight: `${props.maxHeight}px`, overflow: 'auto' } : undefined));

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}
async function onCopy() {
  const text = props.code ?? stripHtml(props.html ?? '');
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch { /* clipboard blocked */ }
}
</script>

<template>
  <div class="cathode-codeblock">
    <div v-if="props.language || props.showCopy" class="cathode-codeblock-bar">
      <span v-if="props.language" class="cathode-codeblock-lang">{{ props.language }}</span>
      <span v-else />
      <button
        v-if="props.showCopy"
        type="button"
        class="cathode-codeblock-copy"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="onCopy"
      >{{ copied ? 'COPIED' : 'COPY' }}</button>
    </div>
    <pre class="cathode-codeblock-pre" :style="preStyle" tabindex="0">
      <code v-if="props.html" v-html="props.html" />
      <code v-else>{{ props.code }}</code>
    </pre>
  </div>
</template>
