import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const CENTERS_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'centers.list.filters.name',
  },
  {
    key: 'schoolCode',
    type: 'text',
    label: 'centers.list.filters.code',
  },
];
