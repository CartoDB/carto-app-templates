<script setup lang="ts">
import { computed, ref } from 'vue';
import { computedAsync } from '@vueuse/core';
import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  CategoryResponse,
  WidgetSource,
} from '@carto/api-client';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';

const props = withDefaults(
  defineProps<{
    data: Promise<{ widgetSource: WidgetSource }>;
    column?: string;
    operation?: AggregationType;
    viewState?: MapViewState;
  }>(),
  {
    column: '',
    operation: 'count',
  },
);

const status = ref<WidgetStatus>('loading');

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

const minMax = computed<[number, number]>(() => {
  let min = Infinity;
  let max = -Infinity;
  for (const { value } of response.value) {
    min = Math.min(value, min);
    max = Math.max(value, max);
  }
  return [min, max];
});
</script>

<template>
  <template v-if="status === 'loading'">
    <span class="title">...</span>
  </template>

  <template v-else-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>

  <template v-else>
    <ul className="category-list">
      <li v-for="row in response" :key="row.name" class="category-item">
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
  </template>
</template>
