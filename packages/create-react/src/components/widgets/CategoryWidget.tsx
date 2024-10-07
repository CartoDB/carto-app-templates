import { useEffect, useMemo, useState } from 'react';
import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  CategoryResponse,
  Filter,
  FilterType,
  WidgetSource,
  removeFilter,
  getFilter,
  hasFilter,
} from '@carto/api-client';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';
import { useToggleFilter } from '../../hooks/useToggleFilter';

const { IN } = FilterType;

export interface CategoryWidgetProps {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data: Promise<{ widgetSource: WidgetSource }>;
  /** Column containing category names. */
  column: string;
  /** Operation used to aggregate features in each category. */
  operation?: Exclude<AggregationType, 'custom'>;
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState?: MapViewState;
  /** Filter state. If specified, widget will be filtered. */
  filters?: Record<string, Filter>;
  /** Callback, to be invoked by the widget when its filters are set or cleared. */
  onFiltersChange?: (filters: Record<string, Filter>) => void;
}

/**
 * Category widget, displaying one or more categories by name, with a horizontal 'meter'
 * representing the value (typically count) of each category.
 */
export function CategoryWidget({
  data,
  column,
  operation,
  viewState,
  filters,
  onFiltersChange,
}: CategoryWidgetProps) {
  const [owner] = useState<string>(crypto.randomUUID());
  const [status, setStatus] = useState<WidgetStatus>('loading');
  const [response, setResponse] = useState<CategoryResponse>([]);
  const toggleFilter = useToggleFilter({
    column,
    owner,
    filters,
    onChange: onFiltersChange,
  });

  // Fetches data for the widget to display, watching changes to filters,
  // view state, and widget configuration to refresh.
  useEffect(() => {
    const abortController = new AbortController();

    data
      .then(({ widgetSource }) =>
        widgetSource.getCategories({
          column,
          operation,
          spatialFilter: viewState && createSpatialFilter(viewState),
          abortController,
          filterOwner: owner,
        }),
      )
      .then((response) => {
        setResponse(response);
        setStatus('complete');
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setStatus('error');
        }
      });

    setStatus('loading');

    return () => abortController.abort();
  }, [data, column, operation, viewState, owner]);

  // Compute min/max over category values.
  const [min, max] = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const { value } of response) {
      min = Math.min(value, min);
      max = Math.max(value, max);
    }
    return [min, max];
  }, [response]);

  // Set of selected (filtered) categories, for quick lookups while rendering.
  const selectedCategories = useMemo(() => {
    const filter = filters && getFilter(filters, { column, owner, type: IN });
    return new Set((filter?.values || []) as string[]);
  }, [filters, column, owner]);

  if (status === 'loading') {
    return <span className="title">...</span>;
  }

  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

  if (!response || !response.length) {
    return <span className="title">No data</span>;
  }

  function onClearFilters() {
    if (filters && onFiltersChange) {
      // Replace, not mutate, the filters object.
      onFiltersChange(removeFilter({ ...filters }, { column, owner }));
    }
  }

  return (
    <>
      <ul className="category-list">
        {response.map(({ name, value }) => (
          <li
            key={name}
            className={`category-item ${selectedCategories.has(name) ? 'selected' : ''}`}
            onClick={() => toggleFilter(name)}
          >
            <div className="category-item-row">
              <span className="category-item-label body1 strong">{name}</span>
              <data className="category-item-value body1" value={value}>
                {numberFormatter.format(value)}
              </data>
            </div>
            <div className="category-item-row">
              <meter
                className="category-item-meter"
                min={min}
                max={max}
                value={value}
              ></meter>
            </div>
          </li>
        ))}
      </ul>
      {filters && onFiltersChange && hasFilter(filters, { column }) && (
        <button onClick={onClearFilters}>Clear</button>
      )}
    </>
  );
}
