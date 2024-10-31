export const COLUMNS_SCHEMA = [
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
    key: 'user.firstName',
    type: 'text',
    label: 'validation-to-program.list.table.columns.firstName'
  },
  {
    key: 'user.administrationTitle',
    type: 'text',
    label: 'validation-to-program.list.table.columns.adminTitle'
  },
  {
    key: 'createdAt',
    type: 'date-time',
    label: 'validation-to-program.list.table.columns.createdAt'
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
      {
        key: 'delete',
        label: 'validation-to-program.list.table.buttons.delete'
      }
    ]
  }
];
