import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'schoolCode',
    type: 'text',
    label: 'schools.list.table.columns.schoolCode',
  },
  {
    key: 'name',
    type: 'text',
    label: 'schools.list.table.columns.name',
  },
  {
    key: 'sitesCount',
    type: 'text',
    label: 'schools.list.table.columns.sites-count',
  },
  {
    key: 'createdAt',
    type: 'date',
    label: 'schools.list.table.columns.createdAt',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'schools.list.table.columns.status',
    sortable: true,
  },
  {
    key: 'actions',
    type: 'button',
    label: 'schools.list.table.columns.actions',
    buttons: [
      {
        key: 'edit-modal',
        label: 'schools.list.table.buttons.edit',
        icon: 'mat_solid:edit',
      },
      {
        key: 'sites',
        label: 'schools.list.table.buttons.sites',
        icon: 'heroicons_outline:building-office-2',
      },
    ],
  },
];
