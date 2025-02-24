<script setup lang="ts">
import {
  AggregationType,
  CategoryResponse,
  Filter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { createSpatialFilter, WidgetStatus } from '../../utils';
import * as echarts from 'echarts';
import { computedAsync, templateRef } from '@vueuse/core';
import { RASTER_CATEGORY_MAP } from '../../rasterCategoryMap';

const props = withDefaults(
  defineProps<{
    data: Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>;
    /** Column containing category names. */
    column: string;
    /** Operation used to aggregate features in each category. */
    operation?: Exclude<AggregationType, 'custom'>;
    /** Map view state. If specified, widget will be filtered to the view. */
    viewState: MapViewState | undefined;
    /** Colors for the treemap. */
    colors: string[];
    /** Filter state. If specified, widget will be filtered. */
    filters?: Record<string, Filter>;
    /** Callback, to be invoked by the widget when its filters are set or cleared. */
    onFiltersChange?: (filters: Record<string, Filter>) => void;
  }>(),
  {
    column: '',
    operation: 'count',
    filters: () => ({}),
    onFiltersChange: () => {},
  },
);

const owner = ref<string>(crypto.randomUUID());
const status = ref<WidgetStatus>('loading');
const containerRef = templateRef<HTMLDivElement>('container');
const chartRef = ref<echarts.ECharts>();

const onClick = (params: echarts.ECElementEvent) => {
  if (params.componentType === 'series') {
    // filterViaHistogram(params.dataIndex);
  }
};

onMounted(() => {
  if (containerRef.value) {
    const chart = echarts.init(containerRef.value, null, {
      height: 200,
      width: 300,
    });
    chartRef.value = chart;
    chartRef.value?.on('click', onClick);
  } else {
    console.warn('Container element not found');
  }
});

onUnmounted(() => {
  if (chartRef.value) {
    chartRef.value?.dispose();
  }
});

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
    .catch((error) => {
      console.error(error);
      if (!abortController.signal.aborted) {
        status.value = 'error';
      }
      return [];
    });
}, []);

watchEffect(() => {
  const data = response.value;
  const colors = props.colors;
  if (data.length && colors.length) {
    const option = {
      tooltip: {},
      series: [
        {
          name: 'Cropland categories',
          type: 'treemap',
          data: data.map((c) => ({
            name: RASTER_CATEGORY_MAP[
              c.name as keyof typeof RASTER_CATEGORY_MAP
            ],
            value: c.value,
            itemStyle: {
              color: colors[Number(c.name)],
            },
          })),
          label: {
            show: true,
            color: 'white',
            textBorderColor: 'rgba(0, 0, 0, 0.5)',
            textBorderWidth: 3,
            fontSize: 10,
          },
          leafSize: 10,
        },
      ],
    };

    chartRef.value?.setOption(option);
  }
});
</script>
<template>
  <template v-if="status === 'loading'">
    <span class="title">Loading ...</span>
  </template>
  <template v-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>

  <div style="min-height: 220px; position: relative">
    <div ref="container"></div>
  </div>
</template>
