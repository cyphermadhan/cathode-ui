<script setup lang="ts">
import { ref, computed } from 'vue';

/**
 * Accordion — stack of expand/collapse sections. Controlled via
 * v-model:expandedIds; uncontrolled uses defaultExpandedIds.
 *
 * Content rendering is slot-based: each item's default slot receives
 * the item id to look up content, or pass content as item.content for
 * a simpler data-driven use.
 */
export interface AccordionItem {
  id: string;
  title: string;
  content?: string;
  meta?: string;
  disabled?: boolean;
}

interface Props {
  items: readonly AccordionItem[];
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  allowMultiple?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  defaultExpandedIds: () => [],
  allowMultiple: true,
});
const emit = defineEmits<{ 'update:expandedIds': [ids: readonly string[]] }>();

const internal = ref<readonly string[]>(props.defaultExpandedIds);
const expanded = computed<readonly string[]>(() => props.expandedIds ?? internal.value);

function toggle(id: string) {
  const isOpen = expanded.value.includes(id);
  let next: readonly string[];
  if (isOpen) {
    next = expanded.value.filter((x) => x !== id);
  } else if (props.allowMultiple) {
    next = [...expanded.value, id];
  } else {
    next = [id];
  }
  if (props.expandedIds === undefined) internal.value = next;
  emit('update:expandedIds', next);
}
</script>

<template>
  <div class="cathode-accordion">
    <div
      v-for="item in props.items"
      :key="item.id"
      class="cathode-accordion-item"
    >
      <button
        :id="`cathode-accordion-btn-${item.id}`"
        type="button"
        class="cathode-accordion-header"
        :aria-expanded="expanded.includes(item.id)"
        :aria-controls="`cathode-accordion-panel-${item.id}`"
        :disabled="item.disabled"
        :data-open="expanded.includes(item.id) ? 'true' : 'false'"
        @click="toggle(item.id)"
      >
        <span
          class="cathode-accordion-chevron"
          aria-hidden="true"
          :data-open="expanded.includes(item.id) ? 'true' : 'false'"
        >▸</span>
        <span class="cathode-accordion-title">{{ item.title }}</span>
        <span v-if="item.meta" class="cathode-accordion-meta">{{ item.meta }}</span>
      </button>
      <Transition name="cathode-accordion">
        <div
          v-if="expanded.includes(item.id)"
          :id="`cathode-accordion-panel-${item.id}`"
          role="region"
          :aria-labelledby="`cathode-accordion-btn-${item.id}`"
          class="cathode-accordion-panel"
          style="overflow: hidden"
        >
          <div class="cathode-accordion-body">
            <slot :item="item">{{ item.content }}</slot>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.cathode-accordion-enter-active,
.cathode-accordion-leave-active { transition: opacity 180ms ease; }
.cathode-accordion-enter-from,
.cathode-accordion-leave-to     { opacity: 0; }
</style>
