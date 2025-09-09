import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const PERMISSIONS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'users.edit.permissions.table.columns.name',
  },
  {
    key: 'nameEn',
    type: 'text',
    label: 'users.edit.permissions.table.columns.nameEn',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'users.edit.permissions.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'users.edit.permissions.table.columns.actions',
    buttons: [
      {
        key: 'delete',
        label: 'users.edit.permissions.table.buttons.delete',
        color: 'warn',
        icon: 'delete',
      },
    ],
  },
];
