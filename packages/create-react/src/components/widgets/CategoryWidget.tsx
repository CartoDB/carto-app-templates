import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  CategoryResponse,
  WidgetSource,
} from '@carto/api-client';
import { useEffect, useMemo, useState } from 'react';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';

export interface CategoryWidgetProps {
  data: Promise<{ widgetSource: WidgetSource }>;
  column: string;
  operation?: AggregationType;
  viewState?: MapViewState;
}

export function CategoryWidget({
  data,
  column,
  operation,
  viewState,
}: CategoryWidgetProps) {
  const [status, setStatus] = useState<WidgetStatus>('loading');
  const [response, setResponse] = useState<CategoryResponse>([]);

  useEffect(() => {
    const abortController = new AbortController();

    data
      .then(({ widgetSource }) =>
        widgetSource.getCategories({
          column,
          operation,
          spatialFilter: viewState && createSpatialFilter(viewState),
          abortController,
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
  }, [data, column, operation, viewState]);

  const [min, max] = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const { value } of response) {
      min = Math.min(value, min);
      max = Math.max(value, max);
    }
    return [min, max];
  }, [response]);

  if (status === 'loading') {
    return <span className="title">...</span>;
  }

  if (status === 'error') {
    return <span className="title">⚠ Error</span>;
  }

  if (!response || !response.length) {
    return <span className="title">No data</span>;
  }

  return (
    <ul className="category-list">
      {response.map(({ name, value }) => (
        <li key={name} className="category-item">
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
  );
}
