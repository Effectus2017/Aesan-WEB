import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'id',
    type: 'text',
    label: 'group-type.list.table.columns.id',
  },
  {
    key: 'name',
    type: 'text',
    label: 'group-type.list.table.columns.name',
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'group-type.list.table.columns.nameEN',
  },
  {
    key: 'isActive',
    type: 'text',
    label: 'group-type.list.table.columns.isActive',
  },
  {
    key: 'displayOrderUI',
    type: 'text',
    label: 'group-type.list.table.columns.displayOrder',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'group-type.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'group-type.list.table.buttons.edit',
      },
    ],
  },
];
