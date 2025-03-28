import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'validation-to-program.list.table.columns.agencyName'
  },
  {
    key: 'uieNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.uieNumber'
  },
  {
    key: 'einNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.einNumber'
  },
  {
    key: 'sdrNumber',
    type: 'text',
    label: 'validation-to-program.list.table.columns.ssPatronal'
  },
  {
    key: ['user.firstName', 'user.fatherLastName'],
    type: 'combined-text',
    keys: ['user.firstName', 'user.fatherLastName'],
    label: 'validation-to-program.list.table.columns.createdBy'
  },
  {
    key: 'status.name',
    type: 'text',
    label: 'validation-to-program.list.table.columns.status'
  },
  {
    key: 'createdAt',
    type: 'date-time',
    label: 'validation-to-program.list.table.columns.createdAt'
  },
  {
    key: ['monitor.firstName', 'monitor.fatherLastName'],
    type: 'combined-text',
    keys: ['monitor.firstName', 'monitor.fatherLastName'],
    label: 'validation-to-program.list.table.columns.assignedTo'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'validation-to-program.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'validation-to-program.list.table.buttons.edit'
      },
    ]
  }
];
