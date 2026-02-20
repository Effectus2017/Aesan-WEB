import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';
import { StaffList } from 'app/shared/models/Staff';

export const EMPLOYEES_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    label: 'staff.employees.list.table.columns.fullName',
    type: 'combined-text',
    sortable: true
  },
  {
    key: 'staffClassificationName',
    label: 'staff.employees.list.table.columns.classification',
    type: 'text',
    sortable: true
  },
  {
    key: 'displayPosition',
    label: 'staff.employees.list.table.columns.position',
    type: 'text',
    sortable: true
  },
  {
    key: 'isActive',
    label: 'staff.employees.list.table.columns.status',
    type: 'boolean',
    sortable: true
  },
  {
    key: 'comments',
    label: 'staff.employees.list.table.columns.description',
    type: 'text',
    sortable: true
  },
  {
    key: 'buttons',
    label: 'staff.employees.list.table.columns.actions',
    type: 'button',
    sortable: false,
    buttons: [
      {
        key: 'edit',
        label: 'staff.employees.list.buttons.edit',
        permission: 'staff.edit',
        disableAgencyRestriction: true,
      },
    ],
  }
];
