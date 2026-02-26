import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const AGENCY_ASSIGNED_USERS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'fatherLastName', 'motherLastName'],
    type: 'combined-text',
    label: 'sponsor-evaluation.agencyAssignedUsersModal.columnName',
  },
  {
    key: 'email',
    type: 'text',
    label: 'sponsor-evaluation.agencyAssignedUsersModal.columnEmail',
  },
  {
    key: 'roleDisplayName',
    type: 'text',
    label: 'sponsor-evaluation.agencyAssignedUsersModal.columnRole',
  },
];
