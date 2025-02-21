import { AggregationType, CategoryResponse, Filter, WidgetSource, WidgetSourceProps } from "@carto/api-client";
import { MapViewState } from "@deck.gl/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSpatialFilter, WidgetStatus } from "../../utils";
import * as echarts from 'echarts';
import { RASTER_CATEGORY_MAP } from "../../rasterCategoryMap";

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
  filters?: Record<string, Filter>;
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange?: (filters: Record<string, Filter>) => void;
}

export default function TreeWidget({
  data,
  column,
  operation,
  operationColumn,
  viewState,
  colors,
}: TreeWidgetProps) {
  const [owner] = useState<string>(crypto.randomUUID());
  const [status, setStatus] = useState<WidgetStatus>('complete');
  const chartRef = useRef<echarts.ECharts | null>(null);

  // Initialize echarts when container is mounted
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

  // recreate the chart options when the data changes
  useEffect(() => {
    const abortController = new AbortController();
    chartRef.current?.showLoading();

    function getOption(response: CategoryResponse) {
      return {
        tooltip: {},
        series: [
          {
            name: 'Cropland categories',
            type: 'treemap',
            data: response.map((c) => ({
              name: RASTER_CATEGORY_MAP[c.name as keyof typeof RASTER_CATEGORY_MAP],
              value: c.value,
              itemStyle: {
                color: colors[Number(c.name)]
              },
            })),
            label: {
              show: true,
              color: 'white',
              textBorderColor: 'rgba(0, 0, 0, 0.5)',
              textBorderWidth: 3,
              fontSize: 10,
            },
            leafSize: 10
          }
        ]
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
  }, [data, column, operation, operationColumn, colors, viewState, owner]);

  // display an error message if the data fails to load
  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

  // render the treemap container
  return <div ref={createChart} style={{ minHeight: '220px' }}></div>;
}
