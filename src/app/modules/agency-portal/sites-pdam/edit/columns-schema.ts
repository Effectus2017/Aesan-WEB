import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SATELLITE_SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'satelliteSiteName',
    type: 'text',
    label: 'sites.list.table.columns.satelliteSiteName',
  },
  {
    key: 'assignmentDate',
    type: 'date',
    label: 'sites.list.table.columns.assignmentDate',
  },
  {
    key: 'comment',
    type: 'text',
    label: 'sites.list.table.columns.comment',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sites.list.table.columns.actions',
    buttons: [
      {
        key: 'element',
        label: 'sites.list.table.buttons.edit',
      },
    ],
  },
];

