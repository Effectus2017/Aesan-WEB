import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SPONSOR_EVALUATION_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-evaluation.list.table.columns.agencyName'
  },
  {
    key: 'uieNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.table.columns.uieNumber'
  },
  {
    key: 'einNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.table.columns.einNumber'
  },
  {
    key: 'sdrNumber',
    type: 'text',
    label: 'sponsor-evaluation.list.table.columns.ssPatronal'
  },
  {
    key: ['user.firstName', 'user.fatherLastName'],
    type: 'combined-text',
    keys: ['user.firstName', 'user.fatherLastName'],
    label: 'sponsor-evaluation.list.table.columns.createdBy'
  },
  {
    key: 'status.name',
    type: 'text',
    label: 'sponsor-evaluation.list.table.columns.status'
  },
  {
    key: 'createdAt',
    type: 'date-time',
    label: 'sponsor-evaluation.list.table.columns.createdAt'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-evaluation.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'sponsor-evaluation.list.table.buttons.edit',
        tooltip: 'sponsor-evaluation.list.table.buttons.editTooltip'
      },
      {
        key: 'viewAssignedUsers',
        label: 'sponsor-evaluation.list.table.buttons.viewAssignedUsers',
        icon: 'heroicons_outline:users',
        tooltip: 'sponsor-evaluation.list.table.buttons.viewAssignedUsersTooltip'
      }
    ]
  }
];
