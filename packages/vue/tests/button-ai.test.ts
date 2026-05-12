import { describe, expect, test, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../src/components/Button.vue';
import CathodeProvider from '../src/CathodeProvider.vue';
import type { CathodeAIProvider } from '../src/ai/provider';

/** Minimal mock provider — we only exercise `act` here. */
function mockProvider(result: string): CathodeAIProvider {
  return {
    async *suggest() { /* unused */ },
    async *chat()    { /* unused */ },
    async act(intent: string, context: unknown): Promise<string> {
      return `${result}:${intent}:${JSON.stringify(context ?? null)}`;
    },
  };
}

describe('Button AI action', () => {
  test('emits click synchronously + actionResult after provider resolves', async () => {
    const ai = mockProvider('DONE');
    const w = mount({
      components: { CathodeProvider, Button },
      template: `
        <CathodeProvider :ai="ai">
          <Button :ai="{ action: 'summarize', context: { id: 1 } }" variant="primary">
            EXPLAIN
          </Button>
        </CathodeProvider>`,
      data: () => ({ ai }),
    }, { attachTo: document.body });

    const btn = w.find('button');
    await btn.trigger('click');

    const btnWrapper = w.findComponent(Button);
    expect(btnWrapper.emitted('click')).toBeTruthy();

    // Provider.act is async — wait a microtask for the result emit.
    await new Promise((r) => setTimeout(r, 0));
    const results = btnWrapper.emitted('actionResult');
    expect(results?.length).toBe(1);
    expect(results?.[0]?.[0]).toContain('DONE:summarize');
  });

  test('provider error does not throw out of click handler', async () => {
    const ai: CathodeAIProvider = {
      async *suggest() {},
      async *chat()    {},
      async act(): Promise<string> { throw new Error('boom'); },
    };
    const w = mount({
      components: { CathodeProvider, Button },
      template: `
        <CathodeProvider :ai="ai">
          <Button :ai="{ action: 'x' }">GO</Button>
        </CathodeProvider>`,
      data: () => ({ ai }),
    }, { attachTo: document.body });

    await w.find('button').trigger('click');
    await new Promise((r) => setTimeout(r, 0));
    // Click fires; actionResult does not.
    const btnWrapper = w.findComponent(Button);
    expect(btnWrapper.emitted('click')).toBeTruthy();
    expect(btnWrapper.emitted('actionResult')).toBeUndefined();
  });
});
