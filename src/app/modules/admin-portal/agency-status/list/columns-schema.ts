import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const AGENCY_STATUS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'agency-status.list.table.columns.name',
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'agency-status.list.table.columns.nameEN',
  },
  {
    key: 'isActive',
    type: 'text',
    label: 'agency-status.list.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'agency-status.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'agency-status.list.table.buttons.edit',
      },
    ],
  },
];
