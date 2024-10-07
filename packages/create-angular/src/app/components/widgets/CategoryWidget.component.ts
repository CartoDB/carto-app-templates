import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { MapViewState } from '@deck.gl/core';
import {
  createSpatialFilter,
  numberFormatter,
  WidgetStatus,
} from '../../../utils';
import {
  AggregationType,
  CategoryResponse,
  Filter,
  FilterType,
  WidgetSource,
  addFilter,
  getFilter,
  hasFilter,
  removeFilter,
} from '@carto/api-client';

/**
 * Category widget, displaying one or more categories by name, with a horizontal 'meter'
 * representing the value (typically count) of each category.
 */
@Component({
  selector: 'category-widget',
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
        @if (response().length === 0) {
          <span class="title">No data</span>
        } @else {
          <ul class="category-list">
            @for (item of response(); track item.name) {
              <li
                class="category-item"
                [class.selected]="selectedCategories().has(item.name)"
                (click)="toggleFilter(item.name)"
              >
                <div class="category-item-row">
                  <span class="category-item-label body1 strong">
                    {{ item.name }}
                  </span>
                  <data class="category-item-value body1" [value]="item.value">
                    {{ formatValue(item.value) }}
                  </data>
                </div>
                <div class="category-item-row">
                  <meter
                    class="category-item-meter"
                    [min]="minMax()[0]"
                    [max]="minMax()[1]"
                    [value]="item.value"
                  ></meter>
                </div>
              </li>
            }
          </ul>
          @if (filters() && isFiltering()) {
            <button (click)="clearFilters()">Clear</button>
          }
        }
      }
    }
  `,
})
export class CategoryWidgetComponent {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data = input.required<Promise<{ widgetSource: WidgetSource }>>();
  /** Column containing category names. */
  column = input.required<string>();
  /** Operation used to aggregate features in each category. */
  operation = input<Exclude<AggregationType, 'custom'>>();
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState = input<MapViewState>();
  /** Filter state. If specified, widget will be filtered. */
  filters = input<Record<string, Filter>>();
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange = output<Record<string, Filter>>();

  owner = crypto.randomUUID();
  status = signal<WidgetStatus>('loading');
  response = signal<CategoryResponse>([]);

  // Compute min/max over category values.
  minMax = computed(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const { value } of this.response()) {
      min = Math.min(value, min);
      max = Math.max(value, max);
    }
    return [min, max];
  });

  // Set of selected (filtered) categories, for quick lookups while rendering.
  selectedCategories = computed(() => {
    const filter =
      this.filters() &&
      getFilter(this.filters()!, {
        column: this.column(),
        owner: this.owner,
        type: FilterType.IN,
      });
    return new Set((filter?.values || []) as string[]);
  });

  // Fetches data for the widget to display, watching changes to filters,
  // view state, and widget configuration to refresh.
  private dataEffect = effect(
    (onCleanup) => {
      const column = this.column();
      const operation = this.operation() || 'count';
      const viewState = this.viewState();
      const abortController = new AbortController();

      onCleanup(() => abortController.abort());

      this.status.set('loading');

      this.data()
        .then(({ widgetSource }) =>
          widgetSource.getCategories({
            column: column,
            operation: operation,
            spatialFilter: viewState && createSpatialFilter(viewState),
            abortController,
            filterOwner: this.owner,
          }),
        )
        .then((response) => {
          this.status.set('complete');
          this.response.set(response);
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            this.status.set('error');
          }
          this.response.set([]);
        });
    },
    { allowSignalWrites: true },
  );

  formatValue(value: number): string {
    return numberFormatter.format(value);
  }

  isFiltering() {
    const filters = this.filters();
    return filters && hasFilter(filters, { column: this.column() });
  }

  clearFilters() {
    if (this.filters()) {
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
  }

  /**
   * Toggle a specified category on/off in filter state.
   */
  toggleFilter(category: string): void {
    let filters = this.filters();

    if (!filters) return;

    const column = this.column();
    const owner = this.owner;

    const { IN } = FilterType;

    const filter = getFilter(filters, { column, type: IN, owner });

    let values: string[];

    if (!filter) {
      values = [category];
    } else if ((filter.values as string[]).includes(category)) {
      values = (filter.values as string[]).filter(
        (v: string) => v !== category,
      );
    } else {
      values = [...(filter.values as string[]), category];
    }

    if (values.length > 0) {
      filters = addFilter(filters, {
        column,
        type: IN,
        owner,
        values: values,
      });
    } else {
      filters = removeFilter(filters, { column, owner });
    }

    // Replace, not mutate, the filters object.
    this.onFiltersChange.emit({ ...filters });
  }
}
