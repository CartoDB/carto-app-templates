import { Component, effect, input, Input, signal } from '@angular/core';
import { MapViewState } from '@deck.gl/core';
import {
  createSpatialFilter,
  numberFormatter,
  WidgetStatus,
} from '../../../utils';
import { AggregationType, WidgetSource } from '@carto/api-client';

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
  data = input.required<Promise<{ widgetSource: WidgetSource }>>();
  column = input<string>();
  operation = input<Exclude<AggregationType, 'custom'>>();
  viewState = input.required<MapViewState>();

  status = signal<WidgetStatus>('loading');
  value = signal(-1);

  formatValue = (value: number) => numberFormatter.format(value);

  private dataEffect = effect(
    (onCleanup) => {
      const column = this.column() || '';
      const operation = this.operation() || 'count';
      const viewState = this.viewState();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) =>
          widgetSource.getFormula({
            column,
            operation,
            spatialFilter: viewState && createSpatialFilter(viewState),
            abortController,
          }),
        )
        .then((response) => {
          this.status.set('complete');
          this.value.set(response.value);
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
}
