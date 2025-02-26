import {
  addFilter,
  AggregationType,
  CategoryResponse,
  Filters,
  FilterType,
  hasFilter,
  removeFilter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSpatialFilter, WidgetStatus } from '../../utils';
import * as echarts from 'echarts';
import { RASTER_CATEGORY_MAP } from '../../rasterCategoryMap';

export interface TreeWidgetProps {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data: Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>;
  /** Column containing category names. */
  column: string;
  /** Operation used to aggregate features in each category. */
  operation?: Exclude<AggregationType, 'custom'>;
  /** Column containing a value to be aggregated. */
  operationColumn?: string;
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState?: MapViewState;
  /** Colors for the treemap. */
  colors: string[];
  /** Filter state. If specified, widget will be filtered. */
  filters?: Filters;
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange?: (filters: Filters) => void;
}

const EMPTY_OBJ = {};

export default function TreeWidget({
  data,
  column,
  operation,
  operationColumn,
  viewState,
  colors,
  filters = EMPTY_OBJ,
  onFiltersChange,
}: TreeWidgetProps) {
  const [owner] = useState<string>(crypto.randomUUID());
  const [status, setStatus] = useState<WidgetStatus>('complete');
  const chartRef = useRef<echarts.ECharts | null>(null);

  const _hasFilter = useMemo(() => {
    return hasFilter(filters, {
      column,
      owner,
    });
  }, [filters, column, owner]);

  // Initialize echarts when container is mounted
  const createChart = useCallback(
    (ref: HTMLDivElement | null) => {
      const onClick = (params: echarts.ECElementEvent) => {
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
              owner,
            });
            onFiltersChange?.({ ...newFilters });
          } else {
            const newFilters = removeFilter(filters, {
              column,
              owner,
            });
            onFiltersChange?.({ ...newFilters });
          }
        }
      };

      if (ref && !chartRef.current) {
        const chart = echarts.init(ref, null, { height: 200, width: 300 });
        chartRef.current = chart;
        chartRef.current?.on('click', onClick);
      }
    },
    [owner, column, filters, onFiltersChange],
  );

  // recreate the chart options when the data changes
  useEffect(() => {
    const abortController = new AbortController();
    chartRef.current?.showLoading();

    function getOption(response: CategoryResponse) {
      const total = response.reduce((sum, c) => sum + c.value, 0);
      return {
        tooltip: {
          formatter: (params: { name: string; value: number }) => {
            const percentage = ((params.value / total) * 100).toFixed(1);
            return `${
              params.name
            }<br/>Count: ${params.value.toLocaleString()}<br/>Percentage: ${percentage}%`;
          },
        },
        series: [
          {
            name: 'Cropland categories',
            type: 'treemap',
            data: response.map((c) => ({
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
    }

    data
      .then(({ widgetSource }) =>
        widgetSource.getCategories({
          column,
          operation,
          operationColumn,
          spatialFilter: viewState && createSpatialFilter(viewState),
          spatialIndexReferenceViewState: viewState,
          abortController,
          filterOwner: owner,
          filters,
        }),
      )
      .then((response) => {
        setStatus('complete');
        chartRef.current?.hideLoading();
        chartRef.current?.setOption(getOption(response));
      })
      .catch(() => {
        chartRef.current?.hideLoading();
        if (!abortController.signal.aborted) {
          setStatus('error');
        }
      });

    return () => abortController.abort();
  }, [
    data,
    filters,
    column,
    operation,
    operationColumn,
    colors,
    viewState,
    owner,
  ]);

  function clearFilters() {
    const newFilters = removeFilter(filters, {
      column,
      owner,
    });
    onFiltersChange?.({ ...newFilters });
  }

  // display an error message if the data fails to load
  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

  // render the treemap container
  return (
    <div>
      {_hasFilter && (
        <button
          style={{ marginLeft: 'auto', display: 'block' }}
          onClick={clearFilters}
        >
          Clear filter
        </button>
      )}
      <div ref={createChart} style={{ minHeight: '220px' }}></div>
    </div>
  );
}
