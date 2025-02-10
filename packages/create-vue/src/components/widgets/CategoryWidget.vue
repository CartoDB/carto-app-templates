<script setup lang="ts">
/**
 * Category widget, displaying one or more categories by name, with a horizontal 'meter'
 * representing the value (typically count) of each category.
 */

import { computed, ref } from 'vue';
import { computedAsync } from '@vueuse/core';
import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  CategoryResponse,
  Filter,
  FilterType,
  WidgetSource,
  removeFilter,
  getFilter,
  hasFilter,
} from '@carto/api-client';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';
import { useToggleFilter } from '../../hooks/useToggleFilter';

const props = withDefaults(
  defineProps<{
    /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
    data: Promise<{ widgetSource: WidgetSource }>;
    /** Column containing category names. */
    column: string;
    /** Operation used to aggregate features in each category. */
    operation?: Exclude<AggregationType, 'custom'>;
    /** Map view state. If specified, widget will be filtered to the view. */
    viewState: MapViewState | undefined;
    /** Filter state. If specified, widget will be filtered. */
    filters: Record<string, Filter> | undefined;
    /** Callback, to be invoked by the widget when its filters are set or cleared. */
    onFiltersChange: ((filters: Record<string, Filter>) => void) | undefined;
  }>(),
  {
    column: '',
    operation: 'count',
  },
);

const owner = ref<string>(crypto.randomUUID());
const status = ref<WidgetStatus>('loading');

// Fetches data for the widget to display, watching changes to filters,
// view state, and widget configuration to refresh.
const response = computedAsync<CategoryResponse>(async (onCancel) => {
  const column = props.column;
  const operation = props.operation;
  const viewState = props.viewState;
  const abortController = new AbortController();

  onCancel(() => abortController.abort());

  status.value = 'loading';

  return props.data
    .then(({ widgetSource }) =>
      widgetSource.getCategories({
        column,
        operation,
        spatialFilter: viewState && createSpatialFilter(viewState),
        abortController,
        filterOwner: owner.value,
      }),
    )
    .then((response) => {
      status.value = 'complete';
      return response;
    })
    .catch(() => {
      if (!abortController.signal.aborted) {
        status.value = 'error';
      }
      return [];
    });
}, []);

// Compute min/max over category values.
const minMax = computed<[number, number]>(() => {
  let min = Infinity;
  let max = -Infinity;
  for (const { value } of response.value) {
    min = Math.min(value, min);
    max = Math.max(value, max);
  }
  return [min, max];
});

// Set of selected (filtered) categories, for quick lookups while rendering.
const selectedCategories = computed(() => {
  const filter =
    props.filters &&
    getFilter(props.filters, {
      column: props.column,
      owner: owner.value,
      type: FilterType.IN,
    });
  return new Set((filter?.values || []) as string[]);
});

const toggleFilter = useToggleFilter({
  column: props.column,
  owner: owner.value,
  filters: props.filters,
  onChange: props.onFiltersChange,
});

function onClearFilters() {
  if (props.filters && props.onFiltersChange) {
    // Replace, not mutate, the filters object.
    props.onFiltersChange(
      removeFilter(
        { ...props.filters },
        {
          column: props.column,
          owner: owner.value,
        },
      ),
    );
  }
}
</script>

<template>
  <template v-if="status === 'loading'">
    <span class="title">...</span>
  </template>

  <template v-else-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>

  <template v-else>
    <ul class="category-list">
      <li
        v-for="row in response"
        :key="row.name"
        :class="{
          'category-item': true,
          selected: selectedCategories.has(row.name),
        }"
        @click="() => toggleFilter(row.name)"
      >
        <div class="category-item-row">
          <span class="category-item-label body1 strong">{{ row.name }}</span>
          <data class="category-item-value body1" :value="row.value">
            {{ numberFormatter.format(row.value) }}
          </data>
        </div>
        <div class="category-item-row">
          <meter
            class="category-item-meter"
            :min="minMax[0]"
            :max="minMax[1]"
            :value="row.value"
          ></meter>
        </div>
      </li>
    </ul>
    <button
      v-if="filters && onFiltersChange && hasFilter(filters, { column })"
      @click="onClearFilters"
    >
      Clear
    </button>
  </template>
</template>
