import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';
import { StaffTypeList } from 'app/shared/models/StaffType';

export const STAFF_TYPE_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'id',
    label: 'staffType.list.table.columns.id',
    type: 'text',
    sortable: true
  },
  {
    key: 'name',
    label: 'staffType.list.table.columns.name',
    type: 'text',
    sortable: true
  },
  {
    key: 'nameEn',
    label: 'staffType.list.table.columns.nameEn',
    type: 'text',
    sortable: true
  },
  {
    key: 'optionKey',
    label: 'staffType.list.table.columns.optionKey',
    type: 'text',
    sortable: true
  },
  {
    key: 'sortOrder',
    label: 'staffType.list.table.columns.sortOrder',
    type: 'text',
    sortable: true
  },
  {
    key: 'isActive',
    label: 'staffType.list.table.columns.isActive',
    type: 'boolean',
    sortable: true
  },
  {
    key: 'buttons',
    label: 'staffType.list.table.columns.actions',
    type: 'button',
    sortable: false,
    buttons: [
      {
        key: 'edit',
        label: 'staffType.list.buttons.edit',
      },
      {
        key: 'delete',
        label: 'staffType.list.buttons.delete',
      },
    ],
  }
];
