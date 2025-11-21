import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'templateKey',
    type: 'text',
    label: 'email-template.list.table.columns.templateKey',
  },
  {
    key: 'description',
    type: 'text',
    label: 'email-template.list.table.columns.description',
  },
  {
    key: 'subjectES',
    type: 'text',
    label: 'email-template.list.table.columns.subjectES',
  },
  {
    key: 'subjectEN',
    type: 'text',
    label: 'email-template.list.table.columns.subjectEN',
  },
  {
    key: 'isActive',
    type: 'text',
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

