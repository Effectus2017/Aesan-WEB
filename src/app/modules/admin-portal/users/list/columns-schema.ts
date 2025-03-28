import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const USERS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
      key: 'imageURL',
      type: 'image',
      label: '',
      imageConfig: {
        defaultImage: 'assets/images/avatars/profile.png',
        width: '40px',
        height: '40px',
        class: 'rounded-full object-cover',
        alt: 'users.list.columns.avatar'
      }
    },
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
      key: 'roles',
      type: 'text',
      label: 'users.list.columns.roles',
    },
    {
      key: 'isActive',
      type: 'boolean',
      label: 'users.list.columns.isActive',
    },
    {
      key: 'isTemporalPasswordActived',
      type: 'boolean',
      label: 'users.list.columns.isTemporalPasswordActived',
    },
    {
      key: 'emailConfirmed',
      type: 'boolean',
      label: 'users.list.columns.emailConfirmed',
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
