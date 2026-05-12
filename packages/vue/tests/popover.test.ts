import { describe, expect, test, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Popover from '../src/components/Popover.vue';

/** Track the active mount so afterEach can unmount cleanly — Popover
 *  attaches document-level mousedown + keydown listeners that survive
 *  bare `document.body.innerHTML = ''` teardown and trip the next test. */
let wrapper: VueWrapper | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = '';
});

function settle() { return new Promise((r) => setTimeout(r, 20)); }

function mountPop() {
  wrapper = mount(Popover, {
    slots: { trigger: '<button>open</button>', default: '<div class="probe">panel</div>' },
    attachTo: document.body,
  });
  return wrapper;
}

describe('Popover', () => {
  test('trigger click toggles panel', async () => {
    mountPop();
    expect(document.querySelector('.probe')).toBeNull();

    await wrapper!.find('span[role="button"]').trigger('click');
    await settle();
    expect(document.querySelector('.probe')).toBeTruthy();
  });

  test('outside click closes panel', async () => {
    mountPop();
    await wrapper!.find('span[role="button"]').trigger('click');
    await settle();
    expect(document.querySelector('.probe')).toBeTruthy();

    // Dispatch mousedown on <body> itself — outside trigger + portaled panel.
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await settle();
    expect(document.querySelector('.probe')).toBeNull();
  });

  test('Escape closes panel', async () => {
    mountPop();
    await wrapper!.find('span[role="button"]').trigger('click');
    await settle();
    expect(document.querySelector('.probe')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(document.querySelector('.probe')).toBeNull();
  });
});
