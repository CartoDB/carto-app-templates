<script setup lang="ts">
import {
addFilter,
  AggregationType,
  CategoryResponse,
  Filter,
  FilterType,
  hasFilter,
  removeFilter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
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

  if (params.componentType === 'series') {
    const category = params.name;
    const entry = Object.entries(RASTER_CATEGORY_MAP).find(
      (entry) => entry[1] === category,
    );
    if (entry) {
      const value = Number(entry[0]);
      const newFilters = addFilter(filters, {
        column,
        type: FilterType.IN,
        values: [value],
        owner: _owner,
      });
      onFiltersChange?.({ ...newFilters });
    } else {
      const newFilters = removeFilter(filters, {
        column,
        owner: _owner,
      });
      onFiltersChange?.({ ...newFilters });
    }
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
  const filters = props.filters;
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
        filters,
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
  <template v-if="status === 'error'">
    <span class="title">⚠ Error</span>
  </template>
  <template v-if="_hasFilter">
    <button style="margin-left: auto; display: block" @click="onClearFilters">
      Clear filter
    </button>
  </template>
  <div style="min-height: 220px; position: relative">
    <div ref="container"></div>
  </div>
</template>
