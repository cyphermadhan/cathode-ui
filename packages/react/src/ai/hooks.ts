import { useCallback, useEffect, useRef, useState } from 'react';
import { useCathode } from '../CathodeProvider';
import type { CathodeAIProvider, ChatMessage } from './provider';

/**
 * React-friendly wrappers around the three `CathodeAIProvider` verbs.
 * Components that opt into AI typically use one of these instead of
 * calling the provider directly — they take care of AbortControllers,
 * streaming accumulation, and hot-swapping the in-flight request when
 * inputs change.
 */

/** Accumulates streamed output from `provider.suggest(prefix)`. */
export function useAiSuggest(prefix: string, opts: { enabled?: boolean; debounceMs?: number } = {}) {
  const { ai } = useCathode();
  const [suggestion, setSuggestion] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!opts.enabled || !ai || !prefix) {
      setSuggestion('');
      return;
    }
    abortRef.current?.abort();
    const t = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setSuggestion('');
      let acc = '';
      try {
        for await (const chunk of ai.suggest(prefix, ctrl.signal)) {
          if (ctrl.signal.aborted) return;
          acc += chunk;
          setSuggestion(acc);
        }
      } catch {
        // silent — suggestion is non-critical
      }
    }, opts.debounceMs ?? 200);
    return () => clearTimeout(t);
  }, [prefix, ai, opts.enabled, opts.debounceMs]);

  return { suggestion, accept: () => prefix + suggestion };
}

/** Streaming chat helper — grows the final message as chunks arrive. */
export function useAiChat(provider?: CathodeAIProvider) {
  const { ai: globalAI } = useCathode();
  const active = provider ?? globalAI;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (content: string) => {
    if (!active) return;
    const user: ChatMessage = { role: 'user', content };
    const next = [...messages, user, { role: 'assistant' as const, content: '' }];
    setMessages(next);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      let acc = '';
      for await (const chunk of active.chat(next.slice(0, -1), ctrl.signal)) {
        if (ctrl.signal.aborted) return;
        acc += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [active, messages]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => { cancel(); setMessages([]); }, [cancel]);

  return { messages, send, cancel, reset, streaming };
}

/** One-shot intent runner — returns a resolver for imperative calls. */
export function useAiAction(provider?: CathodeAIProvider) {
  const { ai: globalAI } = useCathode();
  const active = provider ?? globalAI;
  return useCallback(async (intent: string, context?: unknown): Promise<string | null> => {
    if (!active) return null;
    try {
      return await active.act(intent, context);
    } catch {
      return null;
    }
  }, [active]);
}
