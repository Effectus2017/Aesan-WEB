import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

export const EMPLOYEES_FILTERS_SCHEMA: FilterSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'staff.employees.list.table.columns.fullName',
  },
  {
    key: 'staffClassificationName',
    type: 'text',
    label: 'staff.employees.list.table.columns.classification',
  },
  {
    key: 'positionName',
    type: 'text',
    label: 'staff.employees.list.table.columns.position',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'staff.employees.list.table.columns.status',
  },
  {
    key: 'comments',
    type: 'text',
    label: 'staff.employees.list.table.columns.description',
  },
];
