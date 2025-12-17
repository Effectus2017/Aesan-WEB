import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Column schema for centers list
export const CENTERS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'schoolCode',
    type: 'text',
    label: 'centers.list.table.columns.centerCode',
  },
  {
    key: 'name',
    type: 'text',
    label: 'centers.list.table.columns.name',
  },
  {
    key: 'sitesCount',
    type: 'text',
    label: 'centers.list.table.columns.sites-count',
  },
  {
    key: 'createdAt',
    type: 'date',
    label: 'centers.list.table.columns.createdAt',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'centers.list.table.columns.status',
    sortable: true,
  },
  {
    key: 'actions',
    type: 'button',
    label: 'centers.list.table.columns.actions',
    buttons: [
      {
        key: 'edit-modal',
        label: 'centers.list.table.buttons.edit',
        icon: 'mat_solid:edit',
      },
      {
        key: 'sites',
        label: 'centers.list.table.buttons.sites',
        icon: 'heroicons_outline:building-office-2',
      },
    ],
  },
];

