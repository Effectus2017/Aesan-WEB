import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/**
 * Schema de columnas para listar escuelas en modo solo visualización.
 * Replica los datos e iconografía usados en portal de Agencia sin opción de edición.
 */
export const READONLY_SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
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
        key: 'sites',
        label: 'schools.list.table.buttons.sites',
        icon: 'heroicons_outline:building-office-2',
        permission: 'site.view',
        disableAgencyRestriction: true,
      },
    ],
  },
];

/**
 * Schema de columnas para listar centros en modo solo visualización.
 * Replica los datos e iconografía usados en portal de Agencia sin opción de edición.
 */
export const READONLY_CENTERS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'schoolCode',
    type: 'text',
    label: 'centers.list.table.columns.centerCode',
  },
  {
    key: 'name',
    type: 'text',
    label: 'centers.list.table.columns.name',
  },
  {
    key: 'sitesCount',
    type: 'text',
    label: 'centers.list.table.columns.sites-count',
  },
  {
    key: 'createdAt',
    type: 'date',
    label: 'centers.list.table.columns.createdAt',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'centers.list.table.columns.status',
    sortable: true,
  },
  {
    key: 'actions',
    type: 'button',
    label: 'centers.list.table.columns.actions',
    buttons: [
      {
        key: 'sites',
        label: 'centers.list.table.buttons.sites',
        icon: 'heroicons_outline:building-office-2',
        permission: 'site.view',
      },
    ],
  },
];
