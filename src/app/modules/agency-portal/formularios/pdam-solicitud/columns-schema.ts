import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const PDAM_SOLICITUD_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: 'name',
    type: 'text',
    label: 'agency-pdam.table.columns.agencyName'
  },
  {
    key: 'initDate',
    type: 'date-time',
    label: 'agency-pdam.table.columns.initDate'
  },
  {
    key: 'address',
    type: 'text',
    label: 'agency-pdam.table.columns.address'
  },
  {
    key: 'postalCode',
    type: 'text',
    label: 'agency-pdam.table.columns.postalCode'
  },
  {
    key: 'city',
    type: 'text',
    label: 'agency-pdam.table.columns.city'
  },
  {
    key: 'region',
    type: 'text',
    label: 'agency-pdam.table.columns.region'
  },
  {
    key: 'firstNameLastName',
    type: 'text',
    label: 'agency-pdam.table.columns.fullName'
  },
  {
    key: 'phoneNumber',
    type: 'text',
    label: 'agency-pdam.table.columns.phoneNumber'
  },
  {
    key: 'actions',
    type: 'button',
    label: 'agency-pdam.table.columns.actions',
    buttons: [
      {
        key: 'edit',
        label: 'agency-pdam.table.buttons.edit'
      }
    ]
  }
];
