import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de escuelas
export const SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sites.list.table.columns.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'sites.list.table.columns.address',
  },
  {
    key: 'cityName',
    type: 'text',
    label: 'sites.list.table.columns.city',
  },
  {
    key: 'regionName',
    type: 'text',
    label: 'sites.list.table.columns.region',
  },
  {
    key: 'isMainSite',
    type: 'boolean',
    label: 'sites.list.table.columns.isMainSite',
  },
  {
    key: 'siteCode',
    type: 'text',
    label: 'sites.list.table.columns.siteCode',
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
      {
        key: 'satellites',
        label: 'sites.list.table.buttons.satellites',
        icon: 'heroicons_outline:building-office-2',
      },
    ],
  },
];

