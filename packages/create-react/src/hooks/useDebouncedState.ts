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
