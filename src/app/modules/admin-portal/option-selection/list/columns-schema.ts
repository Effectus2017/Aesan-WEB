import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'id',
    type: 'text',
    label: 'option-selection.list.table.columns.id',
  },
  {
    key: 'name',
    type: 'text',
    label: 'option-selection.list.table.columns.name',
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'option-selection.list.table.columns.nameEN',
  },
  {
    key: 'optionKey',
    type: 'text',
    label: 'option-selection.list.table.columns.optionKey',
  },
  {
    key: 'isActive',
    type: 'text',
    label: 'option-selection.list.table.columns.isActive',
  },
  {
    key: 'displayOrderUI',
    type: 'text',
    label: 'option-selection.list.table.columns.displayOrder',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'option-selection.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'option-selection.list.table.buttons.edit',
      },
    ],
  },
];
