<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import TerminalFrame from './TerminalFrame.vue';
import Button from './Button.vue';
import { useAiChat } from '../ai/composables';
import type { CathodeAIProvider } from '../ai/provider';

interface Props {
  provider?: CathodeAIProvider;
  placeholder?: string;
  title?: string;
  maxHeight?: number;
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'TYPE A MESSAGE…',
  title: 'CHAT',
  maxHeight: 320,
});

const { messages, streaming, send, cancel, reset } = useAiChat(props.provider);
const draft = ref('');
const scrollerEl = ref<HTMLDivElement | null>(null);

watch(
  messages,
  async () => {
    await nextTick();
    if (scrollerEl.value) scrollerEl.value.scrollTop = scrollerEl.value.scrollHeight;
  },
  { deep: true },
);

function onSend() {
  const text = draft.value.trim();
  if (!text) return;
  send(text);
  draft.value = '';
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
}
</script>

<template>
  <TerminalFrame :title="props.title">
    <div class="cathode-chat">
      <div
        ref="scrollerEl"
        class="cathode-chat-scroller"
        :style="{ maxHeight: `${props.maxHeight}px` }"
        role="log"
        aria-live="polite"
      >
        <div v-if="messages.length === 0" class="cathode-chat-empty">NO MESSAGES YET</div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="cathode-chat-row"
          :data-role="m.role"
        >
          <span class="cathode-chat-arrow">{{ m.role === 'user' ? '▸' : '◂' }}</span>
          <span class="cathode-chat-text">
            {{ m.content }}
            <span
              v-if="streaming && m.role === 'assistant' && i === messages.length - 1"
              class="cathode-chat-cursor"
            >█</span>
          </span>
        </div>
      </div>
      <div class="cathode-chat-composer">
        <input
          type="text"
          class="cathode-chat-input"
          v-model="draft"
          :placeholder="props.placeholder"
          :disabled="streaming"
          spellcheck="false"
          autocomplete="off"
          aria-label="Message composer"
          @keydown="onKey"
        />
        <Button v-if="streaming" variant="danger" @click="cancel">STOP</Button>
        <Button v-else variant="primary" :disabled="!draft.trim()" @click="onSend">SEND</Button>
        <Button v-if="messages.length > 0 && !streaming" aria-label="Reset conversation" @click="reset">CLR</Button>
      </div>
    </div>
  </TerminalFrame>
</template>
