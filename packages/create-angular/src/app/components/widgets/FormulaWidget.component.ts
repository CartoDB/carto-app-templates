import { Component, effect, input, signal } from '@angular/core';
import { MapViewState } from '@deck.gl/core';
import {
  createSpatialFilter,
  numberFormatter,
  WidgetStatus,
} from '../../../utils';
import {
  AggregationType,
  Filters,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';

/**
 * Formula widget, displaying a prominent 'scorecard' number.
 */
@Component({
  selector: 'formula-widget',
  standalone: true,
  template: `
    @switch (status()) {
      @case ('loading') {
        <span class="title">...</span>
      }
      @case ('error') {
        <span class="title">⚠ Error</span>
      }
      @case ('complete') {
        <data class="title" [value]="value()">{{ formatValue(value()) }} </data>
      }
    }
  `,
})
export class FormulaWidgetComponent {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data =
    input.required<
      Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>
    >();
  /** Column containing a value to be aggregated. */
  column = input<string>();
  /** Operation used to aggregate the specified column. */
  operation = input<Exclude<AggregationType, 'custom'>>();
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState = input<MapViewState>();
  /** Filter state. If specified, widget will be filtered. */
  filters = input<Filters>();

  owner = crypto.randomUUID();
  status = signal<WidgetStatus>('loading');
  value = signal(-1);

  // Fetches data for the widget to display, watching changes to view state
  // and widget configuration to refresh.
  private dataEffect = effect(
    (onCleanup) => {
      const column = this.column() || '';
      const operation = this.operation() || 'count';
      const viewState = this.viewState();
      const filters = this.filters();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) =>
          widgetSource.getFormula({
            column,
            operation,
            spatialFilter: viewState && createSpatialFilter(viewState),
            signal: abortController.signal,
            filterOwner: this.owner,
            filters,
          }),
        )
        .then((response) => {
          this.status.set('complete');
          this.value.set(response.value ?? 0);
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            this.status.set('error');
          }
          this.value.set(-1);
        });
    },
    { allowSignalWrites: true },
  );

  formatValue(value: number): string {
    return numberFormatter.format(value);
  }
}
