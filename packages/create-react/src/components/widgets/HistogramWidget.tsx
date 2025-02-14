import {
  AggregationType,
  Filter,
  HistogramResponse,
  WidgetSourceProps,
} from '@carto/api-client';
import { WidgetSource } from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** Filter state. If specified, widget will be filtered. */
  filters?: Record<string, Filter>;
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange?: (filters: Record<string, Filter>) => void;
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState?: MapViewState;
}

export function HistogramWidget({
  data,
  column,
  operation,
  ticks,
  viewState,
}: HistogramWidgetProps) {
  const [owner] = useState<string>(crypto.randomUUID());
  const [status, setStatus] = useState<WidgetStatus>('complete');
  const chartRef = useRef<echarts.ECharts | null>(null);

  const createChart = useCallback((ref: HTMLDivElement | null) => {
    const onClick = (params: echarts.ECElementEvent) => {
      if (params.componentType === 'series') {
        // filterViaHistogram(params.dataIndex);
      }
    };

    if (ref && !chartRef.current) {
      const chart = echarts.init(ref, null, { height: 200, width: 300 });
      chartRef.current = chart;
      chartRef.current?.on('click', onClick);
    }
  }, []);

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
          data: ticks,
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
  }, [data, column, operation, ticks, viewState, owner]);

  // function onClearFilters() {
  //   if (filters && onFiltersChange) {
  //     // Replace, not mutate, the filters object.
  //     onFiltersChange(removeFilter({ ...filters }, { column, owner }));
  //   }
  // }

  // function filterViaHistogram(dataIndex: number) {
  //   // clearFiltersButton.style.display = 'inherit';

  //   // removeFilter(filters, {
  //   //   column: 'streamOrder'
  //   // });

  //   // const minValue = histogramTicks[dataIndex];
  //   // const maxValue = histogramTicks[dataIndex + 1] - 0.0001;

  //   // if (dataIndex === histogramTicks.length - 1) {
  //   //   // For the last category (> 600), use CLOSED_OPEN
  //   //   addFilter(filters, {
  //   //     column: 'streamOrder',
  //   //     type: FilterType.CLOSED_OPEN,
  //   //     values: [[minValue, Infinity]]
  //   //   });
  //   // } else {
  //   //   // For first and middle categories, use BETWEEN
  //   //   addFilter(filters, {
  //   //     column: 'streamOrder',
  //   //     type: FilterType.BETWEEN,
  //   //     values: [[minValue, maxValue]]
  //   //   });
  //   // }

  //   // initialize();
  // }

  // if (status === 'loading') {
  //   return <span className="title">...</span>;
  // }

  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

  // if (!response || !response.length) {
  //   return <span className="title">No data</span>;
  // }

  return <div ref={createChart} style={{ minHeight: '260px' }}></div>;
}
