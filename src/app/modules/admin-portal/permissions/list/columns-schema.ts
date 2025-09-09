import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const PERMISSIONS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'permissions.list.table.columns.name',
  },
  {
    key: 'nameEn',
    type: 'text',
    label: 'permissions.list.table.columns.nameEn',
  },
  {
    key: 'valueKey',
    type: 'text',
    label: 'permissions.list.table.columns.valueKey',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'permissions.list.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'permissions.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'permissions.list.table.buttons.edit',
      },
    ],
  },
];
