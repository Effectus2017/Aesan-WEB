import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SATELLITE_SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'satelliteSchoolName',
    type: 'text',
    label: 'schools.list.table.columns.satelliteSchoolName',
  },
  {
    key: 'assignmentDate',
    type: 'date',
    label: 'schools.list.table.columns.assignmentDate',
  },
  {
    key: 'comment',
    type: 'text',
    label: 'schools.list.table.columns.comment',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'schools.list.table.columns.actions',
    buttons: [
      {
        key: 'element',
        label: 'schools.list.table.buttons.edit',
      },
    ],
  },
];

