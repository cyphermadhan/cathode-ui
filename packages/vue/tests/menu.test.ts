import { describe, expect, test, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Menu from '../src/components/Menu.vue';

/** Menu, like Popover, attaches document-level mousedown + keydown
 *  listeners that outlive a bare `document.body.innerHTML = ''`
 *  teardown and then fire on the next test's DOM. Track the wrapper
 *  so afterEach unmounts cleanly. */
let wrapper: VueWrapper | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = '';
});

function settle() { return new Promise((r) => setTimeout(r, 20)); }

const items = [
  { label: 'DUPLICATE' },
  { label: 'EXPORT' },
  { label: 'DELETE', kind: 'danger' as const },
];

function mountMenu() {
  wrapper = mount(Menu, {
    props: { items },
    slots: { trigger: '<button>⋯</button>' },
    attachTo: document.body,
  });
  return wrapper;
}

async function openMenu() {
  await wrapper!.find('.cathode-menu [role="button"]').trigger('click');
  await settle();
}

describe('Menu', () => {
  test('opens on trigger click + portals list into body', async () => {
    mountMenu();
    await openMenu();
    expect(document.querySelector('.cathode-menu-list[role="menu"]')).toBeTruthy();
    expect(document.querySelectorAll('button.cathode-menu-item').length).toBe(3);
  });

  test('ArrowDown / ArrowUp cycle focus, Enter emits select', async () => {
    mountMenu();
    await openMenu();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await settle();
    const btns1 = document.querySelectorAll('button.cathode-menu-item');
    expect((btns1[0] as HTMLElement).getAttribute('data-focus')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await settle();
    const btns2 = document.querySelectorAll('button.cathode-menu-item');
    expect((btns2[1] as HTMLElement).getAttribute('data-focus')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await settle();
    expect(wrapper!.emitted('select')?.[0]?.[0]).toEqual(items[1]);
  });

  test('Escape closes the menu', async () => {
    mountMenu();
    await openMenu();
    expect(document.querySelector('.cathode-menu-list')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(document.querySelector('.cathode-menu-list')).toBeNull();
  });

  test('clicking an item emits select + closes', async () => {
    mountMenu();
    await openMenu();

    const target = document.querySelectorAll('button.cathode-menu-item')[2] as HTMLElement;
    target.click();
    await settle();

    expect(wrapper!.emitted('select')?.[0]).toEqual([items[2], 2]);
    expect(document.querySelector('.cathode-menu-list')).toBeNull();
  });
});
