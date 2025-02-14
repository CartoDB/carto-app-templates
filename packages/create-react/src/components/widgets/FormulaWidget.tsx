import { MapViewState } from '@deck.gl/core';
import {
  AggregationType,
  WidgetSource,
  WidgetSourceProps,
} from '@carto/api-client';
import { useEffect, useState } from 'react';
import {
  createSpatialFilter,
  WidgetStatus,
  numberFormatter,
} from '../../utils';

export interface FormulaWidgetProps {
  /** Widget-compatible data source, from vectorTableSource, vectorQuerySource, etc. */
  data: Promise<{ widgetSource: WidgetSource<WidgetSourceProps> }>;
  /** Column containing a value to be aggregated. */
  column: string;
  /** Operation used to aggregate the specified column. */
  operation?: Exclude<AggregationType, 'custom'>;
  /** Map view state. If specified, widget will be filtered to the view. */
  viewState?: MapViewState;
}

/**
 * Formula widget, displaying a prominent 'scorecard' number.
 */
export function FormulaWidget({
  data,
  column,
  operation,
  viewState,
}: FormulaWidgetProps) {
  const [status, setStatus] = useState<WidgetStatus>('loading');
  const [value, setValue] = useState<number>(-1);

  // Fetches data for the widget to display, watching changes to view state
  // and widget configuration to refresh.
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
        if (response.value) {
          setValue(response.value);
        }
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
