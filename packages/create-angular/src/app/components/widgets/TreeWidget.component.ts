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
  CategoryResponse,
  Filter,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { MapViewState } from '@deck.gl/core';
import { createSpatialFilter, WidgetStatus } from '../../../utils';
import * as echarts from 'echarts';
import { RASTER_CATEGORY_MAP } from '../../rasterCategoriesMap';

function getOption(response: CategoryResponse, colors: string[]) {
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

@Component({
  selector: 'tree-widget',
  standalone: true,
  template: `
    @if (status() === 'loading') {
      <span class="title">Loading ...</span>
    }
    @if (status() === 'error') {
      <span class="title">⚠ Error</span>
    }
    <div style="min-height: 200px; position: relative">
      <div id="tree-container" #container></div>
    </div>
  `,
})
export class TreeWidgetComponent {
  @ViewChild('container') treeContainer?: ElementRef<HTMLDivElement>;

  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data =
    input.required<
      Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>
    >();
  /** Column containing a value to be aggregated. */
  column = input.required<string>();
  /** Operation used to aggregate the specified column. */
  operation = input<Exclude<AggregationType, 'custom'>>();
  /** Colors to be used for the tree. */
  colors = input<string[]>([]);
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState = input<MapViewState>();
  /** Filter state. If specified, widget will be filtered. */
  filters = input<Record<string, Filter>>();
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange = output<Record<string, Filter>>();

  owner = crypto.randomUUID();
  status = signal<WidgetStatus>('loading');
  response = signal<CategoryResponse>([]);

  chart: echarts.ECharts | null = null;

  ngAfterViewInit() {
    const container = this.treeContainer?.nativeElement;
    if (container) {
      this.chart = echarts.init(container, null, {
        height: 200,
        width: 300,
      });
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
      const viewState = this.viewState();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) => {
          return widgetSource.getCategories({
            column,
            operation,
            abortController,
            filterOwner: this.owner,
            spatialFilter: viewState && createSpatialFilter(viewState),
            spatialIndexReferenceViewState: viewState,
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
    const colors = this.colors();
    if (this.chart) {
      this.chart.setOption(getOption(data, colors));
    }
  });

  // TODO: Add logic for filtering
}
