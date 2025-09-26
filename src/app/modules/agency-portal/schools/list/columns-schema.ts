import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
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
    key: 'cityName',
    type: 'text',
    label: 'schools.list.table.columns.city',
  },
  {
    key: 'regionName',
    type: 'text',
    label: 'schools.list.table.columns.region',
  },
  {
    key: 'isMainSchool',
    type: 'boolean',
    label: 'schools.list.table.columns.isMainSchool',
  },
  {
    key: 'mainSchoolName',
    type: 'text',
    label: 'schools.list.table.columns.mainSchool',
  },
  {
    key: 'siteCode',
    type: 'text',
    label: 'schools.list.table.columns.siteCode',
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
      {
        key: 'calendar',
        label: 'schools.list.table.buttons.calendar',
        icon: 'heroicons_outline:calendar',
      },
    ],
  },
];

