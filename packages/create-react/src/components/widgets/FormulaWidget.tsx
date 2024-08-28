import { MapViewState } from '@deck.gl/core';
import { AggregationType, WidgetSource } from '@carto/api-client';
import { useEffect, useState } from 'react';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';

export interface FormulaWidgetProps {
  data: Promise<{ widgetSource: WidgetSource }>;
  column: string;
  operation?: AggregationType;
  viewState?: MapViewState;
}

export function FormulaWidget({
  data,
  column,
  operation,
  viewState,
}: FormulaWidgetProps) {
  const [status, setStatus] = useState<WidgetStatus>('loading');
  const [value, setValue] = useState<number>(-1);

  useEffect(() => {
    const abortController = new AbortController();

    data
      .then(({ widgetSource }) =>
        widgetSource.getFormula({
          column,
          operation,
          spatialFilter: viewState && createSpatialFilter(viewState),
          abortController,
        }),
      )
      .then((response) => {
        setValue(response.value);
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

  return (
    <data className="title" value={value}>
      {numberFormatter.format(value)}
    </data>
  );
}
