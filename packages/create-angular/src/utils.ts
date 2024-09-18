import { effect, signal, Signal } from '@angular/core';

/**
 * Debounced version of Angular's signal().
 * Reference: https://stackoverflow.com/a/77844367
 */
export function debouncedSignal<T>(source: Signal<T>, delay = 0): Signal<T> {
  const debouncedSignal = signal(source());
  effect(
    (onCleanup) => {
      const value = source();
      const timeout = setTimeout(() => debouncedSignal.set(value), delay);

      // See https://angular.io/guide/signals#effect-cleanup-functions
      onCleanup(() => clearTimeout(timeout));
    },
    { allowSignalWrites: true },
  );
  return debouncedSignal;
}
