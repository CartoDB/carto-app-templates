import {
  addFilter,
  Filter,
  FilterType,
  getFilter,
  removeFilter,
} from '@carto/api-client';
import { useState, useEffect, useRef } from 'react';

type Timeout = ReturnType<typeof setTimeout>;

/**
 * A debounced alternative to `useState`, API-equivalent except for the
 * addition of `delay` as the second parameter to the hook.
 *
 * Example:
 * ```
 * const [value, setValue] = useDebouncedState(0, 200);
 * ```
 *
 * When `setValue` is called, state does not change immediately. Instead
 * the hook waits (`delay` milliseconds) before flushing changes to state.
 * Any additional calls to `setValue` will reset the timer, such that state
 * is not updated until `delay` milliseconds have passed since the last
 * change.
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number,
): [T, (state: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  // Last value passed, will be assigned to debouncedValue after debounce.
  const pendingValueRef = useRef(initialValue);

  // Active timeout, if any.
  const setValueTimeoutRef = useRef<Timeout | null>(null);

  // Component-scoped `setValue` function, with debounce.
  const setValueRef = useRef((value: T) => {
    if (setValueTimeoutRef.current) {
      clearTimeout(setValueTimeoutRef.current);
      setValueTimeoutRef.current = null;
    }

    pendingValueRef.current = value;
    setValueTimeoutRef.current = setTimeout(() => {
      setDebouncedValue(pendingValueRef.current);
      setValueTimeoutRef.current = null;
    }, delay);
  });

  // When component unmounts, cancel any active timeout.
  useEffect(() => {
    return () => {
      if (setValueTimeoutRef.current) {
        clearTimeout(setValueTimeoutRef.current);
        setValueTimeoutRef.current = null;
      }
    };
  }, []);

  return [debouncedValue, setValueRef.current];
}

/**
 * A debounced alternative to `useEffect`.
 */
export function useDebouncedEffect(
  callback: () => void | (() => void),
  delay = 200,
  deps: unknown[] = [],
) {
  const firstTimeRef = useRef(true);
  const clearRef = useRef<(() => void) | void>(undefined);

  useEffect(
    () => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      const timeout = setTimeout(() => {
        if (clearRef.current && typeof clearRef.current === 'function') {
          clearRef.current();
        }
        clearRef.current = callback();
      }, delay);

      return () => clearTimeout(timeout);
    },
    // TODO: Should 'callback' really be omitted?
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps],
  );
}

export type ToggleFilterProps = {
  column: string;
  owner: string;
  filters?: Record<string, Filter>;
  onChange?: (filters: Record<string, Filter>) => void;
};

export function useToggleFilter({
  column,
  owner,
  filters,
  onChange,
}: ToggleFilterProps): (category: string) => void {
  const { IN } = FilterType;

  return function onToggleFilter(category: string): void {
    if (!filters || !onChange) return;

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

    onChange({ ...filters });
  };
}
