export const COLUMNS_SCHEMA = [
  {
    key: 'id',
    type: 'text',
    label: 'sponsor-type.list.columns.id',
    sortable: true,
    visible: false,
  },
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-type.list.columns.name',
    sortable: true,
    visible: true,
  },
  {
    key: 'nameEN',
    type: 'text',
    label: 'sponsor-type.list.columns.nameEN',
    sortable: true,
    visible: true,
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-type.list.columns.isActive',
    sortable: true,
    visible: true,
  },
  {
    key: 'displayOrder',
    type: 'number',
    label: 'sponsor-type.list.columns.displayOrder',
    sortable: true,
    visible: true,
  },
  {
    key: 'actions',
    type: 'actions',
    label: 'sponsor-type.list.columns.actions',
    visible: true,
  },
];
