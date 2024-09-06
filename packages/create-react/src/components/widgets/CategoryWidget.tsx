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
import { useEffect, useMemo, useState } from 'react';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';
import { useToggleFilter } from '../../hooks/useToggleFilter';

const { IN } = FilterType;

export interface CategoryWidgetProps {
  data: Promise<{ widgetSource: WidgetSource }>;
  column: string;
  operation?: AggregationType;
  viewState?: MapViewState;
  filters?: Record<string, Filter>;
  onFiltersChange?: (filters: Record<string, Filter>) => void;
}

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

  const [min, max] = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const { value } of response) {
      min = Math.min(value, min);
      max = Math.max(value, max);
    }
    return [min, max];
  }, [response]);

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
      onFiltersChange({ ...removeFilter(filters, { column, owner }) });
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
