import { useEffect, useRef } from 'react';

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
