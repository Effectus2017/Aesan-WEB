import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const SCHOOLS_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'schools.list.table.columns.name',
  },
  {
    key: 'schoolCode',
    type: 'text',
    label: 'schools.list.table.columns.schoolCode',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'schools.list.table.columns.status',
  },
];
