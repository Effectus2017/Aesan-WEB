export const SCHOOLS_COLUMNS_SCHEMA = [
  {
    key: 'name',
    type: 'text',
    label: 'global.table.schools.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'global.table.schools.address',
  },
  {
    key: 'city',
    type: 'text',
    label: 'global.table.schools.city',
  },
  {
    key: 'zipCode',
    type: 'text',
    label: 'global.table.schools.zipCode',
  },
  {
    key: 'level',
    type: 'text',
    label: 'global.table.schools.level',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'global.table.actions',
    buttons: [
      {
        key: 'edit',
        label: 'global.table.edit',
      },
      {
        key: 'delete',
        label: 'global.table.delete',
      },
    ],
  },
];

export const INCOME_SOURCES_COLUMNS_SCHEMA = [
  {
    key: 'source',
    type: 'text',
    label: 'global.table.incomeSources.source',
  },
  {
    key: 'year',
    type: 'text',
    label: 'global.table.incomeSources.year',
  },
  {
    key: 'amount',
    type: 'number',
    label: 'global.table.incomeSources.amount',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'global.table.actions',
    buttons: [
      {
        key: 'edit',
        label: 'global.table.edit',
      },
      {
        key: 'delete',
        label: 'global.table.delete',
      },
    ],
  },
];
