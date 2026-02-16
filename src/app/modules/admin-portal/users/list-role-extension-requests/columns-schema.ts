import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const ROLE_EXTENSION_REQUESTS_COLUMNS_SCHEMA: ColumnSchema[] = [
  { key: 'userName', type: 'text', label: 'users.roleExtensionRequests.columns.userName' },
  { key: 'userEmail', type: 'text', label: 'users.roleExtensionRequests.columns.userEmail' },
  { key: 'roleName', type: 'text', label: 'users.roleExtensionRequests.columns.roleName' },
  { key: 'requestedValidToDisplay', type: 'text', label: 'users.roleExtensionRequests.columns.requestedValidTo' },
  { key: 'reason', type: 'text', label: 'users.roleExtensionRequests.columns.reason' },
  { key: 'status', type: 'text', label: 'users.roleExtensionRequests.columns.status' },
  { key: 'requestedAtDisplay', type: 'text', label: 'users.roleExtensionRequests.columns.requestedAt' },
  {
    key: 'buttons',
    type: 'button',
    label: '',
    buttons: [
      { key: 'approve', label: 'users.roleExtensionRequests.actions.approve' },
      { key: 'reject', label: 'users.roleExtensionRequests.actions.reject' },
    ],
  },
];
