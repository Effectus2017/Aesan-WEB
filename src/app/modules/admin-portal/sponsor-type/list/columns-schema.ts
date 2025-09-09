import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SPONSOR_TYPE_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'id',
    type: 'text',
    label: 'sponsor-type.list.table.columns.id',
    sortable: true,
    visible: false,
  },
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-type.list.table.columns.name',
    sortable: true,
    visible: true,
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'sponsor-type.list.table.columns.nameEN',
    sortable: true,
    visible: true,
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-type.list.table.columns.isActive',
    sortable: true,
    visible: true,
  },
  {
    key: 'displayOrder',
    type: 'text',
    label: 'sponsor-type.list.table.columns.displayOrder',
    sortable: true,
    visible: true,
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-type.list.table.columns.actions',
    visible: true,
    buttons: [
      {
        key: 'edit',
        label: 'sponsor-type.list.table.buttons.edit',
        tooltip: 'sponsor-type.list.table.tooltips.edit',
        permission: 'sponsor-type.edit',
        disabledTooltip: 'sponsor-type.list.table.tooltips.editDisabled'
      },
      {
        key: 'delete',
        label: 'sponsor-type.list.table.buttons.delete',
        tooltip: 'sponsor-type.list.table.tooltips.delete',
        permission: 'sponsor-type.delete',
        disabledTooltip: 'sponsor-type.list.table.tooltips.deleteDisabled'
      },
    ],
  },
];
