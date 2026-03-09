import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const EMPLOYEES_LIST_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'employees.list.filters.name',
  },
  {
    key: 'positionName',
    type: 'text',
    label: 'employees.list.table.columns.position',
  },
  {
    key: 'email',
    type: 'text',
    label: 'employees.list.table.columns.email',
  },
];
