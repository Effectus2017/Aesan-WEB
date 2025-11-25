import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['purposeES', 'purposeEN'],
    type: 'text',
    label: 'message-template.list.table.columns.purpose',
  },
  {
    key: ['titleES', 'titleEN'],
    type: 'text',
    label: 'message-template.list.table.columns.title',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'message-template.list.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'message-template.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'message-template.list.table.buttons.edit',
      },
    ],
  },
];

