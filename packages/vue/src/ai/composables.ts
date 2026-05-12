import { ref, watch, onUnmounted, type Ref } from 'vue';
import { useCathode } from '../useCathode';
import type { CathodeAIProvider, ChatMessage } from './provider';

/**
 * Vue composables wrapping the three `CathodeAIProvider` verbs. Parity
 * with @cathode-ui/react's AI hooks (same function names, same return
 * shapes) — the one difference is that Vue returns refs for reactive
 * bindings instead of React's [value, setter] tuples.
 */

/** Accumulates streamed output from `provider.suggest(prefix)`. */
export function useAiSuggest(
  prefix: Ref<string> | (() => string),
  opts: { enabled?: Ref<boolean> | (() => boolean); debounceMs?: number } = {},
) {
  const { ai } = useCathode();
  const suggestion = ref('');
  let abort: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const readPrefix  = () => (typeof prefix === 'function' ? prefix() : prefix.value);
  const readEnabled = () => {
    if (opts.enabled == null) return false;
    return typeof opts.enabled === 'function' ? opts.enabled() : opts.enabled.value;
  };

  watch(
    [readPrefix, readEnabled],
    ([p, enabled]) => {
      if (timer) clearTimeout(timer);
      if (!enabled || !ai || !p) {
        suggestion.value = '';
        return;
      }
      abort?.abort();
      timer = setTimeout(async () => {
        const ctrl = new AbortController();
        abort = ctrl;
        suggestion.value = '';
        let acc = '';
        try {
          for await (const chunk of ai.suggest(p, ctrl.signal)) {
            if (ctrl.signal.aborted) return;
            acc += chunk;
            suggestion.value = acc;
          }
        } catch {
          // silent — suggestion is non-critical
        }
      }, opts.debounceMs ?? 200);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
    abort?.abort();
  });

  return { suggestion, accept: () => readPrefix() + suggestion.value };
}

/** Streaming chat helper — grows the final message as chunks arrive. */
export function useAiChat(provider?: CathodeAIProvider) {
  const { ai: globalAI } = useCathode();
  const active = provider ?? globalAI;

  const messages = ref<ChatMessage[]>([]);
  const streaming = ref(false);
  let abort: AbortController | null = null;

  async function send(content: string) {
    if (!active) return;
    const user: ChatMessage = { role: 'user', content };
    const next = [...messages.value, user, { role: 'assistant' as const, content: '' }];
    messages.value = next;
    streaming.value = true;

    const ctrl = new AbortController();
    abort = ctrl;
    try {
      let acc = '';
      for await (const chunk of active.chat(next.slice(0, -1), ctrl.signal)) {
        if (ctrl.signal.aborted) return;
        acc += chunk;
        const copy = [...messages.value];
        copy[copy.length - 1] = { role: 'assistant', content: acc };
        messages.value = copy;
      }
    } finally {
      streaming.value = false;
    }
  }

  const cancel = () => abort?.abort();
  const reset = () => { cancel(); messages.value = []; };

  onUnmounted(cancel);

  return { messages, streaming, send, cancel, reset };
}

/** One-shot intent runner — returns a function for imperative calls. */
export function useAiAction(provider?: CathodeAIProvider) {
  const { ai: globalAI } = useCathode();
  const active = provider ?? globalAI;
  return async (intent: string, context?: unknown): Promise<string | null> => {
    if (!active) return null;
    try {
      return await active.act(intent, context);
    } catch {
      return null;
    }
  };
}
