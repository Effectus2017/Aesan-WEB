import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de sitios en el modal
export const SITES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'siteCode',
    type: 'text',
    label: 'sites.list.table.columns.siteCode',
  },
  {
    key: 'siteName',
    type: 'text',
    label: 'sites.list.table.columns.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'sites.list.table.columns.address',
  },
  {
    key: 'siteIsActive',
    type: 'boolean',
    label: 'sites.list.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sites.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'sites.list.table.buttons.edit',
      },
      {
        key: 'calendar',
        label: 'sites.list.table.buttons.calendar',
        icon: 'heroicons_outline:calendar',
      },
    ],
  },
];
