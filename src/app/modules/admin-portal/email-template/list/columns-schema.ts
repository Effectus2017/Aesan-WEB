import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['description', 'descriptionEN'],
    type: 'text',
    label: 'email-template.list.table.columns.description',
  },
  {
    key: ['subjectES', 'subjectEN'],
    type: 'text',
    label: 'email-template.list.table.columns.subject',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'email-template.list.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'email-template.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'email-template.list.table.buttons.edit',
      },
    ],
  },
];

