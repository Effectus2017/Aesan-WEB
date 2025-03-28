import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text' as const,
    label: 'global.table.schools.name',
  },
  {
    key: 'address',
    type: 'text' as const,
    label: 'global.table.schools.address',
  },
  {
    key: 'city',
    type: 'text' as const,
    label: 'global.table.schools.city',
  },
  {
    key: 'zipCode',
    type: 'text' as const,
    label: 'global.table.schools.zipCode',
  },
  {
    key: 'level',
    type: 'text' as const,
    label: 'global.table.schools.level',
  },
  {
    key: 'actions',
    type: 'button' as const,
    label: 'global.table.actions',
    buttons: [
      {
        key: 'edit',
        label: 'global.table.edit',
      },
      {
        key: 'delete',
        label: 'global.table.delete',
      },
    ],
  },
];

export const INCOME_SOURCES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'source',
    type: 'text' as const,
    label: 'global.table.incomeSources.source',
  },
  {
    key: 'year',
    type: 'text' as const,
    label: 'global.table.incomeSources.year',
  },
  {
    key: 'amount',
    type: 'text' as const,
    label: 'global.table.incomeSources.amount',
  },
  {
    key: 'actions',
    type: 'button' as const,
    label: 'global.table.actions',
    buttons: [
      {
        key: 'edit',
        label: 'global.table.edit',
      },
      {
        key: 'delete',
        label: 'global.table.delete',
      },
    ],
  },
];
