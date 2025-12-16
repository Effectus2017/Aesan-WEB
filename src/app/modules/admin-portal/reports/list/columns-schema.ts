import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const REPORTS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'reports.list.table.columns.name',
  },
  {
    key: 'description',
    type: 'text',
    label: 'reports.list.table.columns.description',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'reports.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'reports.list.table.buttons.open',
      },
    ],
  },
];

