import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const SITES_PSAV_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sites.list.filters.name',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sites.list.table.columns.isActive',
  },
];
