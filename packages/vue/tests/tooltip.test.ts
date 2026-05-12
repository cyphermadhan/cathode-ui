import { describe, expect, test, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Tooltip from '../src/components/Tooltip.vue';

afterEach(() => { document.body.innerHTML = ''; });

describe('Tooltip', () => {
  test('hover after delay shows tooltip', async () => {
    mount(Tooltip, {
      props: { label: 'HINT', delay: 20 },
      slots: { default: '<span class="target">hover me</span>' },
      attachTo: document.body,
    });
    // Pre-hover: body does NOT contain the tooltip text.
    expect(document.body.textContent?.includes('HINT') && document.querySelector('[role="tooltip"]')).toBeFalsy();

    const anchor = document.querySelector('.cathode-tooltip-anchor') as HTMLElement;
    anchor.dispatchEvent(new MouseEvent('mouseenter'));

    // Short delay — allow Tooltip's setTimeout + nextTick.
    await new Promise((r) => setTimeout(r, 80));
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('HINT');
  });

  test('mouseleave before delay prevents open', async () => {
    mount(Tooltip, {
      props: { label: 'HINT', delay: 50 },
      slots: { default: '<span>hover me</span>' },
      attachTo: document.body,
    });
    const anchor = document.querySelector('.cathode-tooltip-anchor') as HTMLElement;
    anchor.dispatchEvent(new MouseEvent('mouseenter'));
    // Leave before delay elapses.
    anchor.dispatchEvent(new MouseEvent('mouseleave'));

    await new Promise((r) => setTimeout(r, 80));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
