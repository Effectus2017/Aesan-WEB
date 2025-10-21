import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SPONSOR_EVALUATION_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sponsorEvaluation.list.table.columns.agencyName'
  },
  {
    key: 'uieNumber',
    type: 'text',
    label: 'sponsorEvaluation.list.table.columns.uieNumber'
  },
  {
    key: 'einNumber',
    type: 'text',
    label: 'sponsorEvaluation.list.table.columns.einNumber'
  },
  {
    key: 'sdrNumber',
    type: 'text',
    label: 'sponsorEvaluation.list.table.columns.ssPatronal'
  },
  {
    key: ['user.firstName', 'user.fatherLastName'],
    type: 'combined-text',
    keys: ['user.firstName', 'user.fatherLastName'],
    label: 'sponsorEvaluation.list.table.columns.createdBy'
  },
  {
    key: 'status.name',
    type: 'text',
    label: 'sponsorEvaluation.list.table.columns.status'
  },
  {
    key: 'createdAt',
    type: 'date-time',
    label: 'sponsorEvaluation.list.table.columns.createdAt'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsorEvaluation.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'sponsorEvaluation.list.table.buttons.edit'
      },
    ]
  }
];
