import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const BOARD_MEMBERS_COLUMNS_SCHEMA: ColumnSchema[] = [
  {
    key: ['firstName', 'middleName', 'fatherLastName', 'motherLastName'],
    label: 'staff.boardMembers.list.table.columns.fullName',
    type: 'combined-text',
    sortable: true
  },

  {
    key: 'positionName',
    label: 'staff.boardMembers.list.table.columns.title',
    type: 'text',
    sortable: true
  },
  {
    key: 'birthDate',
    label: 'staff.boardMembers.list.table.columns.birthDate',
    type: 'date',
    sortable: true
  },
  {
    key: 'email',
    label: 'staff.boardMembers.list.table.columns.email',
    type: 'text',
    sortable: true
  },
//   {
//     key: 'postalAddress',
//     label: 'staff.boardMembers.list.table.columns.postalAddress',
//     type: 'text',
//     sortable: true
//   },
  {
    key: 'cityName',
    label: 'staff.boardMembers.list.table.columns.municipality',
    type: 'text',
    sortable: true
  },
//   {
//     key: 'areaCode',
//     label: 'staff.boardMembers.list.table.columns.areaCode',
//     type: 'text',
//     sortable: true
//   },
//   {
//     key: 'updatedAt',
//     label: 'staff.boardMembers.list.table.columns.updateDate',
//     type: 'date',
//     sortable: true
//   },
//   {
//     key: 'comments',
//     label: 'staff.boardMembers.list.table.columns.comments',
//     type: 'text',
//     sortable: true
//   },
{
    key: 'isActive',
    label: 'staff.boardMembers.list.table.columns.status',
    type: 'boolean',
    sortable: true
  },
  {
    key: 'buttons',
    label: 'staff.boardMembers.list.table.columns.actions',
    type: 'button',
    sortable: false,
    buttons: [
      {
        key: 'edit',
        label: 'staff.boardMembers.list.buttons.edit',
      },
      {
        key: 'delete',
        label: 'staff.boardMembers.list.buttons.delete',
      },
      {
        key: 'view',
        label: 'staff.boardMembers.list.buttons.view',
      },
    ],
  }
];
