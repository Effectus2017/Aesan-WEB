import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/**
 * Schema de columnas para la tabla de sitios PSAV relacionados a la agencia
 */
export const PSAV_SITES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.name',
  },
  {
    key: 'address',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.address',
  },
  {
    key: 'cityName',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.city',
  },
  {
    key: 'regionName',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.region',
  },
  {
    key: 'siteCode',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.siteCode',
  },
  {
    key: 'generalEnrollment',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.generalEnrollment',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-evaluation.edit.sites.table.columns.isActive',
  },
  {
    key: 'schoolName',
    type: 'text',
    label: 'sponsor-evaluation.edit.sites.table.columns.schoolName',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-evaluation.edit.sites.table.columns.actions',
    buttons: [
      {
        key: 'view',
        label: 'sponsor-evaluation.edit.sites.table.buttons.view',
        icon: 'heroicons_outline:eye',
      },
      {
        key: 'edit',
        label: 'sponsor-evaluation.edit.sites.table.buttons.edit',
      },
      {
        key: 'viewStaff',
        label: 'sponsor-evaluation.edit.sites.table.buttons.viewStaff',
        icon: 'heroicons_outline:user-group',
      },
    ],
  },
];
