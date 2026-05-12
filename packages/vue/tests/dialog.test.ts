import { describe, expect, test, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Dialog from '../src/components/Dialog.vue';

// Tests for Dialog's three close paths: Escape key, backdrop click, ×
// button. The `modal` flag disables the first two but not the third.

afterEach(() => {
  // Teardown: Dialog teleports into body; clean up any strays between tests.
  document.body.innerHTML = '';
});

describe('Dialog', () => {
  test('opens + renders title into body', async () => {
    mount(Dialog, {
      props: { open: true, title: 'CONFIRM' },
      slots: { default: '<p>Are you sure?</p>' },
      attachTo: document.body,
    });
    expect(document.body.innerHTML).toContain('CONFIRM');
    expect(document.body.innerHTML).toContain('Are you sure?');
  });

  test('Escape key emits close when not modal', async () => {
    const w = mount(Dialog, {
      props: { open: true, title: 'T' },
      attachTo: document.body,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await w.vm.$nextTick();
    expect(w.emitted('close')?.length).toBeGreaterThan(0);
  });

  test('backdrop click emits close when not modal', async () => {
    const w = mount(Dialog, {
      props: { open: true, title: 'T' },
      attachTo: document.body,
    });
    const backdrop = document.querySelector('.cathode-dialog-backdrop') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await w.vm.$nextTick();
    // The click comes from the backdrop itself (target === currentTarget).
    // jsdom/happy-dom synthesize the target as the element the event was
    // dispatched on, so the handler should fire.
    expect(w.emitted('close')?.length).toBeGreaterThan(0);
  });

  test('× button emits close', async () => {
    const w = mount(Dialog, {
      props: { open: true, title: 'T' },
      attachTo: document.body,
    });
    const closeBtn = document.querySelector('.cathode-dialog-close') as HTMLElement;
    closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.emitted('close')?.length).toBeGreaterThan(0);
  });

  test('modal=true suppresses Escape + backdrop close', async () => {
    const w = mount(Dialog, {
      props: { open: true, title: 'T', modal: true },
      attachTo: document.body,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const backdrop = document.querySelector('.cathode-dialog-backdrop') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.emitted('close')).toBeUndefined();
  });
});
