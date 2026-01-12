import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de sitios PSAV
export const SITES_PSAV_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'siteCode',
    type: 'text',
    label: 'sites.list.table.columns.siteCode',
  },
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
    key: 'isActive',
    type: 'boolean',
    label: 'sites.list.table.columns.isActive',
  },
  {
    key: 'groupTypeName',
    type: 'text',
    label: 'sites.list.table.columns.groupTypeName',
  },
  {
    key: 'generalEnrollment',
    type: 'text',
    label: 'sites.list.table.columns.generalEnrollment',
  },

  {
    key: 'actions',
    type: 'button',
    label: 'sites.list.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'sites.list.table.buttons.edit',
        permission: 'site.edit',
      },
      {
        key: 'calendar',
        label: 'sites.list.table.buttons.calendar',
        icon: 'heroicons_outline:calendar',
        permission: 'site.view',
      },
    ],
  },
];
