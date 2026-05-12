<script setup lang="ts">
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: readonly BreadcrumbItem[];
  separator?: string;
  ariaLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { separator: '›', ariaLabel: 'Breadcrumb' });
</script>

<template>
  <nav class="cathode-breadcrumbs" :aria-label="props.ariaLabel">
    <ol class="cathode-breadcrumbs-list">
      <li
        v-for="(item, i) in props.items"
        :key="i"
        class="cathode-breadcrumbs-item"
      >
        <a
          v-if="item.href && i !== props.items.length - 1"
          class="cathode-breadcrumbs-link"
          :href="item.href"
        >{{ item.label }}</a>
        <span
          v-else
          class="cathode-breadcrumbs-current"
          :aria-current="i === props.items.length - 1 ? 'page' : undefined"
        >{{ item.label }}</span>
        <span
          v-if="i !== props.items.length - 1"
          class="cathode-breadcrumbs-sep"
          aria-hidden="true"
        >{{ props.separator }}</span>
      </li>
    </ol>
  </nav>
</template>
