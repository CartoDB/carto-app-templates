import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  CategoryResponse,
  WidgetSource,
} from '@carto/api-client';
import { useEffect, useState } from 'react';
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
    <ul>
      {response.map(({ name, value }) => (
        <li key={name}>
          <span className="body1 strong">{name}</span>
          {': '}
          <data className="body1" value={value}>
            {numberFormatter.format(value)}
          </data>
        </li>
      ))}
    </ul>
  );
}
