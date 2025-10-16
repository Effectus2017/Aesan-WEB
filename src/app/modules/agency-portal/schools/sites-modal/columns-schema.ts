import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

// Esquema de columnas para el listado de sitios en el modal
export const SITES_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: ['site', 'siteCode'],
        type: 'text',
        label: 'sites.list.table.columns.siteCode',
      },
    {
    key: 'siteName',
    type: 'text',
    label: 'sites.list.table.columns.name',
  },
  {
    key: ['site', 'groupType', 'name'],
    type: 'text',
    label: 'sites.list.table.columns.groupTypeName',
  },
  {
    key: ['site', 'address'],
    type: 'text',
    label: 'sites.list.table.columns.address',
  },
  {
    key: ['site', 'city', 'name'],
    type: 'text',
    label: 'sites.list.table.columns.city',
  },
  {
    key: ['site', 'region', 'name'],
    type: 'text',
    label: 'sites.list.table.columns.region',
  },

  {
    key: ['site', 'isActive'],
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
    ],
  },
];
