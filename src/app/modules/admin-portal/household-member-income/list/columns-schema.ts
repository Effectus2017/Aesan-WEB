import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'id', type: 'text', label: 'household-member-income.list.table.columns.id' },
  { key: 'memberId', type: 'text', label: 'household-member-income.list.table.columns.memberId' },
  { key: 'incomeTypeId', type: 'text', label: 'household-member-income.list.table.columns.incomeTypeId' },
  { key: 'amount', type: 'text', label: 'household-member-income.list.table.columns.amount' },
  { key: 'frequencyId', type: 'text', label: 'household-member-income.list.table.columns.frequencyId' },
  { key: 'isActive', type: 'boolean', label: 'household-member-income.list.table.columns.isActive' },
  { key: 'createdAt', type: 'date', label: 'household-member-income.list.table.columns.createdAt' },
  { key: 'updatedAt', type: 'date', label: 'household-member-income.list.table.columns.updatedAt' },
  {
    key: 'actions',
    type: 'button',
    label: 'household-member-income.list.table.columns.actions',
    buttons: [
      { key: 'edit', label: 'household-member-income.list.table.buttons.edit' }
    ]
  }
];
