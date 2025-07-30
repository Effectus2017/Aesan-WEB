import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';
import { StaffList } from 'app/shared/models/Staff';

export const STAFF_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    label: 'staff.list.table.columns.firstName',
    type: 'combined-text',
    sortable: true
  },
  {
    key: 'fatherLastName',
    label: 'staff.list.table.columns.fatherLastName',
    type: 'text',
    sortable: true
  },
  {
    key: 'motherLastName',
    label: 'staff.list.table.columns.motherLastName',
    type: 'text',
    sortable: true
  },
  {
    key: 'email',
    label: 'staff.list.table.columns.email',
    type: 'text',
    sortable: true
  },
  {
    key: 'birthDate',
    label: 'staff.list.table.columns.birthDate',
    type: 'date',
    sortable: true
  },
  {
    key: 'positionName',
    label: 'staff.list.table.columns.position',
    type: 'text',
    sortable: true
  },
  {
    key: 'statusName',
    label: 'staff.list.table.columns.status',
    type: 'text',
    sortable: true
  },
  {
    key: 'staffTypeName',
    label: 'staff.list.table.columns.staffType',
    type: 'text',
    sortable: true
  },
  {
    key: 'cityName',
    label: 'staff.list.table.columns.city',
    type: 'text',
    sortable: true
  },
  {
    key: 'regionName',
    label: 'staff.list.table.columns.region',
    type: 'text',
    sortable: true
  },
  {
    key: 'isActive',
    label: 'staff.list.table.columns.isActive',
    type: 'boolean',
    sortable: true
  },
  {
    key: 'buttons',
    label: 'staff.list.table.columns.actions',
    type: 'button',
    sortable: false,
    buttons: [
      {
        key: 'edit',
        label: 'staff.list.buttons.edit',
      },
      {
        key: 'delete',
        label: 'staff.list.buttons.delete',
      },
    ],
  }
];
