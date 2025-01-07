export const SCHOOLS_COLUMNS_SCHEMA = [
  {
    key: 'name',
    type: 'text',
    label: 'global.table.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'global.table.description',
  },
  {
    key: 'city',
    type: 'text',
    label: 'global.table.active',
  },
  {
    key: 'zipCode',
    type: 'text',
    label: 'global.table.active',
  },
  {
    key: 'level',
    type: 'text',
    label: 'global.table.active',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'global.table.actions',
    buttons: [
      {
        key: 'edit',
        label: 'global.buttons.edit',
      },
      {
        key: 'delete',
        label: 'global.buttons.delete',
      },
    ],
  },
];
