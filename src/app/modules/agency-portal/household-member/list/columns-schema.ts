import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'id', type: 'text', label: 'household-member.list.table.columns.id' },
  { key: 'firstName', type: 'text', label: 'household-member.list.table.columns.firstName' },
  { key: 'middleName', type: 'text', label: 'household-member.list.table.columns.middleName' },
  { key: 'fatherLastName', type: 'text', label: 'household-member.list.table.columns.fatherLastName' },
  { key: 'motherLastName', type: 'text', label: 'household-member.list.table.columns.motherLastName' },
  { key: 'isStudent', type: 'text', label: 'household-member.list.table.columns.isStudent' },
  { key: 'isFoster', type: 'text', label: 'household-member.list.table.columns.isFoster' },
  { key: 'isMigrant', type: 'text', label: 'household-member.list.table.columns.isMigrant' },
  { key: 'isHomeless', type: 'text', label: 'household-member.list.table.columns.isHomeless' },
  { key: 'isRunaway', type: 'text', label: 'household-member.list.table.columns.isRunaway' },
  { key: 'isActive', type: 'text', label: 'household-member.list.table.columns.isActive' },
  {
    key: 'actions',
    type: 'button',
    label: 'household-member.list.table.columns.actions',
    buttons: [
      { key: 'edit', label: 'household-member.list.table.buttons.edit' },
    ],
  },
];
