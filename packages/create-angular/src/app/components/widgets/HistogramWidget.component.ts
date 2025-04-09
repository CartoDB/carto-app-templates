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
  AggregationType,
  Filter,
  HistogramResponse,
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
      data: [min, ...ticks].map(String),
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
  filters = input<Record<string, Filter>>();
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange = output<Record<string, Filter>>();

  owner = crypto.randomUUID();
  status = signal<WidgetStatus>('loading');
  response = signal<HistogramResponse>([]);

  chart: echarts.ECharts | null = null;

  ngAfterViewInit() {
    const container = this.histogramContainer?.nativeElement;
    if (container) {
      console.log('Histogram container found', container);
      this.chart = echarts.init(container, null, {
        height: 200,
        width: 300,
      });
    } else {
      console.log('Histogram container not found');
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  private dataEffect = effect(
    (onCleanup) => {
      const column = this.column();
      const operation = this.operation();
      const ticks = this.ticks();
      const viewState = this.viewState();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) => {
          return widgetSource.getHistogram({
            column,
            operation,
            ticks,
            signal: abortController.signal,
            filterOwner: this.owner,
            spatialFilter: viewState && createSpatialFilter(viewState),
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

  // TODO: Add logic for filtering
}
