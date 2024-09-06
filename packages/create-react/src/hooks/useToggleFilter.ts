import {
  addFilter,
  Filter,
  FilterType,
  getFilter,
  removeFilter,
} from '@carto/api-client';

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
