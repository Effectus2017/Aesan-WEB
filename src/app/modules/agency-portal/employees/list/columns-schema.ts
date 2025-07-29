import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const EMPLOYEES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'firstName',
    label: 'employees.list.table.columns.firstName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'middleName',
    label: 'employees.list.table.columns.middleName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'fatherLastName',
    label: 'employees.list.table.columns.fatherLastName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'motherLastName',
    label: 'employees.list.table.columns.motherLastName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'statusName',
    label: 'employees.list.table.columns.status',
    type: 'boolean',
    sortable: true,
  },
  {
    key: 'positionName',
    label: 'employees.list.table.columns.position',
    type: 'text',
    sortable: true,
  },
  {
    key: 'email',
    label: 'employees.list.table.columns.email',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'cityName',
    label: 'employees.list.table.columns.city',
    type: 'text',
    sortable: true,
  },
  {
    key: 'regionName',
    label: 'employees.list.table.columns.region',
    type: 'text',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'employees.list.table.columns.actions',
    type: 'button',
    buttons: [
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ],
  },
];
