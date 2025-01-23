export const USERS_COLUMNS_SCHEMA = [
    {
      key: 'firstName',
      type: 'text',
      label: 'users.list.columns.firstName',
    },
    {
      key: 'fatherLastName',
      type: 'text',
      label: 'users.list.columns.fatherLastName',
    },
    {
      key: 'email',
      type: 'text',
      label: 'users.list.columns.email',
    },
    {
      key: 'userName',
      type: 'text',
      label: 'users.list.columns.userName',
    },
    {
      key: 'roles',
      type: 'text',
      label: 'users.list.columns.roles',
    },
    {
      key: 'button',
      type: 'button',
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
