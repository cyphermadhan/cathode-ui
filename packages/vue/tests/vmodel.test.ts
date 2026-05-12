import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import Toggle from '../src/components/Toggle.vue';
import Checkbox from '../src/components/Checkbox.vue';
import RadioGroup from '../src/components/RadioGroup.vue';
import Counter from '../src/components/Counter.vue';
import Tabs from '../src/components/Tabs.vue';
import Pagination from '../src/components/Pagination.vue';

// Every Cathode input exposes v-model, which in Vue 3 compiles to a
// `modelValue` prop + `update:modelValue` emit. These tests verify the
// emit fires with the right next value on click / keyboard / arrow.

describe('v-model roundtrip', () => {
  test('Toggle flips on click', async () => {
    const w = mount(Toggle, { props: { modelValue: false, label: 'ENABLE' } });
    await w.find('button[role="switch"]').trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  test('Toggle respects disabled', async () => {
    const w = mount(Toggle, { props: { modelValue: false, disabled: true, label: 'X' } });
    await w.find('button[role="switch"]').trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  test('Checkbox flips on change', async () => {
    const w = mount(Checkbox, { props: { modelValue: false, label: 'X' } });
    await w.find('input[type="checkbox"]').trigger('change');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  test('RadioGroup emits the selected value', async () => {
    const w = mount(RadioGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
    });
    const inputs = w.findAll('input[type="radio"]');
    await inputs[1].trigger('change');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  test('Counter increments + decrements within bounds', async () => {
    const w = mount(Counter, { props: { modelValue: 5, min: 0, max: 10, step: 1 } });
    const [dec, inc] = w.findAll('button.cathode-counter-btn');
    await inc.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([6]);
    await dec.trigger('click');
    expect(w.emitted('update:modelValue')?.[1]).toEqual([4]);
  });

  test('Counter clamps at min', async () => {
    const w = mount(Counter, { props: { modelValue: 0, min: 0, max: 10, step: 1 } });
    const [dec] = w.findAll('button.cathode-counter-btn');
    expect((dec.element as HTMLButtonElement).disabled).toBe(true);
    await dec.trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  test('Tabs emits on select', async () => {
    const w = mount(Tabs, {
      props: {
        modelValue: 'a',
        items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
      },
    });
    const tabs = w.findAll('button[role="tab"]');
    await tabs[1].trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  test('Tabs no-op when clicking active tab', async () => {
    const w = mount(Tabs, {
      props: {
        modelValue: 'a',
        items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
      },
    });
    const tabs = w.findAll('button[role="tab"]');
    await tabs[0].trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  test('Pagination prev + next arrows', async () => {
    const w = mount(Pagination, { props: { modelValue: 5, totalPages: 12 } });
    const prev = w.find('button.cathode-pagination-arrow:first-of-type');
    const next = w.findAll('button.cathode-pagination-arrow').at(-1)!;
    await prev.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual([4]);
    await next.trigger('click');
    expect(w.emitted('update:modelValue')?.[1]).toEqual([6]);
  });

  test('Pagination clamps at boundaries', async () => {
    const w = mount(Pagination, { props: { modelValue: 1, totalPages: 12 } });
    const prev = w.find('button.cathode-pagination-arrow:first-of-type');
    expect((prev.element as HTMLButtonElement).disabled).toBe(true);
  });
});
