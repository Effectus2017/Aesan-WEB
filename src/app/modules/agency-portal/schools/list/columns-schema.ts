import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SCHOOLS_COLUMNS: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'schools.list.table.columns.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'schools.list.table.columns.address',
  },
  {
    key: 'city.name',
    type: 'text',
    label: 'schools.list.table.columns.city',
  },
  {
    key: 'region.name',
    type: 'text',
    label: 'schools.list.table.columns.region',
  },
  {
    key: 'isMainSchool',
    type: 'boolean',
    label: 'schools.list.table.columns.isMainSchool',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'schools.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'schools.list.table.buttons.edit',
      },
    ],
  },
];
