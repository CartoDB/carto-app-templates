<script setup lang="ts">
/**
 * Histogram widget, displaying a histogram of a numeric column.
 */

import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { computedAsync, templateRef } from '@vueuse/core';
import { MapViewState } from '@deck.gl/core';

import {
  createSpatialFilter,
  WidgetStatus,
} from '../../utils';
// import { useToggleFilter } from '../../hooks/useToggleFilter';
import { AggregationType, Filter, HistogramResponse, WidgetSource, WidgetSourceProps } from '@carto/api-client';
import * as echarts from 'echarts';


const props = withDefaults(
  defineProps<{
    /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
    data: Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>;
    /** Column containing a value to be aggregated. */
    column: string;
    /** Operation used to aggregate the specified column. */
    operation?: Exclude<AggregationType, 'custom'>;
    /** Ticks to use for the histogram calculation. */
    ticks: number[];
    /** Filter state. If specified, widget will be filtered. */
    filters?: Record<string, Filter>;
    /** Callback, to be invoked by the widget when its filters are set or cleared. */
    onFiltersChange?: (filters: Record<string, Filter>) => void;
    /** Map view state. If specified, widget will be filtered to the view. */
    viewState: MapViewState;
  }>(),
  {
    column: '',
    operation: 'count',
    filters: () => ({}),
    onFiltersChange: () => {},
  },
);

function getOption(data: HistogramResponse) {
  console.log(data, props.ticks);
  const option = {
    tooltip: {
      // trigger: 'axis',
      // axisPointer: {
      //   type: 'shadow'
      // }
    },
    grid: {
      left: 60,
      right: 30,
      top: 20,
      bottom: 20,
      width: 'auto',
      height: 'auto'
    },
    xAxis: {
      type: 'category',
      data: props.ticks.map(String),
      // axisLabel: {
      //   interval: 4 // Show every 5th label
      // },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      // axisLabel: {
      //   formatter: (value: number) =>
      //     Intl.NumberFormat('en-US', {compactDisplay: 'short', notation: 'compact'}).format(value)
      // }
    },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data,
        itemStyle: {
          color: '#3398DB'
        }
      }
    ]
  };
  return option;
}

const owner = ref<string>(crypto.randomUUID());
const status = ref<WidgetStatus>('loading');
const containerRef = templateRef<HTMLDivElement>('container');
const chartRef = ref<echarts.ECharts>();

const onClick = (params: echarts.ECElementEvent) => {
  if (params.componentType === 'series') {
    // filterViaHistogram(params.dataIndex);
  }
}

onMounted(() => {
  if (containerRef.value) {
    const chart = echarts.init(containerRef.value, null, { height: 200, width: 300 });
    chartRef.value = chart;
    chartRef.value?.on('click', onClick);
  } else {
    console.warn('Container element not found');
  }
})

onUnmounted(() => {
  if (chartRef.value) {
    chartRef.value?.dispose();
  }
})

const response = computedAsync<HistogramResponse>(async (onCancel) => {
  const column = props.column;
  const operation = props.operation;
  const ticks = props.ticks;
  const viewState = props.viewState;
  const abortController = new AbortController();

  onCancel(() => abortController.abort());

  status.value = 'loading';
  
  return props.data
    .then(({ widgetSource }) =>
      widgetSource.getHistogram({
        column,
        operation,
        ticks,
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
});

watch(response, (value) => {
  if (value) {
    chartRef.value?.setOption(getOption(value));
  }
})

</script>
<template>
  <template v-if="status === 'loading'">
    <span class="title">Loading ...</span>
  </template>
  <template v-else-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>
  
  <div style="min-height: 260px; position: relative;">
    <div ref="container"></div>
  </div>
</template>