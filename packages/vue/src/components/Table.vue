<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { CSSProperties } from 'vue';

export interface TableColumn<T> {
  key: keyof T & string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  sortable?: boolean;
}

// Export the props interface so vue-tsc's generated declaration can
// reference it without the "private name" TS4082 error that shows up
// when the generic `T` escapes an unexported interface.
export interface TableProps<T extends Record<string, unknown>> {
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  sortBy?: keyof T & string;
  sortDir?: 'asc' | 'desc';
  emptyText?: string;
  caption?: string;
  showCaption?: boolean;
  rowClickable?: boolean;
}
const props = withDefaults(defineProps<TableProps<T>>(), {
  sortDir: 'asc',
  emptyText: 'NO DATA',
});
const emit = defineEmits<{
  sortChange: [key: keyof T & string, dir: 'asc' | 'desc'];
  rowClick:   [row: T, index: number];
}>();

function headerClick(col: TableColumn<T>) {
  if (!col.sortable) return;
  const nextDir = props.sortBy === col.key && props.sortDir === 'asc' ? 'desc' : 'asc';
  emit('sortChange', col.key, nextDir);
}
function cellStyle(col: TableColumn<T>): CSSProperties {
  return { textAlign: col.align ?? 'left' };
}
function headerStyle(col: TableColumn<T>): CSSProperties {
  return {
    textAlign: col.align ?? 'left',
    width: typeof col.width === 'number' ? `${col.width}px` : col.width,
  };
}
function ariaSort(col: TableColumn<T>): 'ascending' | 'descending' | undefined {
  if (props.sortBy !== col.key) return undefined;
  return props.sortDir === 'asc' ? 'ascending' : 'descending';
}
function onRowClick(row: T, i: number) {
  if (props.rowClickable) emit('rowClick', row, i);
}
function onRowKey(row: T, i: number, e: KeyboardEvent) {
  if (!props.rowClickable) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    emit('rowClick', row, i);
  }
}
</script>

<template>
  <table class="cathode-table">
    <caption
      v-if="props.caption"
      class="cathode-table-caption"
      :data-visible="props.showCaption ? 'true' : 'false'"
    >{{ props.caption }}</caption>
    <thead>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
          class="cathode-table-th"
          scope="col"
          :style="headerStyle(col)"
          :aria-sort="ariaSort(col)"
        >
          <button
            v-if="col.sortable"
            type="button"
            class="cathode-table-sort"
            :data-sorted="props.sortBy === col.key ? 'true' : 'false'"
            @click="headerClick(col)"
          >
            {{ col.header }}
            <span
              v-if="props.sortBy === col.key"
              aria-hidden="true"
              class="cathode-table-sort-arrow"
            >{{ props.sortDir === 'asc' ? '▴' : '▾' }}</span>
          </button>
          <template v-else>{{ col.header }}</template>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="props.rows.length === 0">
        <td class="cathode-table-empty" :colspan="props.columns.length">{{ props.emptyText }}</td>
      </tr>
      <tr
        v-else
        v-for="(row, i) in props.rows"
        :key="i"
        class="cathode-table-row"
        :data-clickable="props.rowClickable ? 'true' : 'false'"
        :tabindex="props.rowClickable ? 0 : undefined"
        @click="onRowClick(row, i)"
        @keydown="(e) => onRowKey(row, i, e)"
      >
        <td
          v-for="col in props.columns"
          :key="col.key"
          class="cathode-table-td"
          :style="cellStyle(col)"
        >
          <slot :name="`cell-${col.key}`" :row="row" :index="i" :value="row[col.key]">
            {{ row[col.key] ?? '' }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
