import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const KITCHEN_TYPE_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'id',
    type: 'text',
    label: 'kitchen-type.list.table.columns.id',
  },
  {
    key: 'name',
    type: 'text',
    label: 'kitchen-type.list.table.columns.name',
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'kitchen-type.list.table.columns.nameEN',
  },
  {
    key: 'isActive',
    type: 'text',
    label: 'kitchen-type.list.table.columns.isActive',
  },
  {
    key: 'displayOrderUI',
    type: 'text',
    label: 'kitchen-type.list.table.columns.displayOrder',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'kitchen-type.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'kitchen-type.list.table.buttons.edit',
      },
    ],
  },
];
