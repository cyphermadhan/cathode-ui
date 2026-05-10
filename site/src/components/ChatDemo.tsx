import { useMemo } from 'react';
import { CathodeProvider, Chat } from '@cathode-ui/react';
import type { CathodeAIProvider, ChatMessage } from '@cathode-ui/react';

/**
 * Live Chat island for the docs site. Uses a simple mock provider so
 * the docs page works offline and without API keys. In a real app the
 * provider is wired to OpenAI / Anthropic / your own backend.
 */
function makeMockProvider(): CathodeAIProvider {
  return {
    async *suggest(prefix) {
      const tail = ' — continued.';
      for (const ch of tail) {
        await new Promise((r) => setTimeout(r, 20));
        yield ch;
      }
      void prefix;
    },
    async *chat(messages: ChatMessage[]) {
      // Canned reply that references the last user turn, one character
      // at a time so the streaming UI animates visibly.
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const reply = lastUser
        ? `Mock echo: "${lastUser.slice(0, 60)}${lastUser.length > 60 ? '…' : ''}" — in a real app this is where the LLM stream arrives.`
        : 'Hello! This is the Cathode UI demo Chat. Type something.';
      for (const ch of reply) {
        await new Promise((r) => setTimeout(r, 15));
        yield ch;
      }
    },
    async act(intent: string) {
      await new Promise((r) => setTimeout(r, 200));
      return `Mock result for intent: ${intent}`;
    },
  };
}

export function ChatDemo() {
  const ai = useMemo(makeMockProvider, []);
  return (
    <CathodeProvider ai={ai} sound={true}>
      <Chat title="CATHODE · CHAT DEMO" maxHeight={360} />
    </CathodeProvider>
  );
}
