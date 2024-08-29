<script setup lang="ts">
import { ref } from 'vue';
import { computedAsync } from '@vueuse/core';
import { MapViewState } from '@deck.gl/core';
import { AggregationType, WidgetSource } from '@carto/api-client';
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

const value = computedAsync(async (onCancel) => {
  const column = props.column;
  const operation = props.operation;
  const viewState = props.viewState;
  const abortController = new AbortController();

  onCancel(() => abortController.abort());

  status.value = 'loading';

  return props.data
    .then(({ widgetSource }) =>
      widgetSource.getFormula({
        column,
        operation,
        spatialFilter: viewState && createSpatialFilter(viewState),
        abortController,
      }),
    )
    .then((response) => {
      status.value = 'complete';
      return response.value;
    })
    .catch(() => {
      if (!abortController.signal.aborted) {
        status.value = 'error';
      }
      return -1;
    });
}, -1);
</script>

<template>
  <template v-if="status === 'loading'">
    <span class="title">...</span>
  </template>

  <template v-else-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>

  <template v-else>
    <data class="title" :value="value"
      >{{ numberFormatter.format(value) }}
    </data>
  </template>
</template>
