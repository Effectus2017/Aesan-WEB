import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/**
 * Schema de columnas para la tabla de escuelas relacionadas a la agencia
 */
export const SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'schoolCode',
    type: 'text',
    label: 'sponsor-evaluation.edit.schools.table.columns.schoolCode',
  },
  {
    key: 'name',
    type: 'text',
    label: 'sponsor-evaluation.edit.schools.table.columns.name',
  },
  {
    key: 'schoolNumber',
    type: 'text',
    label: 'sponsor-evaluation.edit.schools.table.columns.schoolNumber',
  },
  {
    key: 'createdAt',
    type: 'date',
    label: 'sponsor-evaluation.edit.schools.table.columns.createdAt',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-evaluation.edit.schools.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-evaluation.edit.schools.table.columns.actions',
    buttons: [
      {
        key: 'view',
        label: 'sponsor-evaluation.edit.schools.table.buttons.view',
        icon: 'heroicons_outline:eye',
      },
      {
        key: 'edit',
        label: 'sponsor-evaluation.edit.schools.table.buttons.edit',
      },
    ],
  },
];

/**
 * Schema de columnas para la tabla de sitios relacionados a la agencia
 */
export const SITES_COLUMNS_SCHEMA: ColumnSchema[] = [
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
    ],
  },
];

/**
 * Schema de columnas para la tabla de staff relacionados a la agencia
 */
export const STAFF_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    type: 'combined-text',
    label: 'sponsor-evaluation.edit.staff.table.columns.fullName',
  },
  {
    key: 'staffTypeName',
    type: 'text',
    label: 'sponsor-evaluation.edit.staff.table.columns.staffType',
  },
  {
    key: 'positionName',
    type: 'text',
    label: 'sponsor-evaluation.edit.staff.table.columns.position',
  },
  {
    key: 'statusName',
    type: 'text',
    label: 'sponsor-evaluation.edit.staff.table.columns.status',
  },
  {
    key: 'email',
    type: 'text',
    label: 'sponsor-evaluation.edit.staff.table.columns.email',
  },
  {
    key: 'cityName',
    type: 'text',
    label: 'sponsor-evaluation.edit.staff.table.columns.city',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'sponsor-evaluation.edit.staff.table.columns.isActive',
  },
  {
    key: 'actions',
    type: 'button',
    label: 'sponsor-evaluation.edit.staff.table.columns.actions',
    buttons: [
      {
        key: 'view',
        label: 'sponsor-evaluation.edit.staff.table.buttons.view',
        icon: 'heroicons_outline:eye',
      },
      {
        key: 'edit',
        label: 'sponsor-evaluation.edit.staff.table.buttons.edit',
      },
    ],
  },
];

