import {
  addFilter,
  Filter,
  FilterType,
  getFilter,
  removeFilter,
} from '@carto/api-client';

export type ToggleFilterProps = {
  /** Column containing category-like strings for filtering. */
  column: string;
  /** Owner / Widget ID. */
  owner: string;
  /** Filter state. */
  filters?: Record<string, Filter>;
  /** Callback to be invoked when changing filter state. */
  onChange?: (filters: Record<string, Filter>) => void;
};

/**
 * Returns a function, `toggleFilter(category)`, which can be used to toggle
 * a specified category on/off in filter state for a specified column. For
 * use in category- and pie-style widgets.
 */
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

    // Replace, not mutate, the filters object.
    onChange({ ...filters });
  };
}
