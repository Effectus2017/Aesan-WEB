import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const USERS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
      key: 'firstName',
      type: 'text' as const,
      label: 'users.list.columns.firstName',
    },
    {
      key: 'fatherLastName',
      type: 'text' as const,
      label: 'users.list.columns.fatherLastName',
    },
    {
      key: 'email',
      type: 'text' as const,
      label: 'users.list.columns.email',
    },
    {
      key: 'roles',
      type: 'text' as const,
      label: 'users.list.columns.roles',
    },
    {
      key: 'button',
      type: 'button' as const,
      label: '',
      buttons: [
        {
          key: 'edit',
        },
        {
          key: 'delete',
        },
      ],
    },
  ];
