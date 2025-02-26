import {
  addFilter,
  AggregationType,
  Filters,
  FilterType,
  hasFilter,
  HistogramResponse,
  removeFilter,
  WidgetSourceProps,
} from '@carto/api-client';
import { WidgetSource } from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSpatialFilter, WidgetStatus } from '../../utils';
import * as echarts from 'echarts';

export interface HistogramWidgetProps {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data: Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>;
  /** Column containing a value to be aggregated. */
  column: string;
  /** Operation used to aggregate the specified column. */
  operation?: Exclude<AggregationType, 'custom'>;
  /** Ticks to use for the histogram calculation. */
  ticks: number[];
  /** Minimum value to use for the histogram calculation. */
  min?: number;
  /** Filter state. If specified, widget will be filtered. */
  filters?: Filters;
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange?: (filters: Filters) => void;
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState?: MapViewState;
}

const EMPTY_OBJ = {};

export function HistogramWidget({
  data,
  column,
  operation,
  ticks,
  min,
  viewState,
  filters = EMPTY_OBJ,
  onFiltersChange,
}: HistogramWidgetProps) {
  const [owner] = useState<string>(crypto.randomUUID());
  const [status, setStatus] = useState<WidgetStatus>('complete');
  const chartRef = useRef<echarts.ECharts | null>(null);

  const _hasFilter = useMemo(() => {
    return hasFilter(filters, {
      column,
      owner,
    });
  }, [filters, column, owner]);

  const createChart = useCallback(
    (ref: HTMLDivElement | null) => {
      function applyFilter(dataIndex: number) {
        let newFilters = removeFilter(filters, {
          column,
          owner,
        });

        const minValue = ticks[dataIndex];
        const maxValue = ticks[dataIndex + 1] - 0.0001;

        if (dataIndex === ticks.length - 1) {
          // For the last category, use CLOSED_OPEN
          newFilters = addFilter(filters, {
            column,
            type: FilterType.CLOSED_OPEN,
            values: [[minValue, Infinity]],
            owner,
          });
        } else {
          // For first and middle categories, use BETWEEN
          newFilters = addFilter(filters, {
            column,
            type: FilterType.BETWEEN,
            values: [[minValue, maxValue]],
            owner,
          });
        }

        onFiltersChange?.({ ...newFilters });
      }

      const onClick = (params: echarts.ECElementEvent) => {
        if (params.componentType === 'series') {
          applyFilter(params.dataIndex);
        }
      };

      if (ref && !chartRef.current) {
        const chart = echarts.init(ref, null, { height: 200, width: 300 });
        chartRef.current = chart;
        chartRef.current?.on('click', onClick);
      }
    },
    [onFiltersChange, column, filters, owner, ticks],
  );

  // Fetches data for the widget to display, watching changes to filters,
  // view state, and widget configuration to refresh.
  useEffect(() => {
    const abortController = new AbortController();
    chartRef.current?.showLoading();

    function getOption(data: HistogramResponse) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
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
          data: [min, ...ticks],
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

    data
      .then(({ widgetSource }) =>
        widgetSource.getHistogram({
          column,
          operation,
          ticks,
          spatialFilter: viewState && createSpatialFilter(viewState),
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
  }, [data, filters, column, operation, ticks, viewState, min, owner]);

  function clearFilters() {
    const newFilters = removeFilter(filters, {
      column,
      owner,
    });
    onFiltersChange?.({ ...newFilters });
  }

  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

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
      <div ref={createChart} style={{ minHeight: '260px' }}></div>
    </div>
  );
}
