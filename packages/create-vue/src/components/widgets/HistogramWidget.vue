<script setup lang="ts">
/**
 * Histogram widget, displaying a histogram of a numeric column.
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { computedAsync, templateRef } from '@vueuse/core';
import { MapViewState } from '@deck.gl/core';

import { createSpatialFilter, WidgetStatus } from '../../utils';
// import { useToggleFilter } from '../../hooks/useToggleFilter';
import {
  addFilter,
  AggregationType,
  Filter,
  FilterType,
  hasFilter,
  HistogramResponse,
  removeFilter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
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
    /** Minimum value to use for the histogram calculation. */
    min: number;
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
      height: 'auto',
    },
    xAxis: {
      type: 'category',
      data: [props.min, ...props.ticks].map(String),
      // axisLabel: {
      //   interval: 4 // Show every 5th label
      // },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) =>
          Intl.NumberFormat('en-US', {
            compactDisplay: 'short',
            notation: 'compact',
          }).format(value),
      },
    },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data,
        itemStyle: {
          color: '#3398DB',
        },
      },
    ],
  };
  return option;
}

const owner = ref<string>(crypto.randomUUID());
const status = ref<WidgetStatus>('loading');
const containerRef = templateRef<HTMLDivElement>('container');
const chartRef = ref<echarts.ECharts>();

const _hasFilter = computed(() => {
  return hasFilter(props.filters, {
    column: props.column,
    owner: owner.value,
  });
});

const onClick = (params: echarts.ECElementEvent) => {
  const filters = props.filters;
  const onFiltersChange = props.onFiltersChange;
  const column = props.column;
  const _owner = owner.value;
  const ticks = props.ticks;

  if (params.componentType === 'series') {
    let newFilters = removeFilter(filters, {
      column,
      owner: _owner,
    });

    const dataIndex = params.dataIndex;
    const minValue = ticks[dataIndex];
    const maxValue = ticks[dataIndex + 1] - 0.0001;

    if (dataIndex === ticks.length - 1) {
      // For the last category, use CLOSED_OPEN
      newFilters = addFilter(filters, {
        column,
        type: FilterType.CLOSED_OPEN,
        values: [[minValue, Infinity]],
        owner: _owner,
      });
    } else {
      // For first and middle categories, use BETWEEN
      newFilters = addFilter(filters, {
        column,
        type: FilterType.BETWEEN,
        values: [[minValue, maxValue]],
        owner: _owner,
      });
    }

    onFiltersChange?.({ ...newFilters });
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

const response = computedAsync<HistogramResponse>(async (onCancel) => {
  const column = props.column;
  const operation = props.operation;
  const ticks = props.ticks;
  const viewState = props.viewState;
  const filters = props.filters;
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
        signal: abortController.signal,
        filterOwner: owner.value,
        filters,
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
    <span class="title">Loading ...</span>
  </template>
  <template v-else-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>
  <template v-if="_hasFilter">
    <button style="margin-left: auto; display: block" @click="onClearFilters">
      Clear filter
    </button>
  </template>

  <div style="min-height: 260px; position: relative">
    <div ref="container"></div>
  </div>
</template>
