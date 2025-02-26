import {
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  addFilter,
  AggregationType,
  Filters,
  FilterType,
  hasFilter,
  HistogramResponse,
  removeFilter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { createSpatialFilter, WidgetStatus } from '../../../utils';
import * as echarts from 'echarts';

function getOption(data: HistogramResponse, min: number, ticks: number[]) {
  const option = {
    tooltip: {
      // trigger: 'axis',
      // axisPointer: {
      //   type: 'shadow'
      // }
    },
    grid: {
      left: 30,
      right: 20,
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

@Component({
  selector: 'histogram-widget',
  standalone: true,
  template: `
    @if (status() === 'loading') {
      <span class="title">Loading ...</span>
    }
    @if (status() === 'error') {
      <span class="title">⚠ Error</span>
    }
    @if (isFiltering()) {
      <button style="margin-left: auto; display: block" (click)="clearFilters()">
        Clear filter
      </button>
    }
    <div style="min-height: 200px; position: relative">
      <div id="histogram-container" #container></div>
    </div>
  `,
})
export class HistogramWidgetComponent {
  @ViewChild('container') histogramContainer?: ElementRef<HTMLDivElement>;

  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data =
    input.required<
      Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>
    >();
  /** Column containing a value to be aggregated. */
  column = input.required<string>();
  /** Operation used to aggregate the specified column. */
  operation = input<Exclude<AggregationType, 'custom'>>();
  /** Ticks to use for the histogram calculation. */
  ticks = input.required<number[]>();
  /** Minimum value to use for the histogram calculation. */
  min = input.required<number>();
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState = input<MapViewState>();
  /** Filter state. If specified, widget will be filtered. */
  filters = input<Filters>({});
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange = output<Filters>();

  owner = crypto.randomUUID();
  status = signal<WidgetStatus>('loading');
  response = signal<HistogramResponse>([]);

  chart: echarts.ECharts | null = null;

  ngAfterViewInit() {
    const container = this.histogramContainer?.nativeElement;
    if (container) {
      this.chart = echarts.init(container, null, {
        height: 200,
        width: 300,
      });
      this.chart.on('click', (params) => {
        if (params.componentType === 'series') {
          this.applyFilter(params.dataIndex);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  applyFilter(dataIndex: number) {
    const filters = this.filters();
    const column = this.column();
    const ticks = this.ticks();

    let newFilters = removeFilter(filters, {
      column,
      owner: this.owner,
    });

    const minValue = ticks[dataIndex];
    const maxValue = ticks[dataIndex + 1] - 0.0001;

    if (dataIndex === ticks.length - 1) {
      // For the last category, use CLOSED_OPEN
      newFilters = addFilter(filters, {
        column,
        type: FilterType.CLOSED_OPEN,
        values: [[minValue, Infinity]],
        owner: this.owner,
      });
    } else {
      // For first and middle categories, use BETWEEN
      newFilters = addFilter(filters, {
        column,
        type: FilterType.BETWEEN,
        values: [[minValue, maxValue]],
        owner: this.owner,
      });
    }

    this.onFiltersChange.emit({ ...newFilters });
  }

  isFiltering() {
    return hasFilter(this.filters(), { column: this.column(), owner: this.owner });
  }

  clearFilters() {
    // Replace, not mutate, the filters object.
    this.onFiltersChange.emit(
      removeFilter(
        { ...this.filters() },
        {
          column: this.column(),
          owner: this.owner,
        },
      ),
    );
  }

  private dataEffect = effect(
    (onCleanup) => {
      const column = this.column();
      const operation = this.operation();
      const ticks = this.ticks();
      const viewState = this.viewState();
      const filters = this.filters();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) => {
          return widgetSource.getHistogram({
            column,
            operation,
            ticks,
            abortController,
            spatialFilter: viewState && createSpatialFilter(viewState),
            filterOwner: this.owner,
            filters,
          });
        })
        .then((response) => {
          this.status.set('complete');
          this.response.set(response);
        })
        .catch((error) => {
          console.error(error);
          if (!abortController.signal.aborted) {
            this.status.set('error');
          }
          this.response.set([]);
        });
    },
    { allowSignalWrites: true },
  );

  private updateChartEffect = effect(() => {
    const data = this.response();
    const min = this.min();
    const ticks = this.ticks();
    if (this.chart) {
      this.chart.setOption(getOption(data, min, ticks));
    }
  });
}
