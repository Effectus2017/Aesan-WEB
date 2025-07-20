import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const EMPLOYEES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'firstName',
    label: 'employees.list.columns.firstName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'middleName',
    label: 'employees.list.columns.middleName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'fatherLastName',
    label: 'employees.list.columns.fatherLastName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'motherLastName',
    label: 'employees.list.columns.motherLastName',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'statusName',
    label: 'employees.list.columns.status',
    type: 'boolean',
    sortable: true,
  },
  {
    key: 'titleName',
    label: 'employees.list.columns.title',
    type: 'text',
    sortable: true,
  },
  {
    key: 'email',
    label: 'employees.list.columns.email',
    type: 'text',
    sortable: true,
    searchable: true,
  },
  {
    key: 'cityName',
    label: 'employees.list.columns.city',
    type: 'text',
    sortable: true,
  },
  {
    key: 'regionName',
    label: 'employees.list.columns.region',
    type: 'text',
    sortable: true,
  },
  {
    key: 'userName',
    label: 'employees.list.columns.user',
    type: 'text',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'employees.list.columns.actions',
    type: 'button',
    buttons: [
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ],
  },
];
