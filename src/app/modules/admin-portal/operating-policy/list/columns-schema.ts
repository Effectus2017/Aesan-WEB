import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const OPERATING_POLICY_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'operating-policy.list.columns.name',
    sortable: true,
    visible: true,
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'operating-policy.list.columns.nameEN',
    sortable: true,
    visible: true,
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'operating-policy.list.columns.isActive',
    sortable: true,
    visible: true,
  },
  {
    key: 'displayOrder',
    type: 'text',
    label: 'operating-policy.list.columns.displayOrder',
    sortable: true,
    visible: true,
  },
  {
    key: 'actions',
    type: 'button',
    label: 'operating-policy.list.columns.actions',
    visible: true,
  },
];
