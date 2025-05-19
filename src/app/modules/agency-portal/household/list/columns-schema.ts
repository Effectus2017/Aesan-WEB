import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'id', type: 'text', label: 'households.list.table.columns.id' },
  { key: 'street', type: 'text', label: 'households.list.table.columns.street' },
  { key: 'apartment', type: 'text', label: 'households.list.table.columns.apartment' },
  { key: 'city', type: 'text', label: 'households.list.table.columns.city' },
  { key: 'region', type: 'text', label: 'households.list.table.columns.region' },
  { key: 'zipcode', type: 'text', label: 'households.list.table.columns.zipcode' },
  { key: 'phone', type: 'text', label: 'households.list.table.columns.phone' },
  { key: 'email', type: 'text', label: 'households.list.table.columns.email' },
  { key: 'completedBy', type: 'text', label: 'households.list.table.columns.completedBy' },
  { key: 'completedDate', type: 'text', label: 'households.list.table.columns.completedDate' },
  { key: 'isActive', type: 'text', label: 'households.list.table.columns.isActive' },
  {
    key: 'actions',
    type: 'button',
    label: 'households.list.table.columns.actions',
    buttons: [
      { key: 'edit', label: 'households.list.table.buttons.edit' },
    ],
  },
];
