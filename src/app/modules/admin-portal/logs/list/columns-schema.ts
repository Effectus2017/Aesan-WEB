import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const LOGS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'category',
    type: 'text',
    label: 'logs.list.columns.category',
  },
  {
    key: 'id',
    type: 'text',
    label: 'logs.list.columns.id',
  },
  {
    key: 'timestamp',
    type: 'date-time',
    label: 'logs.list.columns.timestamp',
  },
  {
    key: 'summary',
    type: 'text',
    label: 'logs.list.columns.summary',
  },
  {
    key: 'status',
    type: 'text',
    label: 'logs.list.columns.status',
  },
  {
    key: 'level',
    type: 'text',
    label: 'logs.list.columns.level',
  },
  {
    key: 'buttons',
    type: 'button',
    label: '',
    buttons: [
      {
        key: 'view',
        label: 'logs.list.buttons.view',
      },
    ],
  },
];
